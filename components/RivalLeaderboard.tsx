import React from 'react';
import { TerminalPanel } from './TerminalUI';
import type { RivalFund, PlayerStats } from '../types';

interface RivalLeaderboardProps {
  rivalFunds: RivalFund[];
  playerStats: PlayerStats;
  className?: string;
}

const RivalLeaderboard: React.FC<RivalLeaderboardProps> = ({ rivalFunds, playerStats, className }) => {
  
  const playerFundValue = playerStats.portfolio.reduce((sum, co) => sum + co.currentValuation * (co.ownershipPercentage / 100), 0);
  const playerTotalDeals = playerStats.portfolio.length;
  
  const leaderboard = [
    {
      id: 'player',
      name: 'YOUR FUND',
      aum: playerStats.aum || playerFundValue,
      deals: playerTotalDeals,
      reputation: playerStats.reputation,
      isPlayer: true,
      strategy: 'ADAPTIVE',
      winStreak: 0
    },
    ...rivalFunds.map(f => ({
      id: f.id,
      name: f.name,
      aum: f.aum + f.portfolio.reduce((sum, co) => sum + co.currentValue, 0),
      deals: f.totalDeals,
      reputation: f.reputation,
      isPlayer: false,
      strategy: f.strategy,
      winStreak: f.winStreak
    }))
  ].sort((a, b) => b.aum - a.aum);

  const playerRank = leaderboard.findIndex(f => f.isPlayer) + 1;

  const getStrategyIcon = (strategy: string) => {
    switch (strategy) {
      case 'PREDATORY': return '🦈';
      case 'AGGRESSIVE': return '⚡';
      case 'CONSERVATIVE': return '🛡️';
      case 'OPPORTUNISTIC': return '🎯';
      case 'ADAPTIVE': return '🧠';
      default: return '📊';
    }
  };

  const formatAUM = (aum: number) => {
    if (aum >= 1000000000) return `$${(aum / 1000000000).toFixed(1)}B`;
    return `$${(aum / 1000000).toFixed(0)}M`;
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
          {leaderboard.map((fund, index) => (
            <div
              key={fund.id}
              className={`flex items-center gap-2 p-2 rounded text-xs ${
                fund.isPlayer 
                  ? 'bg-blue-500/20 border border-blue-500/50' 
                  : 'bg-slate-800/50 hover:bg-slate-700/50'
              } transition-colors`}
            >
              <div className={`w-6 h-6 rounded flex items-center justify-center font-bold ${
                index === 0 ? 'bg-amber-500 text-black' :
                index === 1 ? 'bg-slate-400 text-black' :
                index === 2 ? 'bg-amber-700 text-white' :
                'bg-slate-700 text-slate-400'
              }`}>
                {index + 1}
              </div>

              <div className="text-base" title={fund.strategy}>
                {getStrategyIcon(fund.strategy)}
              </div>

              <div className="flex-1 min-w-0">
                <div className={`font-bold truncate ${fund.isPlayer ? 'text-blue-400' : 'text-white'}`}>
                  {fund.name}
                </div>
                <div className="text-[10px] text-slate-500">
                  {fund.deals} deal{fund.deals !== 1 ? 's' : ''}
                  {!fund.isPlayer && fund.winStreak && fund.winStreak > 1 && (
                    <span className="text-amber-400 ml-2">🔥 {fund.winStreak} streak</span>
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
            </div>
          ))}
        </div>

        <div className="mt-3 pt-3 border-t border-slate-700 flex flex-wrap gap-3 text-[10px] text-slate-500 justify-center">
          <span>🦈 Predatory</span>
          <span>⚡ Aggressive</span>
          <span>🛡️ Conservative</span>
          <span>🎯 Opportunistic</span>
        </div>
      </div>
    </TerminalPanel>
  );
};

export default RivalLeaderboard;