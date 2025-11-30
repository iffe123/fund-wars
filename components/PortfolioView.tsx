
import React, { useState } from 'react';
import type { PortfolioCompany, PortfolioAction, PlayerStats } from '../types';
import { PORTFOLIO_ACTIONS, MARKET_VOLATILITY_STYLES } from '../constants';
import { TerminalButton, TerminalPanel, AsciiProgress } from './TerminalUI';
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

  return (
    <div className="h-full flex flex-col font-mono text-sm relative">
      {/* MARKET BANNER */}
      {marketVolatility !== 'NORMAL' && (
          <div className={`text-xs font-bold px-2 py-1 flex items-center justify-center space-x-2 border-b border-slate-700 ${MARKET_VOLATILITY_STYLES[marketVolatility].color} bg-slate-900/50`}>
              <i className={`fas ${MARKET_VOLATILITY_STYLES[marketVolatility].icon} animate-pulse`}></i>
              <span>MARKET ALERT: {marketVolatility} // {MARKET_VOLATILITY_STYLES[marketVolatility].description.toUpperCase()}</span>
          </div>
      )}

      {/* TOOLBAR */}
      <div className="p-2 border-b border-slate-700 flex justify-between items-center bg-slate-900 shrink-0">
          <div className="flex space-x-2">
              <TerminalButton label="REFRESH" icon="fa-rotate" className="md:inline-flex hidden" />
              <TerminalButton label="DATA" icon="fa-rotate" className="md:hidden inline-flex" />
              <TerminalButton label="EXPORT" icon="fa-file-csv" disabled className="hidden md:inline-flex" />
          </div>
          <div className="flex space-x-2">
              {onJumpShip && (
                  <TerminalButton
                      label="FOUNDER_MODE"
                      icon="fa-rocket"
                      variant="warning"
                      disabled={!canAccessFounder}
                      title={canAccessFounder ? undefined : 'Increase your reputation to unlock Founder Mode'}
                      onClick={() => {
                          if (!canAccessFounder) return;
                          onJumpShip();
                      }}
                  />
              )}
              <TerminalButton label="CLOSE" icon="fa-times" onClick={onBack} />
          </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
          {/* ASSET LIST */}
          <div className={`${selectedId ? 'md:w-1/2 hidden md:flex' : 'w-full flex'} border-r border-slate-700 flex-col transition-all bg-black overflow-hidden`}>
              <div className="bg-slate-800 px-3 py-1 text-[10px] uppercase text-slate-400 font-bold border-b border-slate-700 shrink-0">
                  Active_Holdings
              </div>
              
              <div className="overflow-auto custom-scrollbar flex-1 p-0 md:p-0">
                  
                  {/* MOBILE CARDS VIEW */}
                  <div className="md:hidden p-4 space-y-3">
                     {portfolio.length === 0 && (
                          <div className="p-8 text-center text-slate-600 italic">NO_ASSETS_FOUND</div>
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
                                    bg-slate-900 border border-slate-700 rounded p-4 relative overflow-hidden
                                    ${isTutorialTarget ? 'z-[70] ring-2 ring-amber-500 animate-pulse relative' : ''}
                                `}
                             >
                                 <div className="flex justify-between items-start mb-2">
                                     <h3 className="font-bold text-white text-lg">{company.name}</h3>
                                     <span className="text-green-500 font-mono font-bold">{formatMoney(company.currentValuation)}</span>
                                 </div>
                                 <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 mb-2">
                                     <div>EBITDA: <span className="text-slate-200">{formatMoney(company.ebitda)}</span></div>
                                     <div>DEBT: <span className="text-red-400">{formatMoney(company.debt)}</span></div>
                                 </div>
                                 <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-500">
                                     <span>{company.dealType}</span>
                                     {company.hasBoardCrisis && <span className="text-red-500 bg-red-900/20 px-1 rounded animate-pulse">CRISIS</span>}
                                 </div>
                                 {company.isAnalyzed && <div className="absolute top-0 right-0 p-1"><i className="fas fa-check-circle text-green-500 text-xs"></i></div>}
                             </div>
                          )
                     })}
                  </div>

                  {/* DESKTOP TABLE VIEW */}
                  <table className="hidden md:table w-full text-left border-collapse">
                      <thead className="bg-slate-900 text-slate-500 text-xs uppercase sticky top-0">
                          <tr>
                              <th className="p-2 border-b border-slate-700">Asset_Name</th>
                              <th className="p-2 border-b border-slate-700">Type</th>
                              <th className="p-2 border-b border-slate-700 text-right">Valuation</th>
                              <th className="p-2 border-b border-slate-700 text-right">EBITDA</th>
                              <th className="p-2 border-b border-slate-700 text-center">Status</th>
                          </tr>
                      </thead>
                      <tbody className="text-slate-300">
                          {portfolio.length === 0 && (
                              <tr><td colSpan={6} className="p-8 text-center text-slate-600 italic">NO_ASSETS_FOUND</td></tr>
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
                                        cursor-pointer hover:bg-slate-800 transition-colors 
                                        ${isSelected ? 'bg-slate-800 text-amber-500' : ''}
                                        ${isTutorialTarget ? 'z-[70] relative bg-slate-800 ring-2 ring-amber-500' : ''}
                                    `}
                                  >
                                      <td className="p-2 border-b border-slate-800 font-bold">
                                          {isSelected && <span className="mr-2">{">"}</span>}
                                          {company.name}
                                          {company.isAnalyzed && <i className="fas fa-check-circle text-green-500 ml-2 text-xs" title="Analyzed"></i>}
                                          {company.hasBoardCrisis && <i className="fas fa-exclamation-triangle text-red-500 ml-2 text-xs animate-bounce" title="Board Crisis"></i>}
                                      </td>
                                      <td className="p-2 border-b border-slate-800 text-xs">{company.dealType}</td>
                                      <td className="p-2 border-b border-slate-800 text-right font-mono text-green-500">{formatMoney(company.currentValuation)}</td>
                                      <td className="p-2 border-b border-slate-800 text-right font-mono text-slate-400">{formatMoney(company.ebitda)}</td>
                                      <td className="p-2 border-b border-slate-800 text-center text-xs">
                                          {company.hasBoardCrisis ? <span className="text-red-500 bg-red-900/20 px-1 rounded">CRISIS</span> : "ACTIVE"}
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
                  md:w-1/2 flex flex-col bg-slate-900/50 
                  absolute inset-0 md:static bg-black md:bg-transparent
                  ${(tutorialStep === 3 || tutorialStep === 6) ? 'z-[60] relative' : 'z-50 md:z-0'} 
              `}>
                  <div className="bg-slate-800 px-3 py-1 text-[10px] uppercase text-slate-400 font-bold border-b border-slate-700 flex justify-between items-center shrink-0">
                      <span>Asset_Detail :: {selectedCompany.name.toUpperCase()}</span>
                      <button onClick={() => setSelectedId(null)} className="p-2 -mr-2"><i className="fas fa-times text-lg"></i></button>
                  </div>
                  
                  <div className="p-4 overflow-auto custom-scrollbar flex-1 space-y-6 pb-24 md:pb-4">
                      
                      {/* CRISIS BANNER */}
                      {selectedCompany.hasBoardCrisis && (
                          <div className="bg-red-500 text-black p-3 font-bold flex justify-between items-center animate-pulse rounded">
                              <span><i className="fas fa-bullhorn mr-2"></i>ACTIVIST ATTACK DETECTED</span>
                              <button 
                                onClick={() => setShowBoardBattle(selectedCompany)}
                                className="bg-black text-red-500 text-xs px-2 py-1 rounded"
                              >
                                  ENTER WAR ROOM
                              </button>
                          </div>
                      )}

                      {/* KPI GRID */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <TerminalPanel title="FINANCIALS" className="h-auto md:h-32">
                              <div className="p-2 space-y-2 text-xs">
                                  <div className={`flex justify-between p-1 rounded ${tutorialStep === 3 ? 'bg-amber-900/30 border border-amber-500/50' : ''}`}>
                                      <span className="text-slate-500">REV:</span> 
                                      <span className="font-mono">{formatMoney(selectedCompany.revenue)}</span>
                                  </div>
                                  <div className="flex justify-between"><span className="text-slate-500">EBITDA:</span> <span className="text-green-500 font-mono">{formatMoney(selectedCompany.ebitda)}</span></div>
                                  <div className="flex justify-between"><span className="text-slate-500">NET_DEBT:</span> <span className="text-red-500 font-mono">{formatMoney(selectedCompany.debt)}</span></div>
                                  <div className="flex justify-between border-t border-slate-700 pt-1 mt-1"><span className="text-slate-500">GROWTH:</span> <span>{formatPercent(selectedCompany.revenueGrowth)}</span></div>
                              </div>
                          </TerminalPanel>
                          
                          <TerminalPanel title="CAP_TABLE" className="h-auto md:h-32">
                              <div className="p-2 space-y-2">
                                  <AsciiProgress value={selectedCompany.ownershipPercentage} max={100} label="FUND_EQUITY" />
                                  <AsciiProgress value={selectedCompany.debt} max={selectedCompany.currentValuation} color="bg-red-500" label="LEVERAGE" />
                              </div>
                          </TerminalPanel>
                      </div>

                      {/* CEO REPORT */}
                      <div className="border border-slate-700 bg-black p-3 font-mono text-xs rounded">
                          <div className="text-slate-500 mb-1 font-bold">CEO_REPORT_LOG:</div>
                          <div className="text-green-400 italic">"{selectedCompany.latestCeoReport}"</div>
                      </div>

                  </div>

                  {/* ACTION BAR (Sticky Footer on Mobile) */}
                  <div className={`
                      p-3 bg-slate-900 border-t border-slate-700 grid grid-cols-2 md:grid-cols-4 gap-2 
                      absolute bottom-0 left-0 right-0 md:relative
                      ${(tutorialStep === 3 || tutorialStep === 6) ? 'z-[70] relative ring-t-2 ring-amber-500' : ''}
                  `}>
                      <button 
                        onClick={() => handleAnalyze(selectedCompany.id)}
                        disabled={analyzingIds.includes(selectedCompany.id) || selectedCompany.isAnalyzed}
                        className={`
                             relative border flex flex-col items-center justify-center p-3 rounded transition-all
                             ${tutorialStep === 3 ? 'z-[70] bg-amber-950/50 border-amber-500 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)] animate-pulse' : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700'}
                             ${(analyzingIds.includes(selectedCompany.id) || selectedCompany.isAnalyzed) ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                      >
                          {analyzingIds.includes(selectedCompany.id) ? (
                              <i className="fas fa-spinner fa-spin"></i>
                          ) : (
                              <i className="fas fa-microscope mb-1"></i>
                          )}
                          <span className="text-[10px] font-bold">ANALYZE</span>
                      </button>

                      <button className="border border-slate-600 bg-slate-800 text-slate-300 flex flex-col items-center justify-center p-3 rounded hover:bg-slate-700 opacity-50 cursor-not-allowed">
                          <i className="fas fa-calculator mb-1"></i>
                          <span className="text-[10px] font-bold">MODEL</span>
                      </button>

                      <button className="border border-slate-600 bg-slate-800 text-slate-300 flex flex-col items-center justify-center p-3 rounded hover:bg-slate-700">
                          <i className="fas fa-comments mb-1"></i>
                          <span className="text-[10px] font-bold">DISCUSS</span>
                      </button>

                      <button 
                         onClick={() => handleSubmitIOI(selectedCompany.id)}
                         disabled={(!selectedCompany.isAnalyzed && tutorialStep !== 0) || isMarketPanic} 
                         className={`
                             border flex flex-col items-center justify-center p-3 rounded transition-all
                             ${tutorialStep === 6 ? 'z-[70] relative bg-green-900 border-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)] animate-pulse' : 'bg-green-900/30 border-green-800 text-green-500 hover:bg-green-900/50'}
                             ${((!selectedCompany.isAnalyzed && tutorialStep !== 0) || isMarketPanic) ? 'opacity-30 grayscale cursor-not-allowed' : ''}
                        `}
                      >
                          <i className="fas fa-file-signature mb-1"></i>
                          <span className="text-[10px] font-bold">{isMarketPanic ? "MKT FROZEN" : "SUBMIT IOI"}</span>
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
