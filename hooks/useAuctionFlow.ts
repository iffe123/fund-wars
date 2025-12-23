import { useState, useCallback } from 'react';
import type { CompetitiveDeal, PlayerStats, RivalFund, ChatMessage } from '../types';
import { AuctionResult } from '../components/CompetitiveAuctionModal';

interface AuctionFlowDependencies {
  playerStats: PlayerStats | null;
  rivalFunds: RivalFund[];
  playSfx: (sfx: string) => void;
  addLogEntry: (entry: string) => void;
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
  removeDeal: (dealId: number) => void;
  updatePlayerStats: (changes: any) => void;
  updateRivalFund: (id: string, changes: Partial<RivalFund>) => void;
  appendChatMessage: (message: ChatMessage) => void;
}

interface UseAuctionFlowReturn {
  currentAuction: CompetitiveDeal | null;
  lastAuctionResult: AuctionResult | null;
  handleStartAuction: (deal: CompetitiveDeal) => void;
  handleAuctionComplete: (result: AuctionResult) => void;
  handleDismissDeal: (dealId: number) => void;
  closeAuction: () => void;
}

export const useAuctionFlow = (deps: AuctionFlowDependencies): UseAuctionFlowReturn => {
  const {
    playerStats,
    rivalFunds,
    playSfx,
    addLogEntry,
    addToast,
    removeDeal,
    updatePlayerStats,
    updateRivalFund,
    appendChatMessage,
  } = deps;

  const [currentAuction, setCurrentAuction] = useState<CompetitiveDeal | null>(null);
  const [lastAuctionResult, setLastAuctionResult] = useState<AuctionResult | null>(null);

  const handleStartAuction = useCallback((deal: CompetitiveDeal) => {
    setCurrentAuction(deal);
    playSfx('NOTIFICATION');
    addLogEntry(`AUCTION ENTERED: ${deal.companyName}`);
    appendChatMessage({
      sender: 'system',
      text: `[SYSTEM_LOG] You entered the auction for ${deal.companyName}. Competitors: ${deal.interestedRivals.length}`,
    });
  }, [playSfx, addLogEntry, appendChatMessage]);

  const handleAuctionComplete = useCallback((result: AuctionResult) => {
    setCurrentAuction(null);
    setLastAuctionResult(result);
    removeDeal(result.deal.id);

    updatePlayerStats(result.statChanges);

    if (result.won && result.portfolioCompany) {
      updatePlayerStats({ addPortfolioCompany: result.portfolioCompany });
    }

    if (!result.won && result.winnerId !== 'none' && result.winnerId !== 'player') {
      const winningFund = rivalFunds.find(f => f.id === result.winnerId);
      if (winningFund) {
        updateRivalFund(result.winnerId, {
          totalDeals: winningFund.totalDeals + 1,
          winStreak: winningFund.winStreak + 1,
          dryPowder: winningFund.dryPowder - result.finalPrice,
          portfolio: [
            ...winningFund.portfolio,
            {
              name: result.deal.companyName,
              dealType: result.deal.dealType,
              acquisitionPrice: result.finalPrice,
              currentValue: result.deal.fairValue,
              acquiredMonth: playerStats?.gameMonth || 1,
              acquiredYear: playerStats?.gameYear || 1,
            },
          ],
        });
      }
    }

    addLogEntry(
      result.won
        ? `AUCTION WON: ${result.deal.companyName} for $${(result.finalPrice / 1000000).toFixed(1)}M`
        : `AUCTION LOST: ${result.deal.companyName} to ${result.winnerName}`
    );

    if (result.rivalTaunt) {
      appendChatMessage({
        sender: 'npc',
        senderName: 'Hunter',
        text: result.rivalTaunt,
      });
      playSfx('NOTIFICATION');
    }

    if (result.won) {
      addToast(`DEAL CLOSED: ${result.deal.companyName}`, 'success');
      playSfx('SUCCESS');
    } else {
      addToast(`DEAL LOST to ${result.winnerName}`, 'error');
      playSfx('ERROR');
    }
  }, [
    playerStats,
    rivalFunds,
    playSfx,
    addLogEntry,
    addToast,
    removeDeal,
    updatePlayerStats,
    updateRivalFund,
    appendChatMessage,
  ]);

  const handleDismissDeal = useCallback((dealId: number) => {
    removeDeal(dealId);
    addToast('DEAL DISMISSED', 'info');
    playSfx('KEYPRESS');
  }, [removeDeal, addToast, playSfx]);

  const closeAuction = useCallback(() => {
    setCurrentAuction(null);
  }, []);

  return {
    currentAuction,
    lastAuctionResult,
    handleStartAuction,
    handleAuctionComplete,
    handleDismissDeal,
    closeAuction,
  };
};

export default useAuctionFlow;
