/**
 * Puzzle System Types
 *
 * Educational puzzles and knowledge tests that challenge players
 * on finance, business, and PE concepts.
 */

export type PuzzleType =
  | 'MULTIPLE_CHOICE'
  | 'TRUE_FALSE'
  | 'TERM_MATCH'
  | 'SEQUENCE';

export type PuzzleCategory =
  | 'PE_FUNDAMENTALS'
  | 'DEAL_STRUCTURE'
  | 'VALUATION'
  | 'DUE_DILIGENCE'
  | 'NEGOTIATION'
  | 'PORTFOLIO_MANAGEMENT'
  | 'EXIT_STRATEGY';

export interface PuzzleOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Puzzle {
  id: string;
  type: PuzzleType;
  category: PuzzleCategory;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  question: string;
  context?: string;
  options: PuzzleOption[];
  explanation: string;
  timeLimit: number; // seconds
  reward: {
    reputation?: number;
    financialEngineering?: number;
    score?: number;
    cash?: number;
  };
  penalty: {
    reputation?: number;
    stress?: number;
    analystRating?: number;
  };
}

export interface PuzzleResult {
  puzzleId: string;
  passed: boolean;
  selectedOptionId: string;
  timeSpent: number;
  reward?: Puzzle['reward'];
  penalty?: Puzzle['penalty'];
}

export interface PuzzleState {
  currentPuzzle: Puzzle | null;
  isActive: boolean;
  timeRemaining: number;
  puzzlesCompleted: string[];
  correctAnswers: number;
  incorrectAnswers: number;
}
