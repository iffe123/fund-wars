import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useRef } from 'react';
import type { GameContextType, PlayerStats, GamePhase, Difficulty, MarketVolatility, UserProfile, NPC, NPCMemory, Scenario, StatChanges, PortfolioCompany, RivalFund, CompetitiveDeal, DayType, TimeSlot, KnowledgeEntry, AIState, RivalMindsetState, CoalitionStateData, PersonalFinances, LifestyleLevel, SkillInvestment, DealAllocation, Warning, NPCDrama, CompanyActiveEvent, ActionType, GameTime } from '../types';
import { PlayerLevel, DealType, ACTION_COSTS } from '../types';

// Import World Engine for living world system
import { processWorldTick, generateWarnings, initializePortfolioCompanyFields } from '../utils/worldEngine';
import { generateCompanyEvent } from '../constants/companyEvents';
import { DEFAULT_FACTION_REPUTATION, DIFFICULTY_SETTINGS, INITIAL_NPCS, SCENARIOS, RIVAL_FUNDS, COMPETITIVE_DEALS, RIVAL_FUND_NPCS, COMPENSATION_BY_LEVEL, BONUS_FACTORS, COALITION_ANNOUNCEMENTS, PSYCHOLOGICAL_WARFARE_MESSAGES, VENDETTA_ESCALATION_MESSAGES, SURPRISE_ATTACK_MESSAGES, FAMILY_NPCS, LIFESTYLE_TIERS, DEFAULT_PERSONAL_FINANCES, SKILL_INVESTMENTS } from '../constants';

// Import Advanced AI System
import {
  calculateAdaptiveDifficulty,
  generateRivalMindset,
  decideTacticalMove,
  checkCoalitionFormation,
  generateSurpriseEvent,
  calculateTacticalMoveEffects,
  generateTacticalMoveMessage,
  generateAIKnowledgeEntry,
  getVendettaPhase,
  VENDETTA_BEHAVIORS,
} from '../utils/rivalAI';
import { useAuth } from './AuthContext';
import { db } from '../services/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { logEvent } from '../services/analytics';

// Import extracted utilities
import {
  clampStat,
  generateUniquePortfolioId,
  TIME_SLOTS,
  getNextTimeState,
  hydrateFactionReputation,
  normalizeMemory,
  clampMemories,
  normalizeKnowledgeEntry,
  clampKnowledge,
  sanitizeKnowledgeLog,
  sanitizeKnowledgeFlags,
  hydrateNpc,
  hydrateRivalFund,
  hydrateCompetitiveDeal,
  MAX_PORTFOLIO_SIZE
} from '../utils/gameUtils';

interface GameContextTypeExtended extends GameContextType {
    advanceTime: () => void;
    rivalFunds: RivalFund[];
    activeDeals: CompetitiveDeal[];
    updateRivalFund: (fundId: string, updates: Partial<RivalFund>) => void;
    addDeal: (deal: CompetitiveDeal) => void;
    removeDeal: (dealId: number) => void;
    generateNewDeals: () => void;
    resetGame: () => void;
    // Living World System
    activeWarnings: Warning[];
    activeDrama: NPCDrama | null;
    activeCompanyEvent: CompanyActiveEvent | null;
    eventQueue: CompanyActiveEvent[];
    pendingDecision: { event: CompanyActiveEvent | NPCDrama; awaitingAdvisorResponse: boolean } | null;
    dismissWarning: (id: string) => void;
    handleWarningAction: (warning: Warning) => void;
    setActiveDrama: (drama: NPCDrama | null) => void;
    setActiveCompanyEvent: (event: CompanyActiveEvent | null) => void;
    handleEventDecision: (eventId: string, optionId: string) => void;
    // Time & Action System
    useAction: (actionType: ActionType) => boolean;
    endWeek: () => void;
    toggleNightGrinder: () => void;
}

const GameContext = createContext<GameContextTypeExtended | undefined>(undefined);

