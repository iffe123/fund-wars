import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useRef } from 'react';
import type { GameContextType, PlayerStats, GamePhase, Difficulty, MarketVolatility, UserProfile, NPC, NPCMemory, Scenario, StatChanges, PortfolioCompany, RivalFund, CompetitiveDeal, FactionReputation, DayType, TimeSlot, KnowledgeEntry } from '../types';
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

const slugify = (text: string) =>
    text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || 'fact';

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

const normalizeKnowledgeEntry = (entry: KnowledgeEntry | string, fallbackSource?: string): KnowledgeEntry => {
    const base: KnowledgeEntry = typeof entry === 'string' ? { summary: entry } : entry;
    const timestamp = base.timestamp || new Date().toISOString();
    const id = base.id || `${slugify(base.summary).slice(0, 40)}-${timestamp}`;
    return {
        ...base,
        id,
        timestamp,
        source: base.source || fallbackSource,
        tags: base.tags || [],
    };
};

const clampKnowledge = (entries: KnowledgeEntry[]): KnowledgeEntry[] => entries.slice(-18);

export const sanitizeKnowledgeLog = (entries?: unknown): KnowledgeEntry[] => {
    if (!Array.isArray(entries)) return [];

    const normalized = entries
        .map(entry => normalizeKnowledgeEntry(entry as KnowledgeEntry | string))
        .filter(entry => Boolean(entry.summary));

    return clampKnowledge(normalized);
};

export const sanitizeKnowledgeFlags = (flags?: unknown): string[] => {
    if (!Array.isArray(flags)) return [];
    return flags.filter((flag): flag is string => typeof flag === 'string');
};

