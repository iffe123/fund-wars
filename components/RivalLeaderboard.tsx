import React, { useState } from 'react';
import { TerminalPanel } from './TerminalUI';
import type { RivalFund, PlayerStats, IndustrySector } from '../types';

interface RivalLeaderboardProps {
  rivalFunds: RivalFund[];
  playerStats: PlayerStats;
  className?: string;
}

interface LeaderboardEntry {
  id: string;
  name: string;
  aum: number;
  deals: number;
  reputation: number;
  isPlayer: boolean;
  strategy: string;
  winStreak: number;
  // Enhanced metrics
  portfolioCount: number;
  avgDealSize: number;
  recentActivity: string;
  sectorFocus: string;
  exitCount: number;
  returnMultiple: number;
}

const RivalLeaderboard: React.FC<RivalLeaderboardProps> = ({ rivalFunds, playerStats, className }) => {
  const [expandedFund, setExpandedFund] = useState<string | null>(null);

  const playerFundValue = playerStats.portfolio.reduce((sum, co) => sum + co.currentValuation * (co.ownershipPercentage / 100), 0);
  const playerTotalDeals = playerStats.portfolio.length;

  // Calculate player MOIC
  const calculateMOIC = (portfolio: typeof playerStats.portfolio): number => {
    const totalInvested = portfolio.reduce((sum, co) => sum + co.investmentCost, 0);
    const totalValue = portfolio.reduce((sum, co) => sum + co.currentValuation * (co.ownershipPercentage / 100), 0);
    return totalInvested > 0 ? totalValue / totalInvested : 1.0;
  };

  // Calculate average deal size
  const calculateAvgDealSize = (portfolio: typeof playerStats.portfolio): number => {
    if (portfolio.length === 0) return 0;
    return portfolio.reduce((sum, co) => sum + co.investmentCost, 0) / portfolio.length;
  };

  // Get sector focus from portfolio
  const getSectorFocus = (portfolio: typeof playerStats.portfolio): string => {
    if (portfolio.length === 0) return 'Generalist';
    const sectorCounts: Record<string, number> = {};
    portfolio.forEach(co => {
      const sector = co.sector || 'Other';
      sectorCounts[sector] = (sectorCounts[sector] || 0) + 1;
    });
    const topSector = Object.entries(sectorCounts).sort((a, b) => b[1] - a[1])[0];
    return topSector ? formatSector(topSector[0]) : 'Generalist';
  };

  // Format sector name for display
  const formatSector = (sector: string): string => {
    const sectorNames: Record<string, string> = {
      TECH: 'Tech',
      HEALTHCARE: 'Healthcare',
      INDUSTRIALS: 'Industrials',
      CONSUMER: 'Consumer',
      ENERGY: 'Energy',
      FINANCIAL_SERVICES: 'FinServ',
    };
    return sectorNames[sector] || sector;
  };

  // Calculate rival metrics
  const getRivalAvgDealSize = (rival: RivalFund): number => {
    if (rival.portfolio.length === 0) return rival.dryPowder / 5; // Estimate
    return rival.portfolio.reduce((sum, co) => sum + co.acquisitionPrice, 0) / rival.portfolio.length;
  };

  const getRivalSectorFocus = (rival: RivalFund): string => {
    if (rival.portfolio.length === 0) return 'Generalist';
    const dealTypes = rival.portfolio.map(p => p.dealType);
    // Infer sector from deal type patterns
    const hasLBO = dealTypes.filter(dt => dt === 'Leveraged Buyout').length;
    const hasGrowth = dealTypes.filter(dt => dt === 'Growth Equity').length;
    if (hasLBO > hasGrowth) return 'Value';
    if (hasGrowth > hasLBO) return 'Growth';
    return 'Generalist';
  };

  const getRivalMOIC = (rival: RivalFund): number => {
    const totalInvested = rival.portfolio.reduce((sum, co) => sum + co.acquisitionPrice, 0);
    const totalValue = rival.portfolio.reduce((sum, co) => sum + co.currentValue, 0);
    if (totalInvested === 0) return 1.0;
    return totalValue / totalInvested;
  };

  const getRecentActivity = (rival: RivalFund): string => {
    if (rival.portfolio.length === 0) return 'Watching';
    const recentDeals = rival.portfolio.filter(p => {
      const monthsAgo = (playerStats.gameYear - p.acquiredYear) * 12 + (playerStats.gameMonth - p.acquiredMonth);
      return monthsAgo < 6;
    });
    if (recentDeals.length > 0) return `${recentDeals.length} new`;
    return 'Holding';
  };

  const leaderboard: LeaderboardEntry[] = [
    {
      id: 'player',
      name: 'YOUR FUND',
      aum: playerStats.aum || playerFundValue,
      deals: playerTotalDeals,
      reputation: playerStats.reputation,
      isPlayer: true,
      strategy: 'ADAPTIVE',
      winStreak: 0,
      // Enhanced metrics
      portfolioCount: playerStats.portfolio.length,
      avgDealSize: calculateAvgDealSize(playerStats.portfolio),
      recentActivity: 'Active',
      sectorFocus: playerStats.primarySector ? formatSector(playerStats.primarySector) : getSectorFocus(playerStats.portfolio),
      exitCount: playerStats.completedExits?.length || 0,
      returnMultiple: calculateMOIC(playerStats.portfolio),
    },
    ...rivalFunds.map(f => ({
      id: f.id,
      name: f.name,
      aum: f.aum + f.portfolio.reduce((sum, co) => sum + co.currentValue, 0),
      deals: f.totalDeals,
      reputation: f.reputation,
      isPlayer: false,
      strategy: f.strategy,
      winStreak: f.winStreak,
      // Enhanced metrics
      portfolioCount: f.portfolio.length,
      avgDealSize: getRivalAvgDealSize(f),
      recentActivity: getRecentActivity(f),
      sectorFocus: getRivalSectorFocus(f),
      exitCount: Math.floor(f.totalDeals * 0.3), // Estimate 30% exit rate
      returnMultiple: getRivalMOIC(f),
    }))
  ].sort((a, b) => b.aum - a.aum);

  const playerRank = leaderboard.findIndex(f => f.isPlayer) + 1;

  const getStrategyIcon = (strategy: string) => {
    switch (strategy) {
      case 'PREDATORY': return { icon: 'fa-skull', color: 'text-red-400' };
      case 'AGGRESSIVE': return { icon: 'fa-bolt', color: 'text-amber-400' };
      case 'CONSERVATIVE': return { icon: 'fa-shield-halved', color: 'text-blue-400' };
      case 'OPPORTUNISTIC': return { icon: 'fa-crosshairs', color: 'text-purple-400' };
      case 'ADAPTIVE': return { icon: 'fa-brain', color: 'text-cyan-400' };
      default: return { icon: 'fa-chart-line', color: 'text-slate-400' };
    }
  };

  const formatAUM = (aum: number) => {
    if (aum >= 1000000000) return `$${(aum / 1000000000).toFixed(1)}B`;
    return `$${(aum / 1000000).toFixed(0)}M`;
  };

  const formatAvgDeal = (size: number) => {
    if (size >= 1000000) return `$${(size / 1000000).toFixed(0)}M`;
    if (size >= 1000) return `$${(size / 1000).toFixed(0)}K`;
    return `$${size.toFixed(0)}`;
  };

  return (
    <TerminalPanel title="FUND_RANKINGS" className={className}>
      <div className="p-2">
        <div className={`text-center p-3 mb-3 rounded border ${
          playerRank === 1 ? 'bg-amber-500/10 border-amber-500/50 text-amber-400' :
          playerRank <= 2 ? 'bg-green-500/10 border-green-500/50 text-green-400' :
          'bg-red-500/10 border-red-500/50 text-red-400'
        }`}>
          <div className="text-xs uppercase tracking-widest opacity-70 mb-1">YOUR RANKING</div>
          <div className="text-3xl font-bold font-mono">#{playerRank}</div>
          <div className="text-xs opacity-70">of {leaderboard.length} funds</div>
        </div>

        <div className="space-y-1">
          {leaderboard.map((fund, index) => {
            const strategyStyle = getStrategyIcon(fund.strategy);
            const isExpanded = expandedFund === fund.id;

            return (
              <div
                key={fund.id}
                className={`relative rounded transition-all ${
                  fund.isPlayer
                    ? 'bg-blue-500/20 border border-blue-500/50'
                    : 'bg-slate-800/50 hover:bg-slate-700/50'
                }`}
              >
                {/* Main row */}
                <div
                  className="flex items-center gap-2 p-2 text-xs cursor-pointer"
                  onClick={() => setExpandedFund(isExpanded ? null : fund.id)}
                >
                  <div className={`w-6 h-6 rounded flex items-center justify-center font-bold ${
                    index === 0 ? 'bg-amber-500 text-black' :
                    index === 1 ? 'bg-slate-400 text-black' :
                    index === 2 ? 'bg-amber-700 text-white' :
                    'bg-slate-700 text-slate-400'
                  }`}>
                    {index + 1}
                  </div>

                  <div className={`${strategyStyle.color}`} title={fund.strategy}>
                    <i className={`fas ${strategyStyle.icon}`}></i>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className={`font-bold truncate ${fund.isPlayer ? 'text-blue-400' : 'text-white'}`}>
                      {fund.name}
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-2">
                      <span>{fund.portfolioCount} co{fund.portfolioCount !== 1 ? 's' : ''}</span>
                      {!fund.isPlayer && fund.winStreak > 1 && (
                        <span className="text-amber-400">
                          <i className="fas fa-fire text-[8px]"></i> {fund.winStreak}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`font-mono font-bold ${fund.isPlayer ? 'text-blue-400' : 'text-green-400'}`}>
                      {formatAUM(fund.aum)}
                    </div>
                    <div className="text-[10px] text-slate-500">AUM</div>
                  </div>

                  <div className="w-16 hidden md:block">
                    <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          fund.reputation > 70 ? 'bg-green-500' :
                          fund.reputation > 40 ? 'bg-amber-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${fund.reputation}%` }}
                      ></div>
                    </div>
                    <div className="text-[9px] text-slate-600 text-center mt-0.5">REP</div>
                  </div>

                  <div className="text-slate-600">
                    <i className={`fas ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'} text-[10px]`}></i>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-2 pb-2 pt-1 border-t border-slate-700/50">
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <div className="text-slate-500 text-[10px]">Portfolio</div>
                        <div className="font-bold text-white">{fund.portfolioCount} companies</div>
                      </div>
                      <div>
                        <div className="text-slate-500 text-[10px]">Avg Deal</div>
                        <div className="font-bold text-white">{formatAvgDeal(fund.avgDealSize)}</div>
                      </div>
                      <div>
                        <div className="text-slate-500 text-[10px]">Exits</div>
                        <div className="font-bold text-white">{fund.exitCount}</div>
                      </div>
                      <div>
                        <div className="text-slate-500 text-[10px]">MOIC</div>
                        <div className={`font-bold ${fund.returnMultiple >= 2 ? 'text-green-400' : fund.returnMultiple >= 1 ? 'text-amber-400' : 'text-red-400'}`}>
                          {fund.returnMultiple.toFixed(1)}x
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500 text-[10px]">Focus</div>
                        <div className="font-bold text-white">{fund.sectorFocus}</div>
                      </div>
                      <div>
                        <div className="text-slate-500 text-[10px]">Activity</div>
                        <div className={`font-bold ${fund.recentActivity.includes('new') ? 'text-amber-400' : 'text-slate-400'}`}>
                          {fund.recentActivity}
                        </div>
                      </div>
                    </div>

                    {/* Strategy description */}
                    <div className="mt-2 text-[10px] text-slate-500 italic border-t border-slate-700/50 pt-2">
                      {fund.strategy === 'PREDATORY' && 'Hostile takeovers, distressed assets, undercuts competitors.'}
                      {fund.strategy === 'AGGRESSIVE' && 'Quick closes, premium bids, market share focused.'}
                      {fund.strategy === 'CONSERVATIVE' && 'Value investing, careful due diligence, patient capital.'}
                      {fund.strategy === 'OPPORTUNISTIC' && 'Flexible strategy, exploits market dislocations.'}
                      {fund.strategy === 'ADAPTIVE' && 'Your fund adapts to market conditions.'}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-3 pt-3 border-t border-slate-700 flex flex-wrap gap-3 text-[10px] text-slate-500 justify-center">
          <span className="flex items-center gap-1">
            <i className="fas fa-skull text-red-400"></i> Predatory
          </span>
          <span className="flex items-center gap-1">
            <i className="fas fa-bolt text-amber-400"></i> Aggressive
          </span>
          <span className="flex items-center gap-1">
            <i className="fas fa-shield-halved text-blue-400"></i> Conservative
          </span>
          <span className="flex items-center gap-1">
            <i className="fas fa-crosshairs text-purple-400"></i> Opportunistic
          </span>
        </div>
      </div>
    </TerminalPanel>
  );
};

export default RivalLeaderboard;
