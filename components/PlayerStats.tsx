import React from 'react';
import type { PlayerStats, MarketVolatility } from '../types';
import { MARKET_VOLATILITY_STYLES } from '../constants';

interface PlayerStatsProps {
  stats: PlayerStats;
  marketVolatility: MarketVolatility;
}

const PlayerStatsDisplay: React.FC<PlayerStatsProps> = ({ stats, marketVolatility }) => {
  const mktStyle = MARKET_VOLATILITY_STYLES[marketVolatility];
  
  // Panic Effect
  const isPanic = marketVolatility === 'PANIC';

  const formatMoney = (val: number) => {
      if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
      if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
      return `$${val}`;
  }

  return (
      <div className={`h-12 bg-slate-900 border-b border-slate-700 flex items-center px-4 justify-between shrink-0 ${isPanic ? 'animate-pulse bg-red-950/30' : ''}`}>
          {/* MOBILE VIEW (< 768px) */}
          <div className="flex md:hidden items-center w-full justify-between space-x-4">
               <div className="flex items-center space-x-2 text-green-500 font-mono">
                  <i className="fas fa-wallet"></i>
                  <span className="font-bold">{formatMoney(stats.cash)}</span>
              </div>
              {stats.loanBalance > 0 && (
                  <div className="flex items-center space-x-1 text-red-400 text-[11px] font-mono">
                      <i className="fas fa-skull-crossbones"></i>
                      <span>Debt {formatMoney(stats.loanBalance)}</span>
                  </div>
              )}
              <div className="flex-1 flex items-center space-x-2">
                   <i className="fas fa-brain text-amber-500 text-xs"></i>
                   <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                       <div
                         className={`h-full ${stats.stress > 70 ? 'bg-red-500' : 'bg-amber-500'}`} 
                         style={{ width: `${Math.min(100, stats.stress)}%` }}
                        ></div>
                   </div>
              </div>
          </div>

          {/* DESKTOP VIEW (>= 768px) */}
          <div className="hidden md:flex items-center space-x-6 text-xs font-mono w-full justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2 text-green-500">
                    <i className="fas fa-wallet"></i>
                    <span className="font-bold">${stats.cash.toLocaleString()}</span>
                </div>
                <div className={`flex items-center space-x-2 ${stats.loanBalance > 0 ? 'text-red-400' : 'text-slate-500'}`}>
                    <i className="fas fa-handshake-slash"></i>
                    <span>
                        {stats.loanBalance > 0
                          ? `DEBT: ${formatMoney(stats.loanBalance)} @ ${(stats.loanRate * 100).toFixed(1)}%`
                          : 'NO DEBT'}
                    </span>
                </div>
                <div className="flex items-center space-x-2 text-amber-500">
                    <i className="fas fa-brain"></i>
                    <span>STRESS: {stats.stress}%</span>
                </div>
                <div className="flex items-center space-x-2 text-blue-400">
                    <i className="fas fa-star"></i>
                    <span>REP: {stats.reputation}</span>
                </div>
              </div>
              
              <div className={`text-[10px] uppercase tracking-widest font-bold flex items-center space-x-2 ${mktStyle.color}`}>
                  <i className={`fas ${mktStyle.icon}`}></i>
                  <span>{marketVolatility}</span>
              </div>

              <div className="flex items-center space-x-4 text-[10px] uppercase tracking-widest font-bold text-slate-400">
                  <span>LEVEL {stats.level}</span>
                  <span className="text-blue-400">Rating {stats.analystRating}</span>
                  <span className="text-green-400">Energy {stats.energy}%</span>
                  <span className="text-amber-400">Ethics {stats.ethics}</span>
                  <span className="text-red-400">Audit {stats.auditRisk}%</span>
              </div>
          </div>
      </div>
  );
};

export default PlayerStatsDisplay;