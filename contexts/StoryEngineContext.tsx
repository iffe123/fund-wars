/**
 * Story Engine Context
 *
 * The heart of the narrative RPG system. Manages story progression,
 * scene navigation, choices, and consequences.
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import type {
  StoryEngineState,
  StoryEngineAction,
  GameState,
  GamePhase,
  Scene,
  Chapter,
  Choice,
  ChoiceEffects,
  ContentRegistry,
  PlayerStats,
  NPCRelationship,
  StoryPath,
  DynamicContent,
} from '../types/storyEngine';
import {
  createInitialGameState,
  isChoiceAvailable,
  isSceneAccessible,
  DEFAULT_STATS,
} from '../types/storyEngine';
import { STORY_CHAPTERS, STORY_SCENES, STORY_PATHS, createContentRegistry } from '../content/storyContent';
import {
  generateDynamicNarrative,
  generateNarratorCommentary,
  generateBonusChoice,
  isDynamicAIAvailable,
} from '../services/dynamicAIService';

// ============================================================================
// INITIAL STATE
// ============================================================================

const createInitialState = (): StoryEngineState => ({
  game: null,
  currentScene: null,
  isInitialized: false,
  isTransitioning: false,
  phase: 'TITLE_SCREEN',
  error: null,
});

// ============================================================================
// REDUCER
// ============================================================================

const storyEngineReducer = (
  state: StoryEngineState,
  action: StoryEngineAction
): StoryEngineState => {
  switch (action.type) {
    case 'INITIALIZE_GAME': {
      const game = createInitialGameState(action.payload.playerName);
      return {
        ...state,
        game,
        isInitialized: true,
        phase: 'PLAYING',
        error: null,
      };
    }

    case 'LOAD_GAME': {
      return {
        ...state,
        game: {
          ...action.payload,
          flags: new Set(action.payload.flags), // Reconstitute Set from array
        },
        isInitialized: true,
        phase: 'PLAYING',
        error: null,
      };
    }

    case 'START_CHAPTER': {
      if (!state.game) return state;

      const registry = createContentRegistry();
      const chapter = registry.chapters.get(action.payload.chapterId);
      if (!chapter) {
        return { ...state, error: `Chapter not found: ${action.payload.chapterId}` };
      }

      const openingScene = registry.scenes.get(chapter.openingSceneId);
      if (!openingScene) {
        return { ...state, error: `Opening scene not found: ${chapter.openingSceneId}` };
      }

      return {
        ...state,
        game: {
          ...state.game,
          currentChapterId: chapter.id,
          currentSceneId: openingScene.id,
          sceneHistory: [...state.game.sceneHistory, openingScene.id],
        },
        currentScene: openingScene,
        phase: 'PLAYING',
      };
    }

    case 'NAVIGATE_TO_SCENE': {
      if (!state.game) return state;

      const registry = createContentRegistry();
      const scene = registry.scenes.get(action.payload.sceneId);
      if (!scene) {
        return { ...state, error: `Scene not found: ${action.payload.sceneId}` };
      }

      // Check if scene is accessible
      if (!isSceneAccessible(scene, state.game)) {
        return { ...state, error: 'Scene not accessible with current game state' };
      }

      return {
        ...state,
        game: {
          ...state.game,
          currentSceneId: scene.id,
          sceneHistory: [...state.game.sceneHistory, scene.id],
        },
        currentScene: scene,
        isTransitioning: false,
      };
    }

    case 'MAKE_CHOICE': {
      if (!state.game || !state.currentScene) return state;

      const { choice } = action.payload;

      // Validate choice is available
      const availability = isChoiceAvailable(choice, state.game);
      if (!availability.available) {
        return { ...state, error: availability.reason || 'Choice not available' };
      }

      // Apply effects and navigate
      let updatedGame = { ...state.game };

      if (choice.effects) {
        updatedGame = applyEffectsToGame(updatedGame, choice.effects);
      }

      // Deduct money cost if applicable
      if (choice.requirements?.moneyCost) {
        updatedGame.stats = {
          ...updatedGame.stats,
          money: updatedGame.stats.money - choice.requirements.moneyCost,
        };
      }

      return {
        ...state,
        game: updatedGame,
        isTransitioning: true, // Will navigate in next action
      };
    }

    case 'APPLY_EFFECTS': {
      if (!state.game) return state;
      return {
        ...state,
        game: applyEffectsToGame(state.game, action.payload),
      };
    }

    case 'SET_FLAG': {
      if (!state.game) return state;
      const newFlags = new Set(state.game.flags);
      newFlags.add(action.payload);
      return {
        ...state,
        game: { ...state.game, flags: newFlags },
      };
    }

    case 'CLEAR_FLAG': {
      if (!state.game) return state;
      const newFlags = new Set(state.game.flags);
      newFlags.delete(action.payload);
      return {
        ...state,
        game: { ...state.game, flags: newFlags },
      };
    }

    case 'UPDATE_RELATIONSHIP': {
      if (!state.game) return state;
      const { npcId, change, memory } = action.payload;

      let relationships = [...state.game.relationships];
      const existingIndex = relationships.findIndex(r => r.npcId === npcId);

      if (existingIndex >= 0) {
        const existing = relationships[existingIndex];
        relationships[existingIndex] = {
          ...existing,
          relationship: Math.max(-100, Math.min(100, existing.relationship + change)),
          memories: memory ? [...existing.memories, memory] : existing.memories,
          state: getRelationshipState(existing.relationship + change),
        };
      } else {
        relationships.push({
          npcId,
          name: npcId, // Will be overwritten with actual name from content
          relationship: Math.max(-100, Math.min(100, change)),
          memories: memory ? [memory] : [],
          state: getRelationshipState(change),
        });
      }

      return {
        ...state,
        game: { ...state.game, relationships },
      };
    }

    case 'COMPLETE_CHAPTER': {
      if (!state.game) return state;

      const registry = createContentRegistry();
      const chapter = registry.chapters.get(action.payload.chapterId);

      return {
        ...state,
        game: {
          ...state.game,
          completedChapters: [...state.game.completedChapters, action.payload.chapterId],
          currentChapterId: null,
          currentSceneId: null,
        },
        currentScene: null,
        phase: 'CHAPTER_COMPLETE',
      };
    }

    case 'SET_PHASE': {
      return { ...state, phase: action.payload };
    }

    case 'SET_TRANSITIONING': {
      return { ...state, isTransitioning: action.payload };
    }

    case 'RESET_GAME': {
      return createInitialState();
    }

    case 'SET_ERROR': {
      return { ...state, error: action.payload };
    }

    case 'SELECT_PATH': {
      if (!state.game) return state;
      return {
        ...state,
        game: {
          ...state.game,
          currentPath: action.payload.pathId,
        },
      };
    }

    case 'ADD_CHOICE_HISTORY': {
      if (!state.game) return state;
      return {
        ...state,
        game: {
          ...state.game,
          choiceHistory: [...(state.game.choiceHistory || []).slice(-20), action.payload],
        },
      };
    }

    default:
      return state;
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function applyEffectsToGame(game: GameState, effects: ChoiceEffects): GameState {
  let updatedGame = { ...game };

  // Apply stat changes
  if (effects.stats) {
    updatedGame.stats = {
      ...updatedGame.stats,
      ...Object.fromEntries(
        Object.entries(effects.stats).map(([key, value]) => [
          key,
          clampStat(
            (updatedGame.stats[key as keyof PlayerStats] || 0) + (value || 0),
            key as keyof PlayerStats
          ),
        ])
      ),
    };
  }

  // Apply money changes
  if (effects.money !== undefined) {
    updatedGame.stats = {
      ...updatedGame.stats,
      money: updatedGame.stats.money + effects.money,
    };
  }

  // Set flags
  if (effects.setFlags) {
    const newFlags = new Set(updatedGame.flags);
    effects.setFlags.forEach(flag => newFlags.add(flag));
    updatedGame.flags = newFlags;
  }

  // Clear flags
  if (effects.clearFlags) {
    const newFlags = new Set(updatedGame.flags);
    effects.clearFlags.forEach(flag => newFlags.delete(flag));
    updatedGame.flags = newFlags;
  }

  // Update relationships
  if (effects.relationships) {
    let relationships = [...updatedGame.relationships];
    for (const rel of effects.relationships) {
      const existingIndex = relationships.findIndex(r => r.npcId === rel.npcId);
      if (existingIndex >= 0) {
        const existing = relationships[existingIndex];
        relationships[existingIndex] = {
          ...existing,
          relationship: Math.max(-100, Math.min(100, existing.relationship + rel.change)),
          memories: rel.memory ? [...existing.memories, rel.memory] : existing.memories,
          state: getRelationshipState(existing.relationship + rel.change),
        };
      } else {
        relationships.push({
          npcId: rel.npcId,
          name: rel.npcId,
          relationship: Math.max(-100, Math.min(100, rel.change)),
          memories: rel.memory ? [rel.memory] : [],
          state: getRelationshipState(rel.change),
        });
      }
    }
    updatedGame.relationships = relationships;
  }

  // Add achievement
  if (effects.achievement && !updatedGame.achievements.includes(effects.achievement)) {
    updatedGame.achievements = [...updatedGame.achievements, effects.achievement];
  }

  return updatedGame;
}

function clampStat(value: number, stat: keyof PlayerStats): number {
  if (stat === 'money') return value; // Money has no cap
  return Math.max(0, Math.min(100, value));
}

function getRelationshipState(value: number): NPCRelationship['state'] {
  if (value <= -60) return 'enemy';
  if (value <= -20) return 'rival';
  if (value < 20) return 'acquaintance';
  if (value < 50) return 'ally';
  return 'mentor';
}

// ============================================================================
// CONTEXT
// ============================================================================

interface StoryEngineContextType {
  // State
  state: StoryEngineState;
  game: GameState | null;
  currentScene: Scene | null;
  currentChapter: Chapter | null;
  phase: GamePhase;
  isPlaying: boolean;

  // Scene & Choice Info
  availableChoices: Array<Choice & { available: boolean; reason?: string }>;
  canAutoAdvance: boolean;

  // Actions
  startNewGame: (playerName: string) => void;
  loadGame: (saveData: GameState) => void;
  startChapter: (chapterId: string) => void;
  makeChoice: (choice: Choice) => void;
  applyChoiceEffects: (choice: Choice) => void;
  navigateToScene: (sceneId: string) => void;
  advanceScene: () => void;
  completeChapter: () => void;
  resetGame: () => void;

  // Path System
  selectPath: (pathId: string) => void;
  getAvailablePaths: () => StoryPath[];
  currentPath: StoryPath | null;
  isPathBranchPoint: () => boolean;

  // Dynamic AI
  dynamicContent: DynamicContent;
  refreshDynamicContent: () => void;
  hasDynamicAI: boolean;

  // Utilities
  getAvailableChapters: () => Chapter[];
  getRelationship: (npcId: string) => NPCRelationship | undefined;
  hasFlag: (flag: string) => boolean;
  getStat: (stat: keyof PlayerStats) => number;
  applyStatChanges: (changes: Partial<PlayerStats>) => void;
}

const StoryEngineContext = createContext<StoryEngineContextType | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

interface StoryEngineProviderProps {
  children: ReactNode;
}

export const StoryEngineProvider: React.FC<StoryEngineProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(storyEngineReducer, undefined, createInitialState);
  const [dynamicContent, setDynamicContent] = useState<DynamicContent>({
    isGenerated: false,
    isLoading: false,
  });

  // Content registry (memoized)
  const registry = useMemo(() => createContentRegistry(), []);

  // Current chapter
  const currentChapter = useMemo(() => {
    if (!state.game?.currentChapterId) return null;
    return registry.chapters.get(state.game.currentChapterId) || null;
  }, [state.game?.currentChapterId, registry]);

  // Current path
  const currentPath = useMemo(() => {
    if (!state.game?.currentPath) return null;
    return registry.paths.get(state.game.currentPath) || null;
  }, [state.game?.currentPath, registry]);

  // Available choices with availability info
  const availableChoices = useMemo(() => {
    if (!state.currentScene || !state.game) return [];

    return state.currentScene.choices.map(choice => {
      const availability = isChoiceAvailable(choice, state.game!);
      return {
        ...choice,
        available: availability.available,
        reason: availability.reason,
      };
    });
  }, [state.currentScene, state.game]);

  // Can auto-advance (scene with no choices but has nextSceneId or requiresAcknowledgment)
  const canAutoAdvance = useMemo(() => {
    if (!state.currentScene) return false;
    return state.currentScene.choices.length === 0 &&
      (!!state.currentScene.nextSceneId || !!state.currentScene.requiresAcknowledgment);
  }, [state.currentScene]);

  // Is actively playing
  const isPlaying = state.phase === 'PLAYING' && !!state.game;

  // Dynamic AI availability
  const hasDynamicAI = isDynamicAIAvailable();

  // Generate dynamic content when scene changes
  const refreshDynamicContent = useCallback(async () => {
    if (!state.currentScene || !state.game) return;

    setDynamicContent(prev => ({ ...prev, isLoading: true }));

    try {
      const [narrative, bonusChoice] = await Promise.all([
        generateDynamicNarrative(state.currentScene, state.game, state.game.currentPath),
        state.currentScene.choices.length > 0
          ? generateBonusChoice(
              state.currentScene,
              state.game,
              state.currentScene.choices.map(c => c.text),
            )
          : Promise.resolve(null),
      ]);

      setDynamicContent({
        narrativeAddition: narrative || undefined,
        bonusChoice: bonusChoice
          ? {
              id: `dynamic_${Date.now()}`,
              text: bonusChoice.text,
              subtext: bonusChoice.subtext,
              narratorComment: bonusChoice.narratorComment,
              nextSceneId: state.currentScene!.choices[0]?.nextSceneId || state.currentScene!.nextSceneId || '',
              effects: {
                stats: bonusChoice.effects.stats,
                money: bonusChoice.effects.money,
                setFlags: ['USED_DYNAMIC_CHOICE'],
              },
              style: bonusChoice.style,
            }
          : undefined,
        isGenerated: true,
        isLoading: false,
      });
    } catch {
      setDynamicContent({ isGenerated: true, isLoading: false });
    }
  }, [state.currentScene?.id, state.game]);

  // Auto-refresh dynamic content on scene change
  useEffect(() => {
    if (state.currentScene && state.game && isPlaying) {
      setDynamicContent({ isGenerated: false, isLoading: false });
      // Small delay to not block scene rendering
      const timer = setTimeout(() => refreshDynamicContent(), 500);
      return () => clearTimeout(timer);
    }
  }, [state.currentScene?.id]);

  // Actions
  const startNewGame = useCallback((playerName: string) => {
    dispatch({ type: 'INITIALIZE_GAME', payload: { playerName } });
  }, []);

  const loadGame = useCallback((saveData: GameState) => {
    dispatch({ type: 'LOAD_GAME', payload: saveData });
  }, []);

  const startChapter = useCallback((chapterId: string) => {
    dispatch({ type: 'START_CHAPTER', payload: { chapterId } });
  }, []);

  const makeChoice = useCallback((choice: Choice) => {
    dispatch({ type: 'MAKE_CHOICE', payload: { choice } });
    dispatch({ type: 'ADD_CHOICE_HISTORY', payload: choice.text });

    // Navigate to next scene after a brief transition
    setTimeout(() => {
      dispatch({ type: 'NAVIGATE_TO_SCENE', payload: { sceneId: choice.nextSceneId } });
    }, 300);
  }, []);

  // Apply choice effects immediately without triggering scene navigation
  const applyChoiceEffects = useCallback((choice: Choice) => {
    if (choice.effects) {
      dispatch({ type: 'APPLY_EFFECTS', payload: choice.effects });
    }
    dispatch({ type: 'ADD_CHOICE_HISTORY', payload: choice.text });
    // Deduct money cost if applicable
    if (choice.requirements?.moneyCost && state.game) {
      dispatch({
        type: 'APPLY_EFFECTS',
        payload: { money: -choice.requirements.moneyCost },
      });
    }
  }, [state.game]);

  // Navigate to a specific scene
  const navigateToScene = useCallback((sceneId: string) => {
    dispatch({ type: 'SET_TRANSITIONING', payload: true });
    setTimeout(() => {
      dispatch({ type: 'NAVIGATE_TO_SCENE', payload: { sceneId } });
    }, 300);
  }, []);

  const advanceScene = useCallback(() => {
    if (!state.currentScene?.nextSceneId) return;
    dispatch({ type: 'SET_TRANSITIONING', payload: true });

    setTimeout(() => {
      dispatch({
        type: 'NAVIGATE_TO_SCENE',
        payload: { sceneId: state.currentScene!.nextSceneId! },
      });
    }, 300);
  }, [state.currentScene]);

  const completeChapter = useCallback(() => {
    if (!state.game?.currentChapterId) return;
    const chapterId = state.game.currentChapterId;
    dispatch({ type: 'COMPLETE_CHAPTER', payload: { chapterId } });

    // Check if this is the path branch point (after chapter 4)
    if (chapterId === 'chapter_4' && !state.game.currentPath) {
      setTimeout(() => {
        dispatch({ type: 'SET_PHASE', payload: 'PATH_REVEAL' });
      }, 100);
    }
  }, [state.game?.currentChapterId, state.game?.currentPath]);

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
    setDynamicContent({ isGenerated: false, isLoading: false });
  }, []);

  // Path System
  const selectPath = useCallback((pathId: string) => {
    dispatch({ type: 'SELECT_PATH', payload: { pathId } });
    dispatch({ type: 'SET_PHASE', payload: 'CHAPTER_COMPLETE' });
  }, []);

  const getAvailablePaths = useCallback((): StoryPath[] => {
    if (!state.game) return [];

    return STORY_PATHS.filter(path => {
      const { requirements } = path;

      // Check min stats
      if (requirements.minStats) {
        for (const [stat, value] of Object.entries(requirements.minStats)) {
          if ((state.game!.stats[stat as keyof PlayerStats] || 0) < (value || 0)) {
            return false;
          }
        }
      }

      return true;
    });
  }, [state.game]);

  const isPathBranchPoint = useCallback((): boolean => {
    if (!state.game) return false;
    return (
      state.game.completedChapters.includes('chapter_4') &&
      !state.game.currentPath
    );
  }, [state.game]);

  // Utilities
  const getAvailableChapters = useCallback((): Chapter[] => {
    if (!state.game) return [];

    return Array.from(registry.chapters.values()).filter(chapter => {
      // Check if already completed
      if (state.game!.completedChapters.includes(chapter.id)) return false;

      // Check path requirements
      if (chapter.requirements?.requiredPath) {
        if (state.game!.currentPath !== chapter.requirements.requiredPath) return false;
      }

      // If chapter belongs to a path, only show if player is on that path (or no path selected yet)
      if (chapter.pathId && state.game!.currentPath && chapter.pathId !== state.game!.currentPath) {
        return false;
      }

      // If player has a path and this is the generic chapter 5, hide it
      if (chapter.id === 'chapter_5' && state.game!.currentPath) {
        return false;
      }

      // Check requirements
      if (!chapter.requirements) return true;

      const { completedChapters, requiredFlags, minStats } = chapter.requirements;

      if (completedChapters) {
        for (const reqChapter of completedChapters) {
          if (!state.game!.completedChapters.includes(reqChapter)) return false;
        }
      }

      if (requiredFlags) {
        for (const flag of requiredFlags) {
          if (!state.game!.flags.has(flag)) return false;
        }
      }

      if (minStats) {
        for (const [stat, value] of Object.entries(minStats)) {
          if ((state.game!.stats[stat as keyof PlayerStats] || 0) < (value || 0)) {
            return false;
          }
        }
      }

      return true;
    });
  }, [state.game, registry]);

  const getRelationship = useCallback(
    (npcId: string): NPCRelationship | undefined => {
      return state.game?.relationships.find(r => r.npcId === npcId);
    },
    [state.game]
  );

  const hasFlag = useCallback(
    (flag: string): boolean => {
      return state.game?.flags.has(flag) || false;
    },
    [state.game]
  );

  const getStat = useCallback(
    (stat: keyof PlayerStats): number => {
      return state.game?.stats[stat] ?? DEFAULT_STATS[stat];
    },
    [state.game]
  );

  // Apply stat changes directly (used by puzzles, dialogues, etc.)
  const applyStatChanges = useCallback(
    (changes: Partial<PlayerStats>) => {
      if (!state.game) return;
      dispatch({ type: 'APPLY_EFFECTS', payload: { stats: changes } });
    },
    [state.game]
  );

  // Auto-save effect
  useEffect(() => {
    if (state.game && state.isInitialized) {
      const saveData = {
        ...state.game,
        flags: Array.from(state.game.flags), // Convert Set to Array for serialization
      };
      localStorage.setItem('fundwars_autosave', JSON.stringify(saveData));
    }
  }, [state.game, state.isInitialized]);

  const contextValue: StoryEngineContextType = {
    state,
    game: state.game,
    currentScene: state.currentScene,
    currentChapter,
    phase: state.phase,
    isPlaying,
    availableChoices,
    canAutoAdvance,
    startNewGame,
    loadGame,
    startChapter,
    makeChoice,
    applyChoiceEffects,
    navigateToScene,
    advanceScene,
    completeChapter,
    resetGame,
    // Path System
    selectPath,
    getAvailablePaths,
    currentPath,
    isPathBranchPoint,
    // Dynamic AI
    dynamicContent,
    refreshDynamicContent,
    hasDynamicAI,
    // Utilities
    getAvailableChapters,
    getRelationship,
    hasFlag,
    getStat,
    applyStatChanges,
  };

  return (
    <StoryEngineContext.Provider value={contextValue}>{children}</StoryEngineContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useStoryEngine = (): StoryEngineContextType => {
  const context = useContext(StoryEngineContext);
  if (!context) {
    throw new Error('useStoryEngine must be used within a StoryEngineProvider');
  }
  return context;
};

export default StoryEngineContext;
