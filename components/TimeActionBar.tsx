import React, { memo } from 'react';
import type { GameTime } from '../types';

interface TimeActionBarProps {
  gameTime: GameTime;
  onEndWeek: () => void;
  onToggleNightGrinder: () => void;
  playerEnergy: number;
  playerHealth: number;
}

const TimeActionBar: React.FC<TimeActionBarProps> = memo(({
  gameTime,
  onEndWeek,
  onToggleNightGrinder,
  playerEnergy,
  playerHealth,
}) => {
  const { week, year, quarter, actionsRemaining, maxActions, isNightGrinder, actionsUsedThisWeek } = gameTime;

  // Calculate action bar fill
  const actionFillPercent = (actionsRemaining / maxActions) * 100;

  // Determine action bar color based on remaining actions
  const getActionBarColor = () => {
    if (actionsRemaining === 0) return 'bg-red-500';
    if (actionsRemaining <= 1) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  // Get quarter display string
  const quarterLabel = `Q${quarter}`;

  // Check if night grinder is risky
  const nightGrinderRisky = playerEnergy < 30 || playerHealth < 30;

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/60 px-4 py-3">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Time Display */}
        <div className="flex items-center gap-4">
          {/* Week/Year Badge */}
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-center justify-center px-3 py-1 rounded-lg bg-amber-950/40 border border-amber-800/50">
              <span className="text-[9px] text-amber-600 uppercase tracking-wider font-bold">Week</span>
              <span className="text-lg font-bold text-amber-400 tabular-nums">{week}</span>
            </div>
            <div className="flex flex-col text-xs text-slate-400">
              <span className="font-bold text-slate-300">Year {year}</span>
              <span className="text-slate-500">{quarterLabel}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-10 bg-slate-700/50"></div>

          {/* Actions Remaining */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <i className="fas fa-bolt text-amber-500 text-sm"></i>
              <span className="text-xs text-slate-400 uppercase tracking-wider">Actions</span>
              <span className="text-sm font-bold text-white tabular-nums">
                {Math.floor(actionsRemaining)}/{maxActions}
              </span>
            </div>
            {/* Action Bar */}
            <div className="w-32 h-2 bg-slate-700/50 rounded-full overflow-hidden border border-slate-600/50">
              <div
                className={`h-full transition-all duration-300 ${getActionBarColor()}`}
                style={{ width: `${actionFillPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Actions Used This Week */}
        {actionsUsedThisWeek.length > 0 && (
          <div className="hidden lg:flex items-center gap-2 text-[10px] text-slate-500">
            <span className="uppercase tracking-wider">This week:</span>
            <div className="flex gap-1 flex-wrap">
              {actionsUsedThisWeek.slice(-5).map((action, i) => (
                <span
                  key={i}
                  className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700/50 text-slate-400"
                >
                  {action.replace(/_/g, ' ')}
                </span>
              ))}
              {actionsUsedThisWeek.length > 5 && (
                <span className="text-slate-400">+{actionsUsedThisWeek.length - 5} more</span>
              )}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Night Grinder Toggle */}
          <button
            onClick={onToggleNightGrinder}
            disabled={actionsRemaining === 0 && !isNightGrinder}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-bold uppercase tracking-wider
              transition-all duration-200
              ${isNightGrinder
                ? 'bg-purple-900/50 border-purple-500/60 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                : nightGrinderRisky
                  ? 'bg-slate-800/50 border-red-800/50 text-red-400 hover:bg-red-950/30 hover:border-red-600/60'
                  : 'bg-slate-800/50 border-slate-600/50 text-slate-400 hover:bg-slate-700/50 hover:border-slate-500'
              }
              ${actionsRemaining === 0 && !isNightGrinder ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            title={
              isNightGrinder
                ? 'Night Grinder active: +1 action this week, -15 energy and -5 health next week'
                : nightGrinderRisky
                  ? 'Warning: Your energy or health is too low for this'
                  : 'Work late for +1 action (costs health/energy next week)'
            }
          >
            <i className={`fas ${isNightGrinder ? 'fa-moon' : 'fa-coffee'} text-sm`}></i>
            <span className="hidden sm:inline">
              {isNightGrinder ? 'Night Grinder ON' : 'Night Grinder'}
            </span>
            {isNightGrinder && (
              <span className="text-[10px] text-purple-400/70 ml-1">+1</span>
            )}
          </button>

          {/* End Week Button */}
          <button
            onClick={onEndWeek}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-bold uppercase tracking-wider
              transition-all duration-200
              ${actionsRemaining === 0
                ? 'bg-emerald-900/50 border-emerald-500/60 text-emerald-300 hover:bg-emerald-900/70 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                : 'bg-slate-800/50 border-slate-600/50 text-slate-400 hover:bg-slate-700/50 hover:border-slate-500'
              }
            `}
          >
            <i className="fas fa-forward-step text-sm"></i>
            <span className="hidden sm:inline">End Week</span>
            <span className="sm:hidden">Next</span>
          </button>
        </div>
      </div>

      {/* Night Grinder Warning */}
      {isNightGrinder && (
        <div className="mt-2 flex items-center gap-2 text-[10px] text-purple-400/80 bg-purple-950/30 px-3 py-1.5 rounded border border-purple-800/30">
          <i className="fas fa-exclamation-triangle text-amber-500"></i>
          <span>
            Night Grinder active. You have +1 action this week, but next week you'll lose 15 energy and 5 health.
          </span>
        </div>
      )}

      {/* No Actions Warning */}
      {actionsRemaining === 0 && !isNightGrinder && (
        <div className="mt-2 flex items-center gap-2 text-[10px] text-amber-400/80 bg-amber-950/30 px-3 py-1.5 rounded border border-amber-800/30">
          <i className="fas fa-hourglass-end text-amber-500"></i>
          <span>
            No actions remaining this week. End the week to continue, or activate Night Grinder for one more action.
          </span>
        </div>
      )}
    </div>
  );
});

TimeActionBar.displayName = 'TimeActionBar';

export default TimeActionBar;
