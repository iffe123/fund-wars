
import React, { useState, useEffect, useCallback } from 'react';
import { TerminalButton, TerminalPanel } from './TerminalUI';
import { useHaptic } from '../hooks/useHaptic';

interface AuctionModalProps {
  companyName: string;
  initialBid: number;
  rivalName: string;
  onComplete: (success: boolean, finalBid: number) => void;
  onClose: () => void;
}

const AuctionModal: React.FC<AuctionModalProps> = ({ companyName, initialBid, rivalName, onComplete, onClose }) => {
  const { triggerImpact } = useHaptic();
  const [currentBid, setCurrentBid] = useState(initialBid);
  const [playerBid, setPlayerBid] = useState(initialBid);
  const [turn, setTurn] = useState<'PLAYER' | 'RIVAL'>('RIVAL');
  const [timer, setTimer] = useState(100); // percentage
  const [log, setLog] = useState<string[]>([`> AUCTION_INIT: ${companyName}`, `> OPENING_BID: $${(initialBid / 1000000).toFixed(1)}M`]);
  const [isOver, setIsOver] = useState(false);

  // Define handlers first (before useEffects that use them)
  const handleWin = useCallback(() => {
      setIsOver(true);
      triggerImpact('MEDIUM');
      setLog(prev => [...prev, `> AUCTION CLOSED. WINNER: YOU`]);
      setTimeout(() => onComplete(true, currentBid), 2000);
  }, [currentBid, onComplete, triggerImpact]);

  const handleLoss = useCallback(() => {
      setIsOver(true);
      triggerImpact('HEAVY'); // Losing hurts
      setLog(prev => [...prev, `> AUCTION CLOSED. WINNER: ${rivalName.toUpperCase()}`]);
      setTimeout(() => onComplete(false, currentBid), 2000);
  }, [currentBid, onComplete, rivalName, triggerImpact]);

  const handleBid = (amount: number) => {
      const newBid = currentBid + amount;
      setPlayerBid(newBid);
      setCurrentBid(newBid);
      setLog(prev => [...prev, `> YOU BID $${(newBid/1000000).toFixed(1)}M`]);
      setTurn('RIVAL');
  };

  // Rival AI Loop
  useEffect(() => {
    if (isOver) return;

    if (turn === 'RIVAL') {
      const thinkTime = Math.random() * 2000 + 1000;
      const timeout = setTimeout(() => {
        // Simple Rival AI: 80% chance to bid up, 20% to fold
        // The higher the bid goes over initial, the more likely they fold
        const bidIncrease = initialBid * 0.05; // 5% increments
        const multiplier = currentBid / initialBid;
        const foldChance = (multiplier - 1) * 2; // e.g. at 1.5x, 100% chance to fold

        if (Math.random() > foldChance) {
             const newBid = currentBid + bidIncrease;
             setCurrentBid(newBid);
             setLog(prev => [...prev, `> ${rivalName.toUpperCase()} BIDS $${(newBid/1000000).toFixed(1)}M`]);
             triggerImpact('HEAVY'); // Rival bids are intense
             setTurn('PLAYER');
             setTimer(100);
        } else {
             // Rival Folds
             setLog(prev => [...prev, `> ${rivalName.toUpperCase()} WITHDRAWS`]);
             setTimeout(() => handleWin(), 1000);
        }
      }, thinkTime);
      return () => clearTimeout(timeout);
    }
  }, [turn, currentBid, isOver, initialBid, rivalName, triggerImpact, handleWin]);

  // Timer for Player Turn
  useEffect(() => {
    if (isOver) return;
    if (turn === 'PLAYER') {
        const interval = setInterval(() => {
            setTimer(prev => {
                if (prev <= 0) {
                    clearInterval(interval);
                    handleLoss(); // Time out
                    return 0;
                }
                return prev - 1; // 100 ticks = ~10s if 100ms interval
            });
        }, 100);
        return () => clearInterval(interval);
    } else {
        setTimer(100); // Reset when not player turn
    }
  }, [turn, isOver, handleLoss]);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
        <div className="w-full max-w-lg border-2 border-red-500 bg-slate-900 shadow-[0_0_50px_rgba(239,68,68,0.4)]">
            <div className="bg-red-500 text-black px-3 py-2 font-bold flex justify-between items-center animate-pulse">
                <span><i className="fas fa-gavel mr-2"></i>LIVE AUCTION IN PROGRESS</span>
                <span>{companyName}</span>
            </div>
            
            <div className="p-6">
                <div className="flex justify-center mb-6">
                    <div className="text-center">
                        <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Current Bid</div>
                        <div className="text-5xl font-mono text-white font-bold tracking-tighter">
                            ${(currentBid / 1000000).toFixed(1)}M
                        </div>
                        <div className={`text-xs mt-2 font-bold ${turn === 'PLAYER' ? 'text-green-500' : 'text-red-500'}`}>
                            {turn === 'PLAYER' ? "YOUR TURN" : `${rivalName.toUpperCase()} BIDDING...`}
                        </div>
                    </div>
                </div>

                {turn === 'PLAYER' && !isOver && (
                    <div className="mb-6">
                        <div className="h-1 bg-slate-800 rounded-full overflow-hidden mb-2">
                            <div className="h-full bg-red-500 transition-all duration-100 ease-linear" style={{ width: `${timer}%` }}></div>
                        </div>
                        <div className="flex justify-between gap-4">
                             <TerminalButton 
                                variant="warning" 
                                label={`MATCH (+$${(initialBid * 0.05 / 1000000).toFixed(1)}M)`} 
                                className="flex-1"
                                onClick={() => handleBid(initialBid * 0.05)}
                             />
                             <TerminalButton 
                                variant="danger" 
                                label={`BULLY (+$${(initialBid * 0.15 / 1000000).toFixed(1)}M)`} 
                                className="flex-1"
                                onClick={() => handleBid(initialBid * 0.15)}
                             />
                             <TerminalButton 
                                label="FOLD" 
                                className="flex-1"
                                onClick={handleLoss}
                             />
                        </div>
                    </div>
                )}

                <div className="bg-black border border-slate-800 h-32 overflow-y-auto font-mono text-xs p-2 text-slate-400">
                    {log.map((line, i) => (
                        <div key={i} className={i === log.length - 1 ? "text-white animate-pulse" : ""}>{line}</div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
};

export default AuctionModal;
