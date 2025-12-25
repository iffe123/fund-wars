/**
 * StatusBar Component
 *
 * Minimal status bar showing only essential info.
 * Visual bars instead of raw numbers.
 */

import React, { useState, useCallback } from 'react';
import { useStoryEngine } from '../../contexts/StoryEngineContext';
import type { PlayerStats } from '../../types/storyEngine';

interface StatusBarProps {
  /** Whether to show expanded details */
  expanded?: boolean;
  /** Callback when menu is clicked */
  onMenuClick?: () => void;
  /** Callback when stats are clicked (to show drawer) */
  onStatsClick?: () => void;
}

const StatusBar: React.FC<StatusBarProps> = ({
  expanded = false,
  onMenuClick,
  onStatsClick,
}) => {
  const { game, currentScene } = useStoryEngine();
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  if (!game) return null;

  const { stats } = game;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-2 flex items-center justify-between">
        {/* Left: Scene/Chapter info */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="text-gray-500 hover:text-gray-300 transition-colors p-1"
            title="Menu"
          >
            <i className="fas fa-bars" />
          </button>
          <span className="text-gray-600 text-sm font-mono">
            {currentScene?.title || 'FUND WARS'}
          </span>
        </div>

        {/* Center: Resource bars */}
        <button
          onClick={onStatsClick}
          className="flex items-center gap-4 hover:bg-gray-900/50 px-3 py-1 rounded transition-colors"
        >
          <ResourceBar
            label="REP"
            value={stats.reputation}
            max={100}
            color="green"
            onHover={() => setShowTooltip('reputation')}
            onLeave={() => setShowTooltip(null)}
          />
          <ResourceBar
            label="STR"
            value={stats.stress}
            max={100}
            color="red"
            inverted
            onHover={() => setShowTooltip('stress')}
            onLeave={() => setShowTooltip(null)}
          />
          <MoneyDisplay value={stats.money} />
        </button>

        {/* Right: Quick actions */}
        <div className="flex items-center gap-2">
          <button
            className="text-gray-500 hover:text-gray-300 transition-colors p-1"
            title="Settings"
          >
            <i className="fas fa-cog text-sm" />
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-gray-800 px-4 py-3 bg-gray-900/50">
          <div className="max-w-4xl mx-auto grid grid-cols-6 gap-4 text-xs font-mono">
            <StatDisplay label="Reputation" value={stats.reputation} color="green" />
            <StatDisplay label="Stress" value={stats.stress} color="red" />
            <StatDisplay label="Ethics" value={stats.ethics} color="blue" />
            <StatDisplay label="Dealcraft" value={stats.dealcraft} color="purple" />
            <StatDisplay label="Politics" value={stats.politics} color="yellow" />
            <StatDisplay label="Money" value={`$${stats.money.toLocaleString()}`} color="green" />
          </div>
        </div>
      )}
    </div>
  );
};

interface ResourceBarProps {
  label: string;
  value: number;
  max: number;
  color: 'green' | 'red' | 'blue' | 'yellow' | 'purple';
  inverted?: boolean;
  onHover?: () => void;
  onLeave?: () => void;
}

const ResourceBar: React.FC<ResourceBarProps> = ({
  label,
  value,
  max,
  color,
  inverted = false,
  onHover,
  onLeave,
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const colorClasses = {
    green: 'bg-green-500',
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
  };

  // For inverted bars (like stress), low is good
  const isWarning = inverted ? percentage > 70 : percentage < 30;
  const barColor = isWarning
    ? (inverted ? colorClasses.red : colorClasses.red)
    : colorClasses[color];

  return (
    <div
      className="flex items-center gap-2 cursor-pointer group"
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <span className="text-gray-500 text-xs font-mono w-8">{label}</span>
      <div className="w-16 h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

interface MoneyDisplayProps {
  value: number;
}

const MoneyDisplay: React.FC<MoneyDisplayProps> = ({ value }) => {
  const formatted = formatCompact(value);

  return (
    <span className="text-green-400 font-mono text-sm">
      ${formatted}
    </span>
  );
};

interface StatDisplayProps {
  label: string;
  value: number | string;
  color: 'green' | 'red' | 'blue' | 'yellow' | 'purple';
}

const StatDisplay: React.FC<StatDisplayProps> = ({ label, value, color }) => {
  const colorClasses = {
    green: 'text-green-400',
    red: 'text-red-400',
    blue: 'text-blue-400',
    yellow: 'text-yellow-400',
    purple: 'text-purple-400',
  };

  return (
    <div className="text-center">
      <div className={`text-lg font-bold ${colorClasses[color]}`}>{value}</div>
      <div className="text-gray-500 text-xs uppercase">{label}</div>
    </div>
  );
};

function formatCompact(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
}

export default StatusBar;
