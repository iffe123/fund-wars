import React, { useMemo } from 'react';
import type { GamePhase, PlayerStats } from '../types';
import { TerminalButton, StatCard } from './TerminalUI';

interface GameEndModalProps {
  phase: GamePhase;
  stats: PlayerStats;
  actionLog: string[];
  onRestart: () => void;
  onClose?: () => void;
}

const PHASE_COPY: Record<
  Exclude<GamePhase, 'INTRO' | 'SCENARIO' | 'LIFE_MANAGEMENT' | 'PORTFOLIO' | 'FOUNDER_MODE'>,
  { title: string; subtitle: string; accent: 'danger' | 'warning' | 'success' }
> = {
  GAME_OVER: {
    title: 'SIMULATION TERMINATED',
    subtitle: 'Your career just got archived by HR.',
    accent: 'danger',
  },
  PRISON: {
    title: 'SIMULATION LOCKED: PRISON',
    subtitle: 'Regulators don’t do second chances.',
    accent: 'danger',
  },
  ALONE: {
    title: 'SIMULATION ENDS: ALONE',
    subtitle: 'You won the money and lost the humans.',
    accent: 'warning',
  },
  VICTORY: {
    title: 'SIMULATION COMPLETE: VICTORY',
    subtitle: 'You made it. Now try doing it without collateral damage.',
    accent: 'success',
  },
};

const GameEndModal: React.FC<GameEndModalProps> = ({ phase, stats, actionLog, onRestart, onClose }) => {
  const copy = PHASE_COPY[phase as keyof typeof PHASE_COPY];

  const likelyCause = useMemo(() => {
    const keywords = ['TERMINATED', 'PRISON', 'INDICT', 'WARNING', 'LP', 'REGULATOR', 'BURNOUT'];
    const best = actionLog.find(line => keywords.some(k => line.toUpperCase().includes(k)));
    return best || actionLog[0] || 'No further details recorded.';
  }, [actionLog]);

  const weekLabel = stats.gameTime
    ? `Week ${stats.gameTime.week} • Year ${stats.gameTime.year} • Q${stats.gameTime.quarter}`
    : `Tick ${stats.timeCursor}`;

  const netWorth = useMemo(() => {
    const portfolioEquity = (stats.portfolio || []).reduce(
      (sum, c) => sum + (c.currentValuation * ((c.ownershipPercentage || 0) / 100)),
      0
    );
    return stats.cash + portfolioEquity + (stats.totalRealizedGains || 0) - (stats.loanBalance || 0);
  }, [stats]);

  if (!copy) return null;

  return (
    <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl border border-slate-700 bg-slate-900 shadow-2xl rounded-lg overflow-hidden">
        <div
          className={`px-4 py-3 border-b border-slate-700 flex items-center justify-between ${
            copy.accent === 'danger'
              ? 'bg-red-500/10'
              : copy.accent === 'warning'
              ? 'bg-amber-500/10'
              : 'bg-emerald-500/10'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
                copy.accent === 'danger'
                  ? 'border-red-500/40 bg-red-500/10'
                  : copy.accent === 'warning'
                  ? 'border-amber-500/40 bg-amber-500/10'
                  : 'border-emerald-500/40 bg-emerald-500/10'
              }`}
            >
              <i
                className={`fas ${
                  copy.accent === 'danger'
                    ? 'fa-skull'
                    : copy.accent === 'warning'
                    ? 'fa-triangle-exclamation'
                    : 'fa-trophy'
                } ${
                  copy.accent === 'danger'
                    ? 'text-red-400'
                    : copy.accent === 'warning'
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{weekLabel}</div>
              <div className="text-lg font-bold text-white">{copy.title}</div>
              <div className="text-xs text-slate-400">{copy.subtitle}</div>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-lg bg-slate-800/60 hover:bg-slate-700 flex items-center justify-center"
              aria-label="Close"
              title="Close"
            >
              <i className="fas fa-xmark text-slate-400" />
            </button>
          )}
        </div>

        <div className="p-4 space-y-4">
          <div className="border border-slate-800 bg-black/40 rounded-lg p-3">
            <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">
              WHAT HAPPENED (LATEST SIGNAL)
            </div>
            <div className="text-xs text-slate-300 font-mono leading-relaxed">{likelyCause}</div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <StatCard label="Net Worth" value={`$${(netWorth / 1_000_000).toFixed(2)}M`} icon="fa-sack-dollar" color="green" />
            <StatCard label="Reputation" value={`${stats.reputation}/100`} icon="fa-star" color="blue" />
            <StatCard label="Stress" value={`${stats.stress}%`} icon="fa-brain" color="amber" />
            <StatCard label="Audit Risk" value={`${stats.auditRisk}%`} icon="fa-magnifying-glass" color="red" />
          </div>

          <div className="border border-slate-800 bg-slate-950/40 rounded-lg p-3">
            <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">NO HIDDEN RULES</div>
            <div className="text-xs text-slate-400 leading-relaxed">
              End states are triggered by explicit checks (e.g., cash insolvency without loan access, extreme audit risk, or
              scenario consequences). Use the Transparency panel during play to see the exact pressures building up.
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-2">
            <TerminalButton
              variant={copy.accent === 'danger' ? 'danger' : copy.accent === 'warning' ? 'warning' : 'primary'}
              label="RESTART SIMULATION"
              icon="fa-rotate-left"
              className="flex-1"
              onClick={onRestart}
            />
            <TerminalButton
              variant="default"
              label="CLOSE (KEEP BROWSING)"
              icon="fa-eye"
              className="flex-1"
              onClick={() => onClose?.()}
              disabled={!onClose}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameEndModal;

