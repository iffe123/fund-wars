import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { GameContextType, PlayerStats, GamePhase, Difficulty, MarketVolatility, UserProfile, NPC, NPCMemory, Scenario, StatChanges, PortfolioCompany, RivalFund, CompetitiveDeal, FactionReputation, DayType, TimeSlot } from '../types';
import { PlayerLevel, DealType } from '../types';
import { DEFAULT_FACTION_REPUTATION, DIFFICULTY_SETTINGS, INITIAL_NPCS, SCENARIOS, RIVAL_FUNDS, COMPETITIVE_DEALS, RIVAL_FUND_NPCS } from '../constants';
import { useAuth } from './AuthContext';
import { db } from '../services/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { logEvent } from '../services/analytics';

interface GameContextTypeExtended extends GameContextType {
    advanceTime: () => void;
    rivalFunds: RivalFund[];
    activeDeals: CompetitiveDeal[];
    updateRivalFund: (fundId: string, updates: Partial<RivalFund>) => void;
    addDeal: (deal: CompetitiveDeal) => void;
    removeDeal: (dealId: number) => void;
    generateNewDeals: () => void;
    resetGame: () => void;
}

const GameContext = createContext<GameContextTypeExtended | undefined>(undefined);

const clampStat = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value));

const TIME_SLOTS: TimeSlot[] = ['MORNING', 'AFTERNOON', 'EVENING'];

const getNextTimeState = (currentDayType: DayType, currentTimeSlot: TimeSlot) => {
    const slotIndex = TIME_SLOTS.indexOf(currentTimeSlot);
    const nextSlot = TIME_SLOTS[(slotIndex + 1) % TIME_SLOTS.length];
    const nextDayType: DayType = nextSlot === 'MORNING'
        ? currentDayType === 'WEEKDAY' ? 'WEEKEND' : 'WEEKDAY'
        : currentDayType;
    return { nextDayType, nextSlot };
};

const isNpcAvailable = (npc: NPC, dayType: DayType, timeSlot: TimeSlot) => {
    const schedule = npc.schedule;
    if (!schedule) return true;
    const slots = dayType === 'WEEKDAY' ? schedule.weekday : schedule.weekend;
    return slots.includes(timeSlot);
};

const hydrateFactionReputation = (factionRep?: FactionReputation): FactionReputation => {
    const hydrated: FactionReputation = { ...DEFAULT_FACTION_REPUTATION };
    if (!factionRep) return hydrated;

    (Object.keys(hydrated) as Array<keyof FactionReputation>).forEach(key => {
        hydrated[key] = clampStat(factionRep[key] ?? hydrated[key]);
    });
    return hydrated;
};

const normalizeMemory = (memory: NPCMemory | string, fallbackSourceId?: string): NPCMemory => {
    const base: NPCMemory = typeof memory === 'string' ? { summary: memory } : memory;
    const now = new Date().toISOString();
    return {
        summary: base.summary,
        timestamp: base.timestamp || now,
        sentiment: base.sentiment,
        impact: base.impact,
        tags: base.tags || [],
        sourceNpcId: base.sourceNpcId || fallbackSourceId,
    };
};

const clampMemories = (memories: NPCMemory[]): NPCMemory[] => memories.slice(-12);

