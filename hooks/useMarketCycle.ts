import { useEffect } from 'react';
import { useGameState, useGameDispatch } from '../contexts/GameStateContext';
import { MarketVolatility } from '../types';

export const useMarketCycle = () => {
    const { gamePhase, marketVolatility } = useGameState();
    const dispatch = useGameDispatch();

    useEffect(() => {
        if (gamePhase === 'INTRO') return;
        
        const interval = setInterval(() => {
            const rand = Math.random();
            let nextCycle: MarketVolatility = 'NORMAL';
            
            if (rand < 0.2) nextCycle = 'BULL_RUN';
            else if (rand < 0.4) nextCycle = 'CREDIT_CRUNCH';
            else if (rand < 0.45) nextCycle = 'PANIC'; 
            else nextCycle = 'NORMAL';

            if (marketVolatility !== 'PANIC' || Math.random() > 0.7) {
                dispatch({ type: 'SET_MARKET_VOLATILITY', payload: nextCycle });
            }
        }, 60000);

        return () => clearInterval(interval);
    }, [gamePhase, marketVolatility, dispatch]);
};