// Re-export utilities for backward compatibility
export { sanitizeKnowledgeLog, sanitizeKnowledgeFlags, hydrateNpc, hydrateRivalFund, hydrateFund, hydrateCompetitiveDeal, MAX_PORTFOLIO_SIZE } from '../utils/gameUtils';

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  
  const user: UserProfile | null = currentUser ? {
      id: currentUser.uid,
      name: currentUser.displayName || 'Anonymous',
      email: currentUser.email || '',
      picture: currentUser.photoURL || ''
  } : null;

  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [npcs, setNpcs] = useState<NPC[]>([...INITIAL_NPCS, ...RIVAL_FUND_NPCS, ...FAMILY_NPCS].map(hydrateNpc));
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(SCENARIOS?.[0] ?? null);
  const [gamePhase, setGamePhase] = useState<GamePhase>('INTRO');
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [marketVolatility, setMarketVolatility] = useState<MarketVolatility>('NORMAL');
  const [tutorialStep, setTutorialStep] = useState<number>(0);
  const [actionLog, setActionLog] = useState<string[]>([]);

  // Living World System State
  const [activeWarnings, setActiveWarnings] = useState<Warning[]>([]);
  const [activeDrama, setActiveDrama] = useState<NPCDrama | null>(null);
  const [activeCompanyEvent, setActiveCompanyEvent] = useState<CompanyActiveEvent | null>(null);
  const [eventQueue, setEventQueue] = useState<CompanyActiveEvent[]>([]);
  const [pendingDecision, setPendingDecision] = useState<{ event: CompanyActiveEvent | NPCDrama; awaitingAdvisorResponse: boolean } | null>(null);

  const addLogEntry = useCallback((message: string) => {
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const entry = `${timestamp} // ${message}`;
      setActionLog(prev => [entry, ...prev].slice(0, 50));
      console.log(`[Game Log]: ${message}`);
  }, []);

  const appendNpcMemory = useCallback((npcId: string, memory: NPCMemory | string) => {
      setNpcs(prev => prev.map(npc => {
          if (npc.id !== npcId) return npc;

          const normalized = normalizeMemory(memory, npcId);
          return { ...npc, memories: clampMemories([...npc.memories, normalized]) };
      }));
  }, []);
  
  // --- RIVAL FUNDS & COMPETITIVE DEALS ---
  const [rivalFunds, setRivalFunds] = useState<RivalFund[]>(RIVAL_FUNDS.map(hydrateRivalFund));
  const [activeDeals, setActiveDeals] = useState<CompetitiveDeal[]>([]);
  const lastProcessedRivalTickRef = useRef<number | null>(null);

  // --- ADVANCED AI STATE ---
  const [aiState, setAIState] = useState<AIState>({
    playerPatterns: {},
    rivalMindsets: {},
    coalitionState: null,
    lastAnalysisUpdate: 0,
    dealsWonByPlayer: [],
    dealsLostByPlayer: [],
    playerBidHistory: [],
  });

  // Track previous vendetta levels for escalation detection
  const previousVendettaRef = useRef<Record<string, number>>({});

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

      // Skip cloud load for guest users (they have fake UIDs that Firebase rejects)
      if (currentUser.uid.startsWith('guest_')) {
          console.log("[CLOUD_LOAD] Guest mode - starting fresh game.");
          setGamePhase('INTRO');
          return;
      }

      // Helper: wrap getDoc with timeout to prevent infinite loading
      const getDocWithTimeout = async (docRef: ReturnType<typeof doc>, timeoutMs: number) => {
          const timeoutPromise = new Promise<never>((_, reject) => {
              setTimeout(() => reject(new Error('Firestore timeout')), timeoutMs);
          });
          return Promise.race([getDoc(docRef), timeoutPromise]);
      };

      const loadGame = async () => {
          try {
              const docRef = doc(db, 'users', currentUser.uid, 'savegame', 'primary');
              // 10 second timeout to prevent infinite "RESTORING SESSION..." screen
              const docSnap = await getDocWithTimeout(docRef, 10000);

              if (docSnap.exists()) {
                  // Cast to any to handle DocumentData being unknown
                  const data = docSnap.data() as any;
                  console.log("[CLOUD_LOAD] Save found:", data);

                  try {
                      const safeKnowledgeLog = sanitizeKnowledgeLog(data.playerStats?.knowledgeLog);
                      const safeKnowledgeFlags = sanitizeKnowledgeFlags(data.playerStats?.knowledgeFlags);
                      const safeNpcs = Array.isArray(data.npcs) ? data.npcs.map(hydrateNpc) : [...INITIAL_NPCS, ...RIVAL_FUND_NPCS, ...FAMILY_NPCS].map(hydrateNpc);
                      const safeRivalFunds = Array.isArray(data.rivalFunds) ? data.rivalFunds.map(hydrateRivalFund) : RIVAL_FUNDS.map(hydrateRivalFund);
                      const safeActiveDeals = Array.isArray(data.activeDeals)
                        ? data.activeDeals
                            .map(hydrateCompetitiveDeal)
                            .filter((deal): deal is CompetitiveDeal => Boolean(deal))
                        : [];

                      if (data.playerStats) {
                          // Hydrate personal finances with backward compatibility
                          const savedPersonalFinances = data.playerStats.personalFinances;
                          const hydratedPersonalFinances: PersonalFinances = savedPersonalFinances ? {
                            bankBalance: savedPersonalFinances.bankBalance ?? data.playerStats.cash ?? 1500,
                            totalEarnings: savedPersonalFinances.totalEarnings ?? 0,
                            salaryYTD: savedPersonalFinances.salaryYTD ?? 0,
                            bonusYTD: savedPersonalFinances.bonusYTD ?? 0,
                            carryReceived: savedPersonalFinances.carryReceived ?? 0,
                            outstandingLoans: savedPersonalFinances.outstandingLoans ?? data.playerStats.loanBalance ?? 0,
                            loanInterestRate: savedPersonalFinances.loanInterestRate ?? data.playerStats.loanRate ?? 0,
                            monthlyBurn: savedPersonalFinances.monthlyBurn ?? 2000,
                            lifestyleLevel: savedPersonalFinances.lifestyleLevel ?? 'BROKE_ASSOCIATE',
                          } : {
                            // Migrate from legacy cash system
                            bankBalance: data.playerStats.cash ?? 1500,
                            totalEarnings: 0,
                            salaryYTD: 0,
                            bonusYTD: 0,
                            carryReceived: 0,
                            outstandingLoans: data.playerStats.loanBalance ?? 0,
                            loanInterestRate: data.playerStats.loanRate ?? 0,
                            monthlyBurn: 2000,
                            lifestyleLevel: 'BROKE_ASSOCIATE',
                          };

                          setPlayerStats({
                            ...data.playerStats,
                            loanBalance: data.playerStats.loanBalance ?? 0,
                            loanRate: data.playerStats.loanRate ?? 0,
                            factionReputation: hydrateFactionReputation(data.playerStats.factionReputation),
                            currentDayType: data.playerStats.currentDayType || 'WEEKDAY',
                            currentTimeSlot: data.playerStats.currentTimeSlot || 'MORNING',
                            timeCursor: typeof data.playerStats.timeCursor === 'number' ? data.playerStats.timeCursor : 0,
                            knowledgeLog: safeKnowledgeLog,
                            knowledgeFlags: safeKnowledgeFlags,
                            // Ensure new fields have proper defaults
                            unlockedAchievements: data.playerStats.unlockedAchievements || [],
                            sectorExpertise: data.playerStats.sectorExpertise || [],
                            completedExits: data.playerStats.completedExits || [],
                            totalRealizedGains: data.playerStats.totalRealizedGains ?? 0,
                            portfolio: Array.isArray(data.playerStats.portfolio) ? data.playerStats.portfolio : [],
                            playedScenarioIds: Array.isArray(data.playerStats.playedScenarioIds) ? data.playerStats.playedScenarioIds : [],
                            playerFlags: data.playerStats.playerFlags || {},
                            employees: data.playerStats.employees || [],
                            // NEW: Personal & Fund Finances
                            personalFinances: hydratedPersonalFinances,
                            fundFinances: data.playerStats.fundFinances ?? null,
                            dealAllocations: data.playerStats.dealAllocations || [],
                            carryEligibleDeals: data.playerStats.carryEligibleDeals || [],
                            activeSkillInvestments: data.playerStats.activeSkillInvestments || [],
                            // NEW: Time & Action System - ensure gameTime has proper defaults
                            gameTime: data.playerStats.gameTime || {
                              week: 1,
                              year: 1,
                              quarter: 1 as 1 | 2 | 3 | 4,
                              actionsRemaining: 4,
                              maxActions: 4,
                              isNightGrinder: false,
                              actionsUsedThisWeek: [],
                            },
                          });
                      }
                      if (data.gamePhase) setGamePhase(data.gamePhase);
                      if (data.activeScenarioId) {
                          const scen = SCENARIOS.find(s => s.id === data.activeScenarioId);
                          if (scen) setActiveScenario(scen);
                      }
                      if (data.marketVolatility) setMarketVolatility(data.marketVolatility);
                      if (data.npcs) setNpcs(safeNpcs);
                      if (data.tutorialStep !== undefined) setTutorialStep(data.tutorialStep);
                      if (data.actionLog) setActionLog(data.actionLog);
                      if (data.rivalFunds) setRivalFunds(safeRivalFunds);
                      if (data.activeDeals) setActiveDeals(safeActiveDeals);
                      logEvent('login_success');
                  } catch (parseError) {
                      console.error('[CLOUD_LOAD] Save data malformed, resetting to defaults.', parseError);
                      setPlayerStats(null);
                      setNpcs([...INITIAL_NPCS, ...RIVAL_FUND_NPCS, ...FAMILY_NPCS].map(hydrateNpc));
                      setRivalFunds(RIVAL_FUNDS.map(hydrateRivalFund));
                      setGamePhase('INTRO');
                  }

              } else {
                  console.log("[CLOUD_LOAD] New User. Starting Cold Open.");
                  setGamePhase('INTRO');
              }
          } catch (error) {
              console.error("Error loading save:", error);
              // On any load failure (including timeout), start fresh game
              // This prevents infinite "RESTORING SESSION..." screen
              console.log("[CLOUD_LOAD] Load failed, starting fresh game.");
              setPlayerStats(null);
              setGamePhase('INTRO');
          }
      };

      loadGame();
  }, [currentUser]);

  // Helper function to remove undefined values from objects for Firestore compatibility
  const removeUndefined = useCallback(<T extends Record<string, unknown>>(obj: T): T => {
      const result: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj)) {
          if (value === undefined) continue;
          if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
              result[key] = removeUndefined(value as Record<string, unknown>);
          } else if (Array.isArray(value)) {
              result[key] = value.map(item =>
                  item !== null && typeof item === 'object' ? removeUndefined(item as Record<string, unknown>) : item
              );
          } else {
              result[key] = value;
          }
      }
      return result as T;
  }, []);

  const saveGame = useCallback(async () => {
      if (!currentUser || !playerStats) return;
      if (!db) return;

      // Skip cloud save for guest users (they have fake UIDs that Firebase rejects)
      if (currentUser.uid.startsWith('guest_')) {
          console.log("[CLOUD_SAVE] Guest mode - skipping cloud save.");
          return;
      }

      // Sanitize playerStats to remove undefined values (Firestore doesn't accept undefined)
      const sanitizedPlayerStats = removeUndefined(playerStats as unknown as Record<string, unknown>);

      const gameState = {
          playerStats: sanitizedPlayerStats,
          gamePhase,
          activeScenarioId: activeScenario?.id ?? null,
          marketVolatility,
          npcs: npcs.map(npc => removeUndefined(npc as unknown as Record<string, unknown>)),
          tutorialStep,
          actionLog,
          rivalFunds: rivalFunds.map(fund => removeUndefined(fund as unknown as Record<string, unknown>)),
          activeDeals: activeDeals.map(deal => removeUndefined(deal as unknown as Record<string, unknown>)),
          lastSaved: new Date().toISOString()
      };

      try {
          await setDoc(doc(db, 'users', currentUser.uid, 'savegame', 'primary'), gameState, { merge: true });
          console.log("[CLOUD_SAVE] Game saved successfully.");
      } catch (error) {
          console.error("Error saving game:", error);
      }
  }, [currentUser, playerStats, gamePhase, activeScenario, marketVolatility, npcs, tutorialStep, actionLog, rivalFunds, activeDeals, removeUndefined]);

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
            knowledgeLog: (baseStats.knowledgeLog || []).map(k => normalizeKnowledgeEntry(k)),
            knowledgeFlags: Array.from(new Set(baseStats.knowledgeFlags || [])),
        };

        const normalizedKnowledgeGain: KnowledgeEntry[] = (changes.knowledgeGain || []).map(k => normalizeKnowledgeEntry(k));
        const derivedKnowledge: KnowledgeEntry[] = [];
        if (npcImpact?.memory) {
            const baseMemory = typeof npcImpact.memory === 'string' ? { summary: npcImpact.memory } : npcImpact.memory;
            derivedKnowledge.push(
                normalizeKnowledgeEntry({
                    summary: baseMemory.summary,
                    timestamp: baseMemory.timestamp,
                    source: targetNpc?.name || npcImpact.npcId,
                    tags: baseMemory.tags || ['npc'],
                }, npcImpact.npcId)
            );
        }

        const knowledgeLog = clampKnowledge([
            ...(newStats.knowledgeLog || []),
            ...normalizedKnowledgeGain,
            ...derivedKnowledge,
        ]);

        const combinedFlags = Array.from(new Set([...(newStats.knowledgeFlags || []), ...(changes.knowledgeFlags || [])]));

        const updatedStats: PlayerStats = {
            ...newStats,
            stress: clampStat(newStats.stress + (changes.stress || 0)),
            reputation: clampStat(newStats.reputation + (changes.reputation || 0)),
            cash: newStats.cash + (changes.cash || 0),
            knowledgeLog,
            knowledgeFlags: combinedFlags,
            factionReputation: { ...hydrateFactionReputation(newStats.factionReputation) },
        };

        // Apply missing stat handlers (Bug fix: these were never applied before)
        if (changes.energy !== undefined) {
            updatedStats.energy = clampStat(newStats.energy + changes.energy);
        }
        if (changes.health !== undefined) {
            updatedStats.health = clampStat(newStats.health + changes.health);
        }
        if (changes.dependency !== undefined) {
            updatedStats.dependency = clampStat(newStats.dependency + changes.dependency);
        }
        if (changes.analystRating !== undefined) {
            updatedStats.analystRating = clampStat(newStats.analystRating + changes.analystRating);
        }
        if (changes.financialEngineering !== undefined) {
            updatedStats.financialEngineering = clampStat(newStats.financialEngineering + changes.financialEngineering);
        }
        if (changes.ethics !== undefined) {
            updatedStats.ethics = clampStat(newStats.ethics + changes.ethics);
        }
        if (changes.level !== undefined) {
            updatedStats.level = changes.level;
        }
        if (changes.employees !== undefined) {
            updatedStats.employees = changes.employees;
        }
        if (changes.aum !== undefined) {
            updatedStats.aum = (newStats.aum || 0) + changes.aum;
        }

        // Apply portfolio mutations (add/modify)
        const currentPortfolio = Array.isArray(newStats.portfolio) ? newStats.portfolio : [];
        let portfolio = currentPortfolio;

        if (changes.addPortfolioCompany) {
            // Check portfolio size limit
            if (portfolio.length >= MAX_PORTFOLIO_SIZE) {
                console.warn(`[PORTFOLIO] Portfolio at max capacity (${MAX_PORTFOLIO_SIZE}). Exit a company before acquiring more.`);
            } else {
                const existingIds = portfolio.map(c => c.id);
                const newCompanyId = changes.addPortfolioCompany.id;
                // Generate unique ID if collision detected or if ID is missing
                const uniqueId = (!newCompanyId || existingIds.includes(newCompanyId))
                    ? generateUniquePortfolioId(existingIds)
                    : newCompanyId;

                // Prevent duplicate companies by name as a secondary check
                const existingByName = portfolio.find(c =>
                    c.name.toLowerCase() === changes.addPortfolioCompany!.name.toLowerCase()
                );
                if (existingByName) {
                    console.warn(`[PORTFOLIO] Company "${changes.addPortfolioCompany.name}" already in portfolio, skipping`);
                } else {
                    portfolio = [...portfolio, {
                        ...changes.addPortfolioCompany,
                        id: uniqueId,
                        acquisitionDate: { year: baseStats.gameYear || 1, month: baseStats.gameMonth || 1 },
                        eventHistory: []
                    } as PortfolioCompany];
                }
            }
        }

        if (changes.modifyCompany) {
            const { id, updates } = changes.modifyCompany;
            portfolio = portfolio.map(company =>
                company.id === id
                    ? {
                        ...company,
                        ...updates,
                        latestCeoReport: updates.latestCeoReport ?? company.latestCeoReport ?? 'Pending Analysis...'
                      }
                    : company
            );
        }

        if (portfolio !== currentPortfolio) {
            updatedStats.portfolio = portfolio;
        }

        const factionChange = changes.factionReputation;
        if (factionChange) {
            (Object.keys(factionChange) as Array<keyof typeof factionChange>).forEach(key => {
                updatedStats.factionReputation[key] = clampStat(updatedStats.factionReputation[key] + (factionChange[key] || 0));
            });
        }

        if (changes.setsFlags?.length) {
            updatedStats.playerFlags = {
                ...newStats.playerFlags,
                ...changes.setsFlags.reduce((acc, flag) => ({ ...acc, [flag]: true }), {} as Record<string, boolean>)
            };
        }

        if (changes.loanBalanceChange) {
            updatedStats.loanBalance = Math.max(0, (updatedStats.loanBalance || 0) + changes.loanBalanceChange);
        }

        if (changes.loanRate !== undefined) {
            // Clamp loan rate to reasonable bounds (5% to 50% APR)
            // 0 is also valid (no interest / no loan)
            const validatedRate = changes.loanRate === 0 ? 0 : Math.max(0.05, Math.min(0.50, changes.loanRate));
            updatedStats.loanRate = validatedRate;
        }

        if (changes.portfolio) {
            updatedStats.portfolio = changes.portfolio;
        }

        const daysAdvanced = changes.advanceDays || 0;
        if (daysAdvanced !== 0) {
            const currentIndex = TIME_SLOTS.indexOf(playerTimeSlot);
            const slotsToAdvance = daysAdvanced * TIME_SLOTS.length + currentIndex;
            const nextSlot = TIME_SLOTS[slotsToAdvance % TIME_SLOTS.length];
            const dayIncrements = Math.floor(slotsToAdvance / TIME_SLOTS.length);
            const nextDayType: DayType = ((playerDayType === 'WEEKDAY' ? 0 : 1) + dayIncrements) % 2 === 0 ? 'WEEKDAY' : 'WEEKEND';

            updatedStats.currentDayType = nextDayType;
            updatedStats.currentTimeSlot = nextSlot;
            updatedStats.timeCursor = playerTimeCursor + daysAdvanced;
        }

        const timeShift = changes.advanceTimeSlots || 0;
        if (timeShift !== 0) {
            const currentIndex = TIME_SLOTS.indexOf(updatedStats.currentTimeSlot);
            const nextIndex = (currentIndex + timeShift + TIME_SLOTS.length) % TIME_SLOTS.length;
            const crossedBoundary = Math.floor((currentIndex + timeShift) / TIME_SLOTS.length);
            const nextDayType: DayType = ((updatedStats.currentDayType === 'WEEKDAY' ? 0 : 1) + crossedBoundary) % 2 === 0
                ? 'WEEKDAY'
                : 'WEEKEND';

            updatedStats.currentTimeSlot = TIME_SLOTS[nextIndex];
            updatedStats.currentDayType = nextDayType;
            updatedStats.timeCursor = updatedStats.timeCursor + crossedBoundary;
        }

        if (changes.score) {
            updatedStats.score = (updatedStats.score || 0) + changes.score;
        }

        if (changes.auditRisk !== undefined) {
            updatedStats.auditRisk = clampStat((updatedStats.auditRisk || 0) + changes.auditRisk);
        }

        if (changes.loanBalanceChange && updatedStats.cash < 0) {
            updatedStats.cash = 0;
        }

        if (changes.npcRelationshipUpdate && targetNpc) {
            const npcUpdate = changes.npcRelationshipUpdate;
            const change = npcUpdate.change || 0;
            const impact = Math.abs(change);

            setNpcs(prev => prev.map(npc => npc.id === targetNpc.id
                ? {
                    ...npc,
                    mood: clampStat((npc.mood ?? npc.relationship) + change),
                    trust: clampStat((npc.trust ?? npc.relationship) + change),
                    memories: clampMemories([...npc.memories, normalizeMemory({
                        summary: (typeof npcUpdate.memory === 'string' ? npcUpdate.memory : npcUpdate.memory?.summary) || `Relationship changed by ${change}`,
                        sentiment: change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral',
                        impact,
                        sourceNpcId: targetNpc.id,
                    }, npc.id)]),
                }
                : npc
            ));
        }

        // Bug fix: Handle NPC removal (was declared in StatChanges but never implemented)
        if (changes.removeNpcId) {
            setNpcs(prev => prev.filter(npc => npc.id !== changes.removeNpcId));
        }

        // New: Achievement System - unlock achievement
        if (changes.unlockAchievement) {
            const existingAchievements = updatedStats.unlockedAchievements || [];
            if (!existingAchievements.includes(changes.unlockAchievement)) {
                updatedStats.unlockedAchievements = [...existingAchievements, changes.unlockAchievement];
            }
        }

        // New: Industry Specialization - add sector experience
        if (changes.sectorExperienceGain) {
            const { sector, amount } = changes.sectorExperienceGain;
            const existingExpertise = [...(updatedStats.sectorExpertise || [])];
            const sectorIndex = existingExpertise.findIndex(e => e.sector === sector);

            if (sectorIndex >= 0) {
                existingExpertise[sectorIndex] = {
                    ...existingExpertise[sectorIndex],
                    level: clampStat(existingExpertise[sectorIndex].level + amount),
                    dealsCompleted: existingExpertise[sectorIndex].dealsCompleted + 1,
                };
            } else {
                existingExpertise.push({
                    sector,
                    level: clampStat(amount),
                    dealsCompleted: 1,
                });
            }
            updatedStats.sectorExpertise = existingExpertise;
        }

        // New: Set primary sector
        if (changes.setPrimarySector) {
            updatedStats.primarySector = changes.setPrimarySector;
        }

        // New: Exit Tracking - add exit result
        if (changes.addExitResult) {
            const existingExits = updatedStats.completedExits || [];
            updatedStats.completedExits = [...existingExits, changes.addExitResult];
            updatedStats.totalRealizedGains = (updatedStats.totalRealizedGains || 0) + changes.addExitResult.profit;
        }

        // ==================== NEW: PERSONAL FINANCE SYSTEM ====================

        // Initialize personal finances if missing (migration from legacy)
        if (!updatedStats.personalFinances) {
            updatedStats.personalFinances = {
                bankBalance: updatedStats.cash || 1500,
                totalEarnings: 0,
                salaryYTD: 0,
                bonusYTD: 0,
                carryReceived: 0,
                outstandingLoans: updatedStats.loanBalance || 0,
                loanInterestRate: updatedStats.loanRate || 0,
                monthlyBurn: 2000,
                lifestyleLevel: 'BROKE_ASSOCIATE',
            };
        }

        // Handle personalCash changes (direct bank balance adjustment)
        if (changes.personalCash !== undefined) {
            updatedStats.personalFinances = {
                ...updatedStats.personalFinances,
                bankBalance: updatedStats.personalFinances.bankBalance + changes.personalCash,
            };
            // Keep legacy cash in sync
            updatedStats.cash = updatedStats.personalFinances.bankBalance;
        }

        // Handle lifestyle level changes
        if (changes.lifestyleLevel !== undefined) {
            const newLifestyle = LIFESTYLE_TIERS[changes.lifestyleLevel];
            if (newLifestyle) {
                updatedStats.personalFinances = {
                    ...updatedStats.personalFinances,
                    lifestyleLevel: changes.lifestyleLevel,
                    monthlyBurn: newLifestyle.monthlyBurn,
                };
            }
        }

        // Handle carry distribution from exits
        if (changes.carryDistribution !== undefined && changes.carryDistribution > 0) {
            updatedStats.personalFinances = {
                ...updatedStats.personalFinances,
                bankBalance: updatedStats.personalFinances.bankBalance + changes.carryDistribution,
                carryReceived: updatedStats.personalFinances.carryReceived + changes.carryDistribution,
                totalEarnings: updatedStats.personalFinances.totalEarnings + changes.carryDistribution,
            };
            // Keep legacy cash in sync
            updatedStats.cash = updatedStats.personalFinances.bankBalance;
        }

        // Handle deal allocation (staffing on deals for carry eligibility)
        if (changes.dealAllocation) {
            const existingAllocations = updatedStats.dealAllocations || [];
            const existingIndex = existingAllocations.findIndex(
                a => a.companyId === changes.dealAllocation!.companyId
            );
            if (existingIndex >= 0) {
                // Update existing allocation
                existingAllocations[existingIndex] = {
                    ...existingAllocations[existingIndex],
                    ...changes.dealAllocation,
                };
                updatedStats.dealAllocations = existingAllocations;
            } else {
                // Add new allocation
                updatedStats.dealAllocations = [...existingAllocations, changes.dealAllocation];
            }
        }

        // Handle skill investment (start learning a new skill)
        if (changes.skillInvestment) {
            const skillDef = SKILL_INVESTMENTS.find(s => s.id === changes.skillInvestment);
            if (skillDef) {
                const currentTick = updatedStats.timeCursor || 0;
                const newInvestment: SkillInvestment = {
                    id: skillDef.id,
                    name: skillDef.name,
                    cost: skillDef.cost,
                    timeWeeks: skillDef.timeWeeks,
                    startedWeek: currentTick,
                    completed: false,
                };
                const existingInvestments = updatedStats.activeSkillInvestments || [];
                // Don't add duplicates
                if (!existingInvestments.some(s => s.id === skillDef.id)) {
                    updatedStats.activeSkillInvestments = [...existingInvestments, newInvestment];
                    // Deduct cost from bank balance
                    updatedStats.personalFinances = {
                        ...updatedStats.personalFinances,
                        bankBalance: updatedStats.personalFinances.bankBalance - skillDef.cost,
                    };
                    updatedStats.cash = updatedStats.personalFinances.bankBalance;
                }
            }
        }

        // Handle second NPC relationship update (for scenarios affecting multiple NPCs)
        if (changes.npcRelationshipUpdate2) {
            const npcUpdate2 = changes.npcRelationshipUpdate2;
            const targetNpc2 = npcs.find(n => n.id === npcUpdate2.npcId);
            if (targetNpc2) {
                const change = npcUpdate2.change || 0;
                const impact = Math.abs(change);
                setNpcs(prev => prev.map(npc => npc.id === targetNpc2.id
                    ? {
                        ...npc,
                        mood: clampStat((npc.mood ?? npc.relationship) + change),
                        trust: clampStat((npc.trust ?? npc.relationship) + (npcUpdate2.trustChange ?? change)),
                        memories: clampMemories([...npc.memories, normalizeMemory({
                            summary: (typeof npcUpdate2.memory === 'string' ? npcUpdate2.memory : npcUpdate2.memory?.summary) || `Relationship changed by ${change}`,
                            sentiment: change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral',
                            impact,
                            sourceNpcId: targetNpc2.id,
                        }, npc.id)]),
                    }
                    : npc
                ));
            }
        }

        // Sync legacy fields with personal finances
        // This ensures backward compatibility with existing code that uses playerStats.cash
        updatedStats.cash = updatedStats.personalFinances.bankBalance;
        updatedStats.loanBalance = updatedStats.personalFinances.outstandingLoans;
        updatedStats.loanRate = updatedStats.personalFinances.loanInterestRate;

        return updatedStats;
    });
  }, [npcs, playerStats]);

  // --- COMPENSATION HELPERS ---
  const calculateAnnualBonus = useCallback((stats: PlayerStats): number => {
      const comp = COMPENSATION_BY_LEVEL[stats.level];
      if (!comp || comp.bonusMultiplier === 0) return 0;

      const baseBonus = comp.weeklySalary * 52 * comp.bonusMultiplier;

      // Calculate performance factors
      const reputationFactor = Math.max(0, Math.min(1,
          (stats.reputation - BONUS_FACTORS.minReputationForBonus) /
          (BONUS_FACTORS.fullBonusReputation - BONUS_FACTORS.minReputationForBonus)
      ));

      // Portfolio performance: average valuation gain
      const portfolioGains = stats.portfolio.reduce((acc, co) => {
          const gain = co.investmentCost > 0
              ? (co.currentValuation - co.investmentCost) / co.investmentCost
              : 0;
          return acc + gain;
      }, 0);
      const avgPortfolioReturn = stats.portfolio.length > 0
          ? portfolioGains / stats.portfolio.length
          : 0;
      const portfolioFactor = Math.max(0, Math.min(1, avgPortfolioReturn + 0.5)); // 0.5 baseline

      // Deals closed this year (approximated by completed exits)
      const dealsCompleted = stats.completedExits?.length || 0;
      const dealsFactor = Math.min(1, dealsCompleted / 3); // 3 deals = full credit

      // Weighted performance score
      const performanceScore =
          reputationFactor * BONUS_FACTORS.reputationWeight +
          portfolioFactor * BONUS_FACTORS.portfolioPerformanceWeight +
          dealsFactor * BONUS_FACTORS.dealsClosedWeight;

      // No bonus if reputation too low
      if (stats.reputation < BONUS_FACTORS.minReputationForBonus) {
          return 0;
      }

      return Math.round(baseBonus * performanceScore);
  }, []);

  // --- LIVING WORLD SYSTEM HANDLERS ---
  const dismissWarning = useCallback((id: string) => {
    setActiveWarnings(prev => prev.filter(w => w.id !== id));
  }, []);

  const handleWarningAction = useCallback((warning: Warning) => {
    // Navigate to appropriate section based on warning type
    // This is handled in the UI component through callbacks
    addLogEntry(`Acting on warning: ${warning.title}`);
    dismissWarning(warning.id);
  }, [addLogEntry, dismissWarning]);

  const handleEventDecision = useCallback((eventId: string, optionId: string) => {
    if (!playerStats) return;

    // Find the event (could be company event or drama)
    let event: CompanyActiveEvent | null = activeCompanyEvent;
    let companyId: number | null = null;

    // Check if it's a company event
    if (activeCompanyEvent?.id === eventId) {
      // Find which company has this event
      const company = playerStats?.portfolio?.find(c => c.activeEvent?.id === eventId);
      if (company) {
        companyId = company.id;
      }
    }

    if (!event) {
      addLogEntry('Event not found or already resolved.');
      return;
    }

    // Find the selected option
    const selectedOption = event.options.find(o => o.id === optionId);
    if (!selectedOption) {
      addLogEntry('Invalid option selected.');
      return;
    }

    // Apply stat changes
    updatePlayerStats(selectedOption.statChanges);

    // Apply company changes if applicable
    if (companyId !== null && Object.keys(selectedOption.companyChanges).length > 0) {
      updatePlayerStats({
        modifyCompany: { id: companyId, updates: { ...selectedOption.companyChanges, activeEvent: undefined } },
      });
    }

    // Log the outcome
    addLogEntry(`Decision: ${selectedOption.label} - ${selectedOption.outcomeText}`);

    // Check for risky outcome
    if (selectedOption.risk && Math.random() * 100 < selectedOption.risk) {
      addLogEntry('WARNING: The risky outcome has occurred. Things may get worse.');
    }

    // Clear the active event
    setActiveCompanyEvent(null);
    setPendingDecision(null);

    // Process next event in queue if any
    if (eventQueue.length > 0) {
      const [nextEvent, ...remaining] = eventQueue;
      setActiveCompanyEvent(nextEvent);
      setEventQueue(remaining);
    }
  }, [playerStats, activeCompanyEvent, eventQueue, updatePlayerStats, addLogEntry]);

  const handleDramaDecision = useCallback((dramaId: string, choiceIndex: number) => {
    if (!activeDrama || activeDrama.id !== dramaId) {
      addLogEntry('Drama not found or already resolved.');
      return;
    }

    const choice = activeDrama.choices[choiceIndex];
    if (!choice) {
      addLogEntry('Invalid choice selected.');
      return;
    }

    // Apply stat changes from the choice
    updatePlayerStats(choice.outcome.statChanges);

    // Log the outcome
    addLogEntry(`${activeDrama.title}: ${choice.text} - ${choice.outcome.description}`);

    // Clear the active drama
    setActiveDrama(null);
    setPendingDecision(null);
  }, [activeDrama, updatePlayerStats, addLogEntry]);

  // --- TIME & ACTION SYSTEM ---
  const useAction = useCallback((actionType: ActionType): boolean => {
    if (!playerStats?.gameTime) return false;

    const cost = ACTION_COSTS[actionType] || 1;
    if (playerStats.gameTime.actionsRemaining < cost) {
      addLogEntry(`Not enough actions for ${actionType.replace(/_/g, ' ')}`);
      return false;
    }

    setPlayerStats(prev => {
      if (!prev?.gameTime) return prev;
      return {
        ...prev,
        gameTime: {
          ...prev.gameTime,
          actionsRemaining: prev.gameTime.actionsRemaining - cost,
          actionsUsedThisWeek: [...prev.gameTime.actionsUsedThisWeek, actionType],
        }
      };
    });

    return true;
  }, [playerStats, addLogEntry]);

  const endWeek = useCallback(() => {
    if (!playerStats?.gameTime) return;

    // Advance the week
    const currentWeek = playerStats.gameTime.week + 1;
    const weeksInYear = 52;
    const yearsPassed = Math.floor((currentWeek - 1) / weeksInYear);
    const weekInYear = ((currentWeek - 1) % weeksInYear) + 1;
    const quarter = Math.ceil(weekInYear / 13) as 1 | 2 | 3 | 4;

    // Apply night grinder penalties if active
    const nightGrinderPenalty = playerStats.gameTime.isNightGrinder
      ? { energy: -15, health: -5 }
      : {};

    setPlayerStats(prev => {
      if (!prev?.gameTime) return prev;
      return {
        ...prev,
        energy: Math.max(0, (prev.energy || 100) + (nightGrinderPenalty.energy || 0)),
        health: Math.max(0, (prev.health || 100) + (nightGrinderPenalty.health || 0)),
        gameTime: {
          week: currentWeek,
          year: 1 + yearsPassed,
          quarter,
          actionsRemaining: prev.gameTime.maxActions,
          maxActions: prev.gameTime.maxActions,
          isNightGrinder: false,
          actionsUsedThisWeek: [],
        }
      };
    });

    addLogEntry(`Week ${currentWeek} begins`);

    // Trigger world tick (portfolio events, rival actions, etc.)
    advanceTime();
  }, [playerStats, addLogEntry, advanceTime]);

  const toggleNightGrinder = useCallback(() => {
    if (!playerStats?.gameTime) return;

    const newIsNightGrinder = !playerStats.gameTime.isNightGrinder;

    setPlayerStats(prev => {
      if (!prev?.gameTime) return prev;
      return {
        ...prev,
        gameTime: {
          ...prev.gameTime,
          isNightGrinder: newIsNightGrinder,
          maxActions: newIsNightGrinder
            ? prev.gameTime.maxActions + 1
            : prev.gameTime.maxActions - 1,
          actionsRemaining: newIsNightGrinder
            ? prev.gameTime.actionsRemaining + 1
            : Math.max(0, prev.gameTime.actionsRemaining - 1),
        }
      };
    });

    if (newIsNightGrinder) {
      addLogEntry('Night Grinder mode activated. You will pay for this tomorrow.');
    } else {
      addLogEntry('Night Grinder mode deactivated.');
    }
  }, [playerStats, addLogEntry]);

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

      // --- PERSONAL FINANCES PROCESSING ---
      const personalFinances = playerStats.personalFinances || DEFAULT_PERSONAL_FINANCES;
      const lifestyleTier = LIFESTYLE_TIERS[personalFinances.lifestyleLevel] || LIFESTYLE_TIERS.BROKE_ASSOCIATE;

      // --- SALARY PAYMENT ---
      // Players receive weekly salary based on their level
      const compensation = COMPENSATION_BY_LEVEL[playerStats.level];
      const weeklySalary = compensation?.weeklySalary || 0;

      let salaryMessage = '';
      if (weeklySalary > 0) {
          salaryMessage = `PAYROLL: +$${weeklySalary.toLocaleString()} salary deposited`;
      }

      // --- LIFESTYLE COSTS ---
      // Weekly burn rate (monthly burn / 4)
      const weeklyBurn = Math.round(lifestyleTier.monthlyBurn / 4);
      const lifestyleMessage = weeklyBurn > 0 ? `LIFESTYLE: -$${weeklyBurn.toLocaleString()} (${lifestyleTier.name})` : '';

      // --- LOAN INTEREST ---
      // Weekly interest accrual
      const weeklyInterest = personalFinances.outstandingLoans > 0
          ? Math.round((personalFinances.outstandingLoans * personalFinances.loanInterestRate) / 52)
          : 0;
      const interestMessage = weeklyInterest > 0 ? `INTEREST: -$${weeklyInterest.toLocaleString()} (loan interest)` : '';

      // --- LIFESTYLE STRESS MODIFIER ---
      // Apply weekly stress from lifestyle tier
      const weeklyLifestyleStress = Math.round(lifestyleTier.stressModifier / 4);

      // --- ANNUAL BONUS CHECK ---
      // If we're advancing to a new year (month goes from 12 to 1), pay bonus
      let annualBonus = 0;
      let bonusMessage = '';
      if (nextMonth > 12) {
          annualBonus = calculateAnnualBonus(playerStats);
          if (annualBonus > 0) {
              bonusMessage = `BONUS SEASON! Your performance bonus: $${annualBonus.toLocaleString()}`;
          } else if (playerStats.reputation >= BONUS_FACTORS.minReputationForBonus) {
              bonusMessage = 'Bonus season: Your performance was... noted. No bonus this year.';
          } else {
              bonusMessage = 'Bonus season: You need at least 30 reputation to qualify for bonuses.';
          }
      }

      // Calculate net weekly cash flow
      const totalCashInflow = weeklySalary + annualBonus;
      const totalCashOutflow = weeklyBurn + weeklyInterest;
      const netCashFlow = totalCashInflow - totalCashOutflow;

      // --- SKILL INVESTMENT PROGRESS ---
      // Check for completed skill investments
      const activeSkills = playerStats.activeSkillInvestments || [];
      const completedSkills: string[] = [];
      const skillStatChanges: StatChanges = {};

      activeSkills.forEach(skill => {
          if (!skill.completed && skill.startedWeek !== undefined) {
              const weeksElapsed = nextTimeCursor - skill.startedWeek;
              if (weeksElapsed >= skill.timeWeeks) {
                  completedSkills.push(skill.name);
                  // Find skill definition and apply benefits
                  const skillDef = SKILL_INVESTMENTS.find(s => s.id === skill.id);
                  if (skillDef?.benefits) {
                      if (skillDef.benefits.analystRating) {
                          skillStatChanges.analystRating = (skillStatChanges.analystRating || 0) + skillDef.benefits.analystRating;
                      }
                      if (skillDef.benefits.financialEngineering) {
                          skillStatChanges.financialEngineering = (skillStatChanges.financialEngineering || 0) + skillDef.benefits.financialEngineering;
                      }
                      if (skillDef.benefits.reputation) {
                          skillStatChanges.reputation = (skillStatChanges.reputation || 0) + skillDef.benefits.reputation;
                      }
                      if (skillDef.benefits.setsFlags) {
                          skillStatChanges.setsFlags = [...(skillStatChanges.setsFlags || []), ...skillDef.benefits.setsFlags];
                      }
                  }
              }
          }
      });

      // Apply weekly stat changes
      updatePlayerStats({
          score: 10,
          cash: netCashFlow !== 0 ? netCashFlow : undefined,
          stress: weeklyLifestyleStress !== 0 ? weeklyLifestyleStress : undefined,
          ...skillStatChanges,
      });

      // Update personal finances tracking
      if (weeklySalary > 0 || annualBonus > 0) {
          setPlayerStats(prev => prev ? {
              ...prev,
              personalFinances: {
                  ...prev.personalFinances,
                  salaryYTD: prev.personalFinances.salaryYTD + weeklySalary,
                  bonusYTD: annualBonus > 0 ? prev.personalFinances.bonusYTD + annualBonus : prev.personalFinances.bonusYTD,
                  totalEarnings: prev.personalFinances.totalEarnings + weeklySalary + annualBonus,
              },
              // Mark completed skills
              activeSkillInvestments: prev.activeSkillInvestments?.map(skill =>
                  completedSkills.some(name => skill.name === name)
                      ? { ...skill, completed: true }
                      : skill
              ) || [],
          } : null);
      }

      // Reset YTD counters at year boundary
      if (nextMonth > 12) {
          setPlayerStats(prev => prev ? {
              ...prev,
              personalFinances: {
                  ...prev.personalFinances,
                  salaryYTD: 0,
                  bonusYTD: 0,
              },
          } : null);
      }

      // Log financial messages
      const financialLog: string[] = [];
      if (salaryMessage) financialLog.push(salaryMessage);
      if (lifestyleMessage) financialLog.push(lifestyleMessage);
      if (interestMessage) financialLog.push(interestMessage);
      if (financialLog.length > 0) {
          addLogEntry(financialLog.join(' | '));
      }
      if (bonusMessage) {
          addLogEntry(bonusMessage);
      }
      if (completedSkills.length > 0) {
          addLogEntry(`SKILL COMPLETED: ${completedSkills.join(', ')} - Benefits applied!`);
      }

      // --- BANKRUPTCY / FIRING CHECK ---
      // If player has negative cash after salary minus lifestyle, they're in trouble
      const projectedCash = playerStats.cash + netCashFlow;
      const canAccessLoan = compensation?.canAccessLoan ?? false;

      if (projectedCash < 0 && !canAccessLoan) {
          // GAME OVER - Fired for inability to manage personal finances
          addLogEntry('TERMINATED: You couldn\'t even manage your own finances. How could you manage a portfolio?');
          setGamePhase('GAME_OVER');
          return;
      }

      // Additional firing condition: reputation too low for too long
      if (playerStats.reputation < 5 && playerStats.timeCursor > 10) {
          addLogEntry('TERMINATED: Your reputation is in the gutter. The partners have lost confidence.');
          setGamePhase('GAME_OVER');
          return;
      }

      // Stress-induced breakdown (optional warning, not game over)
      if (playerStats.stress >= 95 && playerStats.health < 20) {
          addLogEntry('WARNING: Your body is failing. Take a vacation or face the consequences.');
      }

      decayNpcAffinities();

      setPlayerStats(prev => prev ? ({
          ...prev,
          gameYear: nextYear,
          gameMonth: finalMonth,
          currentDayType: nextDayType,
          currentTimeSlot: nextSlot,
          timeCursor: nextTimeCursor,
      }) : null);

      // --- LIVING WORLD SYSTEM PROCESSING ---
      // Process world tick to update portfolio companies, generate events, etc.
      const worldResult = processWorldTick(
        playerStats,
        rivalFunds,
        npcs,
        nextTimeCursor,
        marketVolatility
      );

      // Apply portfolio updates from world engine
      if (worldResult.portfolioUpdates.size > 0) {
        worldResult.portfolioUpdates.forEach((updates, companyId) => {
          updatePlayerStats({
            modifyCompany: { id: companyId, updates },
          });
        });
      }

      // Update warnings
      setActiveWarnings(worldResult.warnings);

      // Process new company events
      if (worldResult.newEvents.length > 0) {
        // Generate full events with options from the event library
        const fullEvents = worldResult.newEvents.map(event => {
          const company = playerStats?.portfolio?.find(c => c.activeEvent?.id === event.id);
          if (company) {
            return generateCompanyEvent(company, event.type);
          }
          return event;
        });

        // Set first event as active, queue the rest
        if (fullEvents.length > 0) {
          setActiveCompanyEvent(fullEvents[0]);
          setEventQueue(fullEvents.slice(1));
          addLogEntry(`COMPANY EVENT: ${fullEvents[0].title} at one of your portfolio companies`);
        }
      }

      // Process NPC dramas
      if (worldResult.npcDramas.length > 0) {
        setActiveDrama(worldResult.npcDramas[0]);
        addLogEntry(`DRAMA: ${worldResult.npcDramas[0].title}`);
      }

      // Log rival actions
      worldResult.rivalActions.forEach(action => {
        addLogEntry(`RIVAL: ${action.impact}`);
      });

      // Log market changes
      worldResult.marketChanges.forEach(change => {
        addLogEntry(`MARKET: ${change.description}`);
      });

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

          // Bug fix: Append to existing playedScenarioIds instead of replacing the array
          const existingIds = playerStats?.playedScenarioIds || [];
          if (!existingIds.includes(nextScenario.id)) {
              setPlayerStats(prev => prev ? { ...prev, playedScenarioIds: [...prev.playedScenarioIds, nextScenario.id] } : null);
          }
          logEvent('scenario_triggered', { id: nextScenario.id, title: nextScenario.title });
          addLogEntry(`Event Triggered (${slotLabel}): ${nextScenario.title}`);
      } else {
          addLogEntry(`Week advanced to ${slotLabel}. No critical incidents reported.`);
      }

  }, [playerStats, decayNpcAffinities, updatePlayerStats, applyMissedAppointments, marketVolatility, npcs, calculateAnnualBonus, addLogEntry]);
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

  // --- ADVANCED RIVAL AI SYSTEM ---

  const processRivalMoves = useCallback(() => {
      if (!playerStats) return;

      const currentTick = playerStats.timeCursor ?? 0;
      const rivalStanding = playerStats.factionReputation.RIVALS ?? DEFAULT_FACTION_REPUTATION.RIVALS;
      const hostility = Math.max(0, 65 - rivalStanding) / 100;

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
                  addLogEntry(`VENDETTA ESCALATION: ${message}`);
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
              addLogEntry(`COALITION ALERT: ${announcement}`);
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
      for (const rival of sortedRivals) {
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
              mindset,
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

                      appendNpcMemory(rival.npcId, {
                          summary: `Poached ${targetDeal.companyName} before you could move.`,
                          sentiment: 'negative',
                          tags: ['rival', 'deal', 'poach'],
                      });
                      knowledgeGain.push(generateAIKnowledgeEntry(rival, decision, success));
                      addLogEntry(generateTacticalMoveMessage(rival, decision, success));
                  }
                  break;
              }

              case 'RUMOR': {
                  if (success) {
                      const vendetta = rival.vendetta ?? 40;
                      workingFunds = workingFunds.map(f => f.id === rival.id
                          ? {
                              ...f,
                              winStreak: Math.max(0, f.winStreak - 1),
                              vendetta: clampStat(vendetta + 3),
                              lastActionTick: currentTick,
                          }
                          : f
                      );
                      fundsChanged = true;

                      const effects = calculateTacticalMoveEffects(decision, success, rival);
                      stressDelta += effects.stress || 0;
                      reputationDelta += effects.reputation || 0;
                      rivalRepDelta += effects.factionReputation?.RIVALS || 0;

                      appendNpcMemory(rival.npcId, {
                          summary: `${rival.managingPartner} spread damaging rumors about you.`,
                          sentiment: 'negative',
                          tags: ['rival', 'rumor', 'psychological'],
                      });
                      knowledgeGain.push(generateAIKnowledgeEntry(rival, decision, success));
                      addLogEntry(generateTacticalMoveMessage(rival, decision, success));
                  }
                  break;
              }

              case 'PSYCHOLOGICAL_WARFARE': {
                  if (success) {
                      const message = PSYCHOLOGICAL_WARFARE_MESSAGES[Math.floor(Math.random() * PSYCHOLOGICAL_WARFARE_MESSAGES.length)]
                          .replace('${name}', rival.managingPartner);

                      const effects = calculateTacticalMoveEffects(decision, success, rival);
                      stressDelta += effects.stress || 0;
                      reputationDelta += effects.reputation || 0;
                      auditRiskDelta += effects.auditRisk || 0;

                      workingFunds = workingFunds.map(f => f.id === rival.id
                          ? {
                              ...f,
                              vendetta: clampStat((f.vendetta ?? 40) + 4),
                              lastActionTick: currentTick,
                          }
                          : f
                      );
                      fundsChanged = true;

                      addLogEntry(`PSYCHOLOGICAL ATTACK: ${message}`);
                      knowledgeGain.push(generateAIKnowledgeEntry(rival, decision, success));
                  }
                  break;
              }

              case 'SABOTAGE': {
                  if (success && playerStats.portfolio.length > 0) {
                      // Target a random portfolio company
                      const targetCompany = playerStats.portfolio[Math.floor(Math.random() * playerStats.portfolio.length)];
                      const effects = calculateTacticalMoveEffects(decision, success, rival);

                      stressDelta += effects.stress || 0;
                      reputationDelta += effects.reputation || 0;
                      auditRiskDelta += effects.auditRisk || 0;

                      workingFunds = workingFunds.map(f => f.id === rival.id
                          ? {
                              ...f,
                              vendetta: clampStat((f.vendetta ?? 40) + 6),
                              lastActionTick: currentTick,
                          }
                          : f
                      );
                      fundsChanged = true;

                      appendNpcMemory(rival.npcId, {
                          summary: `Attempted to sabotage your portfolio company ${targetCompany.name}.`,
                          sentiment: 'negative',
                          tags: ['rival', 'sabotage', 'portfolio'],
                      });
                      addLogEntry(`SABOTAGE ATTEMPT: ${rival.name} is attacking your investment in ${targetCompany.name}!`);
                      knowledgeGain.push(generateAIKnowledgeEntry(rival, decision, success));
                  }
                  break;
              }

              case 'SURPRISE_BID': {
                  if (success) {
                      const surpriseMessage = SURPRISE_ATTACK_MESSAGES[Math.floor(Math.random() * SURPRISE_ATTACK_MESSAGES.length)]
                          .replace('${name}', rival.name);

                      stressDelta += 15;

                      workingFunds = workingFunds.map(f => f.id === rival.id
                          ? {
                              ...f,
                              vendetta: clampStat((f.vendetta ?? 40) + 8),
                              aggressionLevel: clampStat(f.aggressionLevel + 5),
                              lastActionTick: currentTick,
                          }
                          : f
                      );
                      fundsChanged = true;

                      addLogEntry(`SURPRISE MOVE: ${surpriseMessage}`);
                      knowledgeGain.push(generateAIKnowledgeEntry(rival, decision, success));

                      // Update AI state to record surprise move
                      updatedMindsets[rival.id] = {
                          ...updatedMindsets[rival.id],
                          lastSurpriseMove: currentTick,
                      };
                  }
                  break;
              }

              case 'COALITION': {
                  if (success && coalitionState) {
                      const effects = calculateTacticalMoveEffects(decision, success, rival);
                      stressDelta += effects.stress || 0;
                      reputationDelta += effects.reputation || 0;

                      addLogEntry(`COALITION ATTACK: The rival funds are working together against you!`);
                      knowledgeGain.push(generateAIKnowledgeEntry(rival, decision, success));
                  }
                  break;
              }

              case 'MARKET_MANIPULATION': {
                  if (success) {
                      const effects = calculateTacticalMoveEffects(decision, success, rival);
                      stressDelta += effects.stress || 0;
                      rivalRepDelta += effects.factionReputation?.RIVALS || 0;

                      // Reduce quality of available deals
                      workingDeals = workingDeals.map(d => ({
                          ...d,
                          fairValue: Math.round(d.fairValue * 0.9),
                          isHot: false,
                      }));
                      dealsChanged = true;

                      addLogEntry(`MARKET MANIPULATION: ${rival.name} is manipulating deal flow against you.`);
                      knowledgeGain.push(generateAIKnowledgeEntry(rival, decision, success));
                  }
                  break;
              }

              case 'STRATEGIC_RETREAT': {
                  // Rival is pulling back - reduce their vendetta slightly
                  workingFunds = workingFunds.map(f => f.id === rival.id
                      ? {
                          ...f,
                          vendetta: clampStat((f.vendetta ?? 40) - 5),
                          lastActionTick: currentTick,
                      }
                      : f
                  );
                  fundsChanged = true;
                  addLogEntry(`INTEL: ${rival.name} is pulling back. What are they planning?`);
                  break;
              }
          }

          // Generate surprise event for heated rivalries
          if (mindset.vendettaPhase !== 'COLD' && Math.random() < 0.15 * difficultyMultiplier) {
              const surpriseEvent = generateSurpriseEvent(rival, mindset, playerStats);
              if (surpriseEvent) {
                  addLogEntry(`SURPRISE EVENT: ${rival.managingPartner} ${surpriseEvent.event.description}`);
                  stressDelta += surpriseEvent.event.severity === 'HIGH' ? 12 :
                                 surpriseEvent.event.severity === 'MEDIUM' ? 8 : 4;
              }
          }

          // Only process one rival per tick to avoid overwhelming the player
          if (success) break;
      }

      // Update state
      if (fundsChanged) setRivalFunds(workingFunds.map(hydrateRivalFund));
      if (dealsChanged) setActiveDeals(workingDeals);

      // Update AI state
      setAIState(prev => ({
          ...prev,
          rivalMindsets: updatedMindsets,
          coalitionState,
      }));

      // Apply stat changes
      const factionDelta = rivalRepDelta !== 0 ? { RIVALS: rivalRepDelta } : undefined;
      if (stressDelta || reputationDelta || auditRiskDelta || energyDelta || factionDelta || knowledgeGain.length) {
          updatePlayerStats({
              stress: stressDelta || undefined,
              reputation: reputationDelta || undefined,
              auditRisk: auditRiskDelta || undefined,
              energy: energyDelta || undefined,
              factionReputation: factionDelta,
              knowledgeGain: knowledgeGain.length ? knowledgeGain : undefined,
          });
      }
  }, [playerStats, rivalFunds, activeDeals, aiState, marketVolatility, addLogEntry, updatePlayerStats, appendNpcMemory]);

  useEffect(() => {
      if (!playerStats || gamePhase === 'INTRO') return;
      if ((playerStats.timeCursor ?? 0) < 1) return;
      const currentTick = playerStats.timeCursor ?? 0;
      if (lastProcessedRivalTickRef.current === currentTick) return;
      lastProcessedRivalTickRef.current = currentTick;
      processRivalMoves();
  }, [playerStats?.timeCursor, gamePhase, processRivalMoves]);

  // --- RIVAL FUND FUNCTIONS ---

  const updateRivalFund = useCallback((fundId: string, updates: Partial<RivalFund>) => {
      setRivalFunds(prev => prev.map(fund =>
          fund.id === fundId ? hydrateRivalFund({ ...fund, ...updates }) : hydrateRivalFund(fund)
      ));
  }, []);

  const addDeal = useCallback((deal: CompetitiveDeal) => {
      setActiveDeals(prev => [...prev, deal]);
      addLogEntry(`NEW DEAL: ${deal.companyName} ($${(deal.askingPrice / 1000000).toFixed(0)}M)`);
  }, [addLogEntry]);

  const removeDeal = useCallback((dealId: number) => {
      setActiveDeals(prev => prev.filter(d => d.id !== dealId));
  }, []);

  const generateNewDeals = useCallback(() => {
      const availableDeals = COMPETITIVE_DEALS.filter(
          d => !activeDeals.some(ad => ad.id === d.id)
      );

      if (availableDeals.length === 0) return;

      // Always generate at least one deal if the player has fewer than 2 active deals
      // Otherwise, 60% chance to generate new deals (increased from 40%)
      const shouldGenerate = activeDeals.length < 2 || Math.random() < 0.6;
      if (!shouldGenerate) return;

      // Generate 1-2 deals based on how few active deals exist
      const numDeals = activeDeals.length === 0 ? 2 : (Math.random() > 0.6 ? 2 : 1);
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
      localStorage.clear();
      setPlayerStats(null);
      setNpcs([...INITIAL_NPCS, ...RIVAL_FUND_NPCS, ...FAMILY_NPCS].map(hydrateNpc));
      setActiveScenario(SCENARIOS?.[0] ?? null);
      setGamePhase('INTRO');
      setDifficulty(null);
      setMarketVolatility('NORMAL');
      setTutorialStep(0);
      setActionLog([]);
      setRivalFunds(RIVAL_FUNDS.map(hydrateRivalFund));
      setActiveDeals([]);
      // Reset Living World state
      setActiveWarnings([]);
      setActiveDrama(null);
      setActiveCompanyEvent(null);
      setEventQueue([]);
      setPendingDecision(null);
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
      resetGame,
      // Living World System
      activeWarnings,
      activeDrama,
      activeCompanyEvent,
      eventQueue,
      pendingDecision,
      dismissWarning,
      handleWarningAction,
      setActiveDrama,
      setActiveCompanyEvent,
      handleEventDecision,
      // Time & Action System
      useAction,
      endWeek,
      toggleNightGrinder,
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