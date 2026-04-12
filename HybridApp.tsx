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
const StoryApp = React.lazy(() => import('./StoryApp'));
import SplashScreen from './components/SplashScreen';

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
  const [showSplash, setShowSplash] = useState(true);

  const handleSetGameMode = useCallback((mode: GameMode) => {
    setGameMode(mode);
  }, []);

  const hasSave = typeof window !== 'undefined' && !!localStorage.getItem('fundwars_skip_intro');

  if (showSplash) {
    return <SplashScreen onStart={() => setShowSplash(false)} hasSave={hasSave} onContinue={hasSave ? () => setShowSplash(false) : undefined} />;
  }

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
        <React.Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-[#030303] text-amber-400 font-mono">Loading story mode...</div>}>
          <StoryApp />
        </React.Suspense>
      )}
    </GameModeContext.Provider>
  );
};

export default HybridApp;
