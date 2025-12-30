import React, { useCallback, memo } from 'react';
import type { PortfolioCompany, CompanyStatus } from '../../types';
import { Badge } from '../TerminalUI';
import { getCompanyStatus } from '../../utils/worldEngine';

interface CompanyListProps {
  companies: PortfolioCompany[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  analyzingIds: number[];
  tutorialStep: number;
  onTutorialAdvance?: () => void;
  onBack?: () => void;
}

export const CompanyList: React.FC<CompanyListProps> = memo(({
  companies,
  selectedId,
  onSelect,
  analyzingIds,
  tutorialStep,
  onTutorialAdvance,
  onBack,
}) => {
  // Memoize formatting functions
  const formatMoney = useCallback((val: number) => `$${(val / 1000000).toFixed(1)}M`, []);

  // Memoize deal type styling function
  const getDealTypeStyle = useCallback((dealType: string) => {
    switch (dealType) {
      case 'LBO': return 'bg-purple-900/30 text-purple-400 border-purple-700/50';
      case 'GROWTH': return 'bg-emerald-900/30 text-emerald-400 border-emerald-700/50';
      case 'DISTRESSED': return 'bg-red-900/30 text-red-400 border-red-700/50';
      case 'DEBT': return 'bg-amber-900/30 text-amber-400 border-amber-700/50';
      default: return 'bg-slate-800/50 text-slate-400 border-slate-600/50';
    }
  }, []);

  const handleCompanyClick = useCallback((companyId: number, isTutorialTarget: boolean) => {
    onSelect(companyId);
    if (isTutorialTarget && tutorialStep === 2 && onTutorialAdvance) {
      onTutorialAdvance();
    }
  }, [onSelect, tutorialStep, onTutorialAdvance]);

  // Empty state
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mb-4 border border-slate-700/50">
        <i className="fas fa-folder-open text-4xl text-slate-400"></i>
      </div>
      <h3 className="text-lg font-bold text-slate-300 mb-2">Portfolio Empty</h3>
      <p className="text-slate-500 text-sm max-w-xs mb-6">
        No active investments yet. Source deals from the Deal Market and win auctions to build your portfolio.
      </p>
      {onBack && (
        <button
          onClick={onBack}
          className="bg-amber-500 hover:bg-amber-400 text-black px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-colors shadow-lg shadow-amber-500/20"
        >
          <i className="fas fa-gavel mr-2"></i>
          Browse Deal Market
        </button>
      )}
      <div className="mt-6 p-4 bg-slate-800/30 rounded-lg border border-slate-700/30 max-w-xs">
        <div className="flex items-start gap-2 text-xs text-slate-400">
          <i className="fas fa-lightbulb text-amber-500/70 mt-0.5"></i>
          <span>Tip: Deals appear when you advance time. Win auctions to add companies to your portfolio.</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`${selectedId ? 'md:w-1/2 hidden md:flex' : 'w-full flex'} border-r border-slate-700/50 flex-col transition-all bg-black/50 overflow-hidden`}>
      <div className="bg-gradient-to-r from-slate-800/80 to-slate-800/60 px-4 py-2 text-[11px] uppercase text-slate-400 font-bold border-b border-slate-700/60 shrink-0 flex items-center gap-2">
        <i className="fas fa-folder-open text-amber-500/70 text-xs"></i>
        Active Holdings
        <Badge variant="default" size="sm">{companies.length}</Badge>
      </div>

      <div className="overflow-auto custom-scrollbar flex-1 p-0 md:p-0">
        {/* MOBILE CARDS VIEW */}
        <div className="md:hidden p-4 space-y-3">
          {companies.length === 0 && renderEmptyState()}
          {companies.map(company => {
            const isTutorialTarget = tutorialStep === 2 && company.name.includes("PackFancy");
            return (
              <div
                key={company.id}
                data-tutorial={isTutorialTarget ? 'deal-card' : undefined}
                onClick={() => handleCompanyClick(company.id, isTutorialTarget)}
                className={`
                  card-elevated rounded-lg p-4 relative overflow-hidden cursor-pointer
                  transition-all duration-200 hover:border-slate-600
                  ${isTutorialTarget ? 'ring-2 ring-amber-500/50' : ''}
                `}
              >
                {/* Status indicators */}
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  {company.isAnalyzed && (
                    <div className="w-6 h-6 rounded-full bg-emerald-900/50 flex items-center justify-center">
                      <i className="fas fa-check text-emerald-400 text-[10px]"></i>
                    </div>
                  )}
                  {company.hasBoardCrisis && (
                    <div className="w-6 h-6 rounded-full bg-red-900/50 flex items-center justify-center animate-pulse">
                      <i className="fas fa-exclamation text-red-400 text-[10px]"></i>
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <h3 className="font-bold text-white text-base mb-1">{company.name}</h3>
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getDealTypeStyle(company.dealType)}`}>
                    {company.dealType}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-slate-800/50 rounded-lg p-2">
                    <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-0.5">Valuation</div>
                    <div className="text-emerald-400 font-bold tabular-nums">{formatMoney(company.currentValuation)}</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-2">
                    <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-0.5">EBITDA</div>
                    <div className="text-slate-200 font-bold tabular-nums">{formatMoney(company.ebitda)}</div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-500">
                  <span>Debt: <span className="text-red-400">{formatMoney(company.debt)}</span></span>
                  <i className="fas fa-chevron-right"></i>
                </div>
              </div>
            );
          })}
        </div>

        {/* DESKTOP TABLE VIEW */}
        <table className="hidden md:table w-full text-left border-collapse">
          <thead className="bg-gradient-to-r from-slate-800/80 to-slate-800/60 text-slate-400 text-[11px] uppercase sticky top-0 z-10">
            <tr>
              <th className="p-3 border-b border-slate-700/60 font-bold tracking-wider">Asset Name</th>
              <th className="p-3 border-b border-slate-700/60 font-bold tracking-wider">Type</th>
              <th className="p-3 border-b border-slate-700/60 text-right font-bold tracking-wider">Valuation</th>
              <th className="p-3 border-b border-slate-700/60 text-right font-bold tracking-wider">EBITDA</th>
              <th className="p-3 border-b border-slate-700/60 text-center font-bold tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="text-slate-300">
            {companies.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8">
                  {renderEmptyState()}
                </td>
              </tr>
            )}
            {companies.map(company => {
              const isSelected = selectedId === company.id;
              const isTutorialTarget = tutorialStep === 2 && company.name.includes("PackFancy");
              const status = getCompanyStatus(company);

              return (
                <tr
                  key={company.id}
                  onClick={() => handleCompanyClick(company.id, isTutorialTarget)}
                  className={`
                    cursor-pointer transition-all duration-150 group
                    ${isSelected ? 'bg-slate-800/80' : 'hover:bg-slate-800/40'}
                    ${isTutorialTarget ? 'z-[70] relative bg-slate-800 ring-2 ring-amber-500' : ''}
                  `}
                >
                  <td className="p-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <span className={`text-amber-500 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}>
                        <i className="fas fa-chevron-right text-[10px]"></i>
                      </span>
                      <span className={`font-bold ${isSelected ? 'text-amber-400' : 'text-white'}`}>
                        {company.name}
                      </span>
                      {company.isAnalyzed && (
                        <div className="w-5 h-5 rounded-full bg-emerald-900/50 flex items-center justify-center">
                          <i className="fas fa-check text-emerald-400 text-[9px]"></i>
                        </div>
                      )}
                      {company.hasBoardCrisis && (
                        <div className="w-5 h-5 rounded-full bg-red-900/50 flex items-center justify-center animate-pulse">
                          <i className="fas fa-exclamation text-red-400 text-[9px]"></i>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-3 border-b border-slate-800/80">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getDealTypeStyle(company.dealType)}`}>
                      {company.dealType}
                    </span>
                  </td>
                  <td className="p-3 border-b border-slate-800/80 text-right font-mono font-bold text-emerald-400 tabular-nums">
                    {formatMoney(company.currentValuation)}
                  </td>
                  <td className="p-3 border-b border-slate-800/80 text-right font-mono text-slate-300 tabular-nums">
                    {formatMoney(company.ebitda)}
                  </td>
                  <td className="p-3 border-b border-slate-800/80 text-center">
                    {company.hasBoardCrisis ? (
                      <Badge variant="danger" pulse>CRISIS</Badge>
                    ) : (
                      <span className={`
                        inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border
                        ${status === 'PIPELINE' ? 'bg-blue-950/50 text-blue-400 border-blue-700/50' : ''}
                        ${status === 'OWNED' ? 'bg-emerald-950/50 text-emerald-400 border-emerald-700/50' : ''}
                        ${status === 'EXITING' ? 'bg-amber-950/50 text-amber-400 border-amber-700/50' : ''}
                      `}>
                        <i className={`fas text-[8px] ${
                          status === 'PIPELINE' ? 'fa-search' :
                          status === 'OWNED' ? 'fa-building' : 'fa-sign-out-alt'
                        }`}></i>
                        {status}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
});

CompanyList.displayName = 'CompanyList';

export default CompanyList;
