import React, { memo } from 'react';
import type { PortfolioCompany, CompanyStatus, PlayerStats } from '../../types';
import { getCompanyStatus } from '../../utils/worldEngine';

interface DealPhaseActionsProps {
  company: PortfolioCompany;
  playerStats: PlayerStats;
  tutorialStep: number;
  isMarketPanic: boolean;
  analyzingIds: number[];
  // Pipeline actions
  onAnalyze: (companyId: number) => void;
  onSubmitIOI: (companyId: number) => void;
  onWalkAway: (companyId: number) => void;
  onOpenLeverageModal: (company: PortfolioCompany) => void;
  onEnterIC?: (company: PortfolioCompany) => void;
  // Owned actions
  onReviewPerformance: (companyId: number) => void;
  onOperationalImprovement: (companyId: number) => void;
  onRefinanceDebt: (companyId: number) => void;
  onDividendRecap: (companyId: number) => void;
  onPrepareForExit: (companyId: number) => void;
  // Exiting actions
  onListForSale: (companyId: number) => void;
  onNegotiate: (company: PortfolioCompany) => void;
  onIPOPrep: (company: PortfolioCompany) => void;
  onCancelExit: (companyId: number) => void;
  // Helpers
  hasUsedActionThisWeek: (company: PortfolioCompany, actionType: string) => boolean;
}

