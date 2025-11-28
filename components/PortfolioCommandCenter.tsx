import React, { useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { TerminalButton, TerminalPanel } from './TerminalUI';

interface PortfolioCommandCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToAssets: () => void;
}

const PortfolioCommandCenter: React.FC<PortfolioCommandCenterProps> = ({ isOpen, onClose, onJumpToAssets }) => {
  const { playerStats, updatePlayerStats, addLogEntry, setTutorialStep } = useGame();

  const companies = playerStats?.portfolio || [];

  const actionGrid = useMemo(() => {
    return companies.map((company) => {
      const actions = [] as { label: string; onClick: () => void; disabled?: boolean; tooltip?: string }[];

      actions.push({
        label: company.isAnalyzed ? 'Refresh Diligence' : 'Analyze File',
        onClick: () => {
          updatePlayerStats({
            modifyCompany: { id: company.id, updates: { isAnalyzed: true, latestCeoReport: 'Gemini flagged a patent footnote. Valuation sensitivity updated.' } },
            reputation: +2,
          });
          addLogEntry(`Diligence refreshed for ${company.name}`);
          if (!company.isAnalyzed) setTutorialStep(4);
        },
      });

      actions.push({
        label: company.hasBoardCrisis ? 'Enter Board War' : 'Pre-Brief CEO',
        tooltip: company.hasBoardCrisis ? 'Jump into the board fight' : 'Keep the CEO aligned before activists show up',
        onClick: () => {
          updatePlayerStats({
            modifyCompany: { id: company.id, updates: { hasBoardCrisis: false } },
            stress: company.hasBoardCrisis ? -5 : -2,
            reputation: company.hasBoardCrisis ? +6 : +2,
          });
          addLogEntry(company.hasBoardCrisis ? `Resolved board crisis at ${company.name}` : `Pre-briefed ${company.ceo}`);
        },
      });

      actions.push({
        label: 'Submit IOI',
        disabled: !company.isAnalyzed,
        tooltip: company.isAnalyzed ? 'Move to deal execution' : 'Analyze first',
        onClick: () => {
          onJumpToAssets();
          setTutorialStep(6);
        },
      });

      return { company, actions };
    });
  }, [companies, updatePlayerStats, addLogEntry, onJumpToAssets, setTutorialStep]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        <TerminalPanel title="PORTFOLIO_COMMAND_CENTER" className="h-auto">
          <div className="p-4 space-y-4">
            <div className="text-xs text-slate-400 font-mono border border-amber-500/40 bg-amber-950/20 p-3 rounded">
              Quick-launch actions for every company. Use this board to rally the team, hit diligence, or jump to IOI without hunting through tabs.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {actionGrid.map(({ company, actions }) => (
                <div key={company.id} className="border border-slate-700 bg-black/70 p-3 rounded space-y-2 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-white">{company.name}</div>
                      <div className="text-[11px] text-slate-500">Valuation ${(company.currentValuation / 1000000).toFixed(1)}M</div>
                    </div>
                    {company.hasBoardCrisis && <span className="text-[10px] bg-red-900/30 text-red-400 px-2 py-1 rounded">CRISIS</span>}
                  </div>
                  <div className="text-[11px] text-slate-500">CEO: {company.ceo}</div>

                  <div className="grid grid-cols-1 gap-2">
                    {actions.map((action) => (
                      <button
                        key={action.label}
                        onClick={action.onClick}
                        disabled={action.disabled}
                        title={action.tooltip}
                        className={`border px-3 py-2 text-left text-[11px] uppercase tracking-wide rounded transition-all ${
                          action.disabled
                            ? 'border-slate-800 bg-slate-900 text-slate-600 cursor-not-allowed'
                            : 'border-amber-500/60 bg-slate-900 hover:border-amber-400 hover:bg-amber-900/20 text-amber-400'
                        }`}
                      >
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
