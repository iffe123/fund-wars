import React, { useState, useMemo } from 'react';
import type { PortfolioCompany } from '../types';

interface DealFinancingModalProps {
  company: PortfolioCompany;
  purchasePrice: number;
  dryPowder: number;
  onConfirm: (financing: FinancingStructure) => void;
  onCancel: () => void;
}

export interface FinancingStructure {
  fundEquity: number;
  coInvestors: number;
  managementRollover: number;
  seniorDebt: number;
  mezzanineDebt: number;
  highYieldDebt: number;
  shadowLender: number;
  totalEquity: number;
  totalDebt: number;
  leverageRatio: number;
}

// Debt rules by asset risk level
const DEBT_LIMITS: Record<string, Record<string, number>> = {
  LOW: { senior: 0.6, mezz: 1, highYield: 1, shadow: 1 },
  MEDIUM: { senior: 0.4, mezz: 1, highYield: 1, shadow: 1 },
  HIGH: { senior: 0, mezz: 0.3, highYield: 1, shadow: 1 },
  DISTRESSED: { senior: 0, mezz: 0, highYield: 0.2, shadow: 1 },
};

const DEBT_RATES = {
  senior: { rate: 6, label: 'Senior Debt', color: 'emerald', risk: 'Low Risk Only' },
  mezz: { rate: 12, label: 'Mezzanine', color: 'amber', risk: 'Medium Risk OK' },
  highYield: { rate: 18, label: 'High-Yield', color: 'orange', risk: 'High Risk OK' },
  shadow: { rate: 25, label: 'Shadow Lender', color: 'red', risk: 'Any Deal (Ethics↓)' },
};

