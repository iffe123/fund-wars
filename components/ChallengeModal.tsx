
import React, { useState } from 'react';
import type { QuizQuestion } from '../types';

interface ChallengeModalProps {
  isOpen: boolean;
  question: QuizQuestion;
  onClose: () => void;
  onComplete: (success: boolean) => void;
}

const ChallengeModal: React.FC<ChallengeModalProps> = ({ isOpen, question, onClose, onComplete }) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (selectedOption === null) return;
    setShowResult(true);
  };

  const handleContinue = () => {
    onComplete(selectedOption === question.correctIndex);
    setSelectedOption(null);
    setShowResult(false);
    onClose();
  };

  const isCorrect = selectedOption === question.correctIndex;

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-90 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-slate-700 overflow-hidden relative">
        {/* Header */}
        <div className="bg-slate-900 p-4 border-b border-slate-700 flex justify-between items-center">
            <div className="flex items-center space-x-2">
                <i className="fas fa-lock text-amber-500"></i>
                <h2 className="text-lg font-mono font-bold text-white tracking-widest uppercase">Security Clearance Required</h2>
            </div>
        </div>

        {/* Content */}
        <div className="p-8">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Gatekeeper Challenge</p>
            <h3 className="text-xl font-bold text-slate-900 mb-6">{question.question}</h3>
            
            <div className="space-y-3">
                {question.options.map((option, index) => (
                    <button
                        key={index}
                        onClick={() => !showResult && setSelectedOption(index)}
                        disabled={showResult}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all flex justify-between items-center ${
                            showResult
                                ? index === question.correctIndex
                                    ? 'bg-green-50 border-green-500 text-green-800'
                                    : index === selectedOption
                                        ? 'bg-red-50 border-red-500 text-red-800'
                                        : 'bg-slate-50 border-slate-200 text-slate-400'
                                : selectedOption === index
                                    ? 'bg-blue-50 border-blue-600 text-blue-800'
                                    : 'bg-white border-slate-200 hover:border-slate-400 text-slate-700'
                        }`}
                    >
                        <span className="font-medium">{option}</span>
                        {showResult && index === question.correctIndex && <i className="fas fa-check-circle text-green-600"></i>}
                        {showResult && index === selectedOption && index !== question.correctIndex && <i className="fas fa-times-circle text-red-600"></i>}
                    </button>
                ))}
            </div>

            {showResult && (
                <div className={`mt-6 p-4 rounded-lg border ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <p className={`font-bold mb-1 ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                        {isCorrect ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
                    </p>
                    <p className="text-sm text-slate-700">{question.explanation}</p>
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
             {!showResult ? (
                <button
                    onClick={handleSubmit}
                    disabled={selectedOption === null}
                    className="bg-slate-900 text-white font-bold py-2 px-6 rounded hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Submit Answer
                </button>
             ) : (
                <button
                    onClick={handleContinue}
                    className={`font-bold py-2 px-6 rounded transition-colors ${isCorrect ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
                >
                    {isCorrect ? 'Proceed' : 'Accept Consequences'}
                </button>
             )}
        </div>
      </div>
    </div>
  );
};

export default ChallengeModal;
