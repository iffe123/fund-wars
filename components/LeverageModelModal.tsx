import React, { useState, useMemo } from 'react';
import type { PortfolioCompany, LeverageModel } from '../types';

interface LeverageModelModalProps {
  company: PortfolioCompany;
  onClose: () => void;
  onApplyModel: (modelParams: LeverageModel, suggestedBid: number) => void;
}

/**
 * Calculate MOIC (Multiple on Invested Capital)
 */
const calculateMOIC = (entryEquity: number, exitEquity: number): number => {
  if (entryEquity <= 0) return 0;
  return exitEquity / entryEquity;
};

/**
 * Calculate IRR (Internal Rate of Return)
 * Simple IRR: (Exit/Entry)^(1/years) - 1
 */
const calculateIRR = (entryEquity: number, exitEquity: number, years: number): number => {
  if (entryEquity <= 0 || years <= 0) return 0;
  return Math.pow(exitEquity / entryEquity, 1 / years) - 1;
};

/**
 * Get color class based on IRR threshold
 */
const getIRRColor = (irr: number): string => {
  if (irr >= 0.25) return 'text-emerald-400'; // 25%+ = Great
  if (irr >= 0.20) return 'text-emerald-500'; // 20%+ = Good
  if (irr >= 0.15) return 'text-amber-400'; // 15%+ = Acceptable
  if (irr >= 0.10) return 'text-amber-500'; // 10%+ = Marginal
  return 'text-red-400'; // Below 10% = Poor
};

/**
 * Get attractiveness label based on IRR
 */
const getAttractivenessLabel = (irr: number): { label: string; color: string; bgColor: string } => {
  if (irr >= 0.25) return { label: 'EXCELLENT', color: 'text-emerald-400', bgColor: 'bg-emerald-950/50 border-emerald-700/50' };
  if (irr >= 0.20) return { label: 'ATTRACTIVE', color: 'text-emerald-500', bgColor: 'bg-emerald-950/30 border-emerald-700/30' };
  if (irr >= 0.15) return { label: 'ACCEPTABLE', color: 'text-amber-400', bgColor: 'bg-amber-950/50 border-amber-700/50' };
  if (irr >= 0.10) return { label: 'MARGINAL', color: 'text-amber-500', bgColor: 'bg-amber-950/30 border-amber-700/30' };
  return { label: 'PASS', color: 'text-red-400', bgColor: 'bg-red-950/50 border-red-700/50' };
};

