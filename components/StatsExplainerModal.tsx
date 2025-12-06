import React, { useEffect, useRef } from 'react';
import type { PlayerStats, MarketVolatility } from '../types';
import { MARKET_VOLATILITY_STYLES } from '../constants';

interface StatsExplainerModalProps {
  stats: PlayerStats;
  marketVolatility: MarketVolatility;
  onClose: () => void;
  isFirstTime?: boolean;
  focusStatId?: string | null;
}

const STAT_EXPLANATIONS = [
  {
    id: 'cash',
    icon: 'fa-wallet',
    label: 'Cash',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-950/30',
    borderColor: 'border-emerald-800/50',
    description: 'Your operating capital. Used for deals, actions, and survival.',
    tip: 'Running low? Take a bridge loan or win an auction.',
    getValue: (stats: PlayerStats) => `$${stats.cash.toLocaleString()}`,
    getStatus: (stats: PlayerStats) =>
      stats.cash < 5000 ? 'critical' : stats.cash < 20000 ? 'warning' : 'healthy',
  },
  {
    id: 'debt',
    icon: 'fa-skull',
    label: 'Debt',
    color: 'text-red-400',
    bgColor: 'bg-red-950/30',
    borderColor: 'border-red-800/50',
    description: 'Borrowed money. High interest eats your returns every week.',
    tip: 'Pay it down when you can. Interest compounds fast.',
    getValue: (stats: PlayerStats) => stats.loanBalance > 0
      ? `$${stats.loanBalance.toLocaleString()} @ ${(stats.loanRate * 100).toFixed(1)}%`
      : 'None',
    getStatus: (stats: PlayerStats) =>
      stats.loanBalance > 100000 ? 'critical' : stats.loanBalance > 0 ? 'warning' : 'healthy',
  },
  {
    id: 'stress',
    icon: 'fa-brain',
    label: 'Stress',
    color: 'text-amber-400',
    bgColor: 'bg-amber-950/30',
    borderColor: 'border-amber-800/50',
    description: 'Your mental state. Hit 100% and you burn out.',
    tip: 'Take breaks, hit the gym, or use... alternative methods.',
    getValue: (stats: PlayerStats) => `${stats.stress}%`,
    getStatus: (stats: PlayerStats) =>
      stats.stress > 80 ? 'critical' : stats.stress > 50 ? 'warning' : 'healthy',
  },
  {
    id: 'reputation',
    icon: 'fa-star',
    label: 'Reputation',
    color: 'text-blue-400',
    bgColor: 'bg-blue-950/30',
    borderColor: 'border-blue-800/50',
    description: 'Your standing in the industry. Affects promotions and deal flow.',
    tip: 'Build relationships, close deals, and avoid scandals.',
    getValue: (stats: PlayerStats) => `${stats.reputation}/100`,
    getStatus: (stats: PlayerStats) =>
      stats.reputation < 20 ? 'critical' : stats.reputation < 50 ? 'warning' : 'healthy',
  },
  {
    id: 'energy',
    icon: 'fa-bolt',
    label: 'Energy',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-950/30',
    borderColor: 'border-yellow-800/50',
    description: 'Your stamina. Actions cost energy. Low energy = mistakes.',
    tip: 'Coffee helps short-term. Rest helps long-term.',
    getValue: (stats: PlayerStats) => `${stats.energy}%`,
    getStatus: (stats: PlayerStats) =>
      stats.energy < 20 ? 'critical' : stats.energy < 40 ? 'warning' : 'healthy',
  },
  {
    id: 'ethics',
    icon: 'fa-scale-balanced',
    label: 'Ethics',
    color: 'text-purple-400',
    bgColor: 'bg-purple-950/30',
    borderColor: 'border-purple-800/50',
    description: 'Your moral compass. Low ethics attracts regulators.',
    tip: 'Some shortcuts pay off. Others land you in prison.',
    getValue: (stats: PlayerStats) => `${stats.ethics}/100`,
    getStatus: (stats: PlayerStats) =>
      stats.ethics < 20 ? 'critical' : stats.ethics < 50 ? 'warning' : 'healthy',
  },
  {
    id: 'auditRisk',
    icon: 'fa-magnifying-glass',
    label: 'Audit Risk',
    color: 'text-rose-400',
    bgColor: 'bg-rose-950/30',
    borderColor: 'border-rose-800/50',
    description: 'Regulatory attention. Too high and you get investigated.',
    tip: 'Stay clean, or at least stay hidden.',
    getValue: (stats: PlayerStats) => `${stats.auditRisk}%`,
    getStatus: (stats: PlayerStats) =>
      stats.auditRisk > 70 ? 'critical' : stats.auditRisk > 40 ? 'warning' : 'healthy',
  },
  {
    id: 'analystRating',
    icon: 'fa-chart-line',
    label: 'Analyst Rating',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-950/30',
    borderColor: 'border-cyan-800/50',
    description: 'How good you are at analyzing deals. Higher = better insights.',
    tip: 'Practice analysis and learn from mistakes.',
    getValue: (stats: PlayerStats) => `${stats.analystRating}/100`,
    getStatus: (stats: PlayerStats) =>
      stats.analystRating < 30 ? 'warning' : 'healthy',
  },
];

