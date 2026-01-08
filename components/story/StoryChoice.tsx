/**
 * StoryChoice Component
 *
 * Renders a single choice button with styling based on availability and type.
 */

import React from 'react';
import type { Choice } from '../../types/storyEngine';

interface StoryChoiceProps {
  choice: Choice & { available: boolean; reason?: string };
  index: number;
  onClick: () => void;
  disabled?: boolean;
}

const StoryChoice: React.FC<StoryChoiceProps> = ({ choice, index, onClick, disabled }) => {
  const isLocked = !choice.available;

  // Get style based on choice type - all choices now look the same to hide hints
  const getStyleClasses = () => {
    if (isLocked) {
      return 'border-gray-800 bg-gray-900/50 text-gray-600 cursor-not-allowed';
    }
    // All available choices use neutral styling - no hints about risk/safety
    return 'border-gray-700 hover:border-green-500 bg-gray-900 hover:bg-gray-800 text-gray-100';
  };

  // Get keyboard shortcut
  const shortcut = index < 9 ? index + 1 : null;

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLocked}
      className={`
        w-full text-left p-4
        border rounded-sm
        transition-all duration-200
        group relative
        ${getStyleClasses()}
        ${disabled ? 'opacity-50' : ''}
      `}
    >
      {/* Keyboard shortcut indicator */}
      {shortcut && !isLocked && (
        <span className="absolute left-2 top-2 text-xs font-mono text-gray-600 group-hover:text-gray-400">
          [{shortcut}]
        </span>
      )}

      {/* Lock icon for unavailable choices */}
      {isLocked && (
        <span className="absolute right-3 top-3 text-gray-600">
          <i className="fas fa-lock text-sm" />
        </span>
      )}

      <div className="pl-6">
        {/* Main choice text */}
        <div className="font-medium">{choice.text}</div>

        {/* Subtext */}
        {choice.subtext && (
          <div className="text-sm text-gray-500 mt-1">{choice.subtext}</div>
        )}

        {/* Locked reason */}
        {isLocked && choice.reason && (
          <div className="text-xs text-red-500 mt-2 italic">{choice.reason}</div>
        )}

        {/* Narrator comment (shown on hover for available choices) */}
        {choice.narratorComment && !isLocked && (
          <div className="text-xs text-gray-500 italic mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            *{choice.narratorComment}*
          </div>
        )}

        {/* Money cost indicator - only show if there's an upfront cost requirement */}
        {choice.requirements?.moneyCost && !isLocked && (
          <div className="mt-2 text-xs text-yellow-600">
            Cost: ${choice.requirements.moneyCost.toLocaleString()}
          </div>
        )}
      </div>
    </button>
  );
};

export default StoryChoice;
