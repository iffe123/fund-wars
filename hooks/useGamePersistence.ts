import { useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { logEvent } from '../services/analytics';
import { useGameState, useGameDispatch } from '../contexts/GameStateContext';
import { hydrateGameState } from '../utils/persistence';
import { initialState } from '../reducers/gameReducer';

export const useGamePersistence = () => {
    const { currentUser } = useAuth();
    const state = useGameState();
    const dispatch = useGameDispatch();
    const { 
        playerStats, gamePhase, activeScenario, marketVolatility, 
        npcs, tutorialStep, actionLog, rivalFunds, activeDeals 
    } = state;

    // Load Game
    useEffect(() => {
        if (!currentUser) {
            // Reset if no user
            // dispatch({ type: 'RESET_GAME' }); // Maybe not reset if just logged out? 
            return;
        }

        if (!db) {
            console.log("[CLOUD_LOAD] Firestore not available. Using local session.");
            return;
        }

        if (currentUser.uid.startsWith('guest_')) {
            console.log("[CLOUD_LOAD] Guest mode - starting fresh game.");
            return;
        }

        const getDocWithTimeout = async (docRef: ReturnType<typeof doc>, timeoutMs: number) => {
            const timeoutPromise = new Promise<never>((_, reject) => {
                setTimeout(() => reject(new Error('Firestore timeout')), timeoutMs);
            });
            return Promise.race([getDoc(docRef), timeoutPromise]);
        };

        const loadGame = async () => {
            try {
                const docRef = doc(db, 'users', currentUser.uid, 'savegame', 'primary');
                const docSnap = await getDocWithTimeout(docRef, 10000);

                if (docSnap.exists()) {
                    const data = docSnap.data() as any;
                    console.log("[CLOUD_LOAD] Save found:", data);

                    const hydratedState = hydrateGameState(data, initialState);
                    
                    dispatch({ type: 'LOAD_GAME', payload: hydratedState });
                    
                    logEvent('login_success');
                } else {
                    console.log("[CLOUD_LOAD] New User. Starting Cold Open.");
                    // Already at default state
                }
            } catch (error) {
                console.error("Error loading save:", error);
                console.log("[CLOUD_LOAD] Load failed, starting fresh game.");
                dispatch({ type: 'RESET_GAME' });
            }
        };

        loadGame();
    }, [currentUser, dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

    // Save Game
    const saveGame = useCallback(async () => {
        if (!currentUser || !playerStats || !db) return;
        if (currentUser.uid.startsWith('guest_')) return;

        // Serialization logic
        const removeUndefined = <T extends Record<string, unknown>>(obj: T): T => {
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
         };

        const gameStateToSave = {
            playerStats: removeUndefined(playerStats as unknown as Record<string, unknown>),
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
            await setDoc(doc(db, 'users', currentUser.uid, 'savegame', 'primary'), gameStateToSave, { merge: true });
            console.log("[CLOUD_SAVE] Game saved successfully.");
        } catch (error) {
            console.error("Error saving game:", error);
        }
    }, [currentUser, playerStats, gamePhase, activeScenario, marketVolatility, npcs, tutorialStep, actionLog, rivalFunds, activeDeals]);

    // Auto-save effect
    useEffect(() => {
        if (gamePhase !== 'INTRO' && gamePhase !== 'GAME_OVER') {
            const timeout = setTimeout(() => saveGame(), 2000);
            return () => clearTimeout(timeout);
        }
    }, [playerStats, gamePhase, saveGame]);
};
