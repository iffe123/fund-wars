import { useEffect, useRef } from 'react';
import { useGameState, useGameDispatch } from '../contexts/GameStateContext';
import { MarketVolatility } from '../types';

export const useMarketCycle = () => {
    const { gamePhase, marketVolatility, playerStats } = useGameState();
    const dispatch = useGameDispatch();
    const lastWeek = useRef<number>(-1);

    // Market changes tied to week advancement, not a real-time timer
    useEffect(() => {
        if (gamePhase === 'INTRO') return;

        const currentWeek = playerStats?.gameTime?.week ?? playerStats?.timeCursor ?? 0;
        if (currentWeek === lastWeek.current) return;
        lastWeek.current = currentWeek;

        // Don't change market on week 0/1 (let players settle in)
        if (currentWeek <= 1) return;

        const rand = Math.random();
        let nextCycle: MarketVolatility = 'NORMAL';

        if (rand < 0.2) nextCycle = 'BULL_RUN';
        else if (rand < 0.4) nextCycle = 'CREDIT_CRUNCH';
        else if (rand < 0.45) nextCycle = 'PANIC';
        else nextCycle = 'NORMAL';

        // PANIC is sticky — 70% chance to remain in PANIC
        if (marketVolatility === 'PANIC' && Math.random() <= 0.7) {
            return;
        }

        // Only update if market actually changes
        if (nextCycle !== marketVolatility) {
            dispatch({ type: 'SET_MARKET_VOLATILITY', payload: nextCycle });
        }
    }, [gamePhase, playerStats?.gameTime?.week, playerStats?.timeCursor, marketVolatility, dispatch]);
};
