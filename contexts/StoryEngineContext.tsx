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
} from '../types/storyEngine';
import {
  createInitialGameState,
  isChoiceAvailable,
  isSceneAccessible,
  DEFAULT_STATS,
} from '../types/storyEngine';
import { STORY_CHAPTERS, STORY_SCENES, createContentRegistry } from '../content/storyContent';

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
  applyChoiceEffects: (choice: Choice) => void; // Apply effects immediately without navigation
  navigateToScene: (sceneId: string) => void; // Navigate to a specific scene
  advanceScene: () => void; // For auto-advance scenes
  completeChapter: () => void;
  resetGame: () => void;

  // Utilities
  getAvailableChapters: () => Chapter[];
  getRelationship: (npcId: string) => NPCRelationship | undefined;
  hasFlag: (flag: string) => boolean;
  getStat: (stat: keyof PlayerStats) => number;
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

  // Content registry (memoized)
  const registry = useMemo(() => createContentRegistry(), []);

  // Current chapter
  const currentChapter = useMemo(() => {
    if (!state.game?.currentChapterId) return null;
    return registry.chapters.get(state.game.currentChapterId) || null;
  }, [state.game?.currentChapterId, registry]);

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

    // Navigate to next scene after a brief transition
    setTimeout(() => {
      dispatch({ type: 'NAVIGATE_TO_SCENE', payload: { sceneId: choice.nextSceneId } });
    }, 300);
  }, []);

  // Apply choice effects immediately without triggering scene navigation
  // Use this when you want to update stats but control navigation separately
  const applyChoiceEffects = useCallback((choice: Choice) => {
    if (choice.effects) {
      dispatch({ type: 'APPLY_EFFECTS', payload: choice.effects });
    }
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
    dispatch({ type: 'COMPLETE_CHAPTER', payload: { chapterId: state.game.currentChapterId } });
  }, [state.game?.currentChapterId]);

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
  }, []);

  // Utilities
  const getAvailableChapters = useCallback((): Chapter[] => {
    if (!state.game) return [];

    return Array.from(registry.chapters.values()).filter(chapter => {
      // Check if already completed
      if (state.game!.completedChapters.includes(chapter.id)) return false;

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

  // Auto-save effect (could be enhanced)
  useEffect(() => {
    if (state.game && state.isInitialized) {
      // Could implement auto-save to localStorage here
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
    getAvailableChapters,
    getRelationship,
    hasFlag,
    getStat,
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
