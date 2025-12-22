import React, { ReactNode } from 'react';
import { GameStateProvider, useGameState } from './GameStateContext';
import { GameActionsProvider, useGameActions } from './GameActionsContext';
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
                <GameLogic />
                {children}
            </GameActionsProvider>
        </GameStateProvider>
    );
};

export const useGame = () => {
    const state = useGameState();
    const actions = useGameActions();
    
    // Combine state and actions to match legacy interface
    const { currentUser } = useAuth();
    
    return {
        ...state,
        ...actions,
        user: currentUser ? {
            id: currentUser.uid,
            name: currentUser.displayName || 'Anonymous',
            email: currentUser.email || '',
            picture: currentUser.photoURL || ''
        } : null
    };
};
