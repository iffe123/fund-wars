import React, { memo, useMemo, useState, useCallback } from 'react';
import type { PlayerStats, MarketVolatility } from '../types';
import { MARKET_VOLATILITY_STYLES } from '../constants';
import { STRESS_THRESHOLDS } from '../constants/difficulty';
import { useGame } from '../contexts/GameContext';
import TimeActionBar from './TimeActionBar';
import StatsExplainerModal from './StatsExplainerModal';

interface PlayerStatsProps {
  stats: PlayerStats;
  marketVolatility: MarketVolatility;
  onStatsClick?: () => void;
  showTimeActionBar?: boolean;
  onOpenTransparency?: () => void;
}

const PlayerStatsDisplay: React.FC<PlayerStatsProps> = memo(({ stats, marketVolatility, onStatsClick, showTimeActionBar = true, onOpenTransparency }) => {
  const { endWeek, toggleNightGrinder } = useGame();

  // Modal state for stats explainer
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [focusedStatId, setFocusedStatId] = useState<string | null>(null);

  // Handle general stats click (fallback to showing modal without focus)
  const handleGeneralStatsClick = useCallback(() => {
    if (onStatsClick) {
      onStatsClick();
    } else {
      setFocusedStatId(null);
      setShowStatsModal(true);
    }
  }, [onStatsClick]);

  // Memoize computed values
  const mktStyle = useMemo(() => MARKET_VOLATILITY_STYLES[marketVolatility], [marketVolatility]);
  const isPanic = marketVolatility === 'PANIC';

  const formatMoney = useMemo(() => (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
    return `$${val}`;
  }, []);

  // Stress level indicator
  const getStressColor = (stress: number) => {
    if (stress > 80) return 'text-red-400';
    if (stress > 50) return 'text-amber-400';
    return 'text-emerald-400';
  };

  const getStressBarColor = (stress: number) => {
    if (stress > 80) return 'bg-gradient-to-r from-red-600 to-red-400';
    if (stress > 50) return 'bg-gradient-to-r from-amber-600 to-amber-400';
    return 'bg-gradient-to-r from-emerald-600 to-emerald-400';
  };

  return (
    <>
      {/* Time & Action Bar */}
      {showTimeActionBar && stats.gameTime && (
        <TimeActionBar
          gameTime={stats.gameTime}
          onEndWeek={endWeek}
          onToggleNightGrinder={toggleNightGrinder}
          playerEnergy={stats.energy}
          playerHealth={stats.health}
        />
      )}

      {/* Stress Warning Banner */}
      {stats.stress >= STRESS_THRESHOLDS.WARNING && (
        <div
          className={`
            px-4 py-2 flex items-center gap-3 text-xs font-mono uppercase tracking-wider border-b
            ${stats.stress >= STRESS_THRESHOLDS.CRITICAL
              ? 'bg-red-950/60 border-red-800/50 text-red-300 animate-pulse'
              : 'bg-amber-950/40 border-amber-800/40 text-amber-300'
            }
          `}
          role="alert"
        >
          <i className={`fas ${stats.stress >= STRESS_THRESHOLDS.CRITICAL ? 'fa-triangle-exclamation' : 'fa-brain'} text-sm`}></i>
          <span className="font-bold">
            {stats.stress >= STRESS_THRESHOLDS.BREAKDOWN
              ? 'BURNOUT IMMINENT — Take time off or face breakdown!'
              : stats.stress >= STRESS_THRESHOLDS.CRITICAL
              ? 'CRITICAL STRESS — Performance penalties active. Manage your wellbeing.'
              : 'HIGH STRESS WARNING — Consider lifestyle actions to reduce stress.'}
          </span>
          <span className="ml-auto tabular-nums font-bold">{stats.stress}%</span>
        </div>
      )}

      {/* Stats Header */}
      <div
        onClick={handleGeneralStatsClick}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleGeneralStatsClick();
          }
        }}
        className={`
          h-16 bg-gradient-to-b from-slate-800 to-slate-900
          border-b border-slate-600 flex items-center px-4 justify-between shrink-0
          ${isPanic ? 'animate-pulse bg-red-950/20 border-red-900/50' : ''}
          cursor-pointer hover:bg-slate-700/50 transition-colors active:bg-slate-700 terminal-focus
        `}
        role="button"
        tabIndex={0}
        title="Click any stat for details"
        aria-label="Player stats overview — click for details"
      >
      {/* MOBILE VIEW (< 768px) */}
      <div className="flex md:hidden items-center w-full justify-between gap-3">
        {/* Bank Balance */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-950/50 border border-emerald-800/50 flex items-center justify-center">
            <i className="fas fa-wallet text-emerald-400 text-sm"></i>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">Bank</span>
            <span className="text-emerald-400 font-bold text-sm tabular-nums">{formatMoney(stats.personalFinances?.bankBalance ?? stats.cash)}</span>
          </div>
        </div>

        {/* Debt Indicator (if applicable) */}
        {stats.loanBalance > 0 && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-red-950/30 border border-red-900/30">
            <i className="fas fa-skull text-red-400 text-xs"></i>
            <span className="text-red-400 text-xs font-bold">{formatMoney(stats.loanBalance)}</span>
          </div>
        )}

        {/* Stress Bar */}
        <div className="flex-1 max-w-[120px]">
          <div className="flex items-center gap-2">
            <i className={`fas fa-brain ${getStressColor(stats.stress)} text-xs`}></i>
            <div className="flex-1">
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                <div
                  className={`h-full ${getStressBarColor(stats.stress)} transition-all duration-300`}
                  style={{ width: `${Math.min(100, stats.stress)}%` }}
                />
              </div>
            </div>
            <span className={`text-xs font-bold tabular-nums ${getStressColor(stats.stress)}`}>
              {stats.stress}%
            </span>
          </div>
        </div>

        {/* Level Badge */}
        <div className="px-2 py-1 rounded bg-amber-950/30 border border-amber-800/30">
          <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">{stats.level}</span>
        </div>

        {/* Stats Info Hint (Mobile) */}
        <div className="flex items-center gap-2">
          {onOpenTransparency && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenTransparency();
              }}
              className="w-6 h-6 rounded-full bg-slate-800/80 border border-slate-600/50 flex items-center justify-center hover:bg-slate-700"
              title="Transparency & rules"
              aria-label="Open transparency & rules"
            >
              <i className="fas fa-eye text-slate-300 text-[10px]"></i>
            </button>
          )}
          {onStatsClick && (
            <div className="w-6 h-6 rounded-full bg-slate-800/80 border border-slate-600/50 flex items-center justify-center">
              <i className="fas fa-info text-slate-400 text-[10px]"></i>
            </div>
          )}
        </div>
      </div>

      {/* DESKTOP VIEW (>= 768px) — Simplified: only core metrics that matter */}
      <div className="hidden md:flex items-center gap-3 text-xs font-mono w-full justify-between">
        {/* Left - Identity & Cash */}
        <div className="flex items-center gap-3">
          {/* Level Badge */}
          <div className="px-3 py-1.5 rounded-lg bg-amber-950/40 border border-amber-800/40">
            <span className="text-amber-300 text-xs font-bold uppercase tracking-wider">{stats.level}</span>
          </div>

          {/* Bank Balance */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-700/40" title="Your bank account. Earn through salary, bonuses, and carry.">
            <i className="fas fa-wallet text-emerald-400 text-sm"></i>
            <span className="text-emerald-300 font-bold tabular-nums text-sm">${(stats.personalFinances?.bankBalance ?? stats.cash).toLocaleString()}</span>
          </div>

          {/* Dry Powder (fund capital) */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/40 border border-cyan-700/30" title="Fund capital available for new deals.">
            <i className="fas fa-briefcase text-cyan-400 text-sm"></i>
            <span className="text-cyan-200 font-bold tabular-nums text-sm">
              {formatMoney(stats.fundFinances?.dryPowder || 50000000)}
            </span>
          </div>

          {/* Debt warning - only show if in debt */}
          {stats.loanBalance > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-950/40 border border-red-800/40" title="Outstanding debt — pay this off to avoid interest charges.">
              <i className="fas fa-skull text-red-400 text-xs"></i>
              <span className="text-red-300 font-bold tabular-nums text-sm">-{formatMoney(stats.loanBalance)}</span>
            </div>
          )}
        </div>

        {/* Center - Stress & Reputation (the two things you manage) */}
        <div className="flex items-center gap-3">
          {/* Stress */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-600/40" title="Stress — builds from overwork. At 100% you burn out.">
            <i className={`fas fa-brain ${getStressColor(stats.stress)} text-sm`}></i>
            <div className="w-24 h-2.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${getStressBarColor(stats.stress)} transition-all duration-300`}
                style={{ width: `${Math.min(100, stats.stress)}%` }}
              />
            </div>
            <span className={`font-bold tabular-nums text-sm ${getStressColor(stats.stress)}`}>
              {stats.stress}%
            </span>
          </div>

          {/* Reputation */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-950/40 border border-blue-700/40" title="Your standing in the industry. Higher = better deals and contacts.">
            <i className="fas fa-star text-blue-400 text-sm"></i>
            <span className="font-bold text-blue-200 tabular-nums text-sm">{stats.reputation}</span>
          </div>
        </div>

        {/* Right - Market & Actions */}
        <div className="flex items-center gap-3">
          {/* Market Status */}
          <div className={`
            flex items-center gap-2 px-3 py-1.5 rounded-lg border
            ${marketVolatility === 'NORMAL' ? 'bg-slate-800/40 border-slate-600/40' : ''}
            ${marketVolatility === 'BULL_RUN' ? 'bg-emerald-950/40 border-emerald-700/40' : ''}
            ${marketVolatility === 'CREDIT_CRUNCH' ? 'bg-red-950/40 border-red-700/40' : ''}
            ${marketVolatility === 'PANIC' ? 'bg-amber-950/40 border-amber-700/40 animate-pulse' : ''}
          `}>
            <i className={`fas ${mktStyle.icon} ${mktStyle.color} ${marketVolatility !== 'NORMAL' ? 'animate-pulse' : ''}`}></i>
            <span className={`text-xs uppercase tracking-widest font-bold ${mktStyle.color}`}>
              {marketVolatility.replace('_', ' ')}
            </span>
          </div>

          {/* Audit Risk - only show when dangerous (>30%) */}
          {stats.auditRisk > 30 && (
            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border ${stats.auditRisk >= 50 ? 'bg-red-950/40 border-red-800/40 animate-pulse' : 'bg-amber-950/30 border-amber-800/30'}`} title="Audit Risk — regulators are watching you.">
              <i className={`fas fa-magnifying-glass ${stats.auditRisk >= 50 ? 'text-red-400' : 'text-amber-400'} text-xs`}></i>
              <span className={`text-xs font-bold ${stats.auditRisk >= 50 ? 'text-red-300' : 'text-amber-300'}`}>{stats.auditRisk}%</span>
            </div>
          )}

          {/* Transparency shortcut */}
          {onOpenTransparency && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenTransparency();
              }}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-800/40 border border-slate-600/40 hover:bg-slate-700/40 transition-colors"
              title="View all stats & rules"
              aria-label="Open transparency & rules"
            >
              <i className="fas fa-eye text-slate-300 text-[11px]"></i>
              <span className="text-[11px] uppercase tracking-widest font-bold text-slate-300">More</span>
            </button>
          )}
        </div>
      </div>
    </div>

    {/* Stats Explainer Modal */}
    {showStatsModal && (
      <StatsExplainerModal
        stats={stats}
        marketVolatility={marketVolatility}
        onClose={() => setShowStatsModal(false)}
        focusStatId={focusedStatId}
      />
    )}
    </>
  );
});

PlayerStatsDisplay.displayName = 'PlayerStatsDisplay';

export default PlayerStatsDisplay;
