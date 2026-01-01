/**
 * ConsequenceAnimator Component
 *
 * Shows consequences of choices as animated narrative feedback.
 * Instead of dry number changes, shows meaningful text.
 */

import React, { useState, useEffect, useCallback } from 'react';
import type { ChoiceEffects } from '../../types/storyEngine';

interface ConsequenceAnimatorProps {
  /** The effects to animate */
  effects?: ChoiceEffects;
  /** Delay between each consequence line (ms) */
  delay?: number;
  /** Callback when all animations complete */
  onComplete?: () => void;
  /** Additional class names */
  className?: string;
}

interface ConsequenceLine {
  id: string;
  type: 'stat' | 'relationship' | 'narrative' | 'money' | 'flag' | 'achievement';
  text: string;
  icon: string;
  color: string;
  value?: string; // The actual stat change (e.g., "+5", "-10")
}

const ConsequenceAnimator: React.FC<ConsequenceAnimatorProps> = ({
  effects,
  delay = 800, // Increased from 600ms - give players time to read each line
  onComplete,
  className = '',
}) => {
  const [visibleLines, setVisibleLines] = useState<ConsequenceLine[]>([]);
  const [allLines, setAllLines] = useState<ConsequenceLine[]>([]);

  // Generate consequence lines from effects
  useEffect(() => {
    if (!effects) {
      setAllLines([]);
      setVisibleLines([]);
      return;
    }

    const lines: ConsequenceLine[] = [];

    // Stat changes
    if (effects.stats) {
      Object.entries(effects.stats).forEach(([stat, value]) => {
        if (!value) return;

        const isPositive = value > 0;
        const statLabels: Record<string, { pos: string; neg: string; icon: string; label: string }> = {
          reputation: { pos: 'Your reputation grows', neg: 'Your reputation suffers', icon: 'fa-star', label: 'REP' },
          stress: { pos: 'The pressure builds', neg: 'You feel more at ease', icon: 'fa-brain', label: 'STR' },
          ethics: { pos: 'You stayed true to yourself', neg: 'Your conscience whispers', icon: 'fa-scale-balanced', label: 'ETH' },
          dealcraft: { pos: 'Your deal instincts sharpen', neg: 'You feel less confident', icon: 'fa-handshake', label: 'DEAL' },
          politics: { pos: 'You learn to play the game', neg: 'Office politics confuse you', icon: 'fa-chess', label: 'POL' },
        };

        const label = statLabels[stat] || { pos: `${stat} increased`, neg: `${stat} decreased`, icon: 'fa-chart-line', label: stat.toUpperCase().slice(0, 4) };

        lines.push({
          id: `stat-${stat}`,
          type: 'stat',
          text: isPositive ? label.pos : label.neg,
          icon: label.icon,
          color: stat === 'stress'
            ? (isPositive ? 'text-red-400' : 'text-green-400')
            : (isPositive ? 'text-green-400' : 'text-red-400'),
          value: `${isPositive ? '+' : ''}${value} ${label.label}`,
        });
      });
    }

    // Money changes
    if (effects.money !== undefined && effects.money !== 0) {
      const isPositive = effects.money > 0;
      lines.push({
        id: 'money',
        type: 'money',
        text: isPositive
          ? `You pocket some cash`
          : `You spend some money`,
        icon: 'fa-dollar-sign',
        color: isPositive ? 'text-green-400' : 'text-yellow-500',
        value: isPositive
          ? `+$${effects.money.toLocaleString()}`
          : `-$${Math.abs(effects.money).toLocaleString()}`,
      });
    }

    // Relationship changes
    if (effects.relationships) {
      effects.relationships.forEach(rel => {
        const isPositive = rel.change > 0;
        const intensity = Math.abs(rel.change);

        let verb = '';
        if (intensity >= 15) {
          verb = isPositive ? 'is deeply moved' : 'is furious';
        } else if (intensity >= 10) {
          verb = isPositive ? 'respects you more' : 'grows distant';
        } else if (intensity >= 5) {
          verb = isPositive ? 'appreciates this' : 'takes note';
        } else {
          verb = isPositive ? 'nods approvingly' : 'seems unimpressed';
        }

        lines.push({
          id: `rel-${rel.npcId}`,
          type: 'relationship',
          text: `${capitalizeFirst(rel.npcId)} ${verb}${rel.memory ? `. They'll remember: "${rel.memory}"` : ''}`,
          icon: isPositive ? 'fa-heart' : 'fa-heart-crack',
          color: isPositive ? 'text-pink-400' : 'text-gray-400',
          value: `${isPositive ? '+' : ''}${rel.change}`,
        });
      });
    }

    // Flags (hidden from player but shown narratively)
    if (effects.setFlags) {
      // Only show certain narrative flags
      const narrativeFlags = effects.setFlags.filter(f =>
        !f.startsWith('CHAPTER_') && !f.endsWith('_COMPLETE')
      );
      if (narrativeFlags.length > 0) {
        lines.push({
          id: 'flags',
          type: 'flag',
          text: 'This moment will be remembered.',
          icon: 'fa-bookmark',
          color: 'text-amber-400',
        });
      }
    }

    // Achievement
    if (effects.achievement) {
      lines.push({
        id: 'achievement',
        type: 'achievement',
        text: `Achievement Unlocked: ${formatAchievementName(effects.achievement)}`,
        icon: 'fa-trophy',
        color: 'text-yellow-400',
      });
    }

    setAllLines(lines);
    setVisibleLines([]);
  }, [effects]);

  // Animate lines appearing one by one
  useEffect(() => {
    if (allLines.length === 0) return;
    if (visibleLines.length >= allLines.length) {
      onComplete?.();
      return;
    }

    const timer = setTimeout(() => {
      setVisibleLines(prev => [...prev, allLines[prev.length]]);
    }, delay);

    return () => clearTimeout(timer);
  }, [allLines, visibleLines.length, delay, onComplete]);

  if (visibleLines.length === 0) {
    return null;
  }

  return (
    <div className={`consequence-animator ${className}`}>
      {visibleLines.map((line, index) => (
        <ConsequenceLineItem
          key={line.id}
          line={line}
          isNew={index === visibleLines.length - 1}
        />
      ))}
    </div>
  );
};

interface ConsequenceLineItemProps {
  line: ConsequenceLine;
  isNew: boolean;
}

const ConsequenceLineItem: React.FC<ConsequenceLineItemProps> = ({ line, isNew }) => {
  return (
    <div
      className={`
        flex items-center justify-between gap-3 px-4 py-3
        ${line.color}
        ${isNew ? 'animate-slide-in' : 'opacity-80'}
        transition-opacity duration-300
        bg-black/30 rounded-md mb-1
      `}
    >
      <div className="flex items-center gap-3">
        <i className={`fas ${line.icon} w-5 text-center text-lg`} />
        <span className="text-sm">{line.text}</span>
      </div>
      {line.value && (
        <span className="font-mono font-bold text-base whitespace-nowrap">
          {line.value}
        </span>
      )}
    </div>
  );
};

// Helper functions
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatAchievementName(id: string): string {
  return id
    .split('_')
    .map(word => capitalizeFirst(word.toLowerCase()))
    .join(' ');
}

export default ConsequenceAnimator;

// Add animation keyframes to the component (or add to global CSS)
const styles = `
@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-slide-in {
  animation: slide-in 0.4s ease-out forwards;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
