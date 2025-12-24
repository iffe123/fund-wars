import React, { memo, useMemo, useState, useCallback } from 'react';
import type { PlayerStats, MarketVolatility } from '../types';
import { PlayerLevel } from '../types';
import { MARKET_VOLATILITY_STYLES, LEVEL_RANKS } from '../constants';
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

  // Handle individual stat click
  const handleStatClick = useCallback((statId: string) => {
    setFocusedStatId(statId);
    setShowStatsModal(true);
  }, []);

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
  const factions = stats.factionReputation;
  const isPanic = marketVolatility === 'PANIC';

  const formatMoney = useMemo(() => (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
    return `$${val}`;
  }, []);

  // Calculate net worth (bank balance + portfolio value - debt)
  const portfolioValue = stats.portfolio.reduce((sum, c) => sum + (c.currentValuation * (c.ownershipPercentage / 100)), 0);
  const bankBalance = stats.personalFinances?.bankBalance ?? stats.cash;
  const netWorth = bankBalance + portfolioValue + stats.totalRealizedGains - stats.loanBalance;

  // Win condition progress
  const isPartner = LEVEL_RANKS[stats.level] >= LEVEL_RANKS[PlayerLevel.PARTNER];
  const hasMillionDollars = netWorth >= 1000000;
  const canUnlockFounder = stats.reputation >= 50;

  // Progress percentages
  const levelProgress = Math.min(100, (LEVEL_RANKS[stats.level] / LEVEL_RANKS[PlayerLevel.PARTNER]) * 100);
  const wealthProgress = Math.min(100, (netWorth / 1000000) * 100);
  const founderProgress = Math.min(100, (stats.reputation / 50) * 100);

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

      {/* Stats Header */}
      <div
        onClick={handleGeneralStatsClick}
        className={`
          h-14 bg-gradient-to-b from-slate-800 to-slate-900
          border-b border-slate-600 flex items-center px-4 justify-between shrink-0
          ${isPanic ? 'animate-pulse bg-red-950/20 border-red-900/50' : ''}
          cursor-pointer hover:bg-slate-700/50 transition-colors active:bg-slate-700
        `}
        role="button"
        tabIndex={0}
        title="Click any stat for details"
      >
      {/* MOBILE VIEW (< 768px) */}
      <div className="flex md:hidden items-center w-full justify-between gap-3">
        {/* Bank Balance */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-950/50 border border-emerald-800/50 flex items-center justify-center">
            <i className="fas fa-wallet text-emerald-400 text-sm"></i>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Bank</span>
            <span className="text-emerald-400 font-bold text-sm tabular-nums">{formatMoney(stats.personalFinances?.bankBalance ?? stats.cash)}</span>
          </div>
        </div>

        {/* Debt Indicator (if applicable) */}
        {stats.loanBalance > 0 && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-red-950/30 border border-red-900/30">
            <i className="fas fa-skull text-red-400 text-[10px]"></i>
            <span className="text-red-400 text-[10px] font-bold">{formatMoney(stats.loanBalance)}</span>
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
            <span className={`text-[10px] font-bold tabular-nums ${getStressColor(stats.stress)}`}>
              {stats.stress}%
            </span>
          </div>
        </div>

        {/* Level Badge */}
        <div className="px-2 py-1 rounded bg-amber-950/30 border border-amber-800/30">
          <span className="text-amber-400 text-[10px] font-bold uppercase tracking-wider">L{stats.level}</span>
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

      {/* DESKTOP VIEW (>= 768px) */}
      <div className="hidden md:flex items-center gap-4 text-xs font-mono w-full justify-between">
        {/* Left Section - Personal Finances */}
        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800/40 border border-slate-700/30">
          <i className="fas fa-user text-slate-500 text-[10px] mr-1"></i>
          <span className="text-[8px] text-slate-500 uppercase tracking-wider mr-2">Personal</span>

          {/* Bank Balance */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-800/30">
            <i className="fas fa-wallet text-emerald-400 text-[10px]"></i>
            <span className="text-emerald-400 font-bold tabular-nums text-[11px]">${(stats.personalFinances?.bankBalance ?? stats.cash).toLocaleString()}</span>
          </div>

          {/* Lifestyle */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-purple-950/40 border border-purple-800/30">
            <i className="fas fa-home text-purple-400 text-[10px]"></i>
            <span className="text-purple-400 text-[10px] font-medium">
              {stats.personalFinances?.lifestyleLevel?.replace('_', ' ') || 'Broke'}
            </span>
          </div>
        </div>

        {/* Center Section - Fund Capital */}
        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-950/30 border border-blue-700/30">
          <i className="fas fa-briefcase text-blue-500 text-[10px] mr-1"></i>
          <span className="text-[8px] text-blue-500 uppercase tracking-wider mr-2">Fund</span>

          {/* Dry Powder */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-800/30">
            <span className="text-[9px] text-cyan-600">Dry:</span>
            <span className="text-cyan-400 font-bold tabular-nums text-[11px]">
              {formatMoney(stats.fundFinances?.dryPowder || 50000000)}
            </span>
          </div>

          {/* Deployed */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-950/40 border border-amber-800/30">
            <span className="text-[9px] text-amber-600">Deployed:</span>
            <span className="text-amber-400 font-bold tabular-nums text-[11px]">
              {formatMoney(stats.fundFinances?.deployedCapital || portfolioValue)}
            </span>
          </div>
        </div>

        {/* Right Section - Key Stats */}
        <div className="flex items-center gap-3">
          {/* Stress */}
          <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-slate-800/30 border border-slate-700/40">
            <i className={`fas fa-brain ${getStressColor(stats.stress)} text-xs`}></i>
            <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${getStressBarColor(stats.stress)} transition-all duration-300`}
                style={{ width: `${Math.min(100, stats.stress)}%` }}
              />
            </div>
            <span className={`font-bold tabular-nums text-[10px] ${getStressColor(stats.stress)}`}>
              {stats.stress}%
            </span>
          </div>

          {/* Reputation */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-950/30 border border-blue-800/40">
            <i className="fas fa-star text-blue-400 text-xs"></i>
            <span className="font-bold text-blue-400 tabular-nums">{stats.reputation}</span>
          </div>
        </div>

        {/* Center Section - Market Status */}
        <div className={`
          flex items-center gap-2 px-4 py-2 rounded-lg border
          ${marketVolatility === 'NORMAL' ? 'bg-slate-800/30 border-slate-700/40' : ''}
          ${marketVolatility === 'BULL_RUN' ? 'bg-emerald-950/30 border-emerald-800/40' : ''}
          ${marketVolatility === 'CREDIT_CRUNCH' ? 'bg-red-950/30 border-red-800/40' : ''}
          ${marketVolatility === 'PANIC' ? 'bg-amber-950/30 border-amber-800/40 animate-pulse' : ''}
        `}>
          <i className={`fas ${mktStyle.icon} ${mktStyle.color} ${marketVolatility !== 'NORMAL' ? 'animate-pulse' : ''}`}></i>
          <div className="flex flex-col">
            <span className="text-[9px] text-slate-500 uppercase tracking-wider">Market</span>
            <span className={`text-[10px] uppercase tracking-widest font-bold ${mktStyle.color}`}>
              {marketVolatility.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Right Section - Status Indicators */}
        <div className="flex items-center gap-4">
          {/* Time */}
          <div className="flex items-center gap-2 text-slate-400">
            <i className="fas fa-clock text-slate-500"></i>
            <span className="text-[10px] uppercase tracking-wider">{stats.currentDayType} · {stats.currentTimeSlot}</span>
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-slate-700/50"></div>

          {/* Quick Stats */}
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest font-bold">
            <span className="text-slate-400">L{stats.level}</span>
            <span className="text-blue-400 flex items-center gap-1">
              <i className="fas fa-chart-line text-[8px]"></i>
              {stats.analystRating}
            </span>
            <span className={`flex items-center gap-1 ${stats.energy > 30 ? 'text-emerald-400' : 'text-red-400'}`}>
              <i className="fas fa-bolt text-[8px]"></i>
              {stats.energy}%
            </span>
            <span className={`flex items-center gap-1 ${stats.ethics > 30 ? 'text-amber-400' : 'text-red-400'}`}>
              <i className="fas fa-scale-balanced text-[8px]"></i>
              {stats.ethics}
            </span>
            <span className={`flex items-center gap-1 ${stats.auditRisk < 50 ? 'text-slate-400' : 'text-red-400'}`}>
              <i className="fas fa-magnifying-glass text-[8px]"></i>
              {stats.auditRisk}%
            </span>
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-slate-700/50"></div>

          {/* Factions */}
          <div className="flex items-center gap-3 text-[10px] font-bold">
            <span className="uppercase tracking-widest text-slate-400 text-[9px]">Factions</span>
            <div className="flex items-center gap-2">
              <span className="text-blue-300 flex items-center gap-1" title="Managing Directors">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                {factions.MANAGING_DIRECTORS}
              </span>
              <span className="text-emerald-300 flex items-center gap-1" title="Limited Partners">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                {factions.LIMITED_PARTNERS}
              </span>
              <span className="text-amber-200 flex items-center gap-1" title="Analysts">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                {factions.ANALYSTS}
              </span>
              <span className="text-red-200 flex items-center gap-1" title="Regulators">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                {factions.REGULATORS}
              </span>
              <span className="text-pink-200 flex items-center gap-1" title="Rivals">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-400"></span>
                {factions.RIVALS}
              </span>
            </div>
          </div>

          {/* Divider */}
          {onOpenTransparency && <div className="w-px h-6 bg-slate-700/50"></div>}

          {/* Transparency shortcut */}
          {onOpenTransparency && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenTransparency();
              }}
              className="flex items-center gap-2 px-2 py-1 rounded-lg bg-slate-800/30 border border-slate-700/40 hover:bg-slate-700/40 transition-colors"
              title="Transparency & rules"
              aria-label="Open transparency & rules"
            >
              <i className="fas fa-eye text-slate-300 text-[10px]"></i>
              <span className="text-[10px] uppercase tracking-widest font-bold text-slate-300">Rules</span>
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
