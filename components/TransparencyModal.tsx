import React, { useMemo } from 'react';
import type { MarketVolatility, PlayerStats } from '../types';
import { COMPENSATION_BY_LEVEL, DEFAULT_FACTION_REPUTATION, MARKET_VOLATILITY_STYLES } from '../constants';
import { isGeminiApiConfigured } from '../services/geminiService';
import { TerminalButton, TerminalPanel } from './TerminalUI';

interface TransparencyModalProps {
  isOpen: boolean;
  stats: PlayerStats;
  marketVolatility: MarketVolatility;
  onClose: () => void;
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

const TransparencyModal: React.FC<TransparencyModalProps> = ({ isOpen, stats, marketVolatility, onClose }) => {
  const aiOn = isGeminiApiConfigured();

  const financeBreakdown = useMemo(() => {
    const comp = COMPENSATION_BY_LEVEL[stats.level];
    const pf = stats.personalFinances;
    const weeklySalary = comp?.weeklySalary || 0;
    const weeklyBurn = Math.round((pf?.monthlyBurn ?? 2000) / 4);
    const weeklyInterest = pf?.outstandingLoans && pf?.loanInterestRate
      ? Math.round((pf.outstandingLoans * pf.loanInterestRate) / 52)
      : 0;
    const net = weeklySalary - weeklyBurn - weeklyInterest;
    return { weeklySalary, weeklyBurn, weeklyInterest, net };
  }, [stats]);

  const scenarioTriggerOdds = useMemo(() => {
    // Mirrors the exact logic in `context/GameContext.tsx` inside `advanceTime()`.
    const factionRep = stats.factionReputation || DEFAULT_FACTION_REPUTATION;
    const factionTension = Math.min(...Object.values(factionRep));
    const cashPressure = stats.cash < 5000 ? 0.1 : 0;
    const auditPressure = (stats.auditRisk || 0) > 50 ? 0.1 : 0;
    const crisisMultiplier = stats.stress > 70 ? 1.5 : 1.0;
    const volatilityBias =
      marketVolatility === 'PANIC'
        ? 0.2
        : marketVolatility === 'CREDIT_CRUNCH'
        ? 0.1
        : marketVolatility === 'BULL_RUN'
        ? 0.05
        : 0;
    const tensionBias = factionTension < 40 ? 0.08 : 0;
    const portfolioBias = (stats.portfolio?.length || 0) > 0 ? 0.05 : 0;
    const base = 0.35 + cashPressure + auditPressure + volatilityBias + tensionBias + portfolioBias;
    const chance = clamp01(base * crisisMultiplier);
    return {
      chance,
      components: { base: 0.35, cashPressure, auditPressure, volatilityBias, tensionBias, portfolioBias, crisisMultiplier },
    };
  }, [stats, marketVolatility]);

  if (!isOpen) return null;

  const mkt = MARKET_VOLATILITY_STYLES[marketVolatility];

  return (
    <div className="fixed inset-0 z-[250] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <TerminalPanel
          title="TRANSPARENCY // RULES_ENGINE"
          className="max-h-[90vh]"
          action={
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800/60 hover:bg-slate-700 flex items-center justify-center"
              aria-label="Close"
              title="Close"
            >
              <i className="fas fa-xmark text-slate-400"></i>
            </button>
          }
          variant="default"
          headerIcon="fa-eye"
        >
          <div className="p-4 space-y-4 bg-black">
            {/* AI status */}
            <div className="border border-slate-700/80 bg-slate-900/40 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">AI STATUS</div>
                <div className={`text-[10px] font-bold uppercase tracking-widest ${aiOn ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {aiOn ? 'ON (GEMINI CONFIGURED)' : 'OFF (FALLBACK MODE)'}
                </div>
              </div>
              <div className="mt-2 text-xs text-slate-400 leading-relaxed">
                - **What AI CAN change**: NPC conversations may adjust relationship/trust, your reputation, stress, and (in Founder mode) AUM commitments via explicit tool calls.
                <br />
                - **What AI CANNOT change**: it does not directly mint cash, skip AP costs, or secretly alter deal math behind your back.
              </div>
            </div>

            {/* Weekly finances */}
            <div className="border border-slate-700/80 bg-slate-900/40 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">WEEKLY CASHFLOW (EXACT)</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-widest">
                  Bank: ${(stats.personalFinances?.bankBalance ?? stats.cash).toLocaleString()}
                </div>
              </div>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-2 text-xs">
                <div className="border border-slate-800 bg-black/40 rounded p-2">
                  <div className="text-slate-500 text-[10px] uppercase tracking-wider">Salary</div>
                  <div className="text-emerald-400 font-mono font-bold">+${financeBreakdown.weeklySalary.toLocaleString()}</div>
                </div>
                <div className="border border-slate-800 bg-black/40 rounded p-2">
                  <div className="text-slate-500 text-[10px] uppercase tracking-wider">Lifestyle Burn</div>
                  <div className="text-red-400 font-mono font-bold">-${financeBreakdown.weeklyBurn.toLocaleString()}</div>
                </div>
                <div className="border border-slate-800 bg-black/40 rounded p-2">
                  <div className="text-slate-500 text-[10px] uppercase tracking-wider">Loan Interest</div>
                  <div className="text-red-400 font-mono font-bold">-${financeBreakdown.weeklyInterest.toLocaleString()}</div>
                </div>
                <div className="border border-slate-800 bg-black/40 rounded p-2">
                  <div className="text-slate-500 text-[10px] uppercase tracking-wider">Net / Week</div>
                  <div className={`font-mono font-bold ${financeBreakdown.net >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {financeBreakdown.net >= 0 ? '+' : ''}${financeBreakdown.net.toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="mt-2 text-[11px] text-slate-500 leading-relaxed">
                Bonus is evaluated at year rollover and is performance-based (reputation + portfolio returns + exits).
              </div>
            </div>

            {/* Event & scenario odds */}
            <div className="border border-slate-700/80 bg-slate-900/40 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">EVENT ENGINE (NO SECRETS)</div>
                <div className={`text-[10px] font-bold uppercase tracking-widest ${mkt.color}`}>
                  <i className={`fas ${mkt.icon} mr-2`}></i>
                  {marketVolatility.replace('_', ' ')}
                </div>
              </div>
              <div className="mt-2 text-xs text-slate-400 leading-relaxed">
                Each week advance runs:
                <br />- **World tick**: portfolio events, NPC drama, rival actions, market changes.
                <br />- **Scenario trigger roll**: selects a gated scenario if any qualify.
              </div>

              <div className="mt-3 border border-slate-800 bg-black/40 rounded p-3">
                <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Scenario trigger probability</div>
                <div className="text-xs text-slate-300 font-mono">
                  chance = clamp01((0.35 + cashPressure + auditPressure + volatilityBias + tensionBias + portfolioBias) * crisisMultiplier)
                </div>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2 text-[11px] text-slate-400">
                  <div>base: {scenarioTriggerOdds.components.base.toFixed(2)}</div>
                  <div>cashPressure: {scenarioTriggerOdds.components.cashPressure.toFixed(2)}</div>
                  <div>auditPressure: {scenarioTriggerOdds.components.auditPressure.toFixed(2)}</div>
                  <div>volatilityBias: {scenarioTriggerOdds.components.volatilityBias.toFixed(2)}</div>
                  <div>tensionBias: {scenarioTriggerOdds.components.tensionBias.toFixed(2)}</div>
                  <div>portfolioBias: {scenarioTriggerOdds.components.portfolioBias.toFixed(2)}</div>
                  <div className="md:col-span-3">crisisMultiplier: {scenarioTriggerOdds.components.crisisMultiplier.toFixed(2)}</div>
                </div>
                <div className="mt-2 text-xs font-bold text-amber-400">
                  Current chance: {(scenarioTriggerOdds.chance * 100).toFixed(0)}%
                </div>
              </div>

              <div className="mt-3 text-[11px] text-slate-500">
                Baseline probabilities (per week): NPC drama 10% • simple rival world action 5% • market event 2%. Rival “advanced AI”
                also runs based on your tick and can add pressure + intel entries.
              </div>
            </div>

            {/* Hidden info policy */}
            <div className="border border-slate-700/80 bg-slate-900/40 rounded-lg p-3">
              <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">KNOWN UNKNOWNS (DEALS)</div>
              <div className="mt-2 text-xs text-slate-400 leading-relaxed">
                Competitive deals intentionally include **one hidden risk** and **one hidden upside**. This isn’t “gotcha” randomness:
                you’re told up front that those unknowns exist, and you can reveal them by running due diligence in the auction UI.
              </div>
            </div>

            <div className="pt-2">
              <TerminalButton variant="default" label="CLOSE" icon="fa-xmark" onClick={onClose} />
            </div>
          </div>
        </TerminalPanel>
      </div>
    </div>
  );
};

export default TransparencyModal;