const hydrateNpc = (npc: NPC): NPC => {
    const hydratedMemories = Array.isArray(npc.memories)
        ? clampMemories(npc.memories.map(m => normalizeMemory(m, npc.id)))
        : [];

    return {
        ...npc,
        mood: clampStat(typeof npc.mood === 'number' ? npc.mood : npc.relationship),
        trust: clampStat(typeof npc.trust === 'number' ? npc.trust : npc.relationship),
        dialogueHistory: npc.dialogueHistory || [],
        memories: hydratedMemories,
        lastContactTick: typeof npc.lastContactTick === 'number' ? npc.lastContactTick : 0,
    };
};

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  
  const user: UserProfile | null = currentUser ? {
      id: currentUser.uid,
      name: currentUser.displayName || 'Anonymous',
      email: currentUser.email || '',
      picture: currentUser.photoURL || ''
  } : null;

  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [npcs, setNpcs] = useState<NPC[]>([...INITIAL_NPCS, ...RIVAL_FUND_NPCS].map(hydrateNpc));
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(SCENARIOS[0]);
  const [gamePhase, setGamePhase] = useState<GamePhase>('INTRO');
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [marketVolatility, setMarketVolatility] = useState<MarketVolatility>('NORMAL');
  const [tutorialStep, setTutorialStep] = useState<number>(0);
  const [actionLog, setActionLog] = useState<string[]>([]);

  const addLogEntry = useCallback((message: string) => {
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const entry = `${timestamp} // ${message}`;
      setActionLog(prev => [entry, ...prev].slice(0, 50));
      console.log(`[Game Log]: ${message}`);
  }, []);
  
  // --- RIVAL FUNDS & COMPETITIVE DEALS ---
  const [rivalFunds, setRivalFunds] = useState<RivalFund[]>(RIVAL_FUNDS);
  const [activeDeals, setActiveDeals] = useState<CompetitiveDeal[]>([]);

  // --- CLOUD SAVE / LOAD ---
  useEffect(() => {
      if (!currentUser) {
          setPlayerStats(null);
          setGamePhase('INTRO');
          return;
      }

      if (!db) {
          console.log("[CLOUD_LOAD] Firestore not available. Using local session.");
          setGamePhase('INTRO'); 
          return;
      }

      const loadGame = async () => {
          try {
              const docRef = doc(db, 'users', currentUser.uid, 'savegame', 'primary');
              const docSnap = await getDoc(docRef);

              if (docSnap.exists()) {
                  // Cast to any to handle DocumentData being unknown
                  const data = docSnap.data() as any;
                  console.log("[CLOUD_LOAD] Save found:", data);
                  
                  if (data.playerStats) setPlayerStats({
                      ...data.playerStats,
                      loanBalance: data.playerStats.loanBalance ?? 0,
                      loanRate: data.playerStats.loanRate ?? 0,
                      factionReputation: hydrateFactionReputation(data.playerStats.factionReputation),
                      currentDayType: data.playerStats.currentDayType || 'WEEKDAY',
                      currentTimeSlot: data.playerStats.currentTimeSlot || 'MORNING',
                      timeCursor: typeof data.playerStats.timeCursor === 'number' ? data.playerStats.timeCursor : 0,
                  });
                  if (data.gamePhase) setGamePhase(data.gamePhase);
                  if (data.activeScenarioId) {
                      const scen = SCENARIOS.find(s => s.id === data.activeScenarioId);
                      if (scen) setActiveScenario(scen);
                  }
                  if (data.marketVolatility) setMarketVolatility(data.marketVolatility);
                  if (data.npcs) setNpcs(data.npcs.map(hydrateNpc));
                  if (data.tutorialStep !== undefined) setTutorialStep(data.tutorialStep);
                  if (data.actionLog) setActionLog(data.actionLog);
                  if (data.rivalFunds) setRivalFunds(data.rivalFunds);
                  if (data.activeDeals) setActiveDeals(data.activeDeals);
                  logEvent('login_success');
                  
              } else {
                  console.log("[CLOUD_LOAD] New User. Starting Cold Open.");
                  setGamePhase('INTRO');
              }
          } catch (error) {
              console.error("Error loading save:", error);
          }
      };

      loadGame();
  }, [currentUser]);

  const saveGame = useCallback(async () => {
      if (!currentUser || !playerStats) return;
      if (!db) return;

      const gameState = {
          playerStats,
          gamePhase,
          activeScenarioId: activeScenario?.id,
          marketVolatility,
          npcs,
          tutorialStep,
          actionLog,
          rivalFunds,
          activeDeals,
          lastSaved: new Date().toISOString()
      };

      try {
          await setDoc(doc(db, 'users', currentUser.uid, 'savegame', 'primary'), gameState, { merge: true });
          console.log("[CLOUD_SAVE] Game saved successfully.");
      } catch (error) {
          console.error("Error saving game:", error);
      }
  }, [currentUser, playerStats, gamePhase, activeScenario, marketVolatility, npcs, tutorialStep, actionLog, rivalFunds, activeDeals]);

  useEffect(() => {
      if (gamePhase !== 'INTRO' && gamePhase !== 'GAME_OVER') {
          const timeout = setTimeout(() => saveGame(), 2000);
          return () => clearTimeout(timeout);
      }
  }, [playerStats, gamePhase, saveGame]);

  useEffect(() => {
      if (gamePhase === 'GAME_OVER' || gamePhase === 'PRISON' || gamePhase === 'ALONE') {
          logEvent('game_over', { reason: gamePhase, score: playerStats?.score || 0 });
      }
  }, [gamePhase]);

  // --- MARKET CYCLE ---
  useEffect(() => {
    if (gamePhase === 'INTRO') return;
    
    const interval = setInterval(() => {
        const rand = Math.random();
        let nextCycle: MarketVolatility = 'NORMAL';
        
        if (rand < 0.2) nextCycle = 'BULL_RUN';
        else if (rand < 0.4) nextCycle = 'CREDIT_CRUNCH';
        else if (rand < 0.45) nextCycle = 'PANIC'; 
        else nextCycle = 'NORMAL';

        if (marketVolatility !== 'PANIC' || Math.random() > 0.7) {
            setMarketVolatility(nextCycle);
        }
    }, 60000);

    return () => clearInterval(interval);
  }, [gamePhase, marketVolatility]);

  const decayNpcAffinities = useCallback(() => {
      let decayLogged = false;
      setNpcs(prev => prev.map(npc => {
          const moodDecay = npc.isRival ? 2 : 3;
          const trustDecay = 1;
          const nextMood = clampStat((npc.mood ?? npc.relationship) - moodDecay);
          const nextTrust = clampStat((npc.trust ?? npc.relationship) - trustDecay);
          if (nextMood !== npc.mood || nextTrust !== npc.trust) decayLogged = true;
          return { ...npc, mood: nextMood, trust: nextTrust };
      }));

      if (decayLogged) {
          addLogEntry('Relationships cooled after a quiet week. Ping your contacts to rebuild mood and trust.');
      }
  }, [addLogEntry]);

  const applyMissedAppointments = useCallback((dayType: DayType, timeSlot: TimeSlot, timeCursor: number) => {
      const missed: string[] = [];
      setNpcs(prev => prev.map(npc => {
          const standing = npc.schedule?.standingMeetings || [];
          const hasMeeting = standing.some(m => m.dayType === dayType && m.timeSlot === timeSlot);
          if (!hasMeeting) return npc;

          const metThisSlot = npc.lastContactTick === timeCursor;
          if (metThisSlot) return npc;

          missed.push(npc.name);
          const penaltyMood = -6;
          const penaltyTrust = -4;
          const memory = normalizeMemory({
              summary: `You missed our ${dayType === 'WEEKDAY' ? 'check-in' : 'meetup'} (${timeSlot.toLowerCase()}).`,
              sentiment: 'negative',
              impact: penaltyTrust,
              tags: ['missed_meeting'],
          }, npc.id);

          return {
              ...npc,
              mood: clampStat((npc.mood ?? npc.relationship) + penaltyMood),
              trust: clampStat((npc.trust ?? npc.relationship) + penaltyTrust),
              memories: clampMemories([...npc.memories, memory]),
          };
      }));

      if (missed.length) {
          addLogEntry(`Missed appointments with ${missed.join(', ')}. Mood and trust dropped.`);
      }
  }, [addLogEntry]);

  // --- TIME ADVANCEMENT & SCENARIO TRIGGER ---
  const advanceTime = useCallback(() => {
      if (!playerStats) return;

      const currentDayType = playerStats.currentDayType || 'WEEKDAY';
      const currentTimeSlot = playerStats.currentTimeSlot || 'MORNING';
      const currentTimeCursor = playerStats.timeCursor ?? 0;
      applyMissedAppointments(currentDayType, currentTimeSlot, currentTimeCursor);

      const nextMonth = playerStats.gameMonth + 1;
      const nextYear = nextMonth > 12 ? playerStats.gameYear + 1 : playerStats.gameYear;
      const finalMonth = nextMonth > 12 ? 1 : nextMonth;

      const { nextDayType, nextSlot } = getNextTimeState(currentDayType, currentTimeSlot);
      const nextTimeCursor = currentTimeCursor + 1;

      updatePlayerStats({
          score: 10,
      });

      decayNpcAffinities();

      setPlayerStats(prev => prev ? ({
          ...prev,
          gameYear: nextYear,
          gameMonth: finalMonth,
          currentDayType: nextDayType,
          currentTimeSlot: nextSlot,
          timeCursor: nextTimeCursor,
      }) : null);

      const totalPortfolioValue = playerStats.portfolio.reduce((acc, co) => acc + (co.currentValuation || 0), 0);
      const availableScenarios = SCENARIOS.filter(s => {
          if (playerStats.playedScenarioIds.includes(s.id) && s.id !== 1) return false;
          if (s.id === 1) return false;

          if (s.requiresPortfolio && playerStats.portfolio.length === 0) return false;
          if (s.minPortfolioCompanies && playerStats.portfolio.length < s.minPortfolioCompanies) return false;
          if (s.minPortfolioValue && totalPortfolioValue < s.minPortfolioValue) return false;

          if (s.minReputation && playerStats.reputation < s.minReputation) return false;
          if (s.maxReputation && playerStats.reputation > s.maxReputation) return false;

          if (s.allowedVolatility && !s.allowedVolatility.includes(marketVolatility)) return false;

          if (s.dayTypeGate) {
              if (s.dayTypeGate.dayType && s.dayTypeGate.dayType !== nextDayType) return false;
              if (s.dayTypeGate.timeSlots && s.dayTypeGate.timeSlots.length > 0 && !s.dayTypeGate.timeSlots.includes(nextSlot)) return false;
          }

          if (s.factionRequirements) {
              const meetsFactionReqs = s.factionRequirements.every(req => {
                  const current = playerStats.factionReputation[req.faction] ?? 0;
                  if (typeof req.min === 'number' && current < req.min) return false;
                  if (typeof req.max === 'number' && current > req.max) return false;
                  return true;
              });
              if (!meetsFactionReqs) return false;
          }

          if (s.minStress && playerStats.stress < s.minStress) return false;
          if (s.minCash && playerStats.cash < s.minCash) return false;

          if (s.npcRelationshipRequirements && s.npcRelationshipRequirements.length > 0) {
              const meetsNpcReqs = s.npcRelationshipRequirements.every(req => {
                  const npc = npcs.find(n => n.id === req.npcId);
                  if (!npc) return false;
                  if (typeof req.minRelationship === 'number' && npc.relationship < req.minRelationship) return false;
                  if (typeof req.minTrust === 'number' && (npc.trust ?? npc.relationship) < req.minTrust) return false;
                  return true;
              });
              if (!meetsNpcReqs) return false;
          }

          if (s.requiredFlags) {
              const hasAllFlags = s.requiredFlags.every(flag => playerStats.playerFlags[flag]);
              if (!hasAllFlags) return false;
          }

          if (s.blockedByFlags) {
              const hasBlockingFlag = s.blockedByFlags.some(flag => playerStats.playerFlags[flag]);
              if (hasBlockingFlag) return false;
          }

          return true;
      });

      const factionTension = Math.min(...Object.values(playerStats.factionReputation || DEFAULT_FACTION_REPUTATION));
      const cashPressure = playerStats.cash < 5000 ? 0.1 : 0;
      const auditPressure = playerStats.auditRisk > 50 ? 0.1 : 0;
      const crisisMultiplier = playerStats.stress > 70 ? 1.5 : 1.0;
      const volatilityBias = marketVolatility === 'PANIC' ? 0.2 : marketVolatility === 'CREDIT_CRUNCH' ? 0.1 : marketVolatility === 'BULL_RUN' ? 0.05 : 0;
      const tensionBias = factionTension < 40 ? 0.08 : 0;
      const portfolioBias = playerStats.portfolio.length > 0 ? 0.05 : 0;
      const shouldTriggerEvent = Math.random() < ((0.35 + cashPressure + auditPressure + volatilityBias + tensionBias + portfolioBias) * crisisMultiplier);
      const slotLabel = `${nextDayType} ${nextSlot}`;

      if (shouldTriggerEvent && availableScenarios.length > 0) {
          const scoredScenarios = availableScenarios.map(s => {
              let score = s.priorityWeight || 1;
              if (s.triggerTags?.includes('regulatory') && playerStats.auditRisk > 40) score += 2;
              if (s.triggerTags?.includes('rival') && (playerStats.factionReputation.RIVALS ?? 0) < 35) score += 1.5;
              if (s.triggerTags?.includes('lp') && (playerStats.factionReputation.LIMITED_PARTNERS ?? 0) > 50) score += 1;
              if (s.triggerTags?.includes('career') && playerStats.stress < 60) score += 0.5;
              if (s.triggerTags?.includes('insider') && marketVolatility === 'BULL_RUN') score += 1.25;
              return { scenario: s, score };
          });

          scoredScenarios.sort((a, b) => b.score - a.score);
          const topScore = scoredScenarios[0].score;
          const topCandidates = scoredScenarios.filter(s => s.score >= topScore - 0.75).slice(0, 3);
          const nextScenario = topCandidates[Math.floor(Math.random() * topCandidates.length)].scenario;

          setActiveScenario(nextScenario);
          setGamePhase('SCENARIO');
          
          updatePlayerStats({ playedScenarioIds: [nextScenario.id] });
          logEvent('scenario_triggered', { id: nextScenario.id, title: nextScenario.title });
          addLogEntry(`Event Triggered (${slotLabel}): ${nextScenario.title}`);
      } else {
          addLogEntry(`Week advanced to ${slotLabel}. No critical incidents reported.`);
      }

  }, [playerStats, decayNpcAffinities, updatePlayerStats, applyMissedAppointments, marketVolatility, npcs]);


  // --- STAT UPDATES ---
  const updatePlayerStats = useCallback((changes: StatChanges) => {
    const npcImpact = changes.npcRelationshipUpdate;
    const targetNpc = npcImpact ? npcs.find(n => n.id === npcImpact.npcId) : undefined;
    const playerDayType = playerStats?.currentDayType || 'WEEKDAY';
    const playerTimeSlot = playerStats?.currentTimeSlot || 'MORNING';
    const playerTimeCursor = playerStats?.timeCursor ?? 0;

    setPlayerStats(prevStats => {
        const baseStats = prevStats || DIFFICULTY_SETTINGS['Normal'].initialStats;
        const hydratedTimeState = {
            currentDayType: baseStats.currentDayType || 'WEEKDAY',
            currentTimeSlot: baseStats.currentTimeSlot || 'MORNING',
            timeCursor: typeof baseStats.timeCursor === 'number' ? baseStats.timeCursor : 0,
        };
        const newStats: PlayerStats = {
            ...baseStats,
            loanBalance: baseStats.loanBalance ?? 0,
            loanRate: baseStats.loanRate ?? 0,
            factionReputation: hydrateFactionReputation(baseStats.factionReputation),
            ...hydratedTimeState,
        };
        
        if (typeof changes.cash === 'number') newStats.cash += changes.cash;
        if (typeof changes.reputation === 'number') newStats.reputation += changes.reputation;
        if (typeof changes.stress === 'number') newStats.stress = Math.max(0, Math.min(100, newStats.stress + changes.stress));
        if (typeof changes.energy === 'number') newStats.energy = Math.max(0, Math.min(100, newStats.energy + changes.energy));
        if (typeof changes.analystRating === 'number') newStats.analystRating = Math.max(0, Math.min(100, newStats.analystRating + changes.analystRating));
        if (typeof changes.financialEngineering === 'number') newStats.financialEngineering += changes.financialEngineering;
        if (typeof changes.ethics === 'number') newStats.ethics = Math.max(0, Math.min(100, newStats.ethics + changes.ethics));
        if (typeof changes.auditRisk === 'number') newStats.auditRisk = Math.max(0, Math.min(100, newStats.auditRisk + changes.auditRisk));
        if (typeof changes.score === 'number') newStats.score += changes.score;
        if (typeof changes.health === 'number') newStats.health = Math.max(0, Math.min(100, (newStats.health || 100) + changes.health));
        if (typeof changes.dependency === 'number') newStats.dependency = Math.max(0, Math.min(100, (newStats.dependency || 0) + changes.dependency));
        if (typeof changes.aum === 'number') newStats.aum = (newStats.aum || 0) + changes.aum;
        if (changes.employees) newStats.employees = changes.employees;

        if (typeof changes.loanBalanceChange === 'number') {
            newStats.loanBalance = Math.max(0, (newStats.loanBalance || 0) + changes.loanBalanceChange);
        }
        if (typeof changes.loanRate === 'number') {
            newStats.loanRate = Math.max(0, changes.loanRate);
        }

        if (changes.addPortfolioCompany) {
             const finalCompany: PortfolioCompany = {
                  ...changes.addPortfolioCompany,
                  acquisitionDate: { year: prevStats ? prevStats.gameYear : 1, month: prevStats ? prevStats.gameMonth : 1 },
                  eventHistory: []
              };
              if (changes.dealModification) {
                 Object.assign(finalCompany, changes.dealModification);
              }
              newStats.portfolio = [...newStats.portfolio, finalCompany];
              logEvent('deal_signed', { name: finalCompany.name, valuation: finalCompany.currentValuation });
        }

        if (changes.portfolio) {
            newStats.portfolio = changes.portfolio;
        }

        if (changes.modifyCompany) {
             newStats.portfolio = newStats.portfolio.map(p => 
                p.id === changes.modifyCompany!.id ? { ...p, ...changes.modifyCompany!.updates } : p
             );
        }

        if (changes.setsFlags) {
            changes.setsFlags.forEach(flag => {
                newStats.playerFlags[flag] = true;
            });
        }
        
        if (changes.playedScenarioIds) {
            newStats.playedScenarioIds = Array.from(new Set([...newStats.playedScenarioIds, ...changes.playedScenarioIds]));
        }

        if (changes.removeNpcId) {
             newStats.playerFlags[`NPC_REMOVED_${changes.removeNpcId}`] = true;
        }

        if (changes.factionReputation) {
            Object.entries(changes.factionReputation).forEach(([faction, delta]) => {
                if (typeof delta === 'number') {
                    const key = faction as keyof FactionReputation;
                    newStats.factionReputation[key] = clampStat(
                        (newStats.factionReputation[key] ?? DEFAULT_FACTION_REPUTATION[key]) + delta
                    );
                }
            });
        }

        if (targetNpc?.faction && npcImpact) {
            const factionDelta = Math.round(npcImpact.change * 0.6);
            newStats.factionReputation[targetNpc.faction] = clampStat(
                (newStats.factionReputation[targetNpc.faction] ?? DEFAULT_FACTION_REPUTATION[targetNpc.faction]) + factionDelta
            );
        }

        // Prevent the player from running a negative balance unless a loan exists
        if (newStats.loanBalance <= 0) {
            newStats.loanBalance = 0;
            newStats.loanRate = 0;
            if (newStats.cash < 0) newStats.cash = 0;
        }

        return newStats;
    });

    if (changes.npcRelationshipUpdate) {
        const { npcId, change, trustChange, moodChange, memory, broadcastTo } = changes.npcRelationshipUpdate;
        const targetAvailable = targetNpc ? isNpcAvailable(targetNpc, playerDayType, playerTimeSlot) : true;
        const availabilityMoodPenalty = targetAvailable ? 0 : -4;
        const availabilityTrustPenalty = targetAvailable ? 0 : -2;
        const availabilityMemory = targetAvailable
            ? undefined
            : normalizeMemory({
                summary: `You pinged during their off-hours (${playerDayType.toLowerCase()} ${playerTimeSlot.toLowerCase()}).`,
                sentiment: 'negative',
                impact: availabilityTrustPenalty,
                tags: ['timing', 'off_hours'],
            }, npcId);

        setNpcs(prevNpcs => {
            const sourceNpc = prevNpcs.find(n => n.id === npcId);
            const normalizedMemory = memory ? normalizeMemory(memory, npcId) : undefined;
            const shareTargets = broadcastTo ?? (Math.abs(change) >= 6 ? ['LP', 'RIVAL'] : []);

            return prevNpcs.map(npc => {
                const isTargetNpc = npc.id === npcId;
                const calculatedTrustChange = typeof trustChange === 'number' ? trustChange : Math.round(change * 0.6);
                const calculatedMoodChange = typeof moodChange === 'number' ? moodChange : Math.round(change * 0.8);
                const shouldShareWithLp = shareTargets.includes('LP') && npc.role.includes('Limited Partner');
                const shouldShareWithRival = shareTargets.includes('RIVAL') && npc.isRival;
                const shouldReceiveRumor = !isTargetNpc && (shouldShareWithLp || shouldShareWithRival);

                if (isTargetNpc) {
                    const mergedMemories = [
                        ...npc.memories,
                        ...(normalizedMemory ? [normalizedMemory] : []),
                        ...(availabilityMemory ? [availabilityMemory] : []),
                    ];

                    return {
                        ...npc,
                        relationship: clampStat(npc.relationship + change),
                        mood: clampStat((npc.mood ?? npc.relationship) + calculatedMoodChange + availabilityMoodPenalty),
                        trust: clampStat((npc.trust ?? npc.relationship) + calculatedTrustChange + availabilityTrustPenalty),
                        memories: mergedMemories.length > npc.memories.length ? clampMemories(mergedMemories) : npc.memories,
                        lastContactTick: playerTimeCursor,
                    };
                }

                if (normalizedMemory && shouldReceiveRumor) {
                    const rumorSummary = `${sourceNpc?.name || 'Someone'}: ${normalizedMemory.summary}`;
                    const rumorMemory: NPCMemory = {
                        ...normalizedMemory,
                        summary: rumorSummary,
                        sentiment: normalizedMemory.sentiment || (change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral'),
                        tags: Array.from(new Set([...(normalizedMemory.tags || []), 'rumor'])),
                    };
                    return { ...npc, memories: clampMemories([...npc.memories, rumorMemory]) };
                }

                return npc;
            });
        });
    }
  }, [npcs, playerStats]);

  const handleActionOutcome = (outcome: { description: string; statChanges: StatChanges }, title: string) => {
      updatePlayerStats(outcome.statChanges);
  };

  const sendNpcMessage = (npcId: string, message: string, sender: 'player' | 'npc' | 'system' = 'player', senderName?: string) => {
      const currentTick = playerStats?.timeCursor ?? 0;
      setNpcs(prev => prev.map(npc => {
          if (npc.id === npcId) {
              return {
                  ...npc,
                  dialogueHistory: [...npc.dialogueHistory, { sender, senderName, text: message }],
                  lastContactTick: sender === 'player' ? currentTick : npc.lastContactTick,
              };
          }
          return npc;
      }));
  };

  const setTutorialStepHandler = (step: number) => {
      setTutorialStep(step);
  };

  // --- RIVAL FUND FUNCTIONS ---
  
  const updateRivalFund = useCallback((fundId: string, updates: Partial<RivalFund>) => {
      setRivalFunds(prev => prev.map(fund =>
          fund.id === fundId ? { ...fund, ...updates } : fund
      ));
  }, []);

  const addDeal = useCallback((deal: CompetitiveDeal) => {
      setActiveDeals(prev => [...prev, deal]);
      addLogEntry(`NEW DEAL: ${deal.companyName} ($${(deal.askingPrice / 1000000).toFixed(0)}M)`);
  }, []);

  const removeDeal = useCallback((dealId: number) => {
      setActiveDeals(prev => prev.filter(d => d.id !== dealId));
  }, []);

  const generateNewDeals = useCallback(() => {
      const availableDeals = COMPETITIVE_DEALS.filter(
          d => !activeDeals.some(ad => ad.id === d.id)
      );
      
      if (availableDeals.length === 0) return;
      
      if (Math.random() > 0.4) return;
      
      const numDeals = Math.random() > 0.7 ? 2 : 1;
      const shuffled = [...availableDeals].sort(() => Math.random() - 0.5);
      const newDeals = shuffled.slice(0, Math.min(numDeals, availableDeals.length));
      
      newDeals.forEach(deal => {
          const interestedRivals = rivalFunds
              .filter(fund => {
                  if (fund.dryPowder < deal.askingPrice * 0.5) return false;
                  if (deal.dealType === DealType.VENTURE_CAPITAL && fund.strategy === 'CONSERVATIVE') return Math.random() > 0.8;
                  if (deal.isHot && fund.strategy === 'PREDATORY') return true;
                  return Math.random() > 0.3;
              })
              .map(f => f.id);
          
          addDeal({
              ...deal,
              interestedRivals,
              deadline: deal.deadline + Math.floor(Math.random() * 3) - 1
          });
      });
  }, [activeDeals, rivalFunds, addDeal]);

  // Expire deals on time advance
  useEffect(() => {
      if (!playerStats) return;
      
      setActiveDeals(prev => prev.map(deal => ({
          ...deal,
          deadline: deal.deadline - 1
      })).filter(deal => deal.deadline > 0));
  }, [playerStats?.gameMonth]);

  const resetGame = useCallback(() => {
      setPlayerStats(null);
      setNpcs([...INITIAL_NPCS, ...RIVAL_FUND_NPCS].map(hydrateNpc));
      setActiveScenario(SCENARIOS[0]);
      setGamePhase('INTRO');
      setDifficulty(null);
      setMarketVolatility('NORMAL');
      setTutorialStep(0);
      setActionLog([]);
      setRivalFunds(RIVAL_FUNDS);
      setActiveDeals([]);
      logEvent('game_reset');
  }, []);

  return (
    <GameContext.Provider value={{
      user,
      playerStats,
      npcs,
      activeScenario,
      gamePhase,
      difficulty,
      marketVolatility,
      tutorialStep,
      actionLog,
      setGamePhase,
      updatePlayerStats,
      handleActionOutcome,
      sendNpcMessage,
      addLogEntry,
      setTutorialStep: setTutorialStepHandler,
      advanceTime,
      rivalFunds,
      activeDeals,
      updateRivalFund,
      addDeal,
      removeDeal,
      generateNewDeals,
      resetGame
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};