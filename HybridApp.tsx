/**
 * HybridApp - Mode switcher between Simulation and Classic Story modes
 *
 * SIMULATION (default): Full PE sandbox via App.tsx with GameProvider
 * STORY_CLASSIC: Linear visual novel via StoryApp.tsx with StoryEngineProvider
 */

import React, { useState, createContext, useContext, useCallback } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { AudioProvider } from './contexts/AudioContext';
import { GameProvider } from './contexts/GameContext';
import App from './App';
import StoryApp from './StoryApp';

type GameMode = 'SIMULATION' | 'STORY_CLASSIC';

interface GameModeContextType {
  gameMode: GameMode;
  setGameMode: (mode: GameMode) => void;
}

const GameModeContext = createContext<GameModeContextType | undefined>(undefined);

export const useGameMode = () => {
  const ctx = useContext(GameModeContext);
  if (!ctx) throw new Error('useGameMode must be used within HybridApp');
  return ctx;
};

const HybridApp: React.FC = () => {
  const [gameMode, setGameMode] = useState<GameMode>('SIMULATION');

  const handleSetGameMode = useCallback((mode: GameMode) => {
    setGameMode(mode);
  }, []);

  return (
    <GameModeContext.Provider value={{ gameMode, setGameMode: handleSetGameMode }}>
      {gameMode === 'SIMULATION' ? (
        <AuthProvider>
          <AudioProvider>
            <GameProvider>
              <App />
            </GameProvider>
          </AudioProvider>
        </AuthProvider>
      ) : (
        <StoryApp />
      )}
    </GameModeContext.Provider>
  );
};

export default HybridApp;
