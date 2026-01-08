/**
 * StoryGame Component
 *
 * The main orchestrator for the story-driven RPG experience.
 * Handles game flow between title screen, chapter select, and gameplay.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useStoryEngine, StoryEngineProvider } from '../../contexts/StoryEngineContext';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import { ChallengeProvider, useChallenges, useActiveChallenge } from '../../contexts/ChallengeContext';
import TitleScreen from './TitleScreen';
import ChapterSelect from './ChapterSelect';
import StoryScene from './StoryScene';
import CharacterCreate from './CharacterCreate';
import LoginScreen from '../LoginScreen';
import PuzzleModal from '../PuzzleModal';
import NPCDialogueModal from '../NPCDialogueModal';
import DevChapterSelector from '../DevChapterSelector';
import type { PuzzleResult } from '../../types/puzzles';
import type { DialogueResult } from '../../types/npcDialogue';

type GameScreen = 'title' | 'character_create' | 'chapter_select' | 'playing' | 'chapter_complete' | 'game_over';

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
    applyStatChanges,
  } = useStoryEngine();

  // Challenge system hooks
  const {
    state: challengeState,
    completePuzzle,
    skipPuzzle,
    completeDialogue,
    checkTriggers
  } = useChallenges();
  const { activePuzzle, activeDialogue } = useActiveChallenge();

  const [screen, setScreen] = useState<GameScreen>('title');
  const [hasSavedGame, setHasSavedGame] = useState(false);

  // Check for challenge triggers when playing
  useEffect(() => {
    if (screen === 'playing' && game) {
      const flags = game.flags ? Array.from(game.flags) : [];
      checkTriggers(game.stats.week || 1, flags);
    }
  }, [screen, game?.stats.week, checkTriggers]);

  // Handle puzzle completion - apply stat changes
  const handlePuzzleComplete = useCallback((result: PuzzleResult) => {
    completePuzzle(result);
    // Apply rewards or penalties to game stats
    if (result.passed && result.reward) {
      applyStatChanges({
        reputation: result.reward.reputation || 0,
        financialEngineering: result.reward.financialEngineering || 0,
      });
    } else if (!result.passed && result.penalty) {
      applyStatChanges({
        stress: result.penalty.stress || 0,
      });
    }
  }, [completePuzzle, applyStatChanges]);

  // Handle dialogue completion - apply relationship changes
  const handleDialogueComplete = useCallback((result: DialogueResult) => {
    completeDialogue(result);
    // Apply stat changes from dialogue
    if (result.effects) {
      applyStatChanges({
        reputation: result.effects.reputation || 0,
        stress: result.effects.stress || 0,
      });
    }
  }, [completeDialogue, applyStatChanges]);

  // Check for saved game on mount
  useEffect(() => {
    const savedGame = localStorage.getItem('fundwars_autosave');
    setHasSavedGame(!!savedGame);
  }, []);

  // Handle phase changes from the engine
  useEffect(() => {
    if (phase === 'PLAYING' && currentScene) {
      // Check for game over scenes
      if (currentScene.id === 'game_over_restart') {
        setScreen('game_over');
      } else {
        setScreen('playing');
      }
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

  // Handle game restart from game over
  const handleRestart = useCallback(() => {
    resetGame();
    localStorage.removeItem('fundwars_autosave');
    setHasSavedGame(false);
    setScreen('title');
  }, [resetGame]);

  // Handle dev chapter selection - jump directly to playing
  const handleDevChapterStart = useCallback(() => {
    setScreen('playing');
  }, []);

  // Render based on current screen
  // DEV: Chapter selector overlay for quick testing
  const devOverlay = import.meta.env.DEV ? (
    <DevChapterSelector onChapterStart={handleDevChapterStart} />
  ) : null;

  switch (screen) {
    case 'title':
      return (
        <>
          {devOverlay}
          <TitleScreen
            onNewGame={handleNewGame}
            onContinue={handleContinue}
            hasSavedGame={hasSavedGame}
          />
        </>
      );

    case 'character_create':
      return (
        <>
          {devOverlay}
          <CharacterCreate onComplete={handleCharacterCreated} onBack={handleBackToMenu} />
        </>
      );

    case 'chapter_select':
      return (
        <>
          {devOverlay}
          <ChapterSelect onChapterSelect={handleChapterSelect} onBack={handleBackToMenu} />
        </>
      );

    case 'playing':
      if (!currentScene) {
        return (
          <>
            {devOverlay}
            <div className="min-h-screen bg-black flex items-center justify-center">
              <div className="text-green-400 font-mono">Loading scene...</div>
            </div>
          </>
        );
      }
      return (
        <>
          {devOverlay}
          <StoryScene scene={currentScene} />
          {/* Challenge Overlays */}
          {activePuzzle && (
            <PuzzleModal
              puzzle={activePuzzle}
              onComplete={handlePuzzleComplete}
              onSkip={skipPuzzle}
            />
          )}
          {activeDialogue && game && (
            <NPCDialogueModal
              dialogue={activeDialogue}
              playerStats={{
                reputation: game.stats.reputation || 50,
                financialEngineering: game.stats.financialEngineering || 10,
              }}
              flags={game.flags ? Array.from(game.flags) : []}
              onComplete={handleDialogueComplete}
            />
          )}
        </>
      );

    case 'chapter_complete':
      return (
        <>
          {devOverlay}
          <ChapterCompleteScreen
            onContinue={handleChapterCompleteAcknowledge}
            onMainMenu={handleBackToMenu}
          />
        </>
      );

    case 'game_over':
      return (
        <>
          {devOverlay}
          <GameOverScreen
            onRestart={handleRestart}
            game={game}
          />
        </>
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

// Game Over Screen
interface GameOverScreenProps {
  onRestart: () => void;
  game: ReturnType<typeof useStoryEngine>['game'];
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ onRestart, game }) => {
  // Determine the type of game over based on flags
  const flags = game?.flags || new Set<string>();
  const wasQuit = flags.has('CHOSE_TO_QUIT') || flags.has('CHOSE_TO_RESIGN');
  const wasFired = flags.has('CHOSE_TO_GET_FIRED') || flags.has('CHOSE_TO_STAY');
  const wasLegend = flags.has('LEGENDARY_FAILURE');

  const getTitle = () => {
    if (wasLegend) return 'LEGENDARY FAILURE';
    if (wasFired) return 'CAREER TERMINATED';
    if (wasQuit) return 'SIMULATION ENDED';
    return 'GAME OVER';
  };

  const getSubtitle = () => {
    if (wasLegend) return 'You went out in a blaze of glory';
    if (wasFired) return 'But you faced the consequences';
    if (wasQuit) return 'Sometimes discretion is the better part of valor';
    return 'Your journey ends here';
  };

  const getIcon = () => {
    if (wasLegend) return 'fa-fire';
    if (wasFired) return 'fa-gavel';
    if (wasQuit) return 'fa-door-open';
    return 'fa-skull';
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-8">
      <div className="max-w-lg w-full text-center">
        {/* Icon */}
        <div className={`text-6xl mb-6 ${wasLegend ? 'text-yellow-400' : 'text-red-500'}`}>
          <i className={`fas ${getIcon()}`} />
        </div>

        {/* Title */}
        <h1 className={`text-4xl font-bold mb-4 ${wasLegend ? 'text-yellow-400' : 'text-red-500'}`}>
          {getTitle()}
        </h1>

        {/* Subtitle */}
        <p className="text-gray-400 text-lg mb-8">
          {getSubtitle()}
        </p>

        {/* Stats Summary */}
        {game && (
          <div className="mb-8 p-4 bg-gray-900 border border-gray-800 rounded-sm">
            <h3 className="text-gray-500 text-sm font-mono mb-4">FINAL STATS</h3>
            <div className="grid grid-cols-3 gap-4 text-center mb-4">
              <div>
                <div className={`text-2xl font-bold ${(game.stats.reputation || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {game.stats.reputation || 0}
                </div>
                <div className="text-gray-500 text-xs">REPUTATION</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">
                  ${(game.stats.money || 0).toLocaleString()}
                </div>
                <div className="text-gray-500 text-xs">MONEY</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-400">
                  {game.stats.stress || 0}
                </div>
                <div className="text-gray-500 text-xs">STRESS</div>
              </div>
            </div>

            {/* Achievements earned */}
            {game.achievements.length > 0 && (
              <div className="border-t border-gray-800 pt-4 mt-4">
                <h4 className="text-yellow-500 text-xs font-mono mb-2">ACHIEVEMENTS EARNED</h4>
                <div className="flex flex-wrap gap-2 justify-center">
                  {game.achievements.map(achievement => (
                    <span
                      key={achievement}
                      className="px-2 py-1 bg-yellow-900/30 border border-yellow-700 text-yellow-400 text-xs rounded"
                    >
                      {achievement.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Wisdom */}
        <p className="text-gray-600 text-sm italic mb-8">
          {wasLegend
            ? '"In a world of careful moves, one bold stroke can change everything."'
            : wasFired
            ? '"The only real failure is not learning from your mistakes."'
            : '"Every exit is an entry somewhere else."'
          }
        </p>

        {/* Restart Button */}
        <button
          onClick={onRestart}
          className="
            w-full py-4 px-8
            bg-green-900/30 hover:bg-green-900/50
            border border-green-700 hover:border-green-500
            text-green-400 font-mono text-lg
            transition-all duration-200
          "
        >
          <i className="fas fa-redo mr-2" />
          START OVER
        </button>

        <p className="text-gray-600 text-xs mt-4">
          Your journey will begin anew
        </p>
      </div>
    </div>
  );
};

// Auth wrapper component that checks for login
const AuthenticatedGame: React.FC = () => {
  const { currentUser, loading } = useAuth();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-green-400 font-mono text-xl animate-pulse mb-4">
            INITIALIZING...
          </div>
          <div className="w-48 h-1 bg-gray-800 rounded overflow-hidden mx-auto">
            <div
              className="h-full bg-green-500 animate-pulse"
              style={{ width: '60%' }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!currentUser) {
    return <LoginScreen />;
  }

  // Show the game if authenticated
  return (
    <StoryEngineProvider>
      <ChallengeProvider>
        <StoryGameInner />
      </ChallengeProvider>
    </StoryEngineProvider>
  );
};

// Main export with auth provider
const StoryGame: React.FC = () => {
  return (
    <AuthProvider>
      <AuthenticatedGame />
    </AuthProvider>
  );
};

export default StoryGame;