export const DealPhaseActions: React.FC<DealPhaseActionsProps> = memo(({
  company,
  playerStats,
  tutorialStep,
  isMarketPanic,
  analyzingIds,
  onAnalyze,
  onSubmitIOI,
  onWalkAway,
  onOpenLeverageModal,
  onEnterIC,
  onReviewPerformance,
  onOperationalImprovement,
  onRefinanceDebt,
  onDividendRecap,
  onPrepareForExit,
  onListForSale,
  onNegotiate,
  onIPOPrep,
  onCancelExit,
  hasUsedActionThisWeek,
}) => {
  const status = getCompanyStatus(company);
  const actionsRemaining = playerStats.gameTime?.actionsRemaining || 0;

  return (
    <div className={`
      p-4 bg-gradient-to-t from-slate-900 to-slate-900/95 border-t border-slate-700/60
      absolute bottom-0 left-0 right-0 md:relative
      ${(tutorialStep >= 3 && tutorialStep <= 6) ? 'z-[70] relative' : ''}
    `}>
      {/* Status Badge */}
      <div className="flex items-center justify-between mb-3">
        <div className={`
          px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border
          ${status === 'PIPELINE' ? 'bg-blue-950/50 text-blue-400 border-blue-700/50' : ''}
          ${status === 'OWNED' ? 'bg-emerald-950/50 text-emerald-400 border-emerald-700/50' : ''}
          ${status === 'EXITING' ? 'bg-amber-950/50 text-amber-400 border-amber-700/50' : ''}
        `}>
          <i className={`fas mr-1.5 ${
            status === 'PIPELINE' ? 'fa-search' :
            status === 'OWNED' ? 'fa-building' : 'fa-sign-out-alt'
          }`}></i>
          {status}
        </div>
        {actionsRemaining === 0 && tutorialStep === 0 && (
          <span className="text-xs text-red-400 font-bold">
            <i className="fas fa-exclamation-circle mr-1"></i>
            NO ACTIONS - ADVANCE WEEK
          </span>
        )}
      </div>

      {/* PIPELINE Actions */}
      {status === 'PIPELINE' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            data-tutorial={tutorialStep === 3 ? 'diligence-btn' : undefined}
            onClick={() => onAnalyze(company.id)}
            disabled={analyzingIds.includes(company.id) || company.isAnalyzed || (tutorialStep === 0 && actionsRemaining < 1)}
            className={`
              relative border rounded-lg flex flex-col items-center justify-center p-4 transition-all duration-200
              ${tutorialStep === 3
                ? 'bg-amber-950/50 border-amber-500 text-amber-400'
                : 'bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500'
              }
              ${(analyzingIds.includes(company.id) || company.isAnalyzed || (tutorialStep === 0 && actionsRemaining < 1)) ? 'opacity-40 cursor-not-allowed' : ''}
            `}
          >
            {analyzingIds.includes(company.id) ? (
              <div className="w-5 h-5 border-2 border-slate-600 border-t-amber-500 rounded-full animate-spin"></div>
            ) : (
              <i className="fas fa-search text-lg mb-2"></i>
            )}
            <span className="text-[10px] font-bold uppercase tracking-wider">Diligence</span>
            <span className="text-[8px] text-slate-500 mt-0.5">(1 AP)</span>
          </button>

          <button
            onClick={() => onSubmitIOI(company.id)}
            disabled={(!company.isAnalyzed && tutorialStep === 0) || isMarketPanic || (tutorialStep === 0 && actionsRemaining < 1) || (tutorialStep === 0 && company.isAnalyzed && !company.leverageModelViewed)}
            title={
              isMarketPanic
                ? 'Market is frozen during panic - wait for stability'
                : tutorialStep === 0 && company.isAnalyzed && !company.leverageModelViewed
                  ? 'Run the Leverage Model first to unlock IOI submission'
                  : !company.isAnalyzed && tutorialStep === 0
                    ? 'Run Diligence first to analyze this deal'
                    : undefined
            }
            className={`
              border rounded-lg flex flex-col items-center justify-center p-4 transition-all duration-200
              ${tutorialStep === 6
                ? 'z-[70] relative bg-emerald-900/50 border-emerald-500 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)] animate-pulse-glow'
                : 'bg-emerald-950/30 border-emerald-700/50 text-emerald-400 hover:bg-emerald-900/40 hover:border-emerald-600'
              }
              ${((!company.isAnalyzed && tutorialStep === 0) || isMarketPanic || (tutorialStep === 0 && actionsRemaining < 1) || (tutorialStep === 0 && company.isAnalyzed && !company.leverageModelViewed)) ? 'opacity-30 grayscale cursor-not-allowed' : ''}
            `}
          >
            <i className={`fas ${isMarketPanic ? 'fa-snowflake' : tutorialStep === 0 && company.isAnalyzed && !company.leverageModelViewed ? 'fa-lock' : 'fa-clipboard-check'} text-lg mb-2`}></i>
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {isMarketPanic ? "Market Frozen" : tutorialStep === 0 && company.isAnalyzed && !company.leverageModelViewed ? "Locked" : "Submit IOI"}
            </span>
            {isMarketPanic ? (
              <span className="text-[9px] text-blue-400 mt-0.5">Wait for stability</span>
            ) : tutorialStep === 0 && company.isAnalyzed && !company.leverageModelViewed ? (
              <span className="text-[9px] text-amber-400 mt-0.5 font-medium animate-pulse">Run Model First</span>
            ) : !company.isAnalyzed && tutorialStep === 0 ? (
              <span className="text-[9px] text-amber-400 mt-0.5">Run Diligence First</span>
            ) : (
              <span className="text-[8px] text-slate-500 mt-0.5">(1 AP)</span>
            )}
          </button>

          <button
            onClick={() => onWalkAway(company.id)}
            disabled={tutorialStep !== 0 || actionsRemaining < 1}
            className="border border-red-800/50 bg-red-950/30 text-red-400 hover:bg-red-900/40 flex flex-col items-center justify-center p-4 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <i className="fas fa-door-open text-lg mb-2"></i>
            <span className="text-[10px] font-bold uppercase tracking-wider">Walk Away</span>
            <span className="text-[8px] text-slate-500 mt-0.5">(1 AP)</span>
          </button>

          {/* LEVERAGE button - only available for ANALYZED deals */}
          {company.isAnalyzed && (
            <button
              data-tutorial="leverage-btn"
              onClick={() => onOpenLeverageModal(company)}
              disabled={hasUsedActionThisWeek(company, 'LEVERAGE')}
              className={`
                border rounded-lg flex flex-col items-center justify-center p-4 transition-all col-span-2 md:col-span-1
                ${!company.leverageModelViewed && tutorialStep === 0
                  ? 'border-cyan-400 bg-cyan-950/50 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.4)] animate-pulse ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900'
                  : 'border-purple-700/50 bg-purple-950/30 text-purple-400 hover:bg-purple-900/40'
                }
                ${hasUsedActionThisWeek(company, 'LEVERAGE') ? 'opacity-40 cursor-not-allowed' : ''}
              `}
            >
              <i className={`fas fa-calculator text-lg mb-2 ${!company.leverageModelViewed && tutorialStep === 0 ? 'animate-bounce' : ''}`}></i>
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {!company.leverageModelViewed && tutorialStep === 0 ? 'Run Model' : 'Leverage Model'}
              </span>
              <span className={`text-[8px] mt-0.5 ${!company.leverageModelViewed && tutorialStep === 0 ? 'text-cyan-300 font-bold' : 'text-emerald-500'}`}>
                {!company.leverageModelViewed && tutorialStep === 0 ? 'REQUIRED TO UNLOCK IOI' : '(Free)'}
              </span>
            </button>
          )}

          {/* IC PITCH button - available after leverage model is viewed */}
          {company.isAnalyzed && company.leverageModelViewed && onEnterIC && (
            <button
              onClick={() => onEnterIC(company)}
              disabled={actionsRemaining < 1 || isMarketPanic}
              className={`
                border rounded-lg flex flex-col items-center justify-center p-4 transition-all col-span-2 md:col-span-1
                border-amber-500/70 bg-amber-950/40 text-amber-400 hover:bg-amber-900/50 hover:border-amber-400
                shadow-[0_0_15px_rgba(245,158,11,0.2)]
                ${(actionsRemaining < 1 || isMarketPanic) ? 'opacity-40 cursor-not-allowed' : ''}
              `}
            >
              <i className="fas fa-users text-lg mb-2"></i>
              <span className="text-[10px] font-bold uppercase tracking-wider">Enter IC</span>
              <span className="text-[8px] text-amber-300 mt-0.5">Pitch to Partners</span>
            </button>
          )}
        </div>
      )}

      {/* OWNED Actions */}
      {status === 'OWNED' && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <button
            onClick={() => onReviewPerformance(company.id)}
            disabled={actionsRemaining < 1}
            className="border border-blue-700/50 bg-blue-950/30 text-blue-400 hover:bg-blue-900/40 flex flex-col items-center justify-center p-3 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <i className="fas fa-chart-bar text-base mb-1"></i>
            <span className="text-[9px] font-bold uppercase tracking-wider">Review</span>
            <span className="text-[7px] text-slate-500">(1 AP)</span>
          </button>

          <button
            onClick={() => onOperationalImprovement(company.id)}
            disabled={actionsRemaining < 1}
            className="border border-emerald-700/50 bg-emerald-950/30 text-emerald-400 hover:bg-emerald-900/40 flex flex-col items-center justify-center p-3 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <i className="fas fa-cogs text-base mb-1"></i>
            <span className="text-[9px] font-bold uppercase tracking-wider">Improve</span>
            <span className="text-[7px] text-slate-500">(1 AP)</span>
          </button>

          <button
            onClick={() => onRefinanceDebt(company.id)}
            disabled={actionsRemaining < 1 || company.debt <= 0}
            className="border border-purple-700/50 bg-purple-950/30 text-purple-400 hover:bg-purple-900/40 flex flex-col items-center justify-center p-3 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <i className="fas fa-sync-alt text-base mb-1"></i>
            <span className="text-[9px] font-bold uppercase tracking-wider">Refinance</span>
            <span className="text-[7px] text-slate-500">(1 AP)</span>
          </button>

          <button
            onClick={() => onDividendRecap(company.id)}
            disabled={actionsRemaining < 1}
            className="border border-amber-700/50 bg-amber-950/30 text-amber-400 hover:bg-amber-900/40 flex flex-col items-center justify-center p-3 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <i className="fas fa-money-bill-wave text-base mb-1"></i>
            <span className="text-[9px] font-bold uppercase tracking-wider">Dividend</span>
            <span className="text-[7px] text-red-400">(1 AP)</span>
          </button>

          <button
            onClick={() => onPrepareForExit(company.id)}
            disabled={actionsRemaining < 2}
            className="border border-cyan-700/50 bg-cyan-950/30 text-cyan-400 hover:bg-cyan-900/40 flex flex-col items-center justify-center p-3 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <i className="fas fa-sign-out-alt text-base mb-1"></i>
            <span className="text-[9px] font-bold uppercase tracking-wider">Prep Exit</span>
            <span className="text-[7px] text-slate-500">(2 AP)</span>
          </button>
        </div>
      )}

      {/* EXITING Actions */}
      {status === 'EXITING' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => onListForSale(company.id)}
            disabled={actionsRemaining < 2}
            className="border border-emerald-700/50 bg-emerald-950/30 text-emerald-400 hover:bg-emerald-900/40 flex flex-col items-center justify-center p-4 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <i className="fas fa-tag text-lg mb-2"></i>
            <span className="text-[10px] font-bold uppercase tracking-wider">List for Sale</span>
            <span className="text-[8px] text-slate-500 mt-0.5">(2 AP)</span>
          </button>

          <button
            onClick={() => onNegotiate(company)}
            disabled={actionsRemaining < 1}
            className="border border-blue-700/50 bg-blue-950/30 text-blue-400 hover:bg-blue-900/40 flex flex-col items-center justify-center p-4 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <i className="fas fa-handshake text-lg mb-2"></i>
            <span className="text-[10px] font-bold uppercase tracking-wider">Negotiate</span>
            <span className="text-[8px] text-slate-500 mt-0.5">(1 AP)</span>
          </button>

          <button
            onClick={() => onIPOPrep(company)}
            disabled={actionsRemaining < 2}
            className="border border-amber-700/50 bg-amber-950/30 text-amber-400 hover:bg-amber-900/40 flex flex-col items-center justify-center p-4 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <i className="fas fa-bullhorn text-lg mb-2"></i>
            <span className="text-[10px] font-bold uppercase tracking-wider">IPO Prep</span>
            <span className="text-[8px] text-slate-500 mt-0.5">(2 AP)</span>
          </button>

          <button
            onClick={() => onCancelExit(company.id)}
            disabled={actionsRemaining < 1}
            className="border border-red-800/50 bg-red-950/30 text-red-400 hover:bg-red-900/40 flex flex-col items-center justify-center p-4 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <i className="fas fa-undo text-lg mb-2"></i>
            <span className="text-[10px] font-bold uppercase tracking-wider">Cancel Exit</span>
            <span className="text-[8px] text-slate-500 mt-0.5">(1 AP)</span>
          </button>
        </div>
      )}
    </div>
  );
});

DealPhaseActions.displayName = 'DealPhaseActions';

export default DealPhaseActions;