const DealFinancingModal: React.FC<DealFinancingModalProps> = ({
  company,
  purchasePrice,
  dryPowder,
  onConfirm,
  onCancel,
}) => {
  // Determine asset risk level based on company metrics
  const assetRisk = useMemo(() => {
    if (company.ebitdaMargin < 0.05 || company.revenueGrowth < -0.2) return 'DISTRESSED';
    if (company.revenueGrowth < 0 || company.ebitdaMargin < 0.1) return 'HIGH';
    if (company.revenueGrowth < 0.1) return 'MEDIUM';
    return 'LOW';
  }, [company]);

  const debtLimits = DEBT_LIMITS[assetRisk];

  // Financing state
  const [fundEquity, setFundEquity] = useState(Math.round(purchasePrice * 0.4));
  const [coInvestors, setCoInvestors] = useState(0);
  const [managementRollover, setMgmtRollover] = useState(0);
  const [seniorDebt, setSeniorDebt] = useState(0);
  const [mezzDebt, setMezzDebt] = useState(0);
  const [highYieldDebt, setHighYieldDebt] = useState(0);
  const [shadowDebt, setShadowDebt] = useState(0);

  // Calculate totals
  const totalEquity = fundEquity + coInvestors + managementRollover;
  const totalDebt = seniorDebt + mezzDebt + highYieldDebt + shadowDebt;
  const totalSources = totalEquity + totalDebt;
  const shortfall = purchasePrice - totalSources;
  const leverageRatio = totalEquity > 0 ? totalDebt / totalEquity : 0;

  // Validation
  const maxSenior = Math.round(purchasePrice * debtLimits.senior);
  const maxMezz = Math.round(purchasePrice * debtLimits.mezz);
  const maxHighYield = Math.round(purchasePrice * debtLimits.highYield);
  const maxShadow = Math.round(purchasePrice * debtLimits.shadow);

  const isValid = Math.abs(shortfall) < 1000 && fundEquity <= dryPowder;

  const formatMoney = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${val}`;
  };

  const handleConfirm = () => {
    onConfirm({
      fundEquity,
      coInvestors,
      managementRollover,
      seniorDebt,
      mezzanineDebt: mezzDebt,
      highYieldDebt,
      shadowLender: shadowDebt,
      totalEquity,
      totalDebt,
      leverageRatio,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-amber-500/50 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-900/50 to-amber-800/30 p-4 border-b border-amber-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <i className="fas fa-money-check-dollar text-amber-400 text-lg"></i>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Deal Financing</h2>
              <p className="text-xs text-amber-400">{company.name} - Structure your acquisition</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Purchase Price Banner */}
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Purchase Price:</span>
              <span className="text-2xl font-bold text-white">{formatMoney(purchasePrice)}</span>
            </div>
            <div className="flex justify-between items-center mt-2 text-sm">
              <span className="text-slate-500">Asset Risk Level:</span>
              <span className={`font-bold ${
                assetRisk === 'LOW' ? 'text-emerald-400' :
                assetRisk === 'MEDIUM' ? 'text-amber-400' :
                assetRisk === 'HIGH' ? 'text-orange-400' : 'text-red-400'
              }`}>{assetRisk}</span>
            </div>
          </div>

          {/* Equity Contribution */}
          <div className="bg-emerald-950/30 rounded-lg p-4 border border-emerald-800/30">
            <h3 className="text-sm font-bold text-emerald-400 mb-3 flex items-center gap-2">
              <i className="fas fa-coins"></i>
              EQUITY CONTRIBUTION
            </h3>
            <div className="space-y-3">
              {/* Fund Equity */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <label className="text-xs text-slate-400">Fund Equity (Your stake)</label>
                  <input
                    type="range"
                    min={0}
                    max={Math.min(purchasePrice, dryPowder)}
                    step={1000000}
                    value={fundEquity}
                    onChange={(e) => setFundEquity(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>
                <span className="text-emerald-400 font-bold w-20 text-right">{formatMoney(fundEquity)}</span>
              </div>

              {/* Co-Investors */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <label className="text-xs text-slate-400">Co-Investors</label>
                  <input
                    type="range"
                    min={0}
                    max={purchasePrice * 0.4}
                    step={1000000}
                    value={coInvestors}
                    onChange={(e) => setCoInvestors(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
                <span className="text-blue-400 font-bold w-20 text-right">{formatMoney(coInvestors)}</span>
              </div>

              {/* Management Rollover */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <label className="text-xs text-slate-400">Management Rollover</label>
                  <input
                    type="range"
                    min={0}
                    max={purchasePrice * 0.15}
                    step={500000}
                    value={managementRollover}
                    onChange={(e) => setMgmtRollover(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                </div>
                <span className="text-purple-400 font-bold w-20 text-right">{formatMoney(managementRollover)}</span>
              </div>
            </div>
          </div>

          {/* Debt Financing */}
          <div className="bg-red-950/20 rounded-lg p-4 border border-red-800/30">
            <h3 className="text-sm font-bold text-red-400 mb-3 flex items-center gap-2">
              <i className="fas fa-landmark"></i>
              DEBT FINANCING
            </h3>
            <div className="space-y-3">
              {/* Senior Debt */}
              <div className={`flex items-center justify-between gap-4 ${maxSenior === 0 ? 'opacity-40' : ''}`}>
                <div className="flex-1">
                  <label className="text-xs text-slate-400 flex items-center gap-2">
                    Senior Debt @ 6%
                    <span className="text-emerald-500 text-[10px]">{DEBT_RATES.senior.risk}</span>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={maxSenior}
                    step={1000000}
                    value={seniorDebt}
                    onChange={(e) => setSeniorDebt(Number(e.target.value))}
                    disabled={maxSenior === 0}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>
                <span className="text-emerald-400 font-bold w-20 text-right">{formatMoney(seniorDebt)}</span>
              </div>

              {/* Mezzanine */}
              <div className={`flex items-center justify-between gap-4 ${maxMezz === 0 ? 'opacity-40' : ''}`}>
                <div className="flex-1">
                  <label className="text-xs text-slate-400 flex items-center gap-2">
                    Mezzanine @ 12%
                    <span className="text-amber-500 text-[10px]">{DEBT_RATES.mezz.risk}</span>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={maxMezz}
                    step={1000000}
                    value={mezzDebt}
                    onChange={(e) => setMezzDebt(Number(e.target.value))}
                    disabled={maxMezz === 0}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>
                <span className="text-amber-400 font-bold w-20 text-right">{formatMoney(mezzDebt)}</span>
              </div>

              {/* High-Yield */}
              <div className={`flex items-center justify-between gap-4 ${maxHighYield === 0 ? 'opacity-40' : ''}`}>
                <div className="flex-1">
                  <label className="text-xs text-slate-400 flex items-center gap-2">
                    High-Yield @ 18%
                    <span className="text-orange-500 text-[10px]">{DEBT_RATES.highYield.risk}</span>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={maxHighYield}
                    step={1000000}
                    value={highYieldDebt}
                    onChange={(e) => setHighYieldDebt(Number(e.target.value))}
                    disabled={maxHighYield === 0}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                </div>
                <span className="text-orange-400 font-bold w-20 text-right">{formatMoney(highYieldDebt)}</span>
              </div>

              {/* Shadow Lender */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <label className="text-xs text-slate-400 flex items-center gap-2">
                    Shadow Lender @ 25%
                    <span className="text-red-500 text-[10px]">{DEBT_RATES.shadow.risk}</span>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={maxShadow}
                    step={1000000}
                    value={shadowDebt}
                    onChange={(e) => setShadowDebt(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500"
                  />
                </div>
                <span className="text-red-400 font-bold w-20 text-right">{formatMoney(shadowDebt)}</span>
              </div>
              {shadowDebt > 0 && (
                <div className="text-xs text-red-400 bg-red-950/50 p-2 rounded border border-red-800/50">
                  <i className="fas fa-exclamation-triangle mr-1"></i>
                  Warning: Shadow lenders decrease Ethics score and increase Audit Risk
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
            <h3 className="text-sm font-bold text-white mb-3">SUMMARY</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Equity:</span>
                <span className="text-emerald-400 font-bold">{formatMoney(totalEquity)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Debt:</span>
                <span className="text-red-400 font-bold">{formatMoney(totalDebt)}</span>
              </div>
              <div className="border-t border-slate-700/50 pt-2 flex justify-between">
                <span className="text-slate-400">Total Sources:</span>
                <span className={`font-bold ${Math.abs(shortfall) < 1000 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatMoney(totalSources)} / {formatMoney(purchasePrice)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Leverage Ratio:</span>
                <span className={`font-bold ${leverageRatio > 3 ? 'text-red-400' : leverageRatio > 2 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {leverageRatio.toFixed(1)}x
                </span>
              </div>
              {shortfall > 1000 && (
                <div className="text-xs text-red-400 bg-red-950/50 p-2 rounded border border-red-800/50 mt-2">
                  <i className="fas fa-exclamation-circle mr-1"></i>
                  Shortfall: {formatMoney(shortfall)} - Add more equity or debt
                </div>
              )}
              {fundEquity > dryPowder && (
                <div className="text-xs text-red-400 bg-red-950/50 p-2 rounded border border-red-800/50 mt-2">
                  <i className="fas fa-exclamation-circle mr-1"></i>
                  Insufficient dry powder! You only have {formatMoney(dryPowder)} available.
                </div>
              )}
            </div>
          </div>

          {/* Risk Warnings */}
          {leverageRatio > 2 && (
            <div className="bg-amber-950/30 rounded-lg p-3 border border-amber-800/30 text-xs">
              <div className="flex items-start gap-2">
                <i className="fas fa-triangle-exclamation text-amber-400 mt-0.5"></i>
                <div>
                  <span className="text-amber-400 font-bold">High Leverage Warning</span>
                  <p className="text-amber-300/70 mt-1">
                    Higher leverage = higher returns but higher risk of default. Missed interest payments increase Audit Risk.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-800/50 border-t border-slate-700/50 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-4 bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isValid}
            className={`flex-1 py-3 px-4 font-bold rounded-lg transition-colors ${
              isValid
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            <i className="fas fa-check mr-2"></i>
            Confirm Financing
          </button>
        </div>
      </div>
    </div>
  );
};

export default DealFinancingModal;
