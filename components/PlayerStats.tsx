import React from 'react';
import type { PlayerStats, MarketVolatility } from '../types';
import { MARKET_VOLATILITY_STYLES } from '../constants';

interface PlayerStatsProps {
  stats: PlayerStats;
  marketVolatility: MarketVolatility;
}

const PlayerStatsDisplay: React.FC<PlayerStatsProps> = ({ stats, marketVolatility }) => {
  const mktStyle = MARKET_VOLATILITY_STYLES[marketVolatility];
  const factions = stats.factionReputation;
  const isPanic = marketVolatility === 'PANIC';

  const formatMoney = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
    return `$${val}`;
  };

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
    <div className={`
      h-14 bg-gradient-to-b from-slate-900 to-slate-900/95
      border-b border-slate-700/80 flex items-center px-4 justify-between shrink-0
      ${isPanic ? 'animate-pulse bg-red-950/20 border-red-900/50' : ''}
    `}>
      {/* MOBILE VIEW (< 768px) */}
      <div className="flex md:hidden items-center w-full justify-between gap-3">
        {/* Cash */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-950/50 border border-emerald-800/50 flex items-center justify-center">
            <i className="fas fa-wallet text-emerald-400 text-sm"></i>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Cash</span>
            <span className="text-emerald-400 font-bold text-sm tabular-nums">{formatMoney(stats.cash)}</span>
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
      </div>

      {/* DESKTOP VIEW (>= 768px) */}
      <div className="hidden md:flex items-center gap-6 text-xs font-mono w-full justify-between">
        {/* Left Section - Primary Stats */}
        <div className="flex items-center gap-5">
          {/* Cash */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-emerald-950/30 border border-emerald-800/40">
            <i className="fas fa-wallet text-emerald-400"></i>
            <div className="flex flex-col">
              <span className="text-[9px] text-emerald-600 uppercase tracking-wider">Balance</span>
              <span className="font-bold text-emerald-400 tabular-nums">${stats.cash.toLocaleString()}</span>
            </div>
          </div>

          {/* Debt */}
          <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg border ${
            stats.loanBalance > 0
              ? 'bg-red-950/30 border-red-800/40'
              : 'bg-slate-800/30 border-slate-700/40'
          }`}>
            <i className={`fas fa-handshake-slash ${stats.loanBalance > 0 ? 'text-red-400' : 'text-slate-500'}`}></i>
            <div className="flex flex-col">
              <span className={`text-[9px] uppercase tracking-wider ${stats.loanBalance > 0 ? 'text-red-600' : 'text-slate-600'}`}>Debt</span>
              <span className={`font-bold tabular-nums ${stats.loanBalance > 0 ? 'text-red-400' : 'text-slate-500'}`}>
                {stats.loanBalance > 0
                  ? `${formatMoney(stats.loanBalance)} @ ${(stats.loanRate * 100).toFixed(1)}%`
                  : 'None'}
              </span>
            </div>
          </div>

          {/* Stress */}
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-800/30 border border-slate-700/40">
            <i className={`fas fa-brain ${getStressColor(stats.stress)}`}></i>
            <div className="flex flex-col min-w-[80px]">
              <span className="text-[9px] text-slate-600 uppercase tracking-wider">Stress</span>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getStressBarColor(stats.stress)} transition-all duration-300`}
                    style={{ width: `${Math.min(100, stats.stress)}%` }}
                  />
                </div>
                <span className={`font-bold tabular-nums text-[10px] ${getStressColor(stats.stress)}`}>
                  {stats.stress}%
                </span>
              </div>
            </div>
          </div>

          {/* Reputation */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-blue-950/30 border border-blue-800/40">
            <i className="fas fa-star text-blue-400"></i>
            <div className="flex flex-col">
              <span className="text-[9px] text-blue-600 uppercase tracking-wider">Rep</span>
              <span className="font-bold text-blue-400 tabular-nums">{stats.reputation}</span>
            </div>
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
            <span className="uppercase tracking-widest text-slate-600 text-[9px]">Factions</span>
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
        </div>
      </div>
    </div>
  );
};

export default PlayerStatsDisplay;
