/**
 * UI Constants
 *
 * UI-related constants including styles, colors, and display configurations.
 */

import type { MarketVolatility } from '../types';

export const MARKET_VOLATILITY_STYLES: Record<MarketVolatility, { color: string; icon: string, description: string }> = {
    NORMAL: { color: 'text-slate-400', icon: 'fa-chart-line', description: "Markets are behaving rationally. Boring." },
    BULL_RUN: { color: 'text-green-500', icon: 'fa-arrow-trend-up', description: "Everything is going up. Even the garbage." },
    CREDIT_CRUNCH: { color: 'text-red-500', icon: 'fa-arrow-trend-down', description: "Liquidity has dried up. Cash is king." },
    PANIC: { color: 'text-amber-500', icon: 'fa-triangle-exclamation', description: "Total meltdown. Hide under your desk." },
};
