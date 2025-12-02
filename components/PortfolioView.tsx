import React, { useState } from 'react';
import type { PortfolioCompany, PortfolioAction, PlayerStats } from '../types';
import { PORTFOLIO_ACTIONS, MARKET_VOLATILITY_STYLES } from '../constants';
import { TerminalButton, TerminalPanel, AsciiProgress, Badge } from './TerminalUI';
import { useGame } from '../context/GameContext';
import AuctionModal from './AuctionModal';
import BlackBoxModal from './BlackBoxModal';
import BoardBattleModal from './BoardBattleModal';

interface PortfolioViewProps {
  playerStats: PlayerStats;
  onAction: (companyId: number, action: PortfolioAction) => void;
  onBack: () => void;
  onJumpShip?: () => void;
  canAccessFounder?: boolean;
}

const PortfolioView: React.FC<PortfolioViewProps> = ({ playerStats, onAction, onBack, onJumpShip, canAccessFounder = false }) => {
  const { tutorialStep, updatePlayerStats, setTutorialStep, marketVolatility } = useGame();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [analyzingIds, setAnalyzingIds] = useState<number[]>([]);

  // New UI States
  const [showAuction, setShowAuction] = useState<PortfolioCompany | null>(null);
  const [showBlackBox, setShowBlackBox] = useState(false);
  const [showBoardBattle, setShowBoardBattle] = useState<PortfolioCompany | null>(null);

  const portfolio = playerStats.portfolio;
  const selectedCompany = portfolio.find(c => c.id === selectedId);

  // Market Cycle Modifiers
  const isMarketPanic = marketVolatility === 'PANIC' || marketVolatility === 'CREDIT_CRUNCH';

  const formatMoney = (val: number) => `$${(val / 1000000).toFixed(1)}M`;
  const formatPercent = (val: number) => `${(val * 100).toFixed(1)}%`;

  const handleAnalyze = (companyId: number) => {
    setAnalyzingIds(prev => [...prev, companyId]);

    // Simulate analysis delay
    setTimeout(() => {
      setAnalyzingIds(prev => prev.filter(id => id !== companyId));

      // BLACK BOX TRIGGER (5% Chance) - disabled during tutorial to avoid disrupting onboarding
      if (tutorialStep === 0 && Math.random() < 0.05) {
        setShowBlackBox(true);
        return;
      }

      // Mark company as analyzed in stats (simplified logic)
      updatePlayerStats({ modifyCompany: { id: companyId, updates: { isAnalyzed: true, latestCeoReport: "PATENT #8829 DISCOVERED: Hydrophobic Coating Tech. Valuation +40%." } }});

      if (tutorialStep === 3) {
        setTutorialStep(4);
      }
    }, 2000);
  };

  const handleSubmitIOI = (companyId: number) => {
    // TRIGGER LIVE AUCTION
    const company = portfolio.find(c => c.id === companyId);
    if (company && tutorialStep !== 6) { // Don't trigger auction on tutorial step
      setShowAuction(company);
      return;
    }

    // Default Logic (Tutorial or Fallback)
    if (tutorialStep === 6) {
      setTutorialStep(0);
    }
    const dummyAction: PortfolioAction = {
      id: 'submit_ioi',
      text: 'Submit IOI',
      description: 'Commit to the deal.',
      icon: 'fa-signature',
      outcome: { description: 'IOI Submitted.', statChanges: {}, logMessage: 'IOI Submitted' }
    };
    onAction(companyId, dummyAction);
  };

  const handleAuctionComplete = (success: boolean, finalBid: number) => {
    if (success && showAuction) {
      updatePlayerStats({ modifyCompany: { id: showAuction.id, updates: { investmentCost: finalBid } } });
      const dummyAction: PortfolioAction = {
        id: 'submit_ioi',
        text: 'Submit IOI',
        description: 'Commit to the deal.',
        icon: 'fa-signature',
        outcome: { description: `Auction Won at $${(finalBid/1000000).toFixed(1)}M`, statChanges: { reputation: +10 }, logMessage: `Won auction for ${showAuction.name}` }
      };
      onAction(showAuction.id, dummyAction);
    } else {
      updatePlayerStats({ reputation: -5, stress: +5 });
    }
    setShowAuction(null);
  };

  const handleBlackBoxResolve = (choice: 'IGNORE' | 'LEVERAGE' | 'WHISTLEBLOW') => {
    setShowBlackBox(false);
    if (choice === 'IGNORE') updatePlayerStats({ reputation: +5, stress: -5 });
    if (choice === 'LEVERAGE') updatePlayerStats({ reputation: +20, stress: +20, ethics: -50, setsFlags: ['HAS_BLACKMAIL_MATERIAL'] });
    if (choice === 'WHISTLEBLOW') {
      updatePlayerStats({ setsFlags: ['WHISTLEBLOWER'] });
    }
  };

  // Deal type styling
  const getDealTypeStyle = (dealType: string) => {
    switch (dealType) {
      case 'LBO': return 'bg-purple-900/30 text-purple-400 border-purple-700/50';
      case 'GROWTH': return 'bg-emerald-900/30 text-emerald-400 border-emerald-700/50';
      case 'DISTRESSED': return 'bg-red-900/30 text-red-400 border-red-700/50';
      case 'DEBT': return 'bg-amber-900/30 text-amber-400 border-amber-700/50';
      default: return 'bg-slate-800/50 text-slate-400 border-slate-600/50';
    }
  };

  return (
    <div className="h-full flex flex-col font-mono text-sm relative">
      {/* MARKET BANNER */}
      {marketVolatility !== 'NORMAL' && (
        <div className={`
          text-xs font-bold px-4 py-2 flex items-center justify-center gap-3
          border-b backdrop-blur-sm
          ${MARKET_VOLATILITY_STYLES[marketVolatility].color}
          ${marketVolatility === 'BULL_RUN' ? 'bg-emerald-950/50 border-emerald-800/50' : ''}
          ${marketVolatility === 'CREDIT_CRUNCH' ? 'bg-red-950/50 border-red-800/50' : ''}
          ${marketVolatility === 'PANIC' ? 'bg-amber-950/50 border-amber-800/50 animate-pulse' : ''}
        `}>
          <i className={`fas ${MARKET_VOLATILITY_STYLES[marketVolatility].icon} ${marketVolatility !== 'NORMAL' ? 'animate-pulse' : ''}`}></i>
          <span className="uppercase tracking-widest">MARKET ALERT: {marketVolatility.replace('_', ' ')}</span>
          <span className="opacity-70">// {MARKET_VOLATILITY_STYLES[marketVolatility].description.toUpperCase()}</span>
        </div>
      )}

      {/* TOOLBAR */}
      <div className="p-3 border-b border-slate-700/60 flex justify-between items-center bg-gradient-to-r from-slate-900 to-slate-900/95 shrink-0">
        <div className="flex gap-2">
          <TerminalButton label="REFRESH" icon="fa-rotate" size="sm" className="hidden md:inline-flex" />
          <TerminalButton label="DATA" icon="fa-database" size="sm" className="md:hidden inline-flex" />
          <TerminalButton label="EXPORT" icon="fa-file-export" size="sm" disabled className="hidden md:inline-flex" />
        </div>
        <div className="flex gap-2">
          {onJumpShip && (
            <TerminalButton
              label="FOUNDER_MODE"
              icon="fa-rocket"
              variant="warning"
              size="sm"
              glow={canAccessFounder}
              disabled={!canAccessFounder}
              title={canAccessFounder ? undefined : 'Increase your reputation to unlock Founder Mode'}
              onClick={() => {
                if (!canAccessFounder) return;
                onJumpShip();
              }}
            />
          )}
          <TerminalButton label="CLOSE" icon="fa-xmark" size="sm" onClick={onBack} />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* ASSET LIST */}
        <div className={`${selectedId ? 'md:w-1/2 hidden md:flex' : 'w-full flex'} border-r border-slate-700/50 flex-col transition-all bg-black/50 overflow-hidden`}>
          <div className="bg-gradient-to-r from-slate-800/80 to-slate-800/60 px-4 py-2 text-[11px] uppercase text-slate-400 font-bold border-b border-slate-700/60 shrink-0 flex items-center gap-2">
            <i className="fas fa-folder-open text-amber-500/70 text-xs"></i>
            Active Holdings
            <Badge variant="default" size="sm">{portfolio.length}</Badge>
          </div>

          <div className="overflow-auto custom-scrollbar flex-1 p-0 md:p-0">

            {/* MOBILE CARDS VIEW */}
            <div className="md:hidden p-4 space-y-3">
              {portfolio.length === 0 && (
                <div className="p-8 text-center">
                  <i className="fas fa-folder-open text-4xl text-slate-700 mb-3"></i>
                  <div className="text-slate-500 uppercase tracking-widest text-xs">No Assets Found</div>
                </div>
              )}
              {portfolio.map(company => {
                const isTutorialTarget = tutorialStep === 2 && company.name.includes("PackFancy");
                return (
                  <div
                    key={company.id}
                    onClick={() => {
                      setSelectedId(company.id);
                      if (tutorialStep === 2) setTutorialStep(3);
                    }}
                    className={`
                      card-elevated rounded-lg p-4 relative overflow-hidden cursor-pointer
                      transition-all duration-200 hover:border-slate-600
                      ${isTutorialTarget ? 'z-[70] ring-2 ring-amber-500 animate-border-glow' : ''}
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
                )
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
                {portfolio.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-12 text-center">
                      <i className="fas fa-folder-open text-4xl text-slate-700 mb-3 block"></i>
                      <div className="text-slate-500 uppercase tracking-widest text-xs">No Assets Found</div>
                    </td>
                  </tr>
                )}
                {portfolio.map(company => {
                  const isSelected = selectedId === company.id;
                  const isTutorialTarget = tutorialStep === 2 && company.name.includes("PackFancy");

                  return (
                    <tr
                      key={company.id}
                      onClick={() => {
                        setSelectedId(company.id);
                        if (tutorialStep === 2) setTutorialStep(3);
                      }}
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
                          <Badge variant="success">ACTIVE</Badge>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* DETAIL VIEW (Split on Desktop) */}
        {selectedCompany && (
          <div className={`
            md:w-1/2 flex flex-col
            absolute inset-0 md:static md:relative bg-black md:bg-transparent
            ${(tutorialStep >= 3 && tutorialStep <= 6) ? 'z-[60]' : 'z-50 md:z-0'}
            animate-fade-in
          `}>
            <div className="bg-gradient-to-r from-slate-800/90 to-slate-800/70 px-4 py-2 text-[11px] uppercase text-slate-400 font-bold border-b border-slate-700/60 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <i className="fas fa-building text-amber-500/70 text-xs"></i>
                <span>Asset Detail</span>
                <span className="text-amber-400">:: {selectedCompany.name.toUpperCase()}</span>
              </div>
              <button
                onClick={() => setSelectedId(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-700/50 transition-colors"
              >
                <i className="fas fa-xmark text-lg text-slate-400 hover:text-white"></i>
              </button>
            </div>

            <div className="p-4 overflow-auto custom-scrollbar flex-1 space-y-4 pb-28 md:pb-4">

              {/* CRISIS BANNER */}
              {selectedCompany.hasBoardCrisis && (
                <div className="bg-gradient-to-r from-red-950/80 to-red-900/60 rounded-lg p-4 border border-red-800/50 flex justify-between items-center animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                      <i className="fas fa-bullhorn text-red-400"></i>
                    </div>
                    <div>
                      <div className="text-red-400 font-bold uppercase tracking-wider text-sm">Activist Attack Detected</div>
                      <div className="text-red-300/70 text-xs">Board requires immediate attention</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowBoardBattle(selectedCompany)}
                    className="bg-red-500 hover:bg-red-400 text-black text-xs font-bold px-4 py-2 rounded-lg uppercase tracking-wider transition-colors"
                  >
                    Enter War Room
                  </button>
                </div>
              )}

              {/* KPI GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TerminalPanel title="FINANCIALS" headerIcon="fa-chart-pie" className="h-auto">
                  <div className="p-3 space-y-3 text-xs">
                    <div className={`flex justify-between items-center p-2 rounded-lg ${tutorialStep === 3 ? 'bg-amber-900/30 border border-amber-500/50 animate-border-glow' : 'bg-slate-800/30'}`}>
                      <span className="text-slate-500 uppercase tracking-wider">Revenue</span>
                      <span className="font-bold text-white tabular-nums">{formatMoney(selectedCompany.revenue)}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg bg-slate-800/30">
                      <span className="text-slate-500 uppercase tracking-wider">EBITDA</span>
                      <span className="font-bold text-emerald-400 tabular-nums">{formatMoney(selectedCompany.ebitda)}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg bg-slate-800/30">
                      <span className="text-slate-500 uppercase tracking-wider">Net Debt</span>
                      <span className="font-bold text-red-400 tabular-nums">{formatMoney(selectedCompany.debt)}</span>
                    </div>
                    <div className="divider-gradient"></div>
                    <div className="flex justify-between items-center p-2 rounded-lg bg-slate-800/30">
                      <span className="text-slate-500 uppercase tracking-wider">Growth Rate</span>
                      <span className={`font-bold tabular-nums ${selectedCompany.revenueGrowth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {selectedCompany.revenueGrowth >= 0 ? '+' : ''}{formatPercent(selectedCompany.revenueGrowth)}
                      </span>
                    </div>
                  </div>
                </TerminalPanel>

                <TerminalPanel title="CAP TABLE" headerIcon="fa-chart-simple" className="h-auto">
                  <div className="p-3 space-y-4">
                    <AsciiProgress value={selectedCompany.ownershipPercentage} max={100} label="Fund Equity" color="bg-emerald-500" />
                    <AsciiProgress value={selectedCompany.debt} max={selectedCompany.currentValuation} color="bg-red-500" label="Leverage Ratio" />
                  </div>
                </TerminalPanel>
              </div>

              {/* CEO REPORT */}
              <div className="card-elevated rounded-lg p-4">
                <div className="flex items-center gap-2 text-slate-500 mb-3">
                  <i className="fas fa-comment-dots text-amber-500/70"></i>
                  <span className="text-[11px] uppercase tracking-widest font-bold">CEO Report Log</span>
                </div>
                <div className="text-emerald-400 italic text-sm leading-relaxed">
                  "{selectedCompany.latestCeoReport}"
                </div>
              </div>

            </div>

            {/* ACTION BAR (Sticky Footer on Mobile) */}
            <div className={`
              p-4 bg-gradient-to-t from-slate-900 to-slate-900/95 border-t border-slate-700/60
              grid grid-cols-2 md:grid-cols-4 gap-3
              absolute bottom-0 left-0 right-0 md:relative
              ${(tutorialStep >= 3 && tutorialStep <= 6) ? 'z-[70] relative' : ''}
            `}>
              <button
                onClick={() => handleAnalyze(selectedCompany.id)}
                disabled={analyzingIds.includes(selectedCompany.id) || selectedCompany.isAnalyzed}
                className={`
                  relative border rounded-lg flex flex-col items-center justify-center p-4 transition-all duration-200
                  ${tutorialStep === 3
                    ? 'z-[70] bg-amber-950/50 border-amber-500 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)] animate-pulse-glow'
                    : 'bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500'
                  }
                  ${(analyzingIds.includes(selectedCompany.id) || selectedCompany.isAnalyzed) ? 'opacity-40 cursor-not-allowed' : ''}
                `}
              >
                {analyzingIds.includes(selectedCompany.id) ? (
                  <div className="w-5 h-5 border-2 border-slate-600 border-t-amber-500 rounded-full animate-spin"></div>
                ) : (
                  <i className="fas fa-microscope text-lg mb-2"></i>
                )}
                <span className="text-[10px] font-bold uppercase tracking-wider">Analyze</span>
              </button>

              <button className="border border-slate-700 bg-slate-800/30 text-slate-500 flex flex-col items-center justify-center p-4 rounded-lg opacity-50 cursor-not-allowed">
                <i className="fas fa-calculator text-lg mb-2"></i>
                <span className="text-[10px] font-bold uppercase tracking-wider">Model</span>
              </button>

              <button className="border border-slate-600 bg-slate-800/50 text-slate-300 flex flex-col items-center justify-center p-4 rounded-lg hover:bg-slate-700/50 hover:border-slate-500 transition-all">
                <i className="fas fa-comments text-lg mb-2"></i>
                <span className="text-[10px] font-bold uppercase tracking-wider">Discuss</span>
              </button>

              <button
                onClick={() => handleSubmitIOI(selectedCompany.id)}
                disabled={(!selectedCompany.isAnalyzed && tutorialStep !== 0) || isMarketPanic}
                className={`
                  border rounded-lg flex flex-col items-center justify-center p-4 transition-all duration-200
                  ${tutorialStep === 6
                    ? 'z-[70] relative bg-emerald-900/50 border-emerald-500 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)] animate-pulse-glow'
                    : 'bg-emerald-950/30 border-emerald-700/50 text-emerald-400 hover:bg-emerald-900/40 hover:border-emerald-600'
                  }
                  ${((!selectedCompany.isAnalyzed && tutorialStep !== 0) || isMarketPanic) ? 'opacity-30 grayscale cursor-not-allowed' : ''}
                `}
              >
                <i className="fas fa-file-signature text-lg mb-2"></i>
                <span className="text-[10px] font-bold uppercase tracking-wider">{isMarketPanic ? "Mkt Frozen" : "Submit IOI"}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      {showAuction && (
        <AuctionModal
          companyName={showAuction.name}
          initialBid={showAuction.currentValuation}
          rivalName="Marcus (Rival)"
          onClose={() => setShowAuction(null)}
          onComplete={handleAuctionComplete}
        />
      )}

      {showBlackBox && (
        <BlackBoxModal
          onClose={() => setShowBlackBox(false)}
          onResolve={handleBlackBoxResolve}
        />
      )}

      {showBoardBattle && (
        <BoardBattleModal
          companyName={showBoardBattle.name}
          ceoName={showBoardBattle.ceo}
          onClose={() => setShowBoardBattle(null)}
          onResolve={(success) => {
            setShowBoardBattle(null);
            if (success) updatePlayerStats({ reputation: +10, score: +200 });
            else updatePlayerStats({ reputation: -10, stress: +10 });
          }}
        />
      )}
    </div>
  );
};

export default PortfolioView;
