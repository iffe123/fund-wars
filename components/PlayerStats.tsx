import React, { memo, useMemo, useState, useCallback, useRef, useEffect } from 'react';
import type { PlayerStats, MarketVolatility } from '../types';
import { MARKET_VOLATILITY_STYLES } from '../constants';
import { STRESS_THRESHOLDS } from '../constants/difficulty';
import { formatCurrency } from '../utils/formatCurrency';
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

  // Track previous values for flash animations
  const prevCashRef = useRef(stats.personalFinances?.bankBalance ?? stats.cash);
  const prevReputationRef = useRef(stats.reputation);
  const prevStressRef = useRef(stats.stress);
  const [cashFlash, setCashFlash] = useState<'up' | 'down' | null>(null);
  const [repFlash, setRepFlash] = useState<'up' | 'down' | null>(null);
  const [stressFlash, setStressFlash] = useState<'up' | 'down' | null>(null);

  // Detect stat changes and trigger flash animations
  useEffect(() => {
    const currentCash = stats.personalFinances?.bankBalance ?? stats.cash;
    if (currentCash !== prevCashRef.current) {
      setCashFlash(currentCash > prevCashRef.current ? 'up' : 'down');
      prevCashRef.current = currentCash;
      const timer = setTimeout(() => setCashFlash(null), 1200);
      return () => clearTimeout(timer);
    }
  }, [stats.personalFinances?.bankBalance, stats.cash]);

  useEffect(() => {
    if (stats.reputation !== prevReputationRef.current) {
      setRepFlash(stats.reputation > prevReputationRef.current ? 'up' : 'down');
      prevReputationRef.current = stats.reputation;
      const timer = setTimeout(() => setRepFlash(null), 1200);
      return () => clearTimeout(timer);
    }
  }, [stats.reputation]);

  useEffect(() => {
    if (stats.stress !== prevStressRef.current) {
      setStressFlash(stats.stress > prevStressRef.current ? 'up' : 'down');
      prevStressRef.current = stats.stress;
      const timer = setTimeout(() => setStressFlash(null), 1200);
      return () => clearTimeout(timer);
    }
  }, [stats.stress]);

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

  const formatMoney = formatCurrency;

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

      {/* Stress Warning Banner — escalates from subtle strip to full-width urgent alert */}
      {stats.stress >= STRESS_THRESHOLDS.WARNING && (() => {
        const isBreakdown = stats.stress >= STRESS_THRESHOLDS.BREAKDOWN;
        const isCritical = stats.stress >= STRESS_THRESHOLDS.CRITICAL;
        return (
          <div
            className={`
              flex items-center gap-3 border-b-2
              ${isBreakdown
                ? 'burnout-alert px-4 py-3 border-red-400 text-red-50'
                : isCritical
                ? 'px-4 py-2.5 bg-red-950/70 border-red-700 text-red-100'
                : 'px-4 py-2 bg-amber-950/50 border-amber-700 text-amber-100'
              }
            `}
            role="alert"
            aria-live={isCritical ? 'assertive' : 'polite'}
          >
            <i className={`fas ${isCritical ? 'fa-triangle-exclamation' : 'fa-brain'} text-base shrink-0 ${isBreakdown ? 'animate-pulse' : ''}`}></i>
            <span className={`font-bold font-prose leading-snug ${isBreakdown ? 'text-sm md:text-base' : 'text-[13px] uppercase tracking-wider'}`}>
              {isBreakdown
                ? 'Burnout imminent — take time off or face a breakdown.'
                : isCritical
                ? 'Critical Stress — performance penalties active. Manage your wellbeing.'
                : 'High Stress Warning — consider lifestyle actions to reduce stress.'}
            </span>
            <span className="ml-auto tabular-nums font-bold font-mono text-sm">{stats.stress}%</span>
          </div>
        );
      })()}

      {/* Stats Header — canonical home for every status number in the app */}
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
          ${isPanic ? 'animate-pulse bg-red-950/30 border-red-800' : ''}
          cursor-pointer hover:bg-slate-700/60 transition-colors active:bg-slate-700 terminal-focus
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
          <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-700 flex items-center justify-center">
            <i className="fas fa-wallet text-emerald-300 text-sm"></i>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-200 uppercase tracking-wider font-bold">Bank</span>
            <span className="text-emerald-300 font-bold text-sm tabular-nums">{formatMoney(stats.personalFinances?.bankBalance ?? stats.cash)}</span>
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
        {/* Left - Identity & Money (grouped: all cash-related in one cluster) */}
        <div className="flex items-center gap-2">
          {/* Level Badge */}
          <div className="px-3 py-1.5 rounded-lg bg-amber-950/50 border border-amber-700">
            <span className="text-amber-200 text-xs font-bold uppercase tracking-wider">{stats.level}</span>
          </div>

          <span className="w-px h-6 bg-slate-700" aria-hidden="true" />

          {/* Bank Balance */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all duration-300 ${
            cashFlash === 'up' ? 'bg-emerald-900/70 border-emerald-400 scale-105' :
            cashFlash === 'down' ? 'bg-red-900/60 border-red-400 scale-105' :
            'bg-emerald-950/50 border-emerald-700'
          }`} title="Your personal bank account. Earned through salary, bonuses, and carry.">
            <i className={`fas fa-wallet text-sm ${cashFlash === 'down' ? 'text-red-300' : 'text-emerald-300'}`}></i>
            <span className="sr-only">Bank balance:</span>
            <span className={`font-bold tabular-nums text-sm ${cashFlash === 'up' ? 'text-emerald-100' : cashFlash === 'down' ? 'text-red-100' : 'text-emerald-100'}`}>{formatCurrency(stats.personalFinances?.bankBalance ?? stats.cash)}</span>
            {cashFlash && (
              <i className={`fas ${cashFlash === 'up' ? 'fa-arrow-up text-emerald-300' : 'fa-arrow-down text-red-300'} text-[10px] animate-bounce`} aria-hidden="true"></i>
            )}
          </div>

          {/* Dry Powder (fund capital) */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/50 border border-cyan-700" title="Fund capital available for new deals.">
            <i className="fas fa-briefcase text-cyan-300 text-sm"></i>
            <span className="sr-only">Dry powder:</span>
            <span className="text-cyan-100 font-bold tabular-nums text-sm">
              {formatMoney(stats.fundFinances?.dryPowder || 50000000)}
            </span>
          </div>

          {/* Debt warning - only show if in debt */}
          {stats.loanBalance > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-950/60 border border-red-700" title="Outstanding debt — pay this off to avoid interest charges.">
              <i className="fas fa-skull text-red-300 text-xs"></i>
              <span className="sr-only">Debt:</span>
              <span className="text-red-100 font-bold tabular-nums text-sm">-{formatMoney(stats.loanBalance)}</span>
            </div>
          )}
        </div>

        {/* Center - Wellbeing cluster (stress + reputation, the levers you manage) */}
        <div className="flex items-center gap-2">
          {/* Stress */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-300 ${
              stressFlash === 'up' ? 'bg-red-900/60 border-red-400 scale-105' :
              stressFlash === 'down' ? 'bg-emerald-900/60 border-emerald-400 scale-105' :
              'bg-slate-800/60 border-slate-600'
            }`}
            title="Stress — builds from overwork. At 100% you burn out."
            aria-label={`Stress: ${stats.stress}%`}
          >
            <i className={`fas fa-brain ${getStressColor(stats.stress)} text-sm ${stressFlash === 'up' ? 'animate-pulse' : ''}`} aria-hidden="true"></i>
            <div
              className="w-24 h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700"
              role="progressbar"
              aria-valuenow={stats.stress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className={`h-full ${getStressBarColor(stats.stress)} transition-all duration-500`}
                style={{ width: `${Math.min(100, stats.stress)}%` }}
              />
            </div>
            <span className={`font-bold tabular-nums text-sm ${getStressColor(stats.stress)}`}>
              {stats.stress}%
            </span>
            {stressFlash && (
              <i className={`fas ${stressFlash === 'up' ? 'fa-arrow-up text-red-300' : 'fa-arrow-down text-emerald-300'} text-[10px] animate-bounce`} aria-hidden="true"></i>
            )}
          </div>

          {/* Reputation */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all duration-300 ${
              repFlash === 'up' ? 'bg-blue-900/70 border-blue-400 scale-105' :
              repFlash === 'down' ? 'bg-red-900/60 border-red-400 scale-105' :
              'bg-blue-950/50 border-blue-700'
            }`}
            title="Your standing in the industry. Higher = better deals and contacts."
            aria-label={`Reputation: ${stats.reputation}`}
          >
            <i className={`fas fa-star text-sm ${repFlash === 'up' ? 'text-amber-300' : repFlash === 'down' ? 'text-red-300' : 'text-blue-300'}`} aria-hidden="true"></i>
            <span className={`font-bold tabular-nums text-sm ${repFlash === 'up' ? 'text-amber-100' : repFlash === 'down' ? 'text-red-100' : 'text-blue-100'}`}>{stats.reputation}</span>
            {repFlash && (
              <i className={`fas ${repFlash === 'up' ? 'fa-arrow-up text-emerald-300' : 'fa-arrow-down text-red-300'} text-[10px] animate-bounce`} aria-hidden="true"></i>
            )}
          </div>
        </div>

        {/* Right - Market & Actions */}
        <div className="flex items-center gap-2">
          {/* Market Status */}
          <div
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-lg border
              ${marketVolatility === 'NORMAL' ? 'bg-slate-800/60 border-slate-600' : ''}
              ${marketVolatility === 'BULL_RUN' ? 'bg-emerald-950/50 border-emerald-700' : ''}
              ${marketVolatility === 'CREDIT_CRUNCH' ? 'bg-red-950/50 border-red-700' : ''}
              ${marketVolatility === 'PANIC' ? 'bg-amber-950/50 border-amber-700 animate-pulse' : ''}
            `}
            aria-label={`Market: ${marketVolatility.replace('_', ' ')}`}
          >
            <i className={`fas ${mktStyle.icon} ${mktStyle.color} ${marketVolatility !== 'NORMAL' ? 'animate-pulse' : ''}`} aria-hidden="true"></i>
            <span className={`text-xs uppercase tracking-widest font-bold ${mktStyle.color}`}>
              {marketVolatility.replace('_', ' ')}
            </span>
          </div>

          {/* Audit Risk - only show when dangerous (>30%) */}
          {stats.auditRisk > 30 && (
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border ${stats.auditRisk >= 50 ? 'bg-red-950/60 border-red-700 animate-pulse' : 'bg-amber-950/50 border-amber-700'}`}
              title="Audit Risk — regulators are watching you."
              aria-label={`Audit risk: ${stats.auditRisk}%`}
            >
              <i className={`fas fa-magnifying-glass ${stats.auditRisk >= 50 ? 'text-red-300' : 'text-amber-300'} text-xs`} aria-hidden="true"></i>
              <span className={`text-xs font-bold ${stats.auditRisk >= 50 ? 'text-red-100' : 'text-amber-100'}`}>{stats.auditRisk}%</span>
            </div>
          )}

          {/* Transparency shortcut */}
          {onOpenTransparency && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenTransparency();
              }}
              className="terminal-focus flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-800/60 border border-slate-600 hover:bg-slate-700 hover:border-slate-500 transition-colors"
              title="View all stats & rules"
              aria-label="Open transparency & rules"
            >
              <i className="fas fa-eye text-slate-200 text-[11px]" aria-hidden="true"></i>
              <span className="text-[11px] uppercase tracking-widest font-bold text-slate-100">More</span>
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
