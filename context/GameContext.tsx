
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { GameContextType, PlayerStats, GamePhase, Difficulty, MarketVolatility, UserProfile, NPC, Scenario, StatChanges, PortfolioCompany } from '../types';
import { PlayerLevel, DealType } from '../types';
import { DIFFICULTY_SETTINGS, INITIAL_NPCS, SCENARIOS } from '../constants';
import { useAuth } from './AuthContext';
import { db } from '../services/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { logEvent } from '../services/analytics';

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  
  // Transform Firebase User to App UserProfile
  const user: UserProfile | null = currentUser ? {
      id: currentUser.uid,
      name: currentUser.displayName || 'Anonymous',
      email: currentUser.email || '',
      picture: currentUser.photoURL || ''
  } : null;

  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [npcs, setNpcs] = useState<NPC[]>(INITIAL_NPCS);
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(SCENARIOS[0]);
  const [gamePhase, setGamePhase] = useState<GamePhase>('INTRO');
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [marketVolatility, setMarketVolatility] = useState<MarketVolatility>('NORMAL');
  const [tutorialStep, setTutorialStep] = useState<number>(0);

  // --- CLOUD SAVE / LOAD ---
  
  // Load Game on Auth
  useEffect(() => {
      if (!currentUser) {
          setPlayerStats(null); // Reset on logout
          setGamePhase('INTRO');
          return;
      }

      // If DB isn't configured, skip cloud load and treat as new local session
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
                  const data = docSnap.data();
                  console.log("[CLOUD_LOAD] Save found:", data);
                  
                  // Restore State
                  if (data.playerStats) setPlayerStats(data.playerStats);
                  if (data.gamePhase) setGamePhase(data.gamePhase);
                  if (data.activeScenarioId) {
                      const scen = SCENARIOS.find(s => s.id === data.activeScenarioId);
                      if (scen) setActiveScenario(scen);
                  }
                  if (data.marketVolatility) setMarketVolatility(data.marketVolatility);
                  if (data.npcs) setNpcs(data.npcs);
                  if (data.tutorialStep !== undefined) setTutorialStep(data.tutorialStep);
                  logEvent('login_success');
                  
              } else {
                  console.log("[CLOUD_LOAD] New User. Starting Cold Open.");
                  setGamePhase('INTRO'); // Force Intro for new users
              }
          } catch (error) {
              console.error("Error loading save:", error);
          }
      };

      loadGame();
  }, [currentUser]);

  // Save Game Logic
  const saveGame = useCallback(async () => {
      if (!currentUser || !playerStats) return;
      if (!db) return; // Skip if no DB connection

      const gameState = {
          playerStats,
          gamePhase,
          activeScenarioId: activeScenario?.id,
          marketVolatility,
          npcs,
          tutorialStep,
          lastSaved: new Date().toISOString()
      };

      try {
          await setDoc(doc(db, 'users', currentUser.uid, 'savegame', 'primary'), gameState, { merge: true });
          console.log("[CLOUD_SAVE] Game saved successfully.");
      } catch (error) {
          console.error("Error saving game:", error);
      }
  }, [currentUser, playerStats, gamePhase, activeScenario, marketVolatility, npcs, tutorialStep]);

  // Auto-Save on Phase Change or Major Event
  useEffect(() => {
      if (gamePhase !== 'INTRO' && gamePhase !== 'GAME_OVER') {
          const timeout = setTimeout(() => saveGame(), 2000); // Debounce save
          return () => clearTimeout(timeout);
      }
  }, [playerStats, gamePhase, saveGame]);

  // Log Game Over
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

  // --- STAT UPDATES ---
  const updatePlayerStats = useCallback((changes: StatChanges) => {
    setPlayerStats(prevStats => {
        const baseStats = prevStats || DIFFICULTY_SETTINGS['Normal'].initialStats;
        const newStats: PlayerStats = { ...baseStats };
        
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
  }, []);

  const handleActionOutcome = (outcome: { description: string; statChanges: StatChanges }, title: string) => {
      updatePlayerStats(outcome.statChanges);
  };

  const sendNpcMessage = (npcId: string, message: string) => {
      setNpcs(prev => prev.map(npc => {
          if (npc.id === npcId) {
              return {
                  ...npc,
                  dialogueHistory: [...npc.dialogueHistory, { sender: 'player', text: message }]
              };
          }
          return npc;
      }));
  };

  const addLogEntry = (message: string) => {
      console.log(`[Game Log]: ${message}`);
  };

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
      setGamePhase,
      updatePlayerStats,
      handleActionOutcome,
      sendNpcMessage,
      addLogEntry,
      setTutorialStep
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
