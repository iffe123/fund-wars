import React, { useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { TerminalButton, TerminalPanel } from './TerminalUI';
import type { PortfolioCompany, CompanyStatus } from '../types';
import { getCompanyStatus } from '../utils/worldEngine';

interface PortfolioCommandCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToAssets: () => void;
}

// Helper to format money values
const formatMoney = (value: number): string => {
  if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
};

// KPI Component
const KPI: React.FC<{
  label: string;
  value: string | number;
  trend?: number;
  trendColor?: 'green' | 'red' | 'neutral';
}> = ({ label, value, trend, trendColor = 'neutral' }) => {
  const getTrendIcon = () => {
    if (trend === undefined || trend === 0) return null;
    if (trend > 0) return <i className="fas fa-arrow-up text-[8px]"></i>;
    return <i className="fas fa-arrow-down text-[8px]"></i>;
  };

  const getTrendColorClass = () => {
    if (trendColor === 'green' || (trendColor === 'neutral' && trend && trend > 0)) {
      return 'text-green-400';
    }
    if (trendColor === 'red' || (trendColor === 'neutral' && trend && trend < 0)) {
      return 'text-red-400';
    }
    return 'text-slate-400';
  };

  return (
    <div className="text-center">
      <div className="text-[10px] text-slate-500 uppercase tracking-wide">{label}</div>
      <div className="text-xs font-bold text-white flex items-center justify-center gap-1">
        {value}
        {trend !== undefined && (
          <span className={`${getTrendColorClass()}`}>
            {getTrendIcon()}
            {trend !== 0 && <span className="text-[8px]">{Math.abs(trend * 100).toFixed(0)}%</span>}
          </span>
        )}
      </div>
    </div>
  );
};

