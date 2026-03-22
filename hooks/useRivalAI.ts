import { useEffect, useRef, useCallback } from 'react';
import { useGameState, useGameDispatch } from '../contexts/GameStateContext';
import {
    calculateAdaptiveDifficulty, generateRivalMindset, getVendettaPhase,
    checkCoalitionFormation, decideTacticalMove, generateSurpriseEvent,
    calculateTacticalMoveEffects, generateTacticalMoveMessage,
    generateAIKnowledgeEntry, PSYCHOLOGICAL_TACTICS
} from '../utils/rivalAI';
import { 
    COALITION_ANNOUNCEMENTS, PSYCHOLOGICAL_WARFARE_MESSAGES, SURPRISE_ATTACK_MESSAGES, 
    DEFAULT_FACTION_REPUTATION, VENDETTA_ESCALATION_MESSAGES
} from '../constants';
import { hydrateRivalFund, clampStat, normalizeMemory, normalizeKnowledgeEntry } from '../utils/gameUtils';
import { RivalMindsetState, KnowledgeEntry } from '../types';

export const useRivalAI = () => {
    const state = useGameState();
    const dispatch = useGameDispatch();
    const { playerStats, rivalFunds, activeDeals, aiState, marketVolatility, gamePhase } = state;

    const lastProcessedRivalTickRef = useRef<number | null>(null);
    const previousVendettaRef = useRef<Record<string, number>>({});

    const processRivalMoves = useCallback(() => {
        if (!playerStats) return;

        const currentTick = playerStats.timeCursor ?? 0;
        
        let workingFunds = rivalFunds.map(hydrateRivalFund);
        let workingDeals = [...activeDeals];

        let fundsChanged = false;
        let dealsChanged = false;
        let stressDelta = 0;
        let reputationDelta = 0;
        let rivalRepDelta = 0;
        let auditRiskDelta = 0;
        let energyDelta = 0;
        const knowledgeGain: KnowledgeEntry[] = [];

        // Calculate adaptive difficulty based on player performance
        const difficultyMultiplier = calculateAdaptiveDifficulty(playerStats, workingFunds);

        // Update rival mindsets and check for vendetta escalation
        const updatedMindsets: Record<string, RivalMindsetState> = { ...aiState.rivalMindsets };

        for (const rival of workingFunds) {
            const mindset = generateRivalMindset(rival, playerStats, aiState.playerPatterns);
            updatedMindsets[rival.id] = mindset;

            // Check for vendetta escalation
            const previousVendetta = previousVendettaRef.current[rival.id] ?? 0;
            const currentVendetta = rival.vendetta ?? 0;
            const previousPhase = getVendettaPhase(previousVendetta);
            const currentPhase = getVendettaPhase(currentVendetta);

            if (currentPhase !== previousPhase && currentPhase !== 'COLD') {
                const escalationMessages = VENDETTA_ESCALATION_MESSAGES[currentPhase];
                if (escalationMessages) {
                    const message = escalationMessages[Math.floor(Math.random() * escalationMessages.length)]
                        .replace('${name}', rival.managingPartner);
                    dispatch({ type: 'ADD_LOG_ENTRY', payload: `VENDETTA ESCALATION: ${message}` });
                    stressDelta += 5;
                }
            }

            previousVendettaRef.current[rival.id] = currentVendetta;
        }

        // Check for coalition formation
        let coalitionState = aiState.coalitionState;
        if (!coalitionState || coalitionState.expiresAtTick <= currentTick) {
            const newCoalition = checkCoalitionFormation(workingFunds, playerStats, currentTick);
            if (newCoalition) {
                coalitionState = newCoalition;
                const announcement = COALITION_ANNOUNCEMENTS[Math.floor(Math.random() * COALITION_ANNOUNCEMENTS.length)];
                dispatch({ type: 'ADD_LOG_ENTRY', payload: `COALITION ALERT: ${announcement}` });
                stressDelta += 10;
                knowledgeGain.push(normalizeKnowledgeEntry({
                    summary: 'Multiple rival funds are coordinating against you',
                    faction: 'RIVALS',
                    tags: ['coalition', 'rival', 'threat'],
                }, 'coalition'));
            }
        }

        // Sort rivals by threat level (aggression + vendetta + coalition membership)
        const sortedRivals = [...workingFunds].sort((a, b) => {
            const aScore = (b.aggressionLevel + (b.vendetta ?? 40)) *
                (coalitionState?.members.includes(b.id) ? 1.5 : 1);
            const bScore = (a.aggressionLevel + (a.vendetta ?? 40)) *
                (coalitionState?.members.includes(a.id) ? 1.5 : 1);
            return aScore - bScore;
        });

        // Process each rival's turn with advanced AI
        let successfulActions = 0;
        for (const rival of sortedRivals) {
            if (successfulActions >= 3) break;
            const cooldownReady = (rival.lastActionTick ?? -5) < currentTick - 1;
            if (!cooldownReady && Math.random() > 0.4) continue;

            const mindset = updatedMindsets[rival.id];
            if (!mindset) continue;

            // Apply coalition bonus if active
            const isInCoalition = coalitionState?.members.includes(rival.id) ?? false;
            const coalitionBonus = isInCoalition ? 1.3 : 1.0;

            // Decide tactical move using advanced AI
            const decision = decideTacticalMove(
                rival,
                mindset as any,
                playerStats,
                workingDeals,
                marketVolatility,
                currentTick,
                difficultyMultiplier * coalitionBonus
            );

            if (!decision) continue;

            // Execute the tactical move
            const successRoll = Math.random();
            const success = successRoll < decision.successChance;

            // Handle specific tactical moves
            switch (decision.action) {
                case 'POACH': {
                    const vendetta = rival.vendetta ?? 40;
                    const candidateDeals = workingDeals
                        .filter(d => d.interestedRivals.includes(rival.id))
                        .sort((a, b) => (a.deadline - b.deadline) || (Number(b.isHot) - Number(a.isHot)));

                    const targetDeal = candidateDeals[0];
                    if (targetDeal && success) {
                        workingDeals = workingDeals.filter(d => d.id !== targetDeal.id);
                        dealsChanged = true;

                        workingFunds = workingFunds.map(f => {
                            if (f.id !== rival.id) return f;

                            const portfolioEntry = {
                                name: targetDeal.companyName,
                                dealType: targetDeal.dealType,
                                acquisitionPrice: targetDeal.askingPrice,
                                currentValue: Math.round(targetDeal.askingPrice * 1.1),
                                acquiredMonth: playerStats.gameMonth,
                                acquiredYear: playerStats.gameYear,
                            };

                            fundsChanged = true;
                            return {
                                ...f,
                                dryPowder: Math.max(0, f.dryPowder - Math.round(targetDeal.askingPrice * 0.6)),
                                portfolio: [...f.portfolio, portfolioEntry],
                                totalDeals: f.totalDeals + 1,
                                winStreak: f.winStreak + 1,
                                reputation: clampStat(f.reputation + 2),
                                vendetta: clampStat(vendetta + 5),
                                lastActionTick: currentTick,
                            };
                        });

                        stressDelta += 8 + Math.round(decision.intensity / 10);
                        reputationDelta -= 2;
                        rivalRepDelta -= 2;

                        dispatch({
                            type: 'UPDATE_NPC',
                            payload: {
                                id: rival.npcId,
                                updates: {
                                    memories: [
                                        ...state.npcs.find(n => n.id === rival.npcId)?.memories || [],
                                        normalizeMemory({
                                            summary: `Poached ${targetDeal.companyName} before you could move.`,
                                            sentiment: 'negative',
                                            tags: ['rival', 'deal', 'poach'],
                                        }, rival.id)
                                    ]
                                }
                            }
                        });
                        knowledgeGain.push(generateAIKnowledgeEntry(rival, decision, success));
                        dispatch({ type: 'ADD_LOG_ENTRY', payload: generateTacticalMoveMessage(rival, decision, success) });
                    }
                    break;
                }
                
                case 'RUMOR': {
                    if (success) {
                         const vendetta = rival.vendetta ?? 40;
                         workingFunds = workingFunds.map(f => f.id === rival.id
                            ? { ...f, winStreak: Math.max(0, f.winStreak - 1), vendetta: clampStat(vendetta + 3), lastActionTick: currentTick }
                            : f
                         );
                         fundsChanged = true;

                         const effects = calculateTacticalMoveEffects(decision, success, rival);
                         stressDelta += effects.stress || 0;
                         reputationDelta += effects.reputation || 0;
                         rivalRepDelta += effects.factionReputation?.RIVALS || 0;

                         dispatch({ type: 'ADD_LOG_ENTRY', payload: generateTacticalMoveMessage(rival, decision, success) });
                         knowledgeGain.push(generateAIKnowledgeEntry(rival, decision, success));
                    }
                    break;
                }

                case 'COALITION': {
                    if (success) {
                        const vendetta = rival.vendetta ?? 40;
                        workingFunds = workingFunds.map(f => f.id === rival.id
                            ? { ...f, vendetta: clampStat(vendetta + 4), lastActionTick: currentTick }
                            : f
                        );
                        fundsChanged = true;

                        const effects = calculateTacticalMoveEffects(decision, success, rival);
                        stressDelta += effects.stress || 0;
                        reputationDelta += effects.reputation || 0;
                        rivalRepDelta += effects.factionReputation?.RIVALS || 0;

                        dispatch({ type: 'ADD_LOG_ENTRY', payload: generateTacticalMoveMessage(rival, decision, success) });
                        knowledgeGain.push(generateAIKnowledgeEntry(rival, decision, success));
                    }
                    break;
                }

                case 'SABOTAGE': {
                    if (success) {
                        const vendetta = rival.vendetta ?? 40;
                        workingFunds = workingFunds.map(f => f.id === rival.id
                            ? { ...f, vendetta: clampStat(vendetta + 6), lastActionTick: currentTick }
                            : f
                        );
                        fundsChanged = true;

                        const effects = calculateTacticalMoveEffects(decision, success, rival);
                        stressDelta += effects.stress || 0;
                        reputationDelta += effects.reputation || 0;
                        auditRiskDelta += effects.auditRisk || 0;
                        rivalRepDelta += effects.factionReputation?.RIVALS || 0;

                        dispatch({ type: 'ADD_LOG_ENTRY', payload: generateTacticalMoveMessage(rival, decision, success) });
                        knowledgeGain.push(generateAIKnowledgeEntry(rival, decision, success));
                    }
                    break;
                }

                case 'MARKET_MANIPULATION': {
                    if (success) {
                        const vendetta = rival.vendetta ?? 40;
                        workingFunds = workingFunds.map(f => f.id === rival.id
                            ? { ...f, vendetta: clampStat(vendetta + 3), lastActionTick: currentTick }
                            : f
                        );
                        fundsChanged = true;

                        // Inflate asking prices on active deals the player might be interested in
                        workingDeals = workingDeals.map(d => ({
                            ...d,
                            askingPrice: Math.round(d.askingPrice * (1 + 0.05 + Math.random() * 0.1)),
                        }));
                        dealsChanged = true;

                        const effects = calculateTacticalMoveEffects(decision, success, rival);
                        stressDelta += effects.stress || 0;
                        reputationDelta += effects.reputation || 0;
                        auditRiskDelta += effects.auditRisk || 0;
                        rivalRepDelta += effects.factionReputation?.RIVALS || 0;

                        dispatch({ type: 'ADD_LOG_ENTRY', payload: generateTacticalMoveMessage(rival, decision, success) });
                        knowledgeGain.push(generateAIKnowledgeEntry(rival, decision, success));
                    }
                    break;
                }

                case 'PSYCHOLOGICAL_WARFARE': {
                    if (success) {
                        const vendetta = rival.vendetta ?? 40;
                        const tactic = PSYCHOLOGICAL_TACTICS[Math.floor(Math.random() * PSYCHOLOGICAL_TACTICS.length)];

                        workingFunds = workingFunds.map(f => f.id === rival.id
                            ? { ...f, vendetta: clampStat(vendetta + 2), lastActionTick: currentTick }
                            : f
                        );
                        fundsChanged = true;

                        const effects = calculateTacticalMoveEffects(decision, success, rival);
                        stressDelta += effects.stress || 0;
                        reputationDelta += effects.reputation || 0;
                        auditRiskDelta += effects.auditRisk || 0;
                        energyDelta += effects.energy || 0;

                        // Apply the specific psychological tactic effect
                        if (tactic.effect === 'energy') {
                            energyDelta += tactic.magnitude;
                        } else if (tactic.effect === 'stress') {
                            stressDelta += Math.round(tactic.magnitude * 0.5);
                        }

                        dispatch({
                            type: 'ADD_LOG_ENTRY',
                            payload: `PSYCH WARFARE: ${rival.managingPartner} ${tactic.message}`,
                        });
                        knowledgeGain.push(generateAIKnowledgeEntry(rival, decision, success));
                    }
                    break;
                }

                case 'SURPRISE_BID': {
                    const vendetta = rival.vendetta ?? 40;
                    const candidateDeals = workingDeals
                        .filter(d => d.interestedRivals.includes(rival.id) || d.isHot)
                        .sort((a, b) => (b.askingPrice - a.askingPrice));

                    const targetDeal = candidateDeals[0];
                    if (targetDeal && success) {
                        workingDeals = workingDeals.filter(d => d.id !== targetDeal.id);
                        dealsChanged = true;

                        workingFunds = workingFunds.map(f => {
                            if (f.id !== rival.id) return f;

                            const portfolioEntry = {
                                name: targetDeal.companyName,
                                dealType: targetDeal.dealType,
                                acquisitionPrice: Math.round(targetDeal.askingPrice * 1.2),
                                currentValue: Math.round(targetDeal.askingPrice * 1.25),
                                acquiredMonth: playerStats.gameMonth,
                                acquiredYear: playerStats.gameYear,
                            };

                            fundsChanged = true;
                            return {
                                ...f,
                                dryPowder: Math.max(0, f.dryPowder - Math.round(targetDeal.askingPrice * 0.8)),
                                portfolio: [...f.portfolio, portfolioEntry],
                                totalDeals: f.totalDeals + 1,
                                winStreak: f.winStreak + 1,
                                reputation: clampStat(f.reputation + 3),
                                vendetta: clampStat(vendetta + 7),
                                lastActionTick: currentTick,
                            };
                        });

                        const effects = calculateTacticalMoveEffects(decision, success, rival);
                        stressDelta += effects.stress || 0;
                        reputationDelta -= 3;
                        rivalRepDelta -= 3;

                        dispatch({
                            type: 'UPDATE_NPC',
                            payload: {
                                id: rival.npcId,
                                updates: {
                                    memories: [
                                        ...state.npcs.find(n => n.id === rival.npcId)?.memories || [],
                                        normalizeMemory({
                                            summary: `Surprise bid stole ${targetDeal.companyName} right out from under you.`,
                                            sentiment: 'negative',
                                            tags: ['rival', 'deal', 'surprise_bid'],
                                        }, rival.id)
                                    ]
                                }
                            }
                        });
                        knowledgeGain.push(generateAIKnowledgeEntry(rival, decision, success));
                        dispatch({ type: 'ADD_LOG_ENTRY', payload: generateTacticalMoveMessage(rival, decision, success) });
                    }
                    break;
                }

                case 'STRATEGIC_RETREAT': {
                    const vendetta = rival.vendetta ?? 40;
                    workingFunds = workingFunds.map(f => f.id === rival.id
                        ? {
                            ...f,
                            vendetta: clampStat(vendetta - 8),
                            aggressionLevel: Math.max(10, f.aggressionLevel - 5),
                            lastActionTick: currentTick,
                          }
                        : f
                    );
                    fundsChanged = true;
                    stressDelta -= 3;

                    dispatch({ type: 'ADD_LOG_ENTRY', payload: generateTacticalMoveMessage(rival, decision, success) });
                    knowledgeGain.push(generateAIKnowledgeEntry(rival, decision, success));
                    break;
                }
            }

            if (success) successfulActions++;
        }

        if (fundsChanged) dispatch({ type: 'SET_RIVAL_FUNDS', payload: workingFunds.map(hydrateRivalFund) });
        if (dealsChanged) dispatch({ type: 'SET_ACTIVE_DEALS', payload: workingDeals });

        dispatch({
            type: 'SET_AI_STATE',
            payload: {
                ...aiState,
                rivalMindsets: updatedMindsets,
                coalitionState,
            }
        });

        const factionDelta = rivalRepDelta !== 0 ? { RIVALS: rivalRepDelta } : undefined;
        if (stressDelta || reputationDelta || auditRiskDelta || energyDelta || factionDelta || knowledgeGain.length) {
            dispatch({
                type: 'UPDATE_PLAYER_STATS',
                payload: {
                    stress: stressDelta || undefined,
                    reputation: reputationDelta || undefined,
                    auditRisk: auditRiskDelta || undefined,
                    energy: energyDelta || undefined,
                    factionReputation: factionDelta,
                    knowledgeGain: knowledgeGain.length ? knowledgeGain : undefined,
                }
            });
        }
    }, [playerStats, rivalFunds, activeDeals, aiState, marketVolatility, dispatch, state.npcs]);

    useEffect(() => {
        if (!playerStats || gamePhase === 'INTRO') return;
        if ((playerStats.timeCursor ?? 0) < 1) return;
        const currentTick = playerStats.timeCursor ?? 0;
        if (lastProcessedRivalTickRef.current === currentTick) return;
        lastProcessedRivalTickRef.current = currentTick;
        processRivalMoves();
    }, [playerStats?.timeCursor, gamePhase, processRivalMoves]);
};
