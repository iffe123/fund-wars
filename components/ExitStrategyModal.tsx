import React, { useState, useMemo } from 'react';
import type { PortfolioCompany, PlayerStats, MarketVolatility, ExitType, ExitResult, StatChanges } from '../types';
import {
  EXIT_OPTIONS,
  getAvailableExits,
  calculateOwnershipMonths,
  calculateExitValue,
  EXIT_FLAVOR_TEXT,
} from '../constants/exits';

interface ExitStrategyModalProps {
  company: PortfolioCompany;
  playerStats: PlayerStats;
  marketVolatility: MarketVolatility;
  onExecuteExit: (result: ExitResult, statChanges: StatChanges) => void;
  onClose: () => void;
}

const ExitStrategyModal: React.FC<ExitStrategyModalProps> = ({
  company,
  playerStats,
  marketVolatility,
  onExecuteExit,
  onClose,
}) => {
  const [selectedExit, setSelectedExit] = useState<ExitType | null>(null);
  const [phase, setPhase] = useState<'SELECT' | 'RESULT'>('SELECT');
  const [exitOutcome, setExitOutcome] = useState<{
    success: boolean;
    result: ExitResult;
    flavorText: string;
  } | null>(null);

  const ownershipMonths = calculateOwnershipMonths(company, playerStats.gameYear, playerStats.gameMonth);
  const availableExits = useMemo(
    () => getAvailableExits(company, playerStats, marketVolatility, playerStats.gameYear, playerStats.gameMonth),
    [company, playerStats, marketVolatility]
  );

  const selectedOption = selectedExit ? EXIT_OPTIONS.find(e => e.type === selectedExit) : null;

  const projectedValues = useMemo(() => {
    if (!selectedOption) return null;
    return calculateExitValue(company, selectedOption, playerStats, marketVolatility);
  }, [selectedOption, company, playerStats, marketVolatility]);

  const formatCurrency = (val: number) => {
    if (val >= 1000000000) return `$${(val / 1000000000).toFixed(2)}B`;
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    return `$${val.toLocaleString()}`;
  };

  const handleExecuteExit = (exitType: ExitType) => {
    const option = EXIT_OPTIONS.find(e => e.type === exitType);
    if (!option) return;

    const values = calculateExitValue(company, option, playerStats, marketVolatility);
    
    // Determine success (most exits succeed, liquidation always "succeeds" but poorly)
    const successChance = option.type === 'LIQUIDATION' ? 1.0 :
      option.type === 'IPO' ? 0.75 :
      option.type === 'STRATEGIC_SALE' ? 0.85 :
      0.90;

    const success = Math.random() < successChance;

    // Adjust values for failure
    const finalMultiple = success ? values.multiple : values.multiple * 0.6;
    const finalValue = Math.round(company.investmentCost * finalMultiple);
    const finalProfit = finalValue - company.investmentCost;

    const result: ExitResult = {
      exitType: option.type,
      companyName: company.name,
      investmentCost: company.investmentCost,
      exitValue: finalValue,
      multiple: finalMultiple,
      profit: finalProfit,
      holdingPeriodMonths: ownershipMonths,
    };

    const flavorTexts = success
      ? EXIT_FLAVOR_TEXT[option.type].success
      : EXIT_FLAVOR_TEXT[option.type].failure;
    const flavorText = flavorTexts[Math.floor(Math.random() * flavorTexts.length)];

    setSelectedExit(exitType);
    setExitOutcome({ success, result, flavorText });
    setPhase('RESULT');
  };

  const handleComplete = () => {
    if (!exitOutcome) return;

    const statChanges: StatChanges = {
      cash: exitOutcome.result.profit,
      score: Math.round(exitOutcome.result.multiple * 1000),
      reputation: exitOutcome.success ? 5 : -3,
      addExitResult: exitOutcome.result,
    };

    // Remove company from portfolio
    const updatedPortfolio = playerStats.portfolio.filter(c => c.id !== company.id);
    statChanges.portfolio = updatedPortfolio;

    onExecuteExit(exitOutcome.result, statChanges);
  };

  const isAvailable = (type: ExitType) => availableExits.some(e => e.type === type);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-xl border border-slate-700 w-full max-w-3xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-slate-800 sticky top-0">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-white">
                <i className="fas fa-door-open mr-2 text-green-400"></i>
                Exit Strategy: {company.name}
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Owned for {ownershipMonths} months | Investment: {formatCurrency(company.investmentCost)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {phase === 'SELECT' && (
            <>
              {/* Company Summary */}
              <div className="bg-slate-800 rounded-lg p-4 mb-6">
                <h3 className="text-sm uppercase text-slate-500 mb-3">Company Snapshot</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">Current Valuation</p>
                    <p className="text-white font-semibold">{formatCurrency(company.currentValuation)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Revenue</p>
                    <p className="text-white font-semibold">{formatCurrency(company.revenue)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">EBITDA</p>
                    <p className="text-white font-semibold">{formatCurrency(company.ebitda)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Growth</p>
                    <p className={`font-semibold ${company.revenueGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {(company.revenueGrowth * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Market Conditions */}
              <div className={`rounded-lg p-3 mb-6 ${
                marketVolatility === 'BULL_RUN' ? 'bg-green-500/10 border border-green-500/30' :
                marketVolatility === 'PANIC' ? 'bg-red-500/10 border border-red-500/30' :
                marketVolatility === 'CREDIT_CRUNCH' ? 'bg-amber-500/10 border border-amber-500/30' :
                'bg-slate-800'
              }`}>
                <div className="flex items-center gap-2">
                  <i className={`fas fa-chart-line ${
                    marketVolatility === 'BULL_RUN' ? 'text-green-400' :
                    marketVolatility === 'PANIC' ? 'text-red-400' :
                    marketVolatility === 'CREDIT_CRUNCH' ? 'text-amber-400' :
                    'text-slate-400'
                  }`}></i>
                  <span className="text-sm text-slate-300">
                    Market: <span className="font-semibold">{marketVolatility.replace('_', ' ')}</span>
                    {marketVolatility === 'BULL_RUN' && ' - Exit multiples elevated'}
                    {marketVolatility === 'PANIC' && ' - Exit multiples depressed'}
                    {marketVolatility === 'CREDIT_CRUNCH' && ' - Limited financing options'}
                  </span>
                </div>
              </div>

              {/* Exit Options */}
              <h3 className="text-sm uppercase text-slate-500 mb-3">Available Exit Strategies</h3>
              <div className="space-y-3">
                {EXIT_OPTIONS.map(option => {
                  const available = isAvailable(option.type);
                  const isSelected = selectedExit === option.type;

                  return (
                    <button
                      key={option.type}
                      onClick={() => available && handleExecuteExit(option.type)}
                      disabled={!available}
                      className={`w-full text-left p-4 rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-blue-500/20 border-blue-500'
                          : available
                          ? 'bg-slate-800 border-slate-700 hover:border-slate-500 hover:bg-slate-700/50 active:scale-[0.99]'
                          : 'bg-slate-800/50 border-slate-700/50 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          available ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-500'
                        }`}>
                          <i className={`fas ${option.icon}`}></i>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className={`font-semibold ${available ? 'text-white' : 'text-slate-500'}`}>
                              {option.name}
                            </h4>
                            <span className={`text-sm ${available ? 'text-green-400' : 'text-slate-500'}`}>
                              ~{option.baseMultiple.toFixed(1)}x base multiple
                            </span>
                          </div>
                          <p className={`text-sm mt-1 ${available ? 'text-slate-400' : 'text-slate-400'}`}>
                            {option.description}
                          </p>
                          {!available && (
                            <p className="text-xs text-amber-400 mt-2">
                              <i className="fas fa-lock mr-1"></i>
                              Requirements not met
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Execute immediately - no confirmation needed */}
            </>
          )}

          {/* Remove CONFIRM phase - not needed */}
          {false && phase === 'RESULT' && selectedOption && projectedValues && (
            <div>
              <h3 className="text-xl font-bold text-white mb-4">{selectedOption.name}</h3>

              {/* Projected Returns */}
              <div className="bg-slate-800 rounded-lg p-4 mb-6">
                <h4 className="text-sm uppercase text-slate-500 mb-3">Projected Returns</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{formatCurrency(projectedValues.exitValue)}</p>
                    <p className="text-xs text-slate-500">Exit Value</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${projectedValues.multiple >= 2 ? 'text-green-400' : projectedValues.multiple >= 1 ? 'text-amber-400' : 'text-red-400'}`}>
                      {projectedValues.multiple.toFixed(2)}x
                    </p>
                    <p className="text-xs text-slate-500">Multiple</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${projectedValues.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {projectedValues.profit >= 0 ? '+' : ''}{formatCurrency(projectedValues.profit)}
                    </p>
                    <p className="text-xs text-slate-500">Profit</p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <i className="fas fa-clock text-slate-400"></i>
                  <span className="text-slate-400">
                    Expected time to close: <span className="text-white">{selectedOption.timeToClose} months</span>
                  </span>
                </div>
              </div>

              {/* Risks */}
              <div className="mb-6">
                <h4 className="text-sm uppercase text-slate-500 mb-2">Key Risks</h4>
                <ul className="space-y-2">
                  {selectedOption.risks.map((risk, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                      <i className="fas fa-exclamation-triangle text-amber-400 mt-0.5"></i>
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setPhase('SELECT')}
                  className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleExecuteExit}
                  className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors"
                >
                  Execute Exit
                </button>
              </div>
            </div>
          )}

          {phase === 'RESULT' && exitOutcome && (
            <div className="text-center py-8">
              <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
                exitOutcome.success ? 'bg-green-500/20' : 'bg-amber-500/20'
              }`}>
                <i className={`fas ${exitOutcome.success ? 'fa-check' : 'fa-exclamation'} text-4xl ${
                  exitOutcome.success ? 'text-green-400' : 'text-amber-400'
                }`}></i>
              </div>

              <h3 className={`text-2xl font-bold mb-2 ${exitOutcome.success ? 'text-green-400' : 'text-amber-400'}`}>
                {exitOutcome.success ? 'Exit Successful!' : 'Exit Completed (With Issues)'}
              </h3>
              <p className="text-slate-400 italic mb-6">"{exitOutcome.flavorText}"</p>

              {/* Final Results */}
              <div className="bg-slate-800 rounded-lg p-6 mb-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-slate-500">Company</p>
                    <p className="text-xl font-bold text-white">{exitOutcome.result.companyName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Holding Period</p>
                    <p className="text-xl font-bold text-white">{exitOutcome.result.holdingPeriodMonths} months</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Investment</p>
                    <p className="text-xl font-bold text-white">{formatCurrency(exitOutcome.result.investmentCost)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Exit Value</p>
                    <p className="text-xl font-bold text-white">{formatCurrency(exitOutcome.result.exitValue)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Multiple</p>
                    <p className={`text-xl font-bold ${exitOutcome.result.multiple >= 2 ? 'text-green-400' : exitOutcome.result.multiple >= 1 ? 'text-amber-400' : 'text-red-400'}`}>
                      {exitOutcome.result.multiple.toFixed(2)}x
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Profit</p>
                    <p className={`text-xl font-bold ${exitOutcome.result.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {exitOutcome.result.profit >= 0 ? '+' : ''}{formatCurrency(exitOutcome.result.profit)}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleComplete}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
              >
                Continue
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExitStrategyModal;