const PortfolioCommandCenter: React.FC<PortfolioCommandCenterProps> = ({ isOpen, onClose, onJumpToAssets }) => {
  const { playerStats, updatePlayerStats, addLogEntry, tutorialStep, setTutorialStep } = useGame();

  const companies = playerStats?.portfolio || [];
  const currentWeek = playerStats?.timeCursor || 0;

  // Status badge colors
  const statusColors: Record<CompanyStatus, string> = {
    PIPELINE: 'bg-blue-900/50 text-blue-400 border-blue-500/50',
    OWNED: 'bg-green-900/50 text-green-400 border-green-500/50',
    EXITING: 'bg-purple-900/50 text-purple-400 border-purple-500/50',
  };

  // Get actions based on company status
  const getPipelineActions = (company: PortfolioCompany) => [
    {
      label: company.isAnalyzed ? 'Refresh Diligence' : 'Analyze File',
      icon: 'fa-search',
      onClick: () => {
        updatePlayerStats({
          modifyCompany: { id: company.id, updates: { isAnalyzed: true, latestCeoReport: 'Gemini flagged a patent footnote. Valuation sensitivity updated.' } },
          reputation: +2,
        });
        addLogEntry(`Diligence refreshed for ${company.name}`);
        if (!company.isAnalyzed && tutorialStep === 3) setTutorialStep(4);
      },
    },
    {
      label: 'Submit IOI',
      icon: 'fa-file-signature',
      disabled: !company.isAnalyzed,
      tooltip: company.isAnalyzed ? 'Move to deal execution' : 'Analyze first',
      onClick: () => {
        onJumpToAssets();
        if (tutorialStep > 0) {
          setTutorialStep(6);
        }
      },
    },
    {
      label: 'Walk Away',
      icon: 'fa-door-open',
      onClick: () => {
        updatePlayerStats({
          portfolio: companies.filter(c => c.id !== company.id),
          reputation: -2,
        });
        addLogEntry(`Walked away from ${company.name} deal`);
      },
    },
  ];

  const getOwnedCompanyActions = (company: PortfolioCompany) => [
    {
      label: 'Review Financials',
      icon: 'fa-chart-line',
      onClick: () => {
        updatePlayerStats({
          modifyCompany: { id: company.id, updates: { lastFinancialUpdate: currentWeek } },
          stress: +3,
        });
        addLogEntry(`Reviewed ${company.name} quarterly financials`);
      },
    },
    {
      label: company.hasBoardCrisis ? 'Enter Board War' : 'Board Meeting',
      icon: company.hasBoardCrisis ? 'fa-gavel' : 'fa-users',
      highlight: company.hasBoardCrisis,
      onClick: () => {
        updatePlayerStats({
          modifyCompany: { id: company.id, updates: { hasBoardCrisis: false } },
          stress: company.hasBoardCrisis ? -5 : +5,
          reputation: company.hasBoardCrisis ? +6 : +2,
        });
        addLogEntry(company.hasBoardCrisis ? `Resolved board crisis at ${company.name}` : `Attended board meeting at ${company.name}`);
      },
    },
    {
      label: 'Strategic Initiative',
      icon: 'fa-lightbulb',
      onClick: () => {
        updatePlayerStats({
          modifyCompany: { id: company.id, updates: { revenueGrowth: company.revenueGrowth + 0.02 } },
          cash: -50000,
          stress: +5,
        });
        addLogEntry(`Launched strategic initiative at ${company.name}`);
      },
    },
    {
      label: 'CEO Call',
      icon: 'fa-phone',
      onClick: () => {
        updatePlayerStats({
          modifyCompany: { id: company.id, updates: { ceoPerformance: Math.min(100, (company.ceoPerformance || 70) + 5) } },
          energy: -5,
        });
        addLogEntry(`Had alignment call with ${company.ceo}`);
      },
    },
    {
      label: 'Prepare Exit',
      icon: 'fa-sign-out-alt',
      onClick: () => {
        updatePlayerStats({
          modifyCompany: { id: company.id, updates: { isInExitProcess: true } },
          stress: +10,
        });
        addLogEntry(`Initiated exit process for ${company.name}`);
      },
    },
  ];

  const getExitingActions = (company: PortfolioCompany) => [
    {
      label: 'Continue Exit Process',
      icon: 'fa-forward',
      onClick: () => {
        onJumpToAssets();
      },
    },
    {
      label: 'Cancel Exit',
      icon: 'fa-ban',
      onClick: () => {
        updatePlayerStats({
          modifyCompany: { id: company.id, updates: { isInExitProcess: false, exitType: undefined } },
          reputation: -5,
        });
        addLogEntry(`Cancelled exit process for ${company.name}`);
      },
    },
  ];

  const actionGrid = useMemo(() => {
    return companies.map((company) => {
      // Determine company status - safely handle missing fields
      const status = company.isInExitProcess ? 'EXITING' :
                    company.dealClosed !== false ? 'OWNED' : 'PIPELINE';

      let actions;
      switch (status) {
        case 'PIPELINE':
          actions = getPipelineActions(company);
          break;
        case 'EXITING':
          actions = getExitingActions(company);
          break;
        case 'OWNED':
        default:
          actions = getOwnedCompanyActions(company);
          break;
      }

      return { company, actions, status };
    });
  }, [companies, tutorialStep, currentWeek, updatePlayerStats, addLogEntry, onJumpToAssets, setTutorialStep]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <TerminalPanel title="PORTFOLIO_COMMAND_CENTER" className="h-auto">
          <div className="p-4 space-y-4">
            <div className="text-xs text-slate-400 font-mono border border-amber-500/40 bg-amber-950/20 p-3 rounded">
              Quick-launch actions for every company. Pipeline companies need analysis before IOI. Owned companies require active management. Exiting companies are preparing for sale.
            </div>

            {/* Status legend */}
            <div className="flex gap-4 text-[10px]">
              <div className="flex items-center gap-1">
                <span className={`px-2 py-0.5 rounded border ${statusColors.PIPELINE}`}>PIPELINE</span>
                <span className="text-slate-500">Evaluating</span>
              </div>
              <div className="flex items-center gap-1">
                <span className={`px-2 py-0.5 rounded border ${statusColors.OWNED}`}>OWNED</span>
                <span className="text-slate-500">In portfolio</span>
              </div>
              <div className="flex items-center gap-1">
                <span className={`px-2 py-0.5 rounded border ${statusColors.EXITING}`}>EXITING</span>
                <span className="text-slate-500">Exit in progress</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {actionGrid.map(({ company, actions, status }) => (
                <div key={company.id} className="border border-slate-700 bg-black/70 p-3 rounded space-y-2 shadow-lg">
                  {/* Status Header */}
                  <div className="flex justify-between items-start">
                    <span className={`text-[10px] px-2 py-0.5 rounded border ${statusColors[status]}`}>{status}</span>
                    <div className="flex gap-1">
                      {company.hasBoardCrisis && (
                        <span className="text-[10px] bg-red-900/30 text-red-400 px-2 py-0.5 rounded border border-red-500/50">CRISIS</span>
                      )}
                      {company.activeEvent && (
                        <span className="text-[10px] bg-amber-900/30 text-amber-400 px-2 py-0.5 rounded border border-amber-500/50 animate-pulse">EVENT</span>
                      )}
                    </div>
                  </div>

                  {/* Company name and valuation */}
                  <div>
                    <div className="text-sm font-bold text-white">{company.name}</div>
                    <div className="text-[11px] text-slate-500">Valuation {formatMoney(company.currentValuation)}</div>
                  </div>

                  {/* KPIs - only show for owned companies */}
                  {status === 'OWNED' && (
                    <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-700/50">
                      <KPI
                        label="Revenue"
                        value={formatMoney(company.revenue)}
                        trend={company.revenueGrowth}
                        trendColor={company.revenueGrowth > 0 ? 'green' : 'red'}
                      />
                      <KPI
                        label="EBITDA"
                        value={formatMoney(company.ebitda)}
                        trend={company.ebitdaMargin}
                      />
                      <KPI
                        label="Employees"
                        value={company.employeeCount || '-'}
                        trend={company.employeeGrowth}
                      />
                    </div>
                  )}

                  {/* CEO info */}
                  <div className="text-[11px] text-slate-500 flex items-center gap-2">
                    <i className="fas fa-user-tie text-slate-600"></i>
                    CEO: {company.ceo}
                    {company.ceoPerformance !== undefined && (
                      <span className={`ml-auto ${company.ceoPerformance > 70 ? 'text-green-400' : company.ceoPerformance < 40 ? 'text-red-400' : 'text-amber-400'}`}>
                        {company.ceoPerformance}%
                      </span>
                    )}
                  </div>

                  {/* Next Event indicator */}
                  {company.activeEvent && (
                    <div className="text-xs p-2 bg-slate-800 rounded border border-slate-700/50">
                      <div className="flex items-center gap-2">
                        <i className="fas fa-exclamation-circle text-amber-400"></i>
                        <span className="text-amber-300">{company.activeEvent.title}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        Expires in {company.activeEvent.expiresWeek - currentWeek} week{company.activeEvent.expiresWeek - currentWeek !== 1 ? 's' : ''}
                      </div>
                    </div>
                  )}

                  {/* Actions grid */}
                  <div className="grid grid-cols-1 gap-1.5 pt-2">
                    {actions.map((action) => (
                      <button
                        key={action.label}
                        onClick={action.onClick}
                        disabled={action.disabled}
                        title={action.tooltip}
                        className={`border px-3 py-2 text-left text-[11px] uppercase tracking-wide rounded transition-all flex items-center gap-2 ${
                          action.disabled
                            ? 'border-slate-800 bg-slate-900 text-slate-600 cursor-not-allowed'
                            : action.highlight
                            ? 'border-red-500/60 bg-red-900/20 hover:border-red-400 hover:bg-red-900/30 text-red-400'
                            : 'border-amber-500/60 bg-slate-900 hover:border-amber-400 hover:bg-amber-900/20 text-amber-400'
                        }`}
                      >
                        {action.icon && <i className={`fas ${action.icon} text-[10px] w-4`}></i>}
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {companies.length === 0 && (
              <div className="text-center text-slate-500 text-sm py-6 border border-dashed border-slate-700">
                No portfolio yet. Close a deal in Assets to populate this dashboard.
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-2">
              <TerminalButton label="CLOSE" icon="fa-times" onClick={onClose} />
            </div>
          </div>
        </TerminalPanel>
      </div>
    </div>
  );
};

export default PortfolioCommandCenter;
