import { useEffect, useRef } from 'react';
import { useGameState, useGameDispatch } from '../contexts/GameStateContext';
import { MarketVolatility } from '../types';

export const useMarketCycle = () => {
    const { gamePhase, marketVolatility, playerStats } = useGameState();
    const dispatch = useGameDispatch();

    // Market changes tied to week advancement only
    const currentWeek = playerStats?.gameTime?.week ?? 0;

    // Initialize lastWeek to the current week so remounts don't trigger a spurious change
    const lastWeek = useRef<number>(currentWeek);

    useEffect(() => {
        if (gamePhase === 'INTRO') return;
        if (currentWeek === lastWeek.current) return;

        const previousWeek = lastWeek.current;
        lastWeek.current = currentWeek;

        // Don't change market on initial load or week 0/1
        if (previousWeek === -1 || currentWeek <= 1) return;

        // Only change market when the week has strictly advanced (not on re-renders or remounts)
        if (currentWeek <= previousWeek) return;

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

        if (nextCycle !== marketVolatility) {
            dispatch({ type: 'SET_MARKET_VOLATILITY', payload: nextCycle });
        }
    // Only re-run when the week number actually changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentWeek, gamePhase]);
};
