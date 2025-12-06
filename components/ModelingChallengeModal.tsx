import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { ModelingChallenge, StatChanges } from '../types';
import {
  checkAnswer,
  CHALLENGE_INTRO_LINES,
  CHALLENGE_SUCCESS_LINES,
  CHALLENGE_FAILURE_LINES,
} from '../constants/modelingChallenges';

interface ModelingChallengeModalProps {
  challenge: ModelingChallenge;
  onComplete: (success: boolean, statChanges: StatChanges) => void;
  onClose: () => void;
}

const DIFFICULTY_COLORS = {
  EASY: 'green',
  MEDIUM: 'amber',
  HARD: 'red',
};

const TYPE_NAMES: Record<ModelingChallenge['type'], string> = {
  IRR_CALCULATION: 'IRR Calculation',
  LEVERAGE_ANALYSIS: 'Leverage Analysis',
  VALUATION: 'Valuation',
  SENSITIVITY: 'Sensitivity Analysis',
  DEBT_CAPACITY: 'Debt Capacity',
};

const ModelingChallengeModal: React.FC<ModelingChallengeModalProps> = ({
  challenge,
  onComplete,
  onClose,
}) => {
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [timeRemaining, setTimeRemaining] = useState(challenge.timeLimit);
  const [phase, setPhase] = useState<'INTRO' | 'CHALLENGE' | 'RESULT'>('INTRO');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [introLine] = useState(() =>
    CHALLENGE_INTRO_LINES[Math.floor(Math.random() * CHALLENGE_INTRO_LINES.length)]
  );
  const [resultLine, setResultLine] = useState('');

  // Define handleSubmit first, then use ref in timer
  const handleSubmit = useCallback((timedOut = false) => {
    if (phase === 'RESULT') return;

    const answer = parseFloat(userAnswer) || 0;
    const correct = !timedOut && checkAnswer(challenge, answer);

    setIsCorrect(correct);
    setPhase('RESULT');

    const lines = correct ? CHALLENGE_SUCCESS_LINES : CHALLENGE_FAILURE_LINES;
    setResultLine(lines[Math.floor(Math.random() * lines.length)]);
  }, [userAnswer, challenge, phase]);

  // Ref to always have latest handleSubmit
  const handleSubmitRef = useRef(handleSubmit);
  handleSubmitRef.current = handleSubmit;

  // Timer countdown
  useEffect(() => {
    if (phase !== 'CHALLENGE' || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitRef.current(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, timeRemaining]);

  const handleComplete = () => {
    const statChanges = isCorrect ? challenge.reward : challenge.penalty;
    onComplete(isCorrect ?? false, statChanges);
  };

  const startChallenge = () => {
    setPhase('CHALLENGE');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const difficultyColor = DIFFICULTY_COLORS[challenge.difficulty];
  const timerColor = timeRemaining <= 10 ? 'red' : timeRemaining <= 30 ? 'amber' : 'slate';

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-xl border border-slate-700 w-full max-w-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-slate-800">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded bg-${difficultyColor}-500/20 text-${difficultyColor}-400`}>
                  {challenge.difficulty}
                </span>
                <span className="text-xs text-slate-500">
                  {TYPE_NAMES[challenge.type]}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white">
                <i className="fas fa-calculator mr-2 text-blue-400"></i>
                Financial Modeling Challenge
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {phase === 'INTRO' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                <i className="fas fa-brain text-4xl text-blue-400"></i>
              </div>
              <p className="text-slate-400 italic mb-8">"{introLine}"</p>
              <div className="bg-slate-800 rounded-lg p-4 mb-6 text-left">
                <h3 className="text-white font-semibold mb-2">{challenge.question}</h3>
                <p className="text-slate-400 text-sm">{challenge.context}</p>
              </div>
              <div className="flex items-center justify-center gap-4 text-sm text-slate-500 mb-6">
                <span><i className="fas fa-clock mr-1"></i> {challenge.timeLimit}s</span>
                <span><i className="fas fa-trophy mr-1"></i> +{challenge.reward.financialEngineering} FE</span>
                <span><i className="fas fa-star mr-1"></i> +{challenge.reward.score} pts</span>
              </div>
              <button
                onClick={startChallenge}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
              >
                Start Challenge
              </button>
            </div>
          )}

          {phase === 'CHALLENGE' && (
            <div>
              {/* Timer */}
              <div className="flex justify-between items-center mb-6">
                <div className={`text-2xl font-mono font-bold text-${timerColor}-400`}>
                  <i className="fas fa-clock mr-2"></i>
                  {formatTime(timeRemaining)}
                </div>
                {timeRemaining <= 10 && (
                  <span className="text-red-400 animate-pulse">Time running out!</span>
                )}
              </div>

              {/* Question */}
              <div className="bg-slate-800 rounded-lg p-4 mb-6">
                <h3 className="text-white font-semibold mb-2">{challenge.question}</h3>
                <p className="text-slate-400 text-sm mb-4">{challenge.context}</p>

                {/* Data Table */}
                <div className="bg-slate-700/50 rounded p-3">
                  <h4 className="text-xs uppercase text-slate-500 mb-2">Given Data:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(challenge.data).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-slate-400">{formatDataKey(key)}:</span>
                        <span className="text-white font-mono">{formatDataValue(key, value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Answer Input */}
              <div className="mb-6">
                <label className="block text-sm text-slate-400 mb-2">Your Answer:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Enter your answer..."
                    className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white text-lg font-mono focus:outline-none focus:border-blue-500"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  />
                  <span className="text-slate-400 text-sm">
                    {challenge.type === 'IRR_CALCULATION' && '%'}
                    {(challenge.type === 'VALUATION' || challenge.type === 'DEBT_CAPACITY') && '$M'}
                    {challenge.type === 'LEVERAGE_ANALYSIS' && 'x'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Tolerance: ±{Math.round(challenge.tolerance * 100)}% from correct answer
                </p>
              </div>

              <button
                onClick={() => handleSubmit()}
                disabled={!userAnswer}
                className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold rounded-lg transition-colors"
              >
                Submit Answer
              </button>
            </div>
          )}

          {phase === 'RESULT' && (
            <div className="text-center py-8">
              <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
                isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'
              }`}>
                <i className={`fas ${isCorrect ? 'fa-check' : 'fa-times'} text-4xl ${
                  isCorrect ? 'text-green-400' : 'text-red-400'
                }`}></i>
              </div>

              <h3 className={`text-2xl font-bold mb-2 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                {isCorrect ? 'Correct!' : 'Incorrect'}
              </h3>
              <p className="text-slate-400 italic mb-6">"{resultLine}"</p>

              {/* Answer Comparison */}
              <div className="bg-slate-800 rounded-lg p-4 mb-6 text-left">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs uppercase text-slate-500 mb-1">Your Answer</p>
                    <p className={`text-xl font-mono ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                      {userAnswer || '(none)'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-slate-500 mb-1">Correct Answer</p>
                    <p className="text-xl font-mono text-white">{challenge.correctAnswer}</p>
                  </div>
                </div>
              </div>

              {/* Explanation */}
              <div className="bg-slate-800/50 rounded-lg p-4 mb-6 text-left">
                <h4 className="text-sm font-semibold text-white mb-2">
                  <i className="fas fa-lightbulb text-amber-400 mr-2"></i>
                  Explanation
                </h4>
                <p className="text-slate-400 text-sm">{challenge.explanation}</p>
              </div>

              {/* Rewards/Penalties */}
              <div className={`rounded-lg p-4 mb-6 ${isCorrect ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                <h4 className="text-sm font-semibold mb-2 text-slate-300">
                  {isCorrect ? 'Rewards:' : 'Penalties:'}
                </h4>
                <div className="flex flex-wrap justify-center gap-3">
                  {Object.entries(isCorrect ? challenge.reward : challenge.penalty).map(([key, value]) => (
                    <span key={key} className={`text-sm ${(value as number) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatStatChange(key, value as number)}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={handleComplete}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
              >
                Continue
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper functions
const formatDataKey = (key: string): string => {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .trim();
};

const formatDataValue = (key: string, value: number): string => {
  if (key.toLowerCase().includes('rate') || key.toLowerCase().includes('margin') || key.toLowerCase().includes('growth')) {
    return `${(value * 100).toFixed(1)}%`;
  }
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  if (key.toLowerCase().includes('multiple') || key.toLowerCase().includes('leverage') || key.toLowerCase().includes('moic')) {
    return `${value.toFixed(1)}x`;
  }
  return value.toString();
};

const formatStatChange = (key: string, value: number): string => {
  const sign = value >= 0 ? '+' : '';
  const labels: Record<string, string> = {
    financialEngineering: 'Financial Engineering',
    score: 'Score',
    reputation: 'Reputation',
    analystRating: 'Analyst Rating',
    stress: 'Stress',
    cash: 'Cash',
  };
  const label = labels[key] || key;
  return `${sign}${value} ${label}`;
};

export default ModelingChallengeModal;