const LeverageModelModal: React.FC<LeverageModelModalProps> = ({
  company,
  onClose,
  onApplyModel,
}) => {
  // Model inputs with sensible defaults based on company metrics
  const defaultEntryMultiple = company.ebitda > 0
    ? Math.round((company.currentValuation / company.ebitda) * 10) / 10
    : 8;

  const [entryMultiple, setEntryMultiple] = useState(defaultEntryMultiple);
  const [debtPercent, setDebtPercent] = useState(50);
  const [holdPeriodYears, setHoldPeriodYears] = useState(5);
  const [exitMultiple, setExitMultiple] = useState(defaultEntryMultiple + 1);
  const [revenueGrowthRate, setRevenueGrowthRate] = useState(
    Math.round(company.revenueGrowth * 100) || 10
  );
  const [marginImprovement, setMarginImprovement] = useState(2);

  // Calculate model outputs
  const modelOutput = useMemo(() => {
    // Entry metrics
    const entryEV = company.ebitda * entryMultiple;
    const debtAmount = entryEV * (debtPercent / 100);
    const equityCheck = entryEV - debtAmount;

    // Project EBITDA at exit based on revenue growth and margin improvement
    const revenueAtExit = company.revenue * Math.pow(1 + revenueGrowthRate / 100, holdPeriodYears);
    const currentMargin = company.ebitda / company.revenue;
    const exitMargin = currentMargin + (marginImprovement / 100);
    const ebitdaAtExit = revenueAtExit * exitMargin;

    // Exit metrics
    const exitEV = ebitdaAtExit * exitMultiple;

    // Assume debt paydown from cash flow (simplified: 60% of debt paid off over hold)
    const debtAtExit = debtAmount * 0.4;
    const exitEquity = exitEV - debtAtExit;

    // Calculate returns
    const moic = calculateMOIC(equityCheck, exitEquity);
    const irr = calculateIRR(equityCheck, exitEquity, holdPeriodYears);

    const model: LeverageModel = {
      entryMultiple,
      revenueMultiple: company.revenue > 0 ? entryEV / company.revenue : 0,
      debtPercent,
      holdPeriodYears,
      exitMultiple,
      revenueGrowthRate: revenueGrowthRate / 100,
      marginImprovement: marginImprovement / 100,
      projectedIRR: irr,
      projectedMOIC: moic,
      equityCheck,
    };

    return {
      model,
      entryEV,
      debtAmount,
      equityCheck,
      revenueAtExit,
      ebitdaAtExit,
      exitEV,
      exitEquity,
    };
  }, [company, entryMultiple, debtPercent, holdPeriodYears, exitMultiple, revenueGrowthRate, marginImprovement]);

  const attractiveness = getAttractivenessLabel(modelOutput.model.projectedIRR);

  const formatCurrency = (val: number) => {
    if (val >= 1000000000) return `$${(val / 1000000000).toFixed(2)}B`;
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    return `$${val.toLocaleString()}`;
  };

  const handleApplyToBid = () => {
    onApplyModel(modelOutput.model, modelOutput.entryEV);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900/50 to-slate-800 p-4 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <i className="fas fa-calculator text-purple-400"></i>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">LEVERAGE MODEL</h2>
                <p className="text-xs text-slate-400">{company.name} // IRR & MOIC Analysis</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors"
            >
              <i className="fas fa-times text-slate-400"></i>
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Deal Attractiveness Badge */}
          <div className={`mb-6 p-4 rounded-lg border ${attractiveness.bgColor} flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <i className={`fas fa-chart-line text-xl ${attractiveness.color}`}></i>
              <div>
                <span className={`text-sm font-bold ${attractiveness.color}`}>
                  DEAL RATING: {attractiveness.label}
                </span>
                <p className="text-xs text-slate-400 mt-0.5">
                  Based on projected {(modelOutput.model.projectedIRR * 100).toFixed(1)}% IRR
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${getIRRColor(modelOutput.model.projectedIRR)}`}>
                {(modelOutput.model.projectedIRR * 100).toFixed(1)}% IRR
              </div>
              <div className="text-sm text-slate-400">
                {modelOutput.model.projectedMOIC.toFixed(2)}x MOIC
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input Controls */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <i className="fas fa-sliders-h text-purple-400"></i>
                Model Inputs
              </h3>

              {/* Entry Multiple */}
              <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs text-slate-400">Entry Multiple (EV/EBITDA)</label>
                  <span className="text-sm font-bold text-white">{entryMultiple.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="20"
                  step="0.5"
                  value={entryMultiple}
                  onChange={(e) => setEntryMultiple(parseFloat(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>

              {/* Debt Percentage */}
              <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs text-slate-400">Debt % of Purchase</label>
                  <span className="text-sm font-bold text-white">{debtPercent}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  step="5"
                  value={debtPercent}
                  onChange={(e) => setDebtPercent(parseInt(e.target.value))}
                  className="w-full accent-red-500"
                />
              </div>

              {/* Hold Period */}
              <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs text-slate-400">Hold Period (Years)</label>
                  <span className="text-sm font-bold text-white">{holdPeriodYears} yrs</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="10"
                  step="1"
                  value={holdPeriodYears}
                  onChange={(e) => setHoldPeriodYears(parseInt(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              {/* Exit Multiple */}
              <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs text-slate-400">Exit Multiple (EV/EBITDA)</label>
                  <span className="text-sm font-bold text-white">{exitMultiple.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="25"
                  step="0.5"
                  value={exitMultiple}
                  onChange={(e) => setExitMultiple(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              {/* Revenue Growth */}
              <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs text-slate-400">Annual Revenue Growth</label>
                  <span className="text-sm font-bold text-white">{revenueGrowthRate}%</span>
                </div>
                <input
                  type="range"
                  min="-10"
                  max="50"
                  step="1"
                  value={revenueGrowthRate}
                  onChange={(e) => setRevenueGrowthRate(parseInt(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>

              {/* Margin Improvement */}
              <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs text-slate-400">EBITDA Margin Improvement</label>
                  <span className="text-sm font-bold text-white">+{marginImprovement}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="0.5"
                  value={marginImprovement}
                  onChange={(e) => setMarginImprovement(parseFloat(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>

            {/* Output Metrics */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <i className="fas fa-chart-bar text-emerald-400"></i>
                Projected Outcomes
              </h3>

              {/* Entry Metrics */}
              <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30">
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-3">Entry</div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <div className="text-[10px] text-slate-500">Enterprise Value</div>
                    <div className="text-sm font-bold text-white">{formatCurrency(modelOutput.entryEV)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">Debt</div>
                    <div className="text-sm font-bold text-red-400">{formatCurrency(modelOutput.debtAmount)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">Equity Check</div>
                    <div className="text-sm font-bold text-emerald-400">{formatCurrency(modelOutput.equityCheck)}</div>
                  </div>
                </div>
              </div>

              {/* Exit Metrics */}
              <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30">
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-3">Exit (Year {holdPeriodYears})</div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <div className="text-[10px] text-slate-500">Revenue</div>
                    <div className="text-sm font-bold text-white">{formatCurrency(modelOutput.revenueAtExit)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">EBITDA</div>
                    <div className="text-sm font-bold text-white">{formatCurrency(modelOutput.ebitdaAtExit)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">Exit EV</div>
                    <div className="text-sm font-bold text-emerald-400">{formatCurrency(modelOutput.exitEV)}</div>
                  </div>
                </div>
              </div>

              {/* Returns Summary */}
              <div className="bg-gradient-to-br from-purple-950/50 to-slate-800/50 rounded-lg p-4 border border-purple-700/30">
                <div className="text-xs text-purple-400 uppercase tracking-wider mb-3">Returns Analysis</div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${getIRRColor(modelOutput.model.projectedIRR)}`}>
                      {(modelOutput.model.projectedIRR * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-slate-400">IRR</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${modelOutput.model.projectedMOIC >= 2 ? 'text-emerald-400' : modelOutput.model.projectedMOIC >= 1.5 ? 'text-amber-400' : 'text-red-400'}`}>
                      {modelOutput.model.projectedMOIC.toFixed(2)}x
                    </div>
                    <div className="text-xs text-slate-400">MOIC</div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-700/50 text-center">
                  <div className="text-xs text-slate-500">Equity Exit Value</div>
                  <div className="text-xl font-bold text-white">{formatCurrency(modelOutput.exitEquity)}</div>
                </div>
              </div>

              {/* Company Context */}
              <div className="bg-slate-800/20 rounded-lg p-3 border border-slate-700/20">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Current Metrics</div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500">Revenue:</span>
                    <span className="text-white ml-1">{formatCurrency(company.revenue)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">EBITDA:</span>
                    <span className="text-white ml-1">{formatCurrency(company.ebitda)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Margin:</span>
                    <span className="text-white ml-1">{((company.ebitda / company.revenue) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-800/50 p-4 border-t border-slate-700 flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm font-bold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApplyToBid}
            className={`
              px-6 py-2 rounded-lg text-sm font-bold transition-all
              ${modelOutput.model.projectedIRR >= 0.15
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-lg shadow-emerald-500/20'
                : 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black'
              }
            `}
          >
            <i className="fas fa-clipboard-check mr-2"></i>
            Apply to Bid ({formatCurrency(modelOutput.entryEV)})
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeverageModelModal;
