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

  // Get style based on choice type
  const getStyleClasses = () => {
    if (isLocked) {
      return 'border-gray-800 bg-gray-900/50 text-gray-600 cursor-not-allowed';
    }

    switch (choice.style) {
      case 'risky':
        return 'border-red-900 hover:border-red-500 bg-red-950/30 hover:bg-red-950/50 text-red-400';
      case 'safe':
        return 'border-blue-900 hover:border-blue-500 bg-blue-950/30 hover:bg-blue-950/50 text-blue-400';
      case 'ethical':
        return 'border-green-900 hover:border-green-500 bg-green-950/30 hover:bg-green-950/50 text-green-400';
      case 'unethical':
        return 'border-purple-900 hover:border-purple-500 bg-purple-950/30 hover:bg-purple-950/50 text-purple-400';
      case 'hidden':
        return 'border-yellow-900 hover:border-yellow-500 bg-yellow-950/30 hover:bg-yellow-950/50 text-yellow-400';
      default:
        return 'border-gray-700 hover:border-green-500 bg-gray-900 hover:bg-gray-800 text-gray-100';
    }
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

        {/* Effect hints */}
        {choice.effects && !isLocked && (
          <div className="flex gap-2 mt-2 text-xs">
            {choice.effects.stats?.reputation && choice.effects.stats.reputation > 0 && (
              <span className="text-green-500">+REP</span>
            )}
            {choice.effects.stats?.reputation && choice.effects.stats.reputation < 0 && (
              <span className="text-red-500">-REP</span>
            )}
            {choice.effects.stats?.stress && choice.effects.stats.stress > 0 && (
              <span className="text-red-400">+STRESS</span>
            )}
            {choice.effects.stats?.stress && choice.effects.stats.stress < 0 && (
              <span className="text-green-400">-STRESS</span>
            )}
            {choice.effects.money && choice.effects.money > 0 && (
              <span className="text-yellow-500">+$</span>
            )}
            {choice.effects.money && choice.effects.money < 0 && (
              <span className="text-red-500">-$</span>
            )}
            {choice.requirements?.moneyCost && (
              <span className="text-yellow-600">
                -${choice.requirements.moneyCost.toLocaleString()}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Risk indicator for risky choices */}
      {choice.style === 'risky' && !isLocked && (
        <div className="absolute bottom-2 right-3 text-xs text-red-600 font-mono">RISKY</div>
      )}
    </button>
  );
};

export default StoryChoice;