export const hydrateNpc = (npc: NPC): NPC => {
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

export const hydrateRivalFund = (fund: RivalFund): RivalFund => ({
    ...fund,
    vendetta: clampStat(typeof fund.vendetta === 'number' ? fund.vendetta : 40),
    lastActionTick: typeof fund.lastActionTick === 'number' ? fund.lastActionTick : -1,
});

export const hydrateFund = (fund: RivalFund): RivalFund => ({
    ...fund,
    reputation: clampStat(typeof fund.reputation === 'number' ? fund.reputation : 50),
    aggressionLevel: clampStat(typeof fund.aggressionLevel === 'number' ? fund.aggressionLevel : 50),
    riskTolerance: clampStat(typeof fund.riskTolerance === 'number' ? fund.riskTolerance : 50),
    vendetta: clampStat(typeof fund.vendetta === 'number' ? fund.vendetta : 40),
    winStreak: typeof fund.winStreak === 'number' ? fund.winStreak : 0,
    totalDeals: typeof fund.totalDeals === 'number' ? fund.totalDeals : 0,
    dryPowder: typeof fund.dryPowder === 'number' ? fund.dryPowder : 0,
    aum: typeof fund.aum === 'number' ? fund.aum : 0,
    portfolio: Array.isArray(fund.portfolio) ? fund.portfolio : [],
    lastActionTick: typeof fund.lastActionTick === 'number' ? fund.lastActionTick : -1,
});

export const hydrateCompetitiveDeal = (deal: any): CompetitiveDeal | null => {
    if (!deal || typeof deal !== 'object') return null;

    const numeric = <T extends number>(value: any, fallback: T): T =>
        typeof value === 'number' && !Number.isNaN(value) ? value as T : fallback;

    return {
        id: numeric(deal.id, Date.now()),
        companyName: deal.companyName || 'Unknown Target',
        sector: deal.sector || 'Misc',
        description: deal.description || 'No description',
        askingPrice: numeric(deal.askingPrice, 0),
        fairValue: numeric(deal.fairValue, numeric(deal.askingPrice, 0)),
        dealType: deal.dealType || DealType.LBO,
        metrics: {
            revenue: numeric(deal.metrics?.revenue, 0),
            ebitda: numeric(deal.metrics?.ebitda, 0),
            growth: numeric(deal.metrics?.growth, 0),
            debt: numeric(deal.metrics?.debt, 0),
        },
        seller: deal.seller || 'Unknown Seller',
        deadline: numeric(deal.deadline, 3),
        interestedRivals: Array.isArray(deal.interestedRivals) ? deal.interestedRivals : [],
        isHot: Boolean(deal.isHot),
        hiddenRisk: deal.hiddenRisk,
        hiddenUpside: deal.hiddenUpside,
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

  const appendNpcMemory = useCallback((npcId: string, memory: NPCMemory | string) => {
      setNpcs(prev => prev.map(npc => {
          if (npc.id !== npcId) return npc;

          const normalized = normalizeMemory(memory, npcId);
          return { ...npc, memories: clampMemories([...npc.memories, normalized]) };
      }));
  }, []);
  
  // --- RIVAL FUNDS & COMPETITIVE DEALS ---
  const [rivalFunds, setRivalFunds] = useState<RivalFund[]>(RIVAL_FUNDS.map(hydrateFund));
  const [activeDeals, setActiveDeals] = useState<CompetitiveDeal[]>([]);
  const lastProcessedRivalTickRef = useRef<number | null>(null);

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

                  try {
                      const safeKnowledgeLog = sanitizeKnowledgeLog(data.playerStats?.knowledgeLog);
                      const safeKnowledgeFlags = sanitizeKnowledgeFlags(data.playerStats?.knowledgeFlags);
                      const safeNpcs = Array.isArray(data.npcs) ? data.npcs.map(hydrateNpc) : [...INITIAL_NPCS, ...RIVAL_FUND_NPCS].map(hydrateNpc);
                      const safeRivalFunds = Array.isArray(data.rivalFunds) ? data.rivalFunds.map(hydrateFund) : RIVAL_FUNDS.map(hydrateFund);
                      const safeActiveDeals = Array.isArray(data.activeDeals)
                        ? data.activeDeals
                            .map(hydrateCompetitiveDeal)
                            .filter((deal): deal is CompetitiveDeal => Boolean(deal))
                        : [];

                      if (data.playerStats) setPlayerStats({
                          ...data.playerStats,
                          loanBalance: data.playerStats.loanBalance ?? 0,
                          loanRate: data.playerStats.loanRate ?? 0,
                          factionReputation: hydrateFactionReputation(data.playerStats.factionReputation),
                          currentDayType: data.playerStats.currentDayType || 'WEEKDAY',
                          currentTimeSlot: data.playerStats.currentTimeSlot || 'MORNING',
                          timeCursor: typeof data.playerStats.timeCursor === 'number' ? data.playerStats.timeCursor : 0,
                          knowledgeLog: safeKnowledgeLog,
                          knowledgeFlags: safeKnowledgeFlags,
                      });
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
                      setNpcs([...INITIAL_NPCS, ...RIVAL_FUND_NPCS].map(hydrateNpc));
                      setRivalFunds(RIVAL_FUNDS.map(hydrateFund));
                      setGamePhase('INTRO');
                  }

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
                    source: baseMemory.source || targetNpc?.name || npcImpact.npcId,
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

        // Apply portfolio mutations (add/modify)
        const currentPortfolio = Array.isArray(newStats.portfolio) ? newStats.portfolio : [];
        let portfolio = currentPortfolio;

        if (changes.addPortfolioCompany) {
            portfolio = [...portfolio, { ...changes.addPortfolioCompany, acquisitionDate: { year: 1, month: 1 }, eventHistory: [] } as PortfolioCompany];
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
            updatedStats.loanRate = changes.loanRate;
        }

        if (changes.portfolio) {
            updatedStats.portfolio = changes.portfolio;
        }

        updatedStats.mood = clampStat((changes.mood ?? updatedStats.mood ?? updatedStats.reputation));
        updatedStats.trust = clampStat((changes.trust ?? updatedStats.trust ?? updatedStats.reputation));

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

        if (changes.riskAppetite !== undefined) {
            updatedStats.riskAppetite = clampStat(changes.riskAppetite);
        }

        if (changes.dealPace !== undefined) {
            updatedStats.dealPace = clampStat(changes.dealPace);
        }

        if (changes.auditRisk !== undefined) {
            updatedStats.auditRisk = clampStat(changes.auditRisk);
        }

        if (changes.portfolio) {
            updatedStats.portfolio = changes.portfolio;
        }

        if (changes.loanBalanceChange && updatedStats.cash < 0) {
            updatedStats.cash = 0;
        }

        if (changes.npcRelationshipUpdate && targetNpc) {
            const change = changes.npcRelationshipUpdate.change || 0;
            const moodChange = clampStat((targetNpc.mood ?? targetNpc.relationship) + change) - (targetNpc.mood ?? targetNpc.relationship);
            const trustChange = clampStat((targetNpc.trust ?? targetNpc.relationship) + change) - (targetNpc.trust ?? targetNpc.relationship);
            const impact = Math.abs(change);

            setNpcs(prev => prev.map(npc => npc.id === targetNpc.id
                ? {
                    ...npc,
                    mood: clampStat((npc.mood ?? npc.relationship) + change),
                    trust: clampStat((npc.trust ?? npc.relationship) + change),
                    memories: clampMemories([...npc.memories, normalizeMemory({
                        summary: npcImpact.memory || `Relationship changed by ${change}`,
                        sentiment: change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral',
                        impact,
                        sourceNpcId: targetNpc.id,
                    }, npc.id)]),
                }
                : npc
            ));

            updatedStats.mood = clampStat(updatedStats.mood + moodChange);
            updatedStats.trust = clampStat(updatedStats.trust + trustChange);
        }

        return updatedStats;
    });
  }, [npcs, playerStats]);

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

      setPlayerStats(prev => prev ? ({ ...prev, gameYear: nextYear, gameMonth: finalMonth }) : null);

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

  // --- RIVAL ACTIONS ---

  const processRivalMoves = useCallback(() => {
      if (!playerStats) return;

      const currentTick = playerStats.timeCursor ?? 0;
      const rivalStanding = playerStats.factionReputation.RIVALS ?? DEFAULT_FACTION_REPUTATION.RIVALS;
      const hostility = Math.max(0, 65 - rivalStanding) / 100;
      const stressBias = playerStats.stress > 70 ? 0.08 : 0;
      const auditBias = playerStats.auditRisk > 55 ? 0.05 : 0;

      let workingFunds = rivalFunds.map(hydrateFund);
      let workingDeals = [...activeDeals];

      let fundsChanged = false;
      let dealsChanged = false;
      let stressDelta = 0;
      let reputationDelta = 0;
      let rivalRepDelta = 0;
      const knowledgeGain: KnowledgeEntry[] = [];

      const sortedRivals = [...workingFunds].sort((a, b) => (b.aggressionLevel + (b.vendetta ?? 40)) - (a.aggressionLevel + (a.vendetta ?? 40)));

      for (const rival of sortedRivals) {
          const cooldownReady = (rival.lastActionTick ?? -5) < currentTick - 1;
          if (!cooldownReady && Math.random() > 0.4) continue;

      const vendetta = rival.vendetta ?? 40;
      const candidateDeals = workingDeals
          .filter(d => d.interestedRivals.includes(rival.id))
          .sort((a, b) => (a.deadline - b.deadline) || (Number(b.isHot) - Number(a.isHot)));

          const targetDeal = candidateDeals[0];
          const poachChance = targetDeal
              ? 0.18 + hostility + (vendetta / 150) + (targetDeal.isHot ? 0.08 : 0) + stressBias
              : 0;
          const rumorChance = 0.12 + hostility + vendetta / 180 + auditBias;

          if (targetDeal && Math.random() < poachChance) {
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

              stressDelta += 8;
              reputationDelta -= 2;
              rivalRepDelta -= 2;
              appendNpcMemory(rival.npcId, {
                  summary: `Poached ${targetDeal.companyName} before you could move.`,
                  sentiment: 'negative',
                  tags: ['rival', 'deal', 'poach'],
              });
              knowledgeGain.push(normalizeKnowledgeEntry({
                  summary: `${rival.name} poached ${targetDeal.companyName} before you could move.`,
                  npcId: rival.npcId,
                  faction: 'RIVALS',
                  tags: ['rival', 'deal', 'poach'],
              }, rival.id));
              addLogEntry(`RIVAL MOVE: ${rival.name} swooped in and closed ${targetDeal.companyName} while you hesitated.`);
              break;
          }

          if (Math.random() < rumorChance) {
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

              const rumorPenalty = rival.aggressionLevel > 70 ? 2 : 1;
              stressDelta += 4 + Math.round(vendetta / 50);
              reputationDelta -= rumorPenalty;
              rivalRepDelta -= 1;
              appendNpcMemory(rival.npcId, {
                  summary: `${rival.managingPartner} spread a rumor that you're reckless with diligence.`,
                  sentiment: 'negative',
                  tags: ['rival', 'rumor'],
              });
              knowledgeGain.push(normalizeKnowledgeEntry({
                  summary: `${rival.managingPartner} spread a rumor that you're reckless with diligence.`,
                  npcId: rival.npcId,
                  faction: 'RIVALS',
                  tags: ['rival', 'rumor'],
              }, rival.id));
              addLogEntry(`RIVAL RUMOR: ${rival.managingPartner} blasted you to LPs and bankers. Reputation took a hit.`);
              break;
          }
      }

      if (fundsChanged) setRivalFunds(workingFunds.map(hydrateFund));
      if (dealsChanged) setActiveDeals(workingDeals);

      const factionDelta = rivalRepDelta !== 0 ? { RIVALS: rivalRepDelta } : undefined;
      if (stressDelta || reputationDelta || factionDelta || knowledgeGain.length) {
          updatePlayerStats({
              stress: stressDelta || undefined,
              reputation: reputationDelta || undefined,
              factionReputation: factionDelta,
              knowledgeGain: knowledgeGain.length ? knowledgeGain : undefined,
          });
      }
  }, [playerStats, rivalFunds, activeDeals, addLogEntry, updatePlayerStats, appendNpcMemory]);

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
          fund.id === fundId ? hydrateFund({ ...fund, ...updates }) : hydrateFund(fund)
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
      localStorage.clear();
      setPlayerStats(null);
      setNpcs([...INITIAL_NPCS, ...RIVAL_FUND_NPCS].map(hydrateNpc));
      setActiveScenario(SCENARIOS[0]);
      setGamePhase('INTRO');
      setDifficulty(null);
      setMarketVolatility('NORMAL');
      setTutorialStep(0);
      setActionLog([]);
      setRivalFunds(RIVAL_FUNDS.map(hydrateFund));
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