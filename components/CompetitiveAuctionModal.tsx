
import React, { useState, useEffect, useCallback } from 'react';
import { TerminalButton, TerminalPanel } from './TerminalUI';
import { useHaptic } from '../hooks/useHaptic';
import type { CompetitiveDeal, RivalFund, StatChanges, PortfolioCompany } from '../types';
import { DealType } from '../types';
import { RIVAL_FUNDS, RIVAL_BID_STRATEGIES, HUNTER_WIN_TAUNTS, HUNTER_LOSS_REACTIONS } from '../constants';

interface CompetitiveAuctionModalProps {
  deal: CompetitiveDeal;
  playerCash: number;
  playerReputation: number;
  onComplete: (result: AuctionResult) => void;
  onClose: () => void;
}

export interface AuctionResult {
  won: boolean;
  deal: CompetitiveDeal;
  finalPrice: number;
  winnerId: string;
  winnerName: string;
  playerBidHistory: number[];
  rivalTaunt?: string;
  statChanges: StatChanges;
  portfolioCompany?: Omit<PortfolioCompany, 'acquisitionDate' | 'eventHistory'>;
}

interface RivalBidder {
  fund: RivalFund;
  isActive: boolean;
  lastBid: number;
  maxWillingness: number;
  isBluffing: boolean;
  hasDropped: boolean;
}

