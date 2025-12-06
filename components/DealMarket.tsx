
import React, { useState } from 'react';
import { TerminalPanel, TerminalButton } from './TerminalUI';
import type { CompetitiveDeal, RivalFund, PlayerStats } from '../types';
import { DealType } from '../types';
import { RIVAL_FUNDS } from '../constants';
import { MAX_PORTFOLIO_SIZE } from '../context/GameContext';

interface DealMarketProps {
  deals: CompetitiveDeal[];
  playerStats: PlayerStats;
  onSelectDeal: (deal: CompetitiveDeal) => void;
  onDismissDeal: (dealId: number) => void;
}

const DealMarket: React.FC<DealMarketProps> = ({ deals, playerStats, onSelectDeal, onDismissDeal }) => {
  const [expandedDealId, setExpandedDealId] = useState<number | null>(null);

  const getDealTypeColor = (type: DealType) => {
    switch (type) {
      case DealType.LBO: return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case DealType.GROWTH_EQUITY: return 'text-green-400 bg-green-500/10 border-green-500/30';
      case DealType.VENTURE_CAPITAL: return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      default: return 'text-slate-400';
    }
  };

  const getCompetitionLevel = (rivals: string[]) => {
    if (rivals.length >= 3) return { text: 'FIERCE', color: 'text-red-500', icon: '🔥' };
    if (rivals.length === 2) return { text: 'MODERATE', color: 'text-amber-500', icon: '⚔️' };
    if (rivals.length === 1) return { text: 'LOW', color: 'text-green-500', icon: '✓' };
    return { text: 'NONE', color: 'text-slate-500', icon: '😴' };
  };

  const getRivalNames = (rivalIds: string[]) => {
    return rivalIds.map(id => {
      const fund = RIVAL_FUNDS.find(f => f.id === id);
      return fund ? fund.name : id;
    });
  };

  const canAfford = (deal: CompetitiveDeal) => playerStats.cash >= deal.askingPrice * 0.8;
  const isPortfolioFull = playerStats.portfolio.length >= MAX_PORTFOLIO_SIZE;

  if (deals.length === 0) {
    return (
      <TerminalPanel title="DEAL_FLOW" className="h-full">
        <div className="flex flex-col items-center justify-center h-full text-slate-500 p-8">
          <i className="fas fa-inbox text-4xl mb-4"></i>
          <div className="text-center">
            <div className="font-bold mb-2">NO ACTIVE DEALS</div>
            <div className="text-xs">The market is quiet. Advance time to see new opportunities.</div>
          </div>
        </div>
      </TerminalPanel>
    );
  }

  return (
    <TerminalPanel title="DEAL_FLOW // COMPETITIVE MARKET" className="h-full overflow-hidden flex flex-col">
      <div className="p-2 bg-slate-800/50 border-b border-slate-700 flex items-center justify-between flex-wrap gap-2">
        <span className="text-xs text-slate-400">
          <i className="fas fa-chart-line mr-2"></i>
          {deals.length} ACTIVE OPPORTUNITIES
        </span>
        <div className="flex items-center gap-3">
          <span className={`text-xs ${isPortfolioFull ? 'text-red-400' : 'text-slate-400'}`}>
            <i className="fas fa-briefcase mr-1"></i>
            PORTFOLIO: {playerStats.portfolio.length}/{MAX_PORTFOLIO_SIZE}
          </span>
          <span className="text-xs text-amber-400">
            <i className="fas fa-coins mr-1"></i>
            CASH: ${(playerStats.cash / 1000000).toFixed(1)}M
          </span>
        </div>
      </div>

      {isPortfolioFull && (
        <div className="p-2 bg-red-500/10 border-b border-red-500/30 text-xs text-red-400 text-center">
          <i className="fas fa-exclamation-triangle mr-2"></i>
          PORTFOLIO AT MAX CAPACITY - Exit a company before acquiring more
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {deals.map(deal => {
          const competition = getCompetitionLevel(deal.interestedRivals);
          const isExpanded = expandedDealId === deal.id;
          const affordable = canAfford(deal);
          const rivalNames = getRivalNames(deal.interestedRivals);
          const multiple = deal.askingPrice / deal.metrics.ebitda;

          return (
            <div
              key={deal.id}
              className={`border rounded-lg transition-all ${
                deal.isHot 
                  ? 'border-red-500/50 bg-red-500/5' 
                  : 'border-slate-700 bg-slate-800/50'
              } ${!affordable ? 'opacity-60' : ''}`}
            >
              <div 
                className="p-3 cursor-pointer hover:bg-slate-700/30 transition-colors"
                onClick={() => setExpandedDealId(isExpanded ? null : deal.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {deal.isHot && (
                        <span className="text-red-500 text-xs animate-pulse">
                          <i className="fas fa-fire"></i> HOT
                        </span>
                      )}
                      <span className="font-bold text-white truncate">{deal.companyName}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded border ${getDealTypeColor(deal.dealType)}`}>
                        {deal.dealType === DealType.LBO ? 'LBO' : deal.dealType === DealType.GROWTH_EQUITY ? 'GROWTH' : 'VC'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mb-2">{deal.sector}</div>
                    
                    <div className="flex flex-wrap gap-3 text-xs">
                      <div>
                        <span className="text-slate-400">ASK:</span>
                        <span className="text-white ml-1 font-mono font-bold">${(deal.askingPrice / 1000000).toFixed(0)}M</span>
                      </div>
                      <div>
                        <span className="text-slate-400">EBITDA:</span>
                        <span className="text-emerald-400 ml-1 font-mono font-bold">${(deal.metrics.ebitda / 1000000).toFixed(1)}M</span>
                      </div>
                      <div>
                        <span className="text-slate-400">MULT:</span>
                        <span className={`ml-1 font-mono font-bold ${multiple > 12 ? 'text-red-400' : multiple > 8 ? 'text-amber-400' : 'text-green-400'}`}>
                          {multiple.toFixed(1)}x
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">GROWTH:</span>
                        <span className={`ml-1 font-mono font-bold ${deal.metrics.growth > 0.2 ? 'text-green-400' : deal.metrics.growth < 0 ? 'text-red-400' : 'text-slate-300'}`}>
                          {deal.metrics.growth > 0 ? '+' : ''}{(deal.metrics.growth * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`text-xs font-bold ${competition.color}`}>
                      {competition.icon} {competition.text}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      {deal.interestedRivals.length} BIDDER{deal.interestedRivals.length !== 1 ? 'S' : ''}
                    </div>
                    <div className={`text-[10px] mt-1 ${deal.deadline <= 2 ? 'text-red-400 font-bold' : 'text-slate-300'}`}>
                      ⏱️ {deal.deadline} WEEKS
                    </div>
                  </div>
                </div>

                <div className="text-center mt-2">
                  <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} text-slate-400 text-xs`}></i>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-slate-700 p-3 space-y-3 bg-slate-900/50">
                  <p className="text-sm text-slate-200 leading-relaxed">{deal.description}</p>

                  <div className="text-xs">
                    <span className="text-slate-400 font-bold">SELLER:</span>
                    <span className="text-slate-200 ml-2">{deal.seller}</span>
                  </div>

                  {rivalNames.length > 0 && (
                    <div>
                      <div className="text-xs text-slate-400 font-bold mb-1">COMPETING FUNDS:</div>
                      <div className="flex flex-wrap gap-1">
                        {rivalNames.map((name, i) => {
                          const fund = RIVAL_FUNDS.find(f => f.name === name);
                          return (
                            <span 
                              key={i}
                              className={`text-[10px] px-2 py-0.5 rounded border ${
                                fund?.npcId === 'hunter' 
                                  ? 'border-red-500/50 text-red-400 bg-red-500/10' 
                                  : 'border-slate-600 text-slate-400 bg-slate-700/50'
                              }`}
                            >
                              {name}
                              {fund?.strategy && <span className="opacity-50 ml-1">({fund.strategy})</span>}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <TerminalButton
                      variant="success"
                      label={isPortfolioFull ? "PORTFOLIO FULL" : (affordable ? "ENTER AUCTION" : "INSUFFICIENT FUNDS")}
                      className="flex-1"
                      onClick={() => affordable && !isPortfolioFull && onSelectDeal(deal)}
                      disabled={!affordable || isPortfolioFull}
                    />
                    <TerminalButton
                      variant="danger"
                      label="DISMISS"
                      onClick={() => onDismissDeal(deal.id)}
                    />
                  </div>

                  {!affordable && !isPortfolioFull && (
                    <div className="text-xs text-red-400 text-center">
                      You need at least ${((deal.askingPrice * 0.8) / 1000000).toFixed(1)}M to enter this auction
                    </div>
                  )}
                  {isPortfolioFull && (
                    <div className="text-xs text-red-400 text-center">
                      Exit a portfolio company before acquiring new ones
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </TerminalPanel>
  );
};

export default DealMarket;
