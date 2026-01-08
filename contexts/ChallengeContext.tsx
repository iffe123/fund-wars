/**
 * Challenge Context
 *
 * Manages puzzles and NPC dialogues that integrate with the main game flow.
 * Triggers knowledge tests and conversations based on game events.
 */

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import type { Puzzle, PuzzleResult, PuzzleState } from '../types/puzzles';
import type { NPCDialogue, DialogueResult, DialogueState } from '../types/npcDialogue';
import { getRandomPuzzle, PUZZLES } from '../constants/puzzles';
import { getTriggeredDialogues, NPC_DIALOGUES } from '../constants/npcDialogues';

// ============================================================================
// STATE TYPES
// ============================================================================

interface ChallengeState {
  // Puzzle state
  activePuzzle: Puzzle | null;
  puzzleHistory: string[];
  puzzleStats: {
    correct: number;
    incorrect: number;
    skipped: number;
  };

  // Dialogue state
  activeDialogue: NPCDialogue | null;
  dialogueHistory: string[];
  npcRelationships: Record<string, number>;

  // Trigger management
  lastPuzzleWeek: number;
  lastDialogueWeek: number;
  puzzleCooldown: number; // Minimum weeks between puzzles
  dialogueCooldown: number;

  // Pending results to apply
  pendingPuzzleResult: PuzzleResult | null;
  pendingDialogueResult: DialogueResult | null;
}

type ChallengeAction =
  | { type: 'START_PUZZLE'; payload: Puzzle }
  | { type: 'COMPLETE_PUZZLE'; payload: PuzzleResult }
  | { type: 'SKIP_PUZZLE' }
  | { type: 'START_DIALOGUE'; payload: NPCDialogue }
  | { type: 'COMPLETE_DIALOGUE'; payload: DialogueResult }
  | { type: 'CHECK_TRIGGERS'; payload: { week: number; flags: string[] } }
  | { type: 'CLEAR_PENDING' }
  | { type: 'UPDATE_NPC_RELATIONSHIP'; payload: { npcId: string; delta: number } };

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: ChallengeState = {
  activePuzzle: null,
  puzzleHistory: [],
  puzzleStats: { correct: 0, incorrect: 0, skipped: 0 },

  activeDialogue: null,
  dialogueHistory: [],
  npcRelationships: {},

  lastPuzzleWeek: 0,
  lastDialogueWeek: 0,
  puzzleCooldown: 2, // Puzzle every 2+ weeks
  dialogueCooldown: 1, // Dialogue every 1+ weeks

  pendingPuzzleResult: null,
  pendingDialogueResult: null,
};

// ============================================================================
// REDUCER
// ============================================================================

function challengeReducer(state: ChallengeState, action: ChallengeAction): ChallengeState {
  switch (action.type) {
    case 'START_PUZZLE':
      return {
        ...state,
        activePuzzle: action.payload,
      };

    case 'COMPLETE_PUZZLE':
      return {
        ...state,
        activePuzzle: null,
        puzzleHistory: [...state.puzzleHistory, action.payload.puzzleId],
        puzzleStats: {
          ...state.puzzleStats,
          correct: state.puzzleStats.correct + (action.payload.passed ? 1 : 0),
          incorrect: state.puzzleStats.incorrect + (action.payload.passed ? 0 : 1),
        },
        pendingPuzzleResult: action.payload,
      };

    case 'SKIP_PUZZLE':
      return {
        ...state,
        activePuzzle: null,
        puzzleStats: {
          ...state.puzzleStats,
          skipped: state.puzzleStats.skipped + 1,
        },
        pendingPuzzleResult: state.activePuzzle
          ? {
              puzzleId: state.activePuzzle.id,
              passed: false,
              selectedOptionId: 'skipped',
              timeSpent: 0,
              penalty: state.activePuzzle.penalty,
            }
          : null,
      };

    case 'START_DIALOGUE':
      return {
        ...state,
        activeDialogue: action.payload,
      };

    case 'COMPLETE_DIALOGUE':
      return {
        ...state,
        activeDialogue: null,
        dialogueHistory: [...state.dialogueHistory, action.payload.dialogueId],
        npcRelationships: {
          ...state.npcRelationships,
          [action.payload.npcId]:
            (state.npcRelationships[action.payload.npcId] || 0) +
            (action.payload.effects.relationship || 0),
        },
        pendingDialogueResult: action.payload,
      };

    case 'CHECK_TRIGGERS': {
      const { week, flags } = action.payload;

      // Check for puzzle trigger
      if (
        !state.activePuzzle &&
        !state.activeDialogue &&
        week - state.lastPuzzleWeek >= state.puzzleCooldown
      ) {
        // 30% chance to trigger a puzzle each eligible week
        if (Math.random() < 0.3) {
          const puzzle = getRandomPuzzle(undefined, undefined, state.puzzleHistory);
          if (puzzle) {
            return {
              ...state,
              activePuzzle: puzzle,
              lastPuzzleWeek: week,
            };
          }
        }
      }

      // Check for dialogue trigger
      if (
        !state.activePuzzle &&
        !state.activeDialogue &&
        week - state.lastDialogueWeek >= state.dialogueCooldown
      ) {
        const availableDialogues = getTriggeredDialogues(week, flags).filter(
          (d) => !state.dialogueHistory.includes(d.id)
        );

        if (availableDialogues.length > 0) {
          const dialogue =
            availableDialogues[Math.floor(Math.random() * availableDialogues.length)];
          return {
            ...state,
            activeDialogue: dialogue,
            lastDialogueWeek: week,
          };
        }
      }

      return state;
    }

    case 'CLEAR_PENDING':
      return {
        ...state,
        pendingPuzzleResult: null,
        pendingDialogueResult: null,
      };

    case 'UPDATE_NPC_RELATIONSHIP':
      return {
        ...state,
        npcRelationships: {
          ...state.npcRelationships,
          [action.payload.npcId]:
            (state.npcRelationships[action.payload.npcId] || 0) + action.payload.delta,
        },
      };

    default:
      return state;
  }
}