const CompetitiveAuctionModal: React.FC<CompetitiveAuctionModalProps> = ({
  deal,
  playerCash,
  playerReputation,
  onComplete,
  onClose
}) => {
  const { triggerImpact } = useHaptic();
  
  const [currentBid, setCurrentBid] = useState(deal.askingPrice);
  const [currentLeader, setCurrentLeader] = useState<string>('none');
  const [round, setRound] = useState(0);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [playerHasBid, setPlayerHasBid] = useState(false);
  const [timer, setTimer] = useState(100);
  const [isComplete, setIsComplete] = useState(false);
  const [showDueDiligence, setShowDueDiligence] = useState(false);
  const [ddRevealed, setDdRevealed] = useState(false);
  
  const [bidLog, setBidLog] = useState<string[]>([
    `> AUCTION_INIT: ${deal.companyName}`,
    `> SECTOR: ${deal.sector}`,
    `> ASKING_PRICE: $${(deal.askingPrice / 1000000).toFixed(1)}M`,
    `> EBITDA: $${(deal.metrics.ebitda / 1000000).toFixed(1)}M (${(deal.askingPrice / deal.metrics.ebitda).toFixed(1)}x)`,
    `> ---`
  ]);
  const [playerBids, setPlayerBids] = useState<number[]>([]);
  
  const [rivals, setRivals] = useState<RivalBidder[]>(() => {
    return deal.interestedRivals.map(rivalId => {
      const fund = RIVAL_FUNDS.find(f => f.id === rivalId)!;
      const strategy = RIVAL_BID_STRATEGIES[fund.strategy];
      const baseMax = deal.fairValue * strategy.baseMultiplier;
      const maxWillingness = baseMax * (1 + strategy.maxOverbid * Math.random());
      const isBluffing = Math.random() < strategy.bluffChance;
      
      return {
        fund,
        isActive: true,
        lastBid: 0,
        maxWillingness: isBluffing ? deal.fairValue * 0.9 : maxWillingness,
        isBluffing,
        hasDropped: false
      };
    });
  });

  const bidIncrement = Math.max(deal.askingPrice * 0.05, 1000000);
  const impliedMultiple = currentBid / deal.metrics.ebitda;

  const processRivalBids = useCallback(() => {
    if (isComplete) return;
    
    let newBid = currentBid;
    let newLeader = currentLeader;
    const newLog: string[] = [];
    
    const shuffledRivals = [...rivals].sort(() => Math.random() - 0.5);
    
    setRivals(prev => {
      const updated = [...prev];
      
      for (const rival of shuffledRivals) {
        const idx = updated.findIndex(r => r.fund.id === rival.fund.id);
        if (idx === -1) continue; // Bug fix: Skip if rival not found to prevent array[-1] access
        if (updated[idx].hasDropped || !updated[idx].isActive) continue;
        
        const fund = rival.fund;
        const strategy = RIVAL_BID_STRATEGIES[fund.strategy];
        const potentialBid = newBid + bidIncrement * (0.8 + Math.random() * 0.4);
        const aggressionBonus = fund.aggressionLevel / 100 * bidIncrement * 0.5;
        const rivalBid = potentialBid + (fund.strategy === 'PREDATORY' ? aggressionBonus : 0);
        
        if (rivalBid > updated[idx].maxWillingness) {
          updated[idx].hasDropped = true;
          updated[idx].isActive = false;
          newLog.push(`> ${fund.name.toUpperCase()} WITHDRAWS (${fund.strategy})`);
          triggerImpact('LIGHT');
        } else {
          updated[idx].lastBid = rivalBid;
          newBid = rivalBid;
          newLeader = fund.id;
          newLog.push(`> ${fund.name.toUpperCase()} BIDS $${(rivalBid / 1000000).toFixed(1)}M`);
          triggerImpact('MEDIUM');
        }
      }
      
      return updated;
    });
    
    setCurrentBid(newBid);
    setCurrentLeader(newLeader);
    setBidLog(prev => [...prev, ...newLog]);
    
    const activeRivals = rivals.filter(r => !r.hasDropped && r.isActive);
    if (activeRivals.length === 0 && playerHasBid) {
      handlePlayerWin(newBid);
    } else {
      setIsPlayerTurn(true);
      setRound(prev => prev + 1);
    }
  }, [rivals, currentBid, currentLeader, isComplete, playerHasBid, bidIncrement]);

  useEffect(() => {
    if (!isPlayerTurn || isComplete || showDueDiligence) return;
    
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 0) {
          clearInterval(interval);
          if (!playerHasBid) {
            handlePlayerPass();
          } else {
            setIsPlayerTurn(false);
            setTimeout(processRivalBids, 1000);
          }
          return 0;
        }
        return prev - 2;
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, [isPlayerTurn, isComplete, playerHasBid, showDueDiligence, processRivalBids]);

  useEffect(() => {
    if (!isPlayerTurn && !isComplete) {
      const timeout = setTimeout(() => {
        processRivalBids();
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [isPlayerTurn, isComplete, processRivalBids]);

  const handlePlayerBid = (multiplier: number = 1) => {
    const bidAmount = currentBid + (bidIncrement * multiplier);
    
    if (bidAmount > playerCash) {
      setBidLog(prev => [...prev, `> ERROR: INSUFFICIENT_FUNDS`]);
      triggerImpact('HEAVY');
      return;
    }
    
    setCurrentBid(bidAmount);
    setCurrentLeader('player');
    setPlayerHasBid(true);
    setPlayerBids(prev => [...prev, bidAmount]);
    setBidLog(prev => [...prev, `> YOU BID $${(bidAmount / 1000000).toFixed(1)}M`]);
    triggerImpact('MEDIUM');
    setTimer(100);
    setIsPlayerTurn(false);
  };

  const handlePlayerPass = () => {
    setBidLog(prev => [...prev, `> YOU PASS`]);
    
    if (!playerHasBid) {
      const activeRivals = rivals.filter(r => !r.hasDropped);
      if (activeRivals.length > 0) {
        const winner = activeRivals.reduce((a, b) => a.lastBid > b.lastBid ? a : b);
        handleRivalWin(winner.fund, winner.lastBid);
      } else {
        handleDealCollapse();
      }
    } else {
      setIsPlayerTurn(false);
      setTimeout(processRivalBids, 1000);
    }
  };

  const handlePlayerWin = (finalPrice: number) => {
    setIsComplete(true);
    triggerImpact('HEAVY');
    setBidLog(prev => [...prev, `> ---`, `> AUCTION_COMPLETE`, `> WINNER: YOU`, `> FINAL_PRICE: $${(finalPrice / 1000000).toFixed(1)}M`]);
    
    const hunterLost = rivals.some(r => r.fund.npcId === 'hunter' && r.hasDropped);
    
    const result: AuctionResult = {
      won: true,
      deal,
      finalPrice,
      winnerId: 'player',
      winnerName: 'You',
      playerBidHistory: playerBids,
      rivalTaunt: hunterLost ? HUNTER_LOSS_REACTIONS[Math.floor(Math.random() * HUNTER_LOSS_REACTIONS.length)] : undefined,
      statChanges: {
        cash: -finalPrice,
        reputation: finalPrice <= deal.fairValue ? 15 : (finalPrice <= deal.fairValue * 1.1 ? 5 : -5),
        score: 500 + (deal.isHot ? 200 : 0),
        stress: 10
      },
      portfolioCompany: {
        id: deal.id,
        name: deal.companyName,
        ceo: "TBD",
        investmentCost: finalPrice,
        ownershipPercentage: deal.dealType === DealType.LBO ? 100 : (deal.dealType === DealType.GROWTH_EQUITY ? 35 : 15),
        currentValuation: deal.fairValue,
        latestCeoReport: "Integration in progress...",
        nextBoardMeeting: "TBD",
        dealType: deal.dealType,
        revenue: deal.metrics.revenue,
        ebitda: deal.metrics.ebitda,
        debt: deal.metrics.debt,
        revenueGrowth: deal.metrics.growth
      }
    };
    
    setTimeout(() => onComplete(result), 2000);
  };

  const handleRivalWin = (winner: RivalFund, finalPrice: number) => {
    setIsComplete(true);
    triggerImpact('HEAVY');
    setBidLog(prev => [...prev, `> ---`, `> AUCTION_COMPLETE`, `> WINNER: ${winner.name.toUpperCase()}`, `> FINAL_PRICE: $${(finalPrice / 1000000).toFixed(1)}M`]);
    
    const isHunter = winner.npcId === 'hunter';
    
    const result: AuctionResult = {
      won: false,
      deal,
      finalPrice,
      winnerId: winner.id,
      winnerName: winner.name,
      playerBidHistory: playerBids,
      rivalTaunt: isHunter ? HUNTER_WIN_TAUNTS[Math.floor(Math.random() * HUNTER_WIN_TAUNTS.length)] : undefined,
      statChanges: {
        reputation: playerHasBid ? -5 : -2,
        stress: isHunter ? 15 : 5,
        score: playerHasBid ? -100 : 0,
        npcRelationshipUpdate: isHunter ? {
          npcId: 'hunter',
          change: -10,
          memory: `Beat you in the ${deal.companyName} auction`
        } : undefined
      }
    };
    
    setTimeout(() => onComplete(result), 2000);
  };

  const handleDealCollapse = () => {
    setIsComplete(true);
    setBidLog(prev => [...prev, `> ---`, `> AUCTION_FAILED`, `> NO ACCEPTABLE BIDS`]);
    
    const result: AuctionResult = {
      won: false,
      deal,
      finalPrice: 0,
      winnerId: 'none',
      winnerName: 'No one',
      playerBidHistory: playerBids,
      statChanges: { score: 50 }
    };
    
    setTimeout(() => onComplete(result), 2000);
  };

  const handleDueDiligence = () => {
    setShowDueDiligence(true);
    setDdRevealed(true);
    setBidLog(prev => [...prev, `> DUE_DILIGENCE_INITIATED...`, `> RISK: ${deal.hiddenRisk}`, `> UPSIDE: ${deal.hiddenUpside}`]);
    triggerImpact('MEDIUM');
    setTimeout(() => setShowDueDiligence(false), 3000);
  };

  const activeRivalCount = rivals.filter(r => !r.hasDropped).length;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 backdrop-blur-sm p-2 md:p-4">
      <div className="w-full max-w-2xl border-2 border-red-500 bg-slate-900 shadow-[0_0_50px_rgba(239,68,68,0.4)] max-h-[95vh] overflow-y-auto">
        
        <div className="bg-red-500 text-black px-3 py-2 font-bold flex justify-between items-center sticky top-0 z-10">
          <span className="flex items-center">
            <i className="fas fa-gavel mr-2 animate-pulse"></i>
            COMPETITIVE AUCTION
          </span>
          <span className="text-sm">{deal.companyName}</span>
        </div>
        
        <div className="p-4 md:p-6 space-y-4">
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div className="bg-slate-800 p-2 rounded">
              <div className="text-slate-500">SECTOR</div>
              <div className="text-white font-mono">{deal.sector}</div>
            </div>
            <div className="bg-slate-800 p-2 rounded">
              <div className="text-slate-500">DEAL TYPE</div>
              <div className="text-amber-500 font-mono">{deal.dealType}</div>
            </div>
            <div className="bg-slate-800 p-2 rounded">
              <div className="text-slate-500">EBITDA MULTIPLE</div>
              <div className={`font-mono font-bold ${impliedMultiple > 12 ? 'text-red-500' : impliedMultiple > 8 ? 'text-amber-500' : 'text-green-500'}`}>
                {impliedMultiple.toFixed(1)}x
              </div>
            </div>
            <div className="bg-slate-800 p-2 rounded">
              <div className="text-slate-500">COMPETITORS</div>
              <div className={`font-mono font-bold ${activeRivalCount > 1 ? 'text-red-500' : 'text-green-500'}`}>
                {activeRivalCount} ACTIVE
              </div>
            </div>
          </div>

          {!ddRevealed && !isComplete && (
            <button
              onClick={handleDueDiligence}
              className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 py-2 text-xs font-mono transition-colors"
            >
              <i className="fas fa-search mr-2"></i>
              RUN DUE DILIGENCE (Reveal Hidden Info)
            </button>
          )}

          {ddRevealed && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-red-900/30 border border-red-500/50 p-2 rounded">
                <div className="text-red-400 font-bold mb-1"><i className="fas fa-exclamation-triangle mr-1"></i>RISK</div>
                <div className="text-red-200">{deal.hiddenRisk}</div>
              </div>
              <div className="bg-green-900/30 border border-green-500/50 p-2 rounded">
                <div className="text-green-400 font-bold mb-1"><i className="fas fa-arrow-trend-up mr-1"></i>UPSIDE</div>
                <div className="text-green-200">{deal.hiddenUpside}</div>
              </div>
            </div>
          )}

          <div className="text-center py-4 bg-black rounded-lg border border-slate-800">
            <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Current Bid</div>
            <div className="text-4xl md:text-5xl font-mono text-white font-bold tracking-tighter">
              ${(currentBid / 1000000).toFixed(1)}M
            </div>
            <div className={`text-sm mt-2 font-bold ${currentLeader === 'player' ? 'text-green-500' : currentLeader === 'none' ? 'text-slate-500' : 'text-red-500'}`}>
              {currentLeader === 'player' ? '✓ YOU ARE LEADING' : currentLeader === 'none' ? 'NO BIDS YET' : `${rivals.find(r => r.fund.id === currentLeader)?.fund.name.toUpperCase()} LEADING`}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {rivals.map(rival => (
              <div 
                key={rival.fund.id}
                className={`px-3 py-1 rounded text-xs font-mono border ${
                  rival.hasDropped 
                    ? 'border-slate-700 text-slate-600 line-through' 
                    : rival.fund.id === currentLeader 
                      ? 'border-red-500 text-red-400 bg-red-500/10' 
                      : 'border-slate-600 text-slate-400'
                }`}
              >
                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${rival.hasDropped ? 'bg-slate-600' : 'bg-green-500 animate-pulse'}`}></span>
                {rival.fund.name}
                <span className="ml-2 opacity-50">({rival.fund.strategy})</span>
              </div>
            ))}
          </div>

          {isPlayerTurn && !isComplete && !showDueDiligence && (
            <div className="space-y-3">
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-100 ease-linear ${timer > 30 ? 'bg-green-500' : timer > 10 ? 'bg-amber-500' : 'bg-red-500'}`} 
                  style={{ width: `${timer}%` }}
                ></div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <TerminalButton
                  variant="success"
                  label={`+$${(bidIncrement / 1000000).toFixed(1)}M`}
                  className="text-sm"
                  onClick={() => handlePlayerBid(1)}
                  disabled={currentBid + bidIncrement > playerCash}
                />
                <TerminalButton
                  variant="warning"
                  label={`+$${(bidIncrement * 2 / 1000000).toFixed(1)}M`}
                  className="text-sm"
                  onClick={() => handlePlayerBid(2)}
                  disabled={currentBid + bidIncrement * 2 > playerCash}
                />
                <TerminalButton
                  variant="danger"
                  label={`+$${(bidIncrement * 3 / 1000000).toFixed(1)}M`}
                  className="text-sm"
                  onClick={() => handlePlayerBid(3)}
                  disabled={currentBid + bidIncrement * 3 > playerCash}
                />
                <TerminalButton
                  label="PASS"
                  className="text-sm"
                  onClick={handlePlayerPass}
                />
              </div>
              
              <div className="text-center text-xs text-slate-500">
                Your Cash: <span className="text-green-400">${(playerCash / 1000000).toFixed(1)}M</span>
                {currentBid + bidIncrement > playerCash && (
                  <span className="text-red-400 ml-4">INSUFFICIENT FUNDS FOR MIN BID</span>
                )}
              </div>
            </div>
          )}

          {!isPlayerTurn && !isComplete && (
            <div className="text-center py-4">
              <div className="text-amber-500 animate-pulse font-mono">
                <i className="fas fa-spinner fa-spin mr-2"></i>
                RIVALS ARE DELIBERATING...
              </div>
            </div>
          )}

          {isComplete && (
            <div className="text-center py-4">
              <div className={`text-2xl font-bold ${currentLeader === 'player' ? 'text-green-500' : 'text-red-500'}`}>
                {currentLeader === 'player' ? '🎉 YOU WON THE AUCTION' : '💀 YOU LOST THE AUCTION'}
              </div>
            </div>
          )}

          <div className="bg-black border border-slate-800 rounded h-32 md:h-40 overflow-y-auto font-mono text-xs p-2 text-slate-400">
            {bidLog.map((line, i) => (
              <div 
                key={i} 
                className={`${
                  line.includes('YOU BID') ? 'text-green-400' :
                  line.includes('WITHDRAWS') ? 'text-slate-600' :
                  line.includes('WINNER: YOU') ? 'text-green-500 font-bold' :
                  line.includes('WINNER:') ? 'text-red-500 font-bold' :
                  line.includes('BIDS') ? 'text-amber-400' :
                  line.includes('RISK:') ? 'text-red-400' :
                  line.includes('UPSIDE:') ? 'text-green-400' :
                  i === bidLog.length - 1 ? 'text-white' : ''
                }`}
              >
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitiveAuctionModal;
