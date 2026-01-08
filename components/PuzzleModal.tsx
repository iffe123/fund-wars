/**
 * Puzzle Modal Component
 *
 * Displays educational knowledge tests and puzzles during gameplay.
 * These are multiple-choice questions about PE, finance, and business concepts.
 */

import React, { useState, useEffect, useCallback } from 'react';
import type { Puzzle, PuzzleResult } from '../types/puzzles';
import {
  checkPuzzleAnswer,
  PUZZLE_INTRO_LINES,
  PUZZLE_SUCCESS_LINES,
  PUZZLE_FAILURE_LINES,
} from '../constants/puzzles';
import { Z_INDEX } from '../constants/zIndex';

interface PuzzleModalProps {
  puzzle: Puzzle;
  onComplete: (result: PuzzleResult) => void;
  onSkip?: () => void;
}

const PuzzleModal: React.FC<PuzzleModalProps> = ({ puzzle, onComplete, onSkip }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(puzzle.timeLimit);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [introLine] = useState(() =>
    PUZZLE_INTRO_LINES[Math.floor(Math.random() * PUZZLE_INTRO_LINES.length)]
  );

  // Timer countdown
  useEffect(() => {
    if (showResult) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Time's up - auto-submit wrong answer
          handleSubmit(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showResult]);

  const handleSubmit = useCallback((optionId: string | null) => {
    if (showResult) return;

    const correct = optionId ? checkPuzzleAnswer(puzzle, optionId) : false;
    setIsCorrect(correct);
    setShowResult(true);

    // Auto-close after delay
    setTimeout(() => {
      const result: PuzzleResult = {
        puzzleId: puzzle.id,
        passed: correct,
        selectedOptionId: optionId || 'timeout',
        timeSpent: puzzle.timeLimit - timeRemaining,
        reward: correct ? puzzle.reward : undefined,
        penalty: !correct ? puzzle.penalty : undefined,
      };
      onComplete(result);
    }, 3000);
  }, [puzzle, timeRemaining, showResult, onComplete]);

  const getTimerColor = () => {
    if (timeRemaining > puzzle.timeLimit * 0.5) return 'text-emerald-400';
    if (timeRemaining > puzzle.timeLimit * 0.25) return 'text-amber-400';
    return 'text-red-400 animate-pulse';
  };

  const getDifficultyColor = () => {
    switch (puzzle.difficulty) {
      case 'EASY': return 'bg-emerald-900/50 text-emerald-400';
      case 'MEDIUM': return 'bg-amber-900/50 text-amber-400';
      case 'HARD': return 'bg-red-900/50 text-red-400';
    }
  };

  // Result screen
  if (showResult) {
    const resultLine = isCorrect
      ? PUZZLE_SUCCESS_LINES[Math.floor(Math.random() * PUZZLE_SUCCESS_LINES.length)]
      : PUZZLE_FAILURE_LINES[Math.floor(Math.random() * PUZZLE_FAILURE_LINES.length)];

    return (
      <div
        className="fixed inset-0 bg-black/90 flex items-center justify-center p-4"
        style={{ zIndex: Z_INDEX.modal + 10 }}
      >
        <div className={`max-w-2xl w-full rounded-lg border-2 ${
          isCorrect ? 'border-emerald-500 bg-emerald-950/30' : 'border-red-500 bg-red-950/30'
        }`}>
          {/* Result Header */}
          <div className={`p-6 border-b ${
            isCorrect ? 'border-emerald-500/30' : 'border-red-500/30'
          }`}>
            <div className="flex items-center gap-3">
              <span className={`text-4xl ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                {isCorrect ? '✓' : '✗'}
              </span>
              <div>
                <h2 className={`text-2xl font-bold ${
                  isCorrect ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {isCorrect ? 'Correct!' : 'Incorrect'}
                </h2>
                <p className="text-slate-400 text-sm italic">{resultLine}</p>
              </div>
            </div>
          </div>

          {/* Explanation */}
          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-slate-400 mb-2">Explanation:</h3>
              <p className="text-slate-200 leading-relaxed">{puzzle.explanation}</p>
            </div>

            {/* Correct Answer */}
            {!isCorrect && (
              <div className="mt-4 p-3 bg-emerald-900/20 border border-emerald-500/30 rounded">
                <p className="text-emerald-400 text-sm">
                  <strong>Correct Answer:</strong>{' '}
                  {puzzle.options.find(o => o.isCorrect)?.text}
                </p>
              </div>
            )}

            {/* Rewards/Penalties */}
            <div className="mt-4 flex flex-wrap gap-2">
              {isCorrect && puzzle.reward && (
                <>
                  {puzzle.reward.reputation && (
                    <span className="px-2 py-1 bg-emerald-900/50 text-emerald-400 text-xs rounded">
                      +{puzzle.reward.reputation} Reputation
                    </span>
                  )}
                  {puzzle.reward.financialEngineering && (
                    <span className="px-2 py-1 bg-blue-900/50 text-blue-400 text-xs rounded">
                      +{puzzle.reward.financialEngineering} Financial Engineering
                    </span>
                  )}
                  {puzzle.reward.score && (
                    <span className="px-2 py-1 bg-purple-900/50 text-purple-400 text-xs rounded">
                      +{puzzle.reward.score} Score
                    </span>
                  )}
                </>
              )}
              {!isCorrect && puzzle.penalty && (
                <>
                  {puzzle.penalty.stress && (
                    <span className="px-2 py-1 bg-red-900/50 text-red-400 text-xs rounded">
                      +{puzzle.penalty.stress} Stress
                    </span>
                  )}
                  {puzzle.penalty.analystRating && (
                    <span className="px-2 py-1 bg-amber-900/50 text-amber-400 text-xs rounded">
                      {puzzle.penalty.analystRating} Analyst Rating
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Auto-close notice */}
          <div className="p-4 border-t border-slate-700 text-center">
            <p className="text-slate-500 text-sm">Continuing in a moment...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/90 flex items-center justify-center p-4"
      style={{ zIndex: Z_INDEX.modal + 10 }}
    >
      <div className="max-w-2xl w-full bg-slate-900 border border-amber-500/50 rounded-lg">
        {/* Header */}
        <div className="p-6 border-b border-amber-500/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📚</span>
              <div>
                <span className="text-amber-400 text-sm font-bold uppercase tracking-wider">
                  Knowledge Check
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded ${getDifficultyColor()}`}>
                    {puzzle.difficulty}
                  </span>
                  <span className="text-xs text-slate-500">
                    {puzzle.category.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Timer */}
            <div className={`text-2xl font-mono font-bold ${getTimerColor()}`}>
              {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
            </div>
          </div>

          <p className="text-slate-400 text-sm italic">{introLine}</p>
        </div>

        {/* Question */}
        <div className="p-6">
          {puzzle.context && (
            <div className="mb-4 p-3 bg-slate-800/50 rounded border-l-4 border-amber-500">
              <p className="text-slate-300 text-sm">{puzzle.context}</p>
            </div>
          )}

          <h2 className="text-xl font-bold text-slate-100 mb-6">{puzzle.question}</h2>

          {/* Options */}
          <div className="space-y-3">
            {puzzle.options.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedOption(option.id)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  selectedOption === option.id
                    ? 'border-amber-500 bg-amber-900/30'
                    : 'border-slate-600 hover:border-slate-500 bg-slate-800/50 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-bold ${
                    selectedOption === option.id
                      ? 'border-amber-500 bg-amber-500 text-black'
                      : 'border-slate-500 text-slate-500'
                  }`}>
                    {option.id.toUpperCase()}
                  </span>
                  <span className={`flex-1 ${
                    selectedOption === option.id ? 'text-amber-200' : 'text-slate-300'
                  }`}>
                    {option.text}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 flex gap-3">
          {onSkip && (
            <button
              onClick={onSkip}
              className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium rounded transition-colors"
            >
              Skip (Penalty)
            </button>
          )}
          <button
            onClick={() => handleSubmit(selectedOption)}
            disabled={!selectedOption}
            className={`flex-1 py-3 font-bold rounded transition-colors ${
              selectedOption
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            Submit Answer
          </button>
        </div>
      </div>
    </div>
  );
};

export default PuzzleModal;