// ============================================================================
// CONTEXT
// ============================================================================

interface ChallengeContextValue {
  state: ChallengeState;
  startPuzzle: (puzzle?: Puzzle) => void;
  completePuzzle: (result: PuzzleResult) => void;
  skipPuzzle: () => void;
  startDialogue: (dialogue: NPCDialogue) => void;
  completeDialogue: (result: DialogueResult) => void;
  checkTriggers: (week: number, flags: string[]) => void;
  clearPending: () => void;
  getRandomPuzzleForWeek: (week: number) => Puzzle | null;
  getNPCRelationship: (npcId: string) => number;
}

const ChallengeContext = createContext<ChallengeContextValue | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

export function ChallengeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(challengeReducer, initialState);

  const startPuzzle = useCallback((puzzle?: Puzzle) => {
    const p = puzzle || getRandomPuzzle();
    if (p) {
      dispatch({ type: 'START_PUZZLE', payload: p });
    }
  }, []);

  const completePuzzle = useCallback((result: PuzzleResult) => {
    dispatch({ type: 'COMPLETE_PUZZLE', payload: result });
  }, []);

  const skipPuzzle = useCallback(() => {
    dispatch({ type: 'SKIP_PUZZLE' });
  }, []);

  const startDialogue = useCallback((dialogue: NPCDialogue) => {
    dispatch({ type: 'START_DIALOGUE', payload: dialogue });
  }, []);

  const completeDialogue = useCallback((result: DialogueResult) => {
    dispatch({ type: 'COMPLETE_DIALOGUE', payload: result });
  }, []);

  const checkTriggers = useCallback((week: number, flags: string[]) => {
    dispatch({ type: 'CHECK_TRIGGERS', payload: { week, flags } });
  }, []);

  const clearPending = useCallback(() => {
    dispatch({ type: 'CLEAR_PENDING' });
  }, []);

  const getRandomPuzzleForWeek = useCallback(
    (week: number): Puzzle | null => {
      // Difficulty scales with week
      let difficulty: 'EASY' | 'MEDIUM' | 'HARD' = 'EASY';
      if (week > 8) difficulty = 'MEDIUM';
      if (week > 16) difficulty = 'HARD';

      return getRandomPuzzle(difficulty, undefined, state.puzzleHistory);
    },
    [state.puzzleHistory]
  );

  const getNPCRelationship = useCallback(
    (npcId: string): number => {
      return state.npcRelationships[npcId] || 0;
    },
    [state.npcRelationships]
  );

  const value: ChallengeContextValue = {
    state,
    startPuzzle,
    completePuzzle,
    skipPuzzle,
    startDialogue,
    completeDialogue,
    checkTriggers,
    clearPending,
    getRandomPuzzleForWeek,
    getNPCRelationship,
  };

  return <ChallengeContext.Provider value={value}>{children}</ChallengeContext.Provider>;
}

// ============================================================================
// HOOKS
// ============================================================================

export function useChallenges() {
  const context = useContext(ChallengeContext);
  if (!context) {
    throw new Error('useChallenges must be used within a ChallengeProvider');
  }
  return context;
}

// Helper hook to check if any challenge is active
export function useActiveChallenge() {
  const { state } = useChallenges();
  return {
    hasActivePuzzle: state.activePuzzle !== null,
    hasActiveDialogue: state.activeDialogue !== null,
    hasAnyActive: state.activePuzzle !== null || state.activeDialogue !== null,
    activePuzzle: state.activePuzzle,
    activeDialogue: state.activeDialogue,
  };
}

// Helper hook to get pending results
export function usePendingChallengeResults() {
  const { state, clearPending } = useChallenges();
  return {
    pendingPuzzleResult: state.pendingPuzzleResult,
    pendingDialogueResult: state.pendingDialogueResult,
    hasPending: state.pendingPuzzleResult !== null || state.pendingDialogueResult !== null,
    clearPending,
  };
}
