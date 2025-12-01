import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { GameContextType, PlayerStats, GamePhase, Difficulty, MarketVolatility, UserProfile, NPC, Scenario, StatChanges, PortfolioCompany, RivalFund, CompetitiveDeal } from '../types';
import { PlayerLevel, DealType } from '../types';
import { DIFFICULTY_SETTINGS, INITIAL_NPCS, SCENARIOS, RIVAL_FUNDS, COMPETITIVE_DEALS, RIVAL_FUND_NPCS } from '../constants';
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
}

const GameContext = createContext<GameContextTypeExtended | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  
  const user: UserProfile | null = currentUser ? {
      id: currentUser.uid,
      name: currentUser.displayName || 'Anonymous',
      email: currentUser.email || '',
      picture: currentUser.photoURL || ''
  } : null;

  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [npcs, setNpcs] = useState<NPC[]>([...INITIAL_NPCS, ...RIVAL_FUND_NPCS]);
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(SCENARIOS[0]);
  const [gamePhase, setGamePhase] = useState<GamePhase>('INTRO');
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [marketVolatility, setMarketVolatility] = useState<MarketVolatility>('NORMAL');
  const [tutorialStep, setTutorialStep] = useState<number>(0);
  const [actionLog, setActionLog] = useState<string[]>([]);
  
  // --- RIVAL FUNDS & COMPETITIVE DEALS ---
  const [rivalFunds, setRivalFunds] = useState<RivalFund[]>(RIVAL_FUNDS);
  const [activeDeals, setActiveDeals] = useState<CompetitiveDeal[]>([]);

  const addLogEntry = useCallback((message: string) => {
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const entry = `${timestamp} // ${message}`;
      setActionLog(prev => [entry, ...prev].slice(0, 50));
      console.log(`[Game Log]: ${message}`);
  }, []);

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
                  });
                  if (data.gamePhase) setGamePhase(data.gamePhase);
                  if (data.activeScenarioId) {
                      const scen = SCENARIOS.find(s => s.id === data.activeScenarioId);
                      if (scen) setActiveScenario(scen);
                  }
                  if (data.marketVolatility) setMarketVolatility(data.marketVolatility);
                  if (data.npcs) setNpcs(data.npcs);
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

  // --- TIME ADVANCEMENT & SCENARIO TRIGGER ---
  const advanceTime = useCallback(() => {
      if (!playerStats) return;

      const nextMonth = playerStats.gameMonth + 1;
      const nextYear = nextMonth > 12 ? playerStats.gameYear + 1 : playerStats.gameYear;
      const finalMonth = nextMonth > 12 ? 1 : nextMonth;

      updatePlayerStats({
          score: 10,
      });
      
      setPlayerStats(prev => prev ? ({ ...prev, gameYear: nextYear, gameMonth: finalMonth }) : null);

      const availableScenarios = SCENARIOS.filter(s => {
          if (playerStats.playedScenarioIds.includes(s.id) && s.id !== 1) return false;
          if (s.id === 1) return false;

          if (s.requiresPortfolio && playerStats.portfolio.length === 0) return false;
          
          if (s.minReputation && playerStats.reputation < s.minReputation) return false;
          if (s.maxReputation && playerStats.reputation > s.maxReputation) return false;
          
          if (s.minStress && playerStats.stress < s.minStress) return false;
          if (s.minCash && playerStats.cash < s.minCash) return false;

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

      const crisisMultiplier = playerStats.stress > 70 ? 1.5 : 1.0;
      const shouldTriggerEvent = Math.random() < (0.4 * crisisMultiplier); 

      if (shouldTriggerEvent && availableScenarios.length > 0) {
          availableScenarios.sort((a, b) => {
              const scoreA = (a.requiredFlags?.length || 0) + (a.requiresPortfolio ? 1 : 0);
              const scoreB = (b.requiredFlags?.length || 0) + (b.requiresPortfolio ? 1 : 0);
              return scoreB - scoreA;
          });

          const candidates = availableScenarios.slice(0, 3);
          const nextScenario = candidates[Math.floor(Math.random() * candidates.length)];
          
          setActiveScenario(nextScenario);
          setGamePhase('SCENARIO');
          
          updatePlayerStats({ playedScenarioIds: [nextScenario.id] });
          logEvent('scenario_triggered', { id: nextScenario.id, title: nextScenario.title });
          addLogEntry(`Event Triggered: ${nextScenario.title}`);
      } else {
          addLogEntry("Week advanced. No critical incidents reported.");
      }

  }, [playerStats]);


  // --- STAT UPDATES ---
  const updatePlayerStats = useCallback((changes: StatChanges) => {
    let autoLoanLog: string | null = null;

    setPlayerStats(prevStats => {
        const baseStats = prevStats || DIFFICULTY_SETTINGS['Normal'].initialStats;
        const newStats: PlayerStats = {
            ...baseStats,
            loanBalance: baseStats.loanBalance ?? 0,
            loanRate: baseStats.loanRate ?? 0,
        };

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

        if (typeof changes.cash === 'number') {
            const projectedCash = newStats.cash + changes.cash;
            const isDebtPaydown = typeof changes.loanBalanceChange === 'number' && changes.loanBalanceChange < 0;

            if (changes.cash < 0 && projectedCash < 0 && !isDebtPaydown) {
                const deficit = Math.abs(projectedCash);
                const loanSize = Math.max(25000, Math.ceil(deficit * 1.1));
                newStats.loanBalance = Math.max(0, (newStats.loanBalance || 0) + loanSize);
                newStats.loanRate = newStats.loanRate || 0.22;
                newStats.cash = Math.max(0, projectedCash + loanSize);
                newStats.stress = Math.min(100, newStats.stress + 2);
                autoLoanLog = `Emergency loan issued for $${loanSize.toLocaleString()} to cover a cash shortfall.`;
            } else {
                newStats.cash = projectedCash;
            }
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

        newStats.cash = Math.max(0, newStats.cash);
        newStats.loanBalance = Math.max(0, newStats.loanBalance || 0);

        return newStats;
    });

    if (changes.npcRelationshipUpdate) {
        setNpcs(prevNpcs => prevNpcs.map(npc => {
            if (npc.id === changes.npcRelationshipUpdate?.npcId) {
                return {
                    ...npc,
                    relationship: Math.max(0, Math.min(100, npc.relationship + changes.npcRelationshipUpdate.change)),
                    memories: [...npc.memories, changes.npcRelationshipUpdate.memory]
                };
            }
            return npc;
        }));
    }

    if (autoLoanLog) {
        addLogEntry(autoLoanLog);
    }
  }, [addLogEntry]);

  const handleActionOutcome = (outcome: { description: string; statChanges: StatChanges }, title: string) => {
      updatePlayerStats(outcome.statChanges);
  };

  const sendNpcMessage = (npcId: string, message: string, sender: 'player' | 'npc' | 'system' = 'player', senderName?: string) => {
      setNpcs(prev => prev.map(npc => {
          if (npc.id === npcId) {
              return {
                  ...npc,
                  dialogueHistory: [...npc.dialogueHistory, { sender, senderName, text: message }]
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
  }, [addLogEntry]);

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
      generateNewDeals
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