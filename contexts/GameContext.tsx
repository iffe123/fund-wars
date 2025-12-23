import React, { ReactNode } from 'react';
import { GameStateProvider, useGameState } from './GameStateContext';
import { GameActionsProvider, useGameActions } from './GameActionsContext';
import { RPGEventProvider, useRPGEvents } from './RPGEventContext';
import { useGamePersistence } from '../hooks/useGamePersistence';
import { useRivalAI } from '../hooks/useRivalAI';
import { useMarketCycle } from '../hooks/useMarketCycle';
import { useAuth } from '../context/AuthContext';

// Component to handle side effects and game loop logic
const GameLogic: React.FC = () => {
    useGamePersistence();
    useRivalAI();
    useMarketCycle();

    // Auto-generate deals logic if needed, or moved to hook
    // const actions = useGameActions();
    // useEffect to generate deals?

    return null;
};

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <GameStateProvider>
            <GameActionsProvider>
                <RPGEventProvider>
                    <GameLogic />
                    {children}
                </RPGEventProvider>
            </GameActionsProvider>
        </GameStateProvider>
    );
};

export const useGame = () => {
    const state = useGameState();
    const actions = useGameActions();
    const rpgEvents = useRPGEvents();

    // Combine state and actions to match legacy interface
    const { currentUser } = useAuth();

    return {
        ...state,
        ...actions,
        // RPG Event System
        rpgEventState: rpgEvents.state,
        currentEvent: rpgEvents.currentEvent,
        currentPhase: rpgEvents.currentPhase,
        activeArcs: rpgEvents.activeArcs,
        worldFlags: rpgEvents.worldFlags,
        isEventModalOpen: rpgEvents.isEventModalOpen,
        // RPG Event Actions
        initializeEventSystem: rpgEvents.initializeEventSystem,
        selectEvent: rpgEvents.selectEvent,
        makeEventChoice: rpgEvents.makeChoice,
        advanceEventWeek: rpgEvents.advanceWeek,
        setEventPhase: rpgEvents.setPhase,
        closeEventModal: rpgEvents.closeEventModal,
        getAvailableEvents: rpgEvents.getAvailableEvents,
        applyEventConsequences: rpgEvents.applyConsequences,
        scheduleEvent: rpgEvents.scheduleEvent,
        setWorldFlag: rpgEvents.setWorldFlag,
        clearWorldFlag: rpgEvents.clearWorldFlag,
        getNextEvent: rpgEvents.getNextEvent,
        refreshEventQueue: rpgEvents.refreshEventQueue,
        getFlowStatus: rpgEvents.getFlowStatus,
        user: currentUser ? {
            id: currentUser.uid,
            name: currentUser.displayName || 'Anonymous',
            email: currentUser.email || '',
            picture: currentUser.photoURL || ''
        } : null
    };
};

// Export RPGEventProvider for direct access if needed
export { useRPGEvents };
