/**
 * StoryGame Component
 *
 * The main orchestrator for the story-driven RPG experience.
 * Handles game flow between title screen, chapter select, and gameplay.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useStoryEngine, StoryEngineProvider } from '../../contexts/StoryEngineContext';
import TitleScreen from './TitleScreen';
import ChapterSelect from './ChapterSelect';
import StoryScene from './StoryScene';
import CharacterCreate from './CharacterCreate';

type GameScreen = 'title' | 'character_create' | 'chapter_select' | 'playing' | 'chapter_complete';

const StoryGameInner: React.FC = () => {
  const {
    game,
    currentScene,
    phase,
    isPlaying,
    startNewGame,
    loadGame,
    startChapter,
    resetGame,
    getAvailableChapters,
  } = useStoryEngine();

  const [screen, setScreen] = useState<GameScreen>('title');
  const [hasSavedGame, setHasSavedGame] = useState(false);

  // Check for saved game on mount
  useEffect(() => {
    const savedGame = localStorage.getItem('fundwars_autosave');
    setHasSavedGame(!!savedGame);
  }, []);

  // Handle phase changes from the engine
  useEffect(() => {
    if (phase === 'PLAYING' && currentScene) {
      setScreen('playing');
    } else if (phase === 'CHAPTER_COMPLETE') {
      setScreen('chapter_complete');
    }
  }, [phase, currentScene]);

  // Handle new game
  const handleNewGame = useCallback(() => {
    setScreen('character_create');
  }, []);

  // Handle continue (load saved game)
  const handleContinue = useCallback(() => {
    const savedGame = localStorage.getItem('fundwars_autosave');
    if (savedGame) {
      try {
        const parsed = JSON.parse(savedGame);
        // Convert flags array back to Set
        parsed.flags = new Set(parsed.flags || []);
        loadGame(parsed);
        setScreen('chapter_select');
      } catch (e) {
        console.error('Failed to load saved game:', e);
        setScreen('character_create');
      }
    }
  }, [loadGame]);

  // Handle character creation complete
  const handleCharacterCreated = useCallback(
    (playerName: string) => {
      startNewGame(playerName);
      setScreen('chapter_select');
    },
    [startNewGame]
  );

  // Handle chapter selection
  const handleChapterSelect = useCallback(
    (chapterId: string) => {
      startChapter(chapterId);
      setScreen('playing');
    },
    [startChapter]
  );

  // Handle back to menu
  const handleBackToMenu = useCallback(() => {
    setScreen('title');
  }, []);

  // Handle chapter complete - continue to chapter select
  const handleChapterCompleteAcknowledge = useCallback(() => {
    setScreen('chapter_select');
  }, []);

  // Render based on current screen
  switch (screen) {
    case 'title':
      return (
        <TitleScreen
          onNewGame={handleNewGame}
          onContinue={handleContinue}
          hasSavedGame={hasSavedGame}
        />
      );

    case 'character_create':
      return <CharacterCreate onComplete={handleCharacterCreated} onBack={handleBackToMenu} />;

    case 'chapter_select':
      return <ChapterSelect onChapterSelect={handleChapterSelect} onBack={handleBackToMenu} />;

    case 'playing':
      if (!currentScene) {
        return (
          <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="text-green-400 font-mono">Loading scene...</div>
          </div>
        );
      }
      return <StoryScene scene={currentScene} />;

    case 'chapter_complete':
      return (
        <ChapterCompleteScreen
          onContinue={handleChapterCompleteAcknowledge}
          onMainMenu={handleBackToMenu}
        />
      );

    default:
      return null;
  }
};

// Character Create Screen
interface CharacterCreateProps {
  onComplete: (name: string) => void;
  onBack: () => void;
}

const CharacterCreate: React.FC<CharacterCreateProps> = ({ onComplete, onBack }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Please enter your name');
      return;
    }
    if (trimmedName.length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }
    onComplete(trimmedName);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        <button
          onClick={onBack}
          className="text-gray-500 hover:text-green-400 font-mono text-sm mb-8 transition-colors"
        >
          ← BACK
        </button>

        <h1 className="text-3xl font-bold mb-2 text-gray-100">NEW ASSOCIATE</h1>
        <p className="text-gray-500 mb-8">Enter your name to begin your career at Sterling Partners.</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-400 text-sm font-mono mb-2">YOUR NAME</label>
            <input
              type="text"
              value={name}
              onChange={e => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="Enter your name..."
              className="
                w-full px-4 py-3
                bg-gray-900 border border-gray-700
                text-gray-100 font-mono
                placeholder-gray-600
                focus:border-green-500 focus:outline-none
                transition-colors
              "
              maxLength={30}
              autoFocus
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>

          <button
            type="submit"
            className="
              w-full py-4 px-8
              bg-green-900/30 hover:bg-green-900/50
              border border-green-700 hover:border-green-500
              text-green-400 font-mono text-lg
              transition-all duration-200
            "
          >
            BEGIN CAREER →
          </button>
        </form>

        <p className="text-gray-600 text-sm mt-8 text-center italic">
          "Your name will be remembered. For better or worse."
        </p>
      </div>
    </div>
  );
};

// Chapter Complete Screen
interface ChapterCompleteScreenProps {
  onContinue: () => void;
  onMainMenu: () => void;
}

const ChapterCompleteScreen: React.FC<ChapterCompleteScreenProps> = ({ onContinue, onMainMenu }) => {
  const { game } = useStoryEngine();

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-8">
      <div className="max-w-lg w-full text-center">
        <div className="text-green-400 text-6xl mb-6">✓</div>
        <h1 className="text-4xl font-bold mb-4 text-gray-100">CHAPTER COMPLETE</h1>

        {game && (
          <div className="mb-8 p-4 bg-gray-900 border border-gray-800 rounded-sm">
            <h3 className="text-gray-400 text-sm font-mono mb-4">YOUR STATS</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-400">{game.stats.reputation}</div>
                <div className="text-gray-500 text-xs">REPUTATION</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">
                  ${game.stats.money.toLocaleString()}
                </div>
                <div className="text-gray-500 text-xs">MONEY</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-400">{game.stats.stress}</div>
                <div className="text-gray-500 text-xs">STRESS</div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={onContinue}
            className="
              w-full py-4 px-8
              bg-green-900/30 hover:bg-green-900/50
              border border-green-700 hover:border-green-500
              text-green-400 font-mono text-lg
              transition-all duration-200
            "
          >
            CONTINUE →
          </button>

          <button
            onClick={onMainMenu}
            className="
              w-full py-3 px-8
              bg-gray-900 hover:bg-gray-800
              border border-gray-700 hover:border-gray-500
              text-gray-400 font-mono
              transition-all duration-200
            "
          >
            MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
};

// Main export with provider
const StoryGame: React.FC = () => {
  return (
    <StoryEngineProvider>
      <StoryGameInner />
    </StoryEngineProvider>
  );
};

export default StoryGame;