const StatsExplainerModal: React.FC<StatsExplainerModalProps> = ({
  stats,
  marketVolatility,
  onClose,
  isFirstTime = false,
  focusStatId = null
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to focused stat when modal opens
  useEffect(() => {
    if (focusStatId && scrollContainerRef.current) {
      const element = scrollContainerRef.current.querySelector(`#stat-${focusStatId}`);
      if (element) {
        // Small delay to ensure layout is complete
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }
  }, [focusStatId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-red-400';
      case 'warning': return 'text-amber-400';
      default: return 'text-emerald-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical': return 'fa-triangle-exclamation';
      case 'warning': return 'fa-circle-exclamation';
      default: return 'fa-circle-check';
    }
  };

  // Calculate net worth
  const portfolioValue = stats.portfolio.reduce((sum, c) => sum + (c.currentValuation * (c.ownershipPercentage / 100)), 0);
  const netWorth = stats.cash + portfolioValue + stats.totalRealizedGains - stats.loanBalance;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-800/80 p-4 border-b border-slate-700 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <i className="fas fa-chart-bar text-amber-500"></i>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Player Statistics</h2>
              <p className="text-xs text-slate-400">
                {isFirstTime ? "Here's what each stat means" : `Level ${stats.level} | Net Worth: $${(netWorth / 1000000).toFixed(2)}M`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-700/50 hover:bg-slate-700 flex items-center justify-center transition-colors"
          >
            <i className="fas fa-xmark text-slate-400"></i>
          </button>
        </div>

        {/* First Time Tutorial Message */}
        {isFirstTime && (
          <div className="p-4 bg-amber-950/30 border-b border-amber-800/30">
            <div className="flex items-start gap-3">
              <i className="fas fa-lightbulb text-amber-500 mt-1"></i>
              <div>
                <p className="text-amber-100 text-sm">
                  <strong>Welcome, rookie.</strong> These numbers are your lifeline.
                  Ignore them at your peril. Click any stat for details.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {STAT_EXPLANATIONS.map(stat => {
              const status = stat.getStatus(stats);
              const isFocused = focusStatId === stat.id;
              return (
                <div
                  key={stat.id}
                  id={`stat-${stat.id}`}
                  className={`p-4 rounded-lg border ${stat.bgColor} ${stat.borderColor} transition-all hover:scale-[1.02] ${
                    isFocused ? 'ring-2 ring-amber-500 shadow-lg shadow-amber-500/20' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <i className={`fas ${stat.icon} ${stat.color}`}></i>
                      <span className="font-bold text-white">{stat.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-mono font-bold ${stat.color}`}>
                        {stat.getValue(stats)}
                      </span>
                      <i className={`fas ${getStatusIcon(status)} ${getStatusColor(status)} text-xs`}></i>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">{stat.description}</p>
                  <p className="text-[10px] text-slate-500 italic">
                    <i className="fas fa-lightbulb text-amber-500/50 mr-1"></i>
                    {stat.tip}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Market Status */}
          <div className="mt-4 p-4 rounded-lg border border-slate-700 bg-slate-800/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <i className={`fas ${MARKET_VOLATILITY_STYLES[marketVolatility].icon} ${MARKET_VOLATILITY_STYLES[marketVolatility].color}`}></i>
                <span className="font-bold text-white">Market Conditions</span>
              </div>
              <span className={`text-sm font-bold uppercase tracking-wider ${MARKET_VOLATILITY_STYLES[marketVolatility].color}`}>
                {marketVolatility.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-slate-400">{MARKET_VOLATILITY_STYLES[marketVolatility].description}</p>
          </div>

          {/* Faction Reputation */}
          <div className="mt-4 p-4 rounded-lg border border-slate-700 bg-slate-800/30">
            <div className="flex items-center gap-2 mb-3">
              <i className="fas fa-users text-slate-400"></i>
              <span className="font-bold text-white">Faction Standing</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
              <div className="text-center p-2 rounded bg-blue-950/30 border border-blue-800/30">
                <div className="text-blue-400 font-bold">{stats.factionReputation.MANAGING_DIRECTORS}</div>
                <div className="text-slate-500">MDs</div>
              </div>
              <div className="text-center p-2 rounded bg-emerald-950/30 border border-emerald-800/30">
                <div className="text-emerald-400 font-bold">{stats.factionReputation.LIMITED_PARTNERS}</div>
                <div className="text-slate-500">LPs</div>
              </div>
              <div className="text-center p-2 rounded bg-amber-950/30 border border-amber-800/30">
                <div className="text-amber-400 font-bold">{stats.factionReputation.ANALYSTS}</div>
                <div className="text-slate-500">Analysts</div>
              </div>
              <div className="text-center p-2 rounded bg-red-950/30 border border-red-800/30">
                <div className="text-red-400 font-bold">{stats.factionReputation.REGULATORS}</div>
                <div className="text-slate-500">Regulators</div>
              </div>
              <div className="text-center p-2 rounded bg-pink-950/30 border border-pink-800/30">
                <div className="text-pink-400 font-bold">{stats.factionReputation.RIVALS}</div>
                <div className="text-slate-500">Rivals</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-800/50 border-t border-slate-700 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg transition-colors text-sm"
          >
            {isFirstTime ? 'Got It' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatsExplainerModal;
