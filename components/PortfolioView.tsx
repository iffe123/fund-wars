import React, { useState, useMemo, useCallback, memo } from 'react';
import type { PortfolioCompany, PortfolioAction, PlayerStats, CompanyStatus, DealPhase, LeverageModel } from '../types';
import { MARKET_VOLATILITY_STYLES } from '../constants';
import { TerminalButton, TerminalPanel, AsciiProgress, Badge } from './TerminalUI';
import { useGame } from '../context/GameContext';
import AuctionModal from './AuctionModal';
import BlackBoxModal from './BlackBoxModal';
import BoardBattleModal from './BoardBattleModal';
import ExitStrategyModal from './ExitStrategyModal';
import LeverageModelModal from './LeverageModelModal';
import { calculatePortfolioAnalytics, formatMoney as formatMoneyUtil } from '../utils/scenarioGating';
import { getCompanyStatus } from '../utils/worldEngine';

interface PortfolioViewProps {
  playerStats: PlayerStats;
  onAction: (companyId: number, action: PortfolioAction) => void;
  onBack: () => void;
  onJumpShip?: () => void;
  canAccessFounder?: boolean;
  backDisabled?: boolean;
  onDiscuss?: (company: PortfolioCompany, advisorType: 'sarah' | 'machiavelli') => void;
}

const PortfolioView: React.FC<PortfolioViewProps> = memo(({ playerStats, onAction, onBack, onJumpShip, canAccessFounder = false, backDisabled = false, onDiscuss }) => {
  const { tutorialStep, updatePlayerStats, setTutorialStep, marketVolatility, rivalFunds, useAction, addLogEntry } = useGame();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [analyzingIds, setAnalyzingIds] = useState<number[]>([]);

  // New UI States
  const [showAuction, setShowAuction] = useState<PortfolioCompany | null>(null);
  const [showBlackBox, setShowBlackBox] = useState(false);
  const [showBoardBattle, setShowBoardBattle] = useState<PortfolioCompany | null>(null);
  const [showExitModal, setShowExitModal] = useState<PortfolioCompany | null>(null);
  const [showLeverageModal, setShowLeverageModal] = useState<PortfolioCompany | null>(null);

  const portfolio = playerStats.portfolio;
  const selectedCompany = portfolio.find(c => c.id === selectedId);
  const currentWeek = playerStats.gameTime?.week || playerStats.timeCursor || 0;

  // Calculate analytics for all portfolio companies
  const portfolioAnalytics = useMemo(() => {
    const analyticsMap = new Map<number, ReturnType<typeof calculatePortfolioAnalytics>>();
    portfolio.forEach(company => {
      analyticsMap.set(company.id, calculatePortfolioAnalytics(company, currentWeek, rivalFunds || []));
    });
    return analyticsMap;
  }, [portfolio, currentWeek, rivalFunds]);

  // Get analytics for selected company
  const selectedAnalytics = selectedCompany ? portfolioAnalytics.get(selectedCompany.id) : null;

  // Market Cycle Modifiers
  const isMarketPanic = marketVolatility === 'PANIC' || marketVolatility === 'CREDIT_CRUNCH';

  // Memoize formatting functions
  const formatMoney = useCallback((val: number) => `$${(val / 1000000).toFixed(1)}M`, []);
  const formatPercent = useCallback((val: number) => `${(val * 100).toFixed(1)}%`, []);

  // Helper: Get company's deal phase (with backward compatibility)
  const getCompanyDealPhase = useCallback((company: PortfolioCompany): DealPhase => {
    // If dealPhase is explicitly set, use it
    if (company.dealPhase) return company.dealPhase;

    // Backward compatibility: derive phase from existing fields
    if (company.dealClosed) return 'WON';
    if (company.isInExitProcess) return 'WON'; // Still owned, just exiting
    if (company.isAnalyzed) return 'ANALYZED';
    return 'PIPELINE';
  }, []);

  // Helper: Check if action was used this week on a company
  const hasUsedActionThisWeek = useCallback((company: PortfolioCompany, actionType: string): boolean => {
    return (company.actionsThisWeek || []).includes(actionType);
  }, []);

  // Helper: Record that an action was taken on a company this week
  const recordCompanyAction = useCallback((companyId: number, actionType: string) => {
    const company = portfolio.find(c => c.id === companyId);
    if (!company) return;

    const currentActions = company.actionsThisWeek || [];
    updatePlayerStats({
      modifyCompany: {
        id: companyId,
        updates: {
          actionsThisWeek: [...currentActions, actionType],
        }
      }
    });
  }, [portfolio, updatePlayerStats]);

  // Helper: Handle DISCUSS action - opens COMMS with context
  const handleDiscuss = useCallback((company: PortfolioCompany, advisorType: 'sarah' | 'machiavelli') => {
    if (onDiscuss) {
      onDiscuss(company, advisorType);
    } else {
      // Fallback: just log that discuss was requested
      addLogEntry(`Requested discussion about ${company.name} with ${advisorType === 'sarah' ? 'Sarah (Deal Analysis)' : 'Machiavelli (Strategy)'}`);
    }
  }, [onDiscuss, addLogEntry]);

  // Helper: Handle LEVERAGE model application
  const handleApplyLeverageModel = useCallback((model: LeverageModel, suggestedBid: number) => {
    if (!showLeverageModal) return;

    // Update company with model data, pre-fill bid context, and mark as viewed
    updatePlayerStats({
      modifyCompany: {
        id: showLeverageModal.id,
        updates: {
          latestCeoReport: `Leverage model applied: ${(model.projectedIRR * 100).toFixed(1)}% IRR, ${model.projectedMOIC.toFixed(2)}x MOIC at ${formatMoney(suggestedBid)} entry.`,
          leverageModelViewed: true,
          leverageModelParams: {
            entryMultiple: model.entryMultiple,
            exitMultiple: model.exitMultiple,
            projectedIRR: model.projectedIRR,
            projectedMOIC: model.projectedMOIC,
          },
        }
      }
    });

    addLogEntry(`LEVERAGE MODEL: ${showLeverageModal.name} - Target IRR ${(model.projectedIRR * 100).toFixed(1)}%, MOIC ${model.projectedMOIC.toFixed(2)}x`);
    setShowLeverageModal(null);

    // Record the action
    recordCompanyAction(showLeverageModal.id, 'LEVERAGE');
  }, [showLeverageModal, updatePlayerStats, addLogEntry, formatMoney, recordCompanyAction]);

  const handleAnalyze = (companyId: number) => {
    // Check if we have enough actions (skip during tutorial)
    if (tutorialStep === 0 && !useAction('ANALYZE_DEAL')) {
      return; // Not enough actions
    }

    setAnalyzingIds(prev => [...prev, companyId]);

    // Simulate analysis delay
    setTimeout(() => {
      setAnalyzingIds(prev => prev.filter(id => id !== companyId));

      // BLACK BOX TRIGGER (5% Chance) - disabled during tutorial to avoid disrupting onboarding
      if (tutorialStep === 0 && Math.random() < 0.05) {
        setShowBlackBox(true);
        return;
      }

      // Mark company as analyzed and update deal phase
      updatePlayerStats({
        modifyCompany: {
          id: companyId,
          updates: {
            isAnalyzed: true,
            dealPhase: 'ANALYZED' as DealPhase,
            ddCompletedWeek: currentWeek,
            latestCeoReport: "PATENT #8829 DISCOVERED: Hydrophobic Coating Tech. Valuation +40%."
          }
        }
      });
      recordCompanyAction(companyId, 'DILIGENCE');

      if (tutorialStep === 3) {
        setTutorialStep(4);
      }
    }, 2000);
  };

  const handleSubmitIOI = (companyId: number) => {
    // Check if we have enough actions (skip during tutorial)
    if (tutorialStep === 0 && !useAction('SUBMIT_IOI')) {
      return; // Not enough actions
    }

    // TRIGGER LIVE AUCTION
    const company = portfolio.find(c => c.id === companyId);
    if (company && tutorialStep !== 6) { // Don't trigger auction on tutorial step
      // Update deal phase to BIDDING
      updatePlayerStats({
        modifyCompany: {
          id: companyId,
          updates: {
            dealPhase: 'BIDDING' as DealPhase,
          }
        }
      });
      recordCompanyAction(companyId, 'SUBMIT_IOI');
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
      // CRITICAL: Mark company as WON/OWNED immediately after winning auction
      updatePlayerStats({
        modifyCompany: {
          id: showAuction.id,
          updates: {
            investmentCost: finalBid,
            dealClosed: true, // Transition from PIPELINE to OWNED
            dealPhase: 'WON' as DealPhase, // Update deal phase state machine
            actionsThisWeek: [], // Reset actions for new ownership phase
            lastManagementActions: {}, // Initialize management action tracking
            acquisitionDate: {
              year: playerStats.gameTime?.year || 1,
              month: Math.ceil(((playerStats.gameTime?.week || 1) % 52) / 4.33) || 1
            }
          }
        }
      });
      const dummyAction: PortfolioAction = {
        id: 'submit_ioi',
        text: 'Submit IOI',
        description: 'Commit to the deal.',
        icon: 'fa-signature',
        outcome: { description: `Auction Won at $${(finalBid/1000000).toFixed(1)}M`, statChanges: { reputation: +10 }, logMessage: `Won auction for ${showAuction.name}` }
      };
      onAction(showAuction.id, dummyAction);
      addLogEntry(`DEAL WON: ${showAuction.name} acquired for ${formatMoney(finalBid)}`);
    } else if (showAuction) {
      // Lost auction - update phase and remove from pipeline
      updatePlayerStats({
        modifyCompany: {
          id: showAuction.id,
          updates: {
            dealPhase: 'LOST' as DealPhase,
          }
        }
      });
      // Remove from portfolio after a brief delay to show LOST state
      setTimeout(() => {
        const newPortfolio = playerStats.portfolio.filter(c => c.id !== showAuction.id);
        updatePlayerStats({ portfolio: newPortfolio, reputation: -5, stress: +5 });
      }, 100);
      addLogEntry(`DEAL LOST: Lost auction for ${showAuction.name}`);
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

  // Handle exit execution from ExitStrategyModal
  const handleExecuteExit = (exitType: string, proceeds: number) => {
    if (!showExitModal) return;
    updatePlayerStats({
      modifyCompany: {
        id: showExitModal.id,
        updates: {
          isInExitProcess: false,
          dealClosed: false, // Remove from portfolio
        }
      },
      cash: proceeds,
      reputation: +5,
      score: +500,
    });
    setShowExitModal(null);
  };

  // === STATE-APPROPRIATE ACTION HANDLERS ===

  // PIPELINE Actions
  const handleRefreshDiligence = (companyId: number) => {
    if (tutorialStep === 0 && !useAction('ANALYZE_DEAL')) return;
    updatePlayerStats({
      modifyCompany: { id: companyId, updates: { isAnalyzed: true } }
    });
  };

  const handleWalkAway = (companyId: number) => {
    if (tutorialStep === 0 && !useAction('ANALYZE_DEAL')) return;

    const company = portfolio.find(c => c.id === companyId);
    if (company) {
      addLogEntry(`WALKED AWAY: Passed on ${company.name}`);
    }

    // Mark as walked away, then remove from portfolio
    updatePlayerStats({
      modifyCompany: {
        id: companyId,
        updates: {
          dealPhase: 'WALKED_AWAY' as DealPhase,
        }
      }
    });

    // Remove from portfolio after brief delay
    setTimeout(() => {
      const newPortfolio = playerStats.portfolio.filter(c => c.id !== companyId);
      updatePlayerStats({ portfolio: newPortfolio });
    }, 100);

    setSelectedId(null);
  };

  // OWNED Actions
  const handleReviewPerformance = (companyId: number) => {
    if (tutorialStep === 0 && !useAction('PORTFOLIO_REVIEW')) return;
    updatePlayerStats({
      modifyCompany: { id: companyId, updates: { isAnalyzed: true } }
    });
  };

  const handleOperationalImprovement = (companyId: number) => {
    if (tutorialStep === 0 && !useAction('PORTFOLIO_REVIEW')) return;
    const company = portfolio.find(c => c.id === companyId);
    if (!company) return;
    // Boost company value by 5-15%
    const boost = 1 + (Math.random() * 0.1 + 0.05);
    updatePlayerStats({
      modifyCompany: {
        id: companyId,
        updates: {
          currentValuation: Math.round(company.currentValuation * boost),
          ebitda: Math.round(company.ebitda * (1 + Math.random() * 0.05)),
        }
      },
      stress: +5,
    });
  };

  const handleRefinanceDebt = (companyId: number) => {
    if (tutorialStep === 0 && !useAction('PORTFOLIO_REVIEW')) return;
    const company = portfolio.find(c => c.id === companyId);
    if (!company) return;
    // Reduce debt by 10-20%
    const reduction = 0.8 + Math.random() * 0.1;
    updatePlayerStats({
      modifyCompany: {
        id: companyId,
        updates: {
          debt: Math.round(company.debt * reduction),
        }
      },
      financialEngineering: +2,
    });
  };

  const handlePrepareForExit = (companyId: number) => {
    if (tutorialStep === 0 && !useAction('EXIT_PLANNING')) return;
    updatePlayerStats({
      modifyCompany: {
        id: companyId,
        updates: {
          isInExitProcess: true,
        }
      },
    });
  };

  const handleDividendRecap = (companyId: number) => {
    if (tutorialStep === 0 && !useAction('PORTFOLIO_REVIEW')) return;
    const company = portfolio.find(c => c.id === companyId);
    if (!company) return;
    // Extract 10-20% of company value as dividend, but increase debt
    const dividendAmount = Math.round(company.currentValuation * (0.1 + Math.random() * 0.1));
    updatePlayerStats({
      modifyCompany: {
        id: companyId,
        updates: {
          debt: company.debt + dividendAmount,
          cashBalance: Math.max(0, company.cashBalance - dividendAmount * 0.2),
        }
      },
      cash: dividendAmount,
      ethics: -5,
      auditRisk: +3,
    });
  };

  // EXITING Actions
  const handleListForSale = (companyId: number) => {
    if (tutorialStep === 0 && !useAction('EXIT_PLANNING')) return;
    setShowExitModal(portfolio.find(c => c.id === companyId) || null);
  };

  const handleCancelExit = (companyId: number) => {
    if (tutorialStep === 0 && !useAction('PORTFOLIO_REVIEW')) return;
    updatePlayerStats({
      modifyCompany: {
        id: companyId,
        updates: {
          isInExitProcess: false,
        }
      },
    });
  };

  // Get company status helper
  const getSelectedCompanyStatus = (): CompanyStatus => {
    if (!selectedCompany) return 'PIPELINE';
    return getCompanyStatus(selectedCompany);
  };

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
              title={canAccessFounder ? undefined : 'Requires $1M in personal funds'}
              onClick={() => {
                if (!canAccessFounder) return;
                onJumpShip();
              }}
            />
          )}
          <TerminalButton label="BACK" icon="fa-arrow-left" size="sm" onClick={onBack} disabled={backDisabled} />
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
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                  <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mb-4 border border-slate-700/50">
                    <i className="fas fa-folder-open text-4xl text-slate-400"></i>
                  </div>
                  <h3 className="text-lg font-bold text-slate-300 mb-2">Portfolio Empty</h3>
                  <p className="text-slate-500 text-sm max-w-xs mb-6">
                    No active investments yet. Source deals from the Deal Market and win auctions to build your portfolio.
                  </p>
                  <button
                    onClick={onBack}
                    className="bg-amber-500 hover:bg-amber-400 text-black px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-colors shadow-lg shadow-amber-500/20"
                  >
                    <i className="fas fa-gavel mr-2"></i>
                    Browse Deal Market
                  </button>
                  <div className="mt-6 p-4 bg-slate-800/30 rounded-lg border border-slate-700/30 max-w-xs">
                    <div className="flex items-start gap-2 text-xs text-slate-400">
                      <i className="fas fa-lightbulb text-amber-500/70 mt-0.5"></i>
                      <span>Tip: Deals appear when you advance time. Win auctions to add companies to your portfolio.</span>
                    </div>
                  </div>
                </div>
              )}
              {portfolio.map(company => {
                const isTutorialTarget = tutorialStep === 2 && company.name.includes("PackFancy");
                return (
                  <div
                    key={company.id}
                    data-tutorial={isTutorialTarget ? 'deal-card' : undefined}
                    onClick={() => {
                      setSelectedId(company.id);
                      if (tutorialStep === 2) setTutorialStep(3);
                    }}
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
                    <td colSpan={5} className="p-8">
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4 border border-slate-700/50">
                          <i className="fas fa-folder-open text-3xl text-slate-400"></i>
                        </div>
                        <h3 className="text-lg font-bold text-slate-300 mb-2">Portfolio Empty</h3>
                        <p className="text-slate-500 text-sm max-w-md mb-4">
                          No active investments yet. Source deals from the Deal Market and win auctions to build your portfolio.
                        </p>
                        <button
                          onClick={onBack}
                          className="bg-amber-500 hover:bg-amber-400 text-black px-5 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors"
                        >
                          <i className="fas fa-gavel mr-2"></i>
                          Browse Deal Market
                        </button>
                      </div>
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
                          <span className={`
                            inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border
                            ${getCompanyStatus(company) === 'PIPELINE' ? 'bg-blue-950/50 text-blue-400 border-blue-700/50' : ''}
                            ${getCompanyStatus(company) === 'OWNED' ? 'bg-emerald-950/50 text-emerald-400 border-emerald-700/50' : ''}
                            ${getCompanyStatus(company) === 'EXITING' ? 'bg-amber-950/50 text-amber-400 border-amber-700/50' : ''}
                          `}>
                            <i className={`fas text-[8px] ${
                              getCompanyStatus(company) === 'PIPELINE' ? 'fa-search' :
                              getCompanyStatus(company) === 'OWNED' ? 'fa-building' : 'fa-sign-out-alt'
                            }`}></i>
                            {getCompanyStatus(company)}
                          </span>
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

              {/* ANALYTICS SECTION */}
              {selectedAnalytics && selectedCompany.dealClosed && (
                <div className="space-y-3">
                  {/* Unrealized P&L */}
                  <div className={`p-3 rounded-lg border ${
                    selectedAnalytics.unrealizedGainLoss >= 0
                      ? 'bg-emerald-950/30 border-emerald-800/50'
                      : 'bg-red-950/30 border-red-800/50'
                  }`}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <i className={`fas ${selectedAnalytics.unrealizedGainLoss >= 0 ? 'fa-arrow-trend-up text-emerald-400' : 'fa-arrow-trend-down text-red-400'}`}></i>
                        <span className="text-xs text-slate-400 uppercase tracking-wider">Unrealized P&L</span>
                      </div>
                      <div className="text-right">
                        <span className={`font-bold ${selectedAnalytics.unrealizedGainLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {selectedAnalytics.unrealizedGainLoss >= 0 ? '+' : ''}
                          {formatMoneyUtil(selectedAnalytics.unrealizedGainLoss)}
                        </span>
                        <span className={`text-xs ml-2 ${selectedAnalytics.unrealizedGainLoss >= 0 ? 'text-emerald-500/70' : 'text-red-500/70'}`}>
                          ({selectedAnalytics.unrealizedGainLossPercent >= 0 ? '+' : ''}
                          {selectedAnalytics.unrealizedGainLossPercent.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Analyst Sentiment */}
                  <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-2 mb-2">
                      <i className={`fas fa-chart-line text-xs ${
                        selectedAnalytics.analystSentiment === 'BULLISH' ? 'text-emerald-400' :
                        selectedAnalytics.analystSentiment === 'BEARISH' ? 'text-red-400' : 'text-slate-400'
                      }`}></i>
                      <span className={`text-xs font-bold uppercase ${
                        selectedAnalytics.analystSentiment === 'BULLISH' ? 'text-emerald-400' :
                        selectedAnalytics.analystSentiment === 'BEARISH' ? 'text-red-400' : 'text-slate-400'
                      }`}>
                        {selectedAnalytics.analystSentiment} OUTLOOK
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 italic">{selectedAnalytics.analystNote}</p>
                  </div>

                  {/* Early Sale Penalty Warning */}
                  {selectedAnalytics.earlySalePenalty > 0 && (
                    <div className="p-3 bg-amber-950/30 rounded-lg border border-amber-800/30">
                      <div className="flex items-center gap-2">
                        <i className="fas fa-clock text-amber-500 text-xs"></i>
                        <span className="text-xs text-amber-400">
                          Early sale penalty: {(selectedAnalytics.earlySalePenalty * 100).toFixed(0)}%
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Hold {26 - selectedAnalytics.holdingPeriodWeeks} more weeks to avoid penalty
                      </p>
                    </div>
                  )}

                  {/* Rival Bidding Activity */}
                  {selectedAnalytics.activeBidders.length > 0 && (
                    <div className="p-3 bg-purple-950/30 rounded-lg border border-purple-800/30 animate-pulse">
                      <div className="flex items-center gap-2">
                        <i className="fas fa-gavel text-purple-400 text-xs"></i>
                        <span className="text-xs text-purple-300">
                          {selectedAnalytics.activeBidders.length} rival{selectedAnalytics.activeBidders.length > 1 ? 's' : ''} circling
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {selectedAnalytics.activeBidders.slice(0, 3).map((bidder, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 bg-purple-900/50 rounded text-purple-300 border border-purple-700/50">
                            {bidder}
                          </span>
                        ))}
                      </div>
                      {selectedAnalytics.highestBid && (
                        <p className="text-[10px] text-slate-500 mt-2">
                          Highest indication: {formatMoneyUtil(selectedAnalytics.highestBid)}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Holding Period */}
                  <div className="flex items-center justify-between text-[10px] text-slate-500 px-1">
                    <span>Holding period: {selectedAnalytics.holdingPeriodWeeks} weeks</span>
                    <span>Acquired: Y{selectedCompany.acquisitionDate.year} M{selectedCompany.acquisitionDate.month}</span>
                  </div>
                </div>
              )}

              {/* DEAL PROGRESS INDICATOR - For Pipeline Deals */}
              {getSelectedCompanyStatus() === 'PIPELINE' && (
                <div className="card-elevated rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 text-slate-500 mb-3">
                    <i className="fas fa-tasks text-blue-500/70"></i>
                    <span className="text-[11px] uppercase tracking-widest font-bold">Deal Progress</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Step 1: Due Diligence */}
                    <div className={`flex-1 p-2 rounded-lg border text-center transition-all ${
                      selectedCompany?.isAnalyzed
                        ? 'bg-emerald-950/30 border-emerald-700/50'
                        : 'bg-blue-950/30 border-blue-700/50 animate-pulse'
                    }`}>
                      <div className={`text-xs font-bold ${selectedCompany?.isAnalyzed ? 'text-emerald-400' : 'text-blue-400'}`}>
                        {selectedCompany?.isAnalyzed ? '✓' : '1'}
                      </div>
                      <div className="text-[9px] text-slate-400 mt-1">Diligence</div>
                      <div className="text-[8px] text-slate-500">(1 AP)</div>
                    </div>
                    <i className="fas fa-chevron-right text-slate-600 text-[10px]"></i>

                    {/* Step 2: Leverage Model */}
                    <div className={`flex-1 p-2 rounded-lg border text-center transition-all ${
                      selectedCompany?.leverageModelViewed
                        ? 'bg-emerald-950/30 border-emerald-700/50'
                        : selectedCompany?.isAnalyzed
                          ? 'bg-purple-950/30 border-purple-700/50 animate-pulse'
                          : 'bg-slate-800/30 border-slate-700/50 opacity-50'
                    }`}>
                      <div className={`text-xs font-bold ${
                        selectedCompany?.leverageModelViewed
                          ? 'text-emerald-400'
                          : selectedCompany?.isAnalyzed
                            ? 'text-purple-400'
                            : 'text-slate-500'
                      }`}>
                        {selectedCompany?.leverageModelViewed ? '✓' : '2'}
                      </div>
                      <div className="text-[9px] text-slate-400 mt-1">Model</div>
                      <div className="text-[8px] text-emerald-500">Free</div>
                    </div>
                    <i className="fas fa-chevron-right text-slate-600 text-[10px]"></i>

                    {/* Step 3: Submit IOI */}
                    <div className={`flex-1 p-2 rounded-lg border text-center transition-all ${
                      selectedCompany?.dealPhase === 'BIDDING' || selectedCompany?.dealPhase === 'WON'
                        ? 'bg-emerald-950/30 border-emerald-700/50'
                        : selectedCompany?.leverageModelViewed
                          ? 'bg-emerald-950/30 border-emerald-700/50 animate-pulse'
                          : 'bg-slate-800/30 border-slate-700/50 opacity-50'
                    }`}>
                      <div className={`text-xs font-bold ${
                        selectedCompany?.dealPhase === 'BIDDING' || selectedCompany?.dealPhase === 'WON'
                          ? 'text-emerald-400'
                          : selectedCompany?.leverageModelViewed
                            ? 'text-emerald-400'
                            : 'text-slate-500'
                      }`}>
                        {selectedCompany?.dealPhase === 'BIDDING' || selectedCompany?.dealPhase === 'WON' ? '✓' : '3'}
                      </div>
                      <div className="text-[9px] text-slate-400 mt-1">Submit IOI</div>
                      <div className="text-[8px] text-slate-500">(1 AP)</div>
                    </div>
                  </div>
                  {/* Next step hint */}
                  <div className="mt-3 text-[10px] text-slate-500 text-center">
                    {!selectedCompany?.isAnalyzed && (
                      <span className="text-blue-400">→ Complete Due Diligence to analyze the deal</span>
                    )}
                    {selectedCompany?.isAnalyzed && !selectedCompany?.leverageModelViewed && (
                      <span className="text-purple-400">→ Run Leverage Model to set your bid parameters</span>
                    )}
                    {selectedCompany?.leverageModelViewed && selectedCompany?.dealPhase !== 'BIDDING' && selectedCompany?.dealPhase !== 'WON' && (
                      <span className="text-emerald-400">→ Ready to Submit IOI and enter auction</span>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* ACTION BAR (Sticky Footer on Mobile) - State-Appropriate Actions */}
            <div className={`
              p-4 bg-gradient-to-t from-slate-900 to-slate-900/95 border-t border-slate-700/60
              absolute bottom-0 left-0 right-0 md:relative
              ${(tutorialStep >= 3 && tutorialStep <= 6) ? 'z-[70] relative' : ''}
            `}>
              {/* Status Badge */}
              <div className="flex items-center justify-between mb-3">
                <div className={`
                  px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border
                  ${getSelectedCompanyStatus() === 'PIPELINE' ? 'bg-blue-950/50 text-blue-400 border-blue-700/50' : ''}
                  ${getSelectedCompanyStatus() === 'OWNED' ? 'bg-emerald-950/50 text-emerald-400 border-emerald-700/50' : ''}
                  ${getSelectedCompanyStatus() === 'EXITING' ? 'bg-amber-950/50 text-amber-400 border-amber-700/50' : ''}
                `}>
                  <i className={`fas mr-1.5 ${
                    getSelectedCompanyStatus() === 'PIPELINE' ? 'fa-search' :
                    getSelectedCompanyStatus() === 'OWNED' ? 'fa-building' : 'fa-sign-out-alt'
                  }`}></i>
                  {getSelectedCompanyStatus()}
                </div>
                {(playerStats.gameTime?.actionsRemaining || 0) === 0 && tutorialStep === 0 && (
                  <span className="text-xs text-red-400 font-bold">
                    <i className="fas fa-exclamation-circle mr-1"></i>
                    NO ACTIONS - ADVANCE WEEK
                  </span>
                )}
              </div>

              {/* PIPELINE Actions */}
              {getSelectedCompanyStatus() === 'PIPELINE' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button
                    data-tutorial={tutorialStep === 3 ? 'diligence-btn' : undefined}
                    onClick={() => handleAnalyze(selectedCompany.id)}
                    disabled={analyzingIds.includes(selectedCompany.id) || selectedCompany.isAnalyzed || (tutorialStep === 0 && (playerStats.gameTime?.actionsRemaining || 0) < 1)}
                    className={`
                      relative border rounded-lg flex flex-col items-center justify-center p-4 transition-all duration-200
                      ${tutorialStep === 3
                        ? 'bg-amber-950/50 border-amber-500 text-amber-400'
                        : 'bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500'
                      }
                      ${(analyzingIds.includes(selectedCompany.id) || selectedCompany.isAnalyzed || (tutorialStep === 0 && (playerStats.gameTime?.actionsRemaining || 0) < 1)) ? 'opacity-40 cursor-not-allowed' : ''}
                    `}
                  >
                    {analyzingIds.includes(selectedCompany.id) ? (
                      <div className="w-5 h-5 border-2 border-slate-600 border-t-amber-500 rounded-full animate-spin"></div>
                    ) : (
                      <i className="fas fa-search text-lg mb-2"></i>
                    )}
                    <span className="text-[10px] font-bold uppercase tracking-wider">Diligence</span>
                    <span className="text-[8px] text-slate-500 mt-0.5">(1 AP)</span>
                  </button>

                  <button
                    onClick={() => handleSubmitIOI(selectedCompany.id)}
                    disabled={(!selectedCompany.isAnalyzed && tutorialStep === 0) || isMarketPanic || (tutorialStep === 0 && (playerStats.gameTime?.actionsRemaining || 0) < 1) || (tutorialStep === 0 && selectedCompany.isAnalyzed && !selectedCompany.leverageModelViewed)}
                    title={
                      isMarketPanic
                        ? 'Market is frozen during panic - wait for stability'
                        : tutorialStep === 0 && selectedCompany.isAnalyzed && !selectedCompany.leverageModelViewed
                          ? 'Run the Leverage Model first to unlock IOI submission'
                          : !selectedCompany.isAnalyzed && tutorialStep === 0
                            ? 'Run Diligence first to analyze this deal'
                            : undefined
                    }
                    className={`
                      border rounded-lg flex flex-col items-center justify-center p-4 transition-all duration-200
                      ${tutorialStep === 6
                        ? 'z-[70] relative bg-emerald-900/50 border-emerald-500 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)] animate-pulse-glow'
                        : 'bg-emerald-950/30 border-emerald-700/50 text-emerald-400 hover:bg-emerald-900/40 hover:border-emerald-600'
                      }
                      ${((!selectedCompany.isAnalyzed && tutorialStep === 0) || isMarketPanic || (tutorialStep === 0 && (playerStats.gameTime?.actionsRemaining || 0) < 1) || (tutorialStep === 0 && selectedCompany.isAnalyzed && !selectedCompany.leverageModelViewed)) ? 'opacity-30 grayscale cursor-not-allowed' : ''}
                    `}
                  >
                    <i className={`fas ${isMarketPanic ? 'fa-snowflake' : tutorialStep === 0 && selectedCompany.isAnalyzed && !selectedCompany.leverageModelViewed ? 'fa-lock' : 'fa-clipboard-check'} text-lg mb-2`}></i>
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      {isMarketPanic ? "Market Frozen" : tutorialStep === 0 && selectedCompany.isAnalyzed && !selectedCompany.leverageModelViewed ? "Locked" : "Submit IOI"}
                    </span>
                    {isMarketPanic ? (
                      <span className="text-[9px] text-blue-400 mt-0.5">Wait for stability</span>
                    ) : tutorialStep === 0 && selectedCompany.isAnalyzed && !selectedCompany.leverageModelViewed ? (
                      <span className="text-[9px] text-amber-400 mt-0.5 font-medium animate-pulse">⬇ Run Model First</span>
                    ) : !selectedCompany.isAnalyzed && tutorialStep === 0 ? (
                      <span className="text-[9px] text-amber-400 mt-0.5">Run Diligence First</span>
                    ) : (
                      <span className="text-[8px] text-slate-500 mt-0.5">(1 AP)</span>
                    )}
                  </button>

                  <button
                    onClick={() => handleWalkAway(selectedCompany.id)}
                    disabled={tutorialStep !== 0 || (playerStats.gameTime?.actionsRemaining || 0) < 1}
                    className="border border-red-800/50 bg-red-950/30 text-red-400 hover:bg-red-900/40 flex flex-col items-center justify-center p-4 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <i className="fas fa-door-open text-lg mb-2"></i>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Walk Away</span>
                    <span className="text-[8px] text-slate-500 mt-0.5">(1 AP)</span>
                  </button>

                  {/* LEVERAGE button - only available for ANALYZED deals */}
                  {/* Highlight when model needs to be run to unlock IOI */}
                  {selectedCompany.isAnalyzed && (
                    <button
                      data-tutorial="leverage-btn"
                      onClick={() => setShowLeverageModal(selectedCompany)}
                      disabled={hasUsedActionThisWeek(selectedCompany, 'LEVERAGE')}
                      className={`
                        border rounded-lg flex flex-col items-center justify-center p-4 transition-all col-span-2 md:col-span-1
                        ${!selectedCompany.leverageModelViewed && tutorialStep === 0
                          ? 'border-cyan-400 bg-cyan-950/50 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.4)] animate-pulse ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900'
                          : 'border-purple-700/50 bg-purple-950/30 text-purple-400 hover:bg-purple-900/40'
                        }
                        ${hasUsedActionThisWeek(selectedCompany, 'LEVERAGE') ? 'opacity-40 cursor-not-allowed' : ''}
                      `}
                    >
                      <i className={`fas fa-calculator text-lg mb-2 ${!selectedCompany.leverageModelViewed && tutorialStep === 0 ? 'animate-bounce' : ''}`}></i>
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        {!selectedCompany.leverageModelViewed && tutorialStep === 0 ? '📊 Run Model' : 'Leverage Model'}
                      </span>
                      <span className={`text-[8px] mt-0.5 ${!selectedCompany.leverageModelViewed && tutorialStep === 0 ? 'text-cyan-300 font-bold' : 'text-emerald-500'}`}>
                        {!selectedCompany.leverageModelViewed && tutorialStep === 0 ? '⬆ REQUIRED TO UNLOCK IOI' : '(Free)'}
                      </span>
                    </button>
                  )}
                </div>
              )}

              {/* OWNED Actions */}
              {getSelectedCompanyStatus() === 'OWNED' && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  <button
                    onClick={() => handleReviewPerformance(selectedCompany.id)}
                    disabled={(playerStats.gameTime?.actionsRemaining || 0) < 1}
                    className="border border-blue-700/50 bg-blue-950/30 text-blue-400 hover:bg-blue-900/40 flex flex-col items-center justify-center p-3 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <i className="fas fa-chart-bar text-base mb-1"></i>
                    <span className="text-[9px] font-bold uppercase tracking-wider">Review</span>
                    <span className="text-[7px] text-slate-500">(1 AP)</span>
                  </button>

                  <button
                    onClick={() => handleOperationalImprovement(selectedCompany.id)}
                    disabled={(playerStats.gameTime?.actionsRemaining || 0) < 1}
                    className="border border-emerald-700/50 bg-emerald-950/30 text-emerald-400 hover:bg-emerald-900/40 flex flex-col items-center justify-center p-3 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <i className="fas fa-cogs text-base mb-1"></i>
                    <span className="text-[9px] font-bold uppercase tracking-wider">Improve</span>
                    <span className="text-[7px] text-slate-500">(1 AP)</span>
                  </button>

                  <button
                    onClick={() => handleRefinanceDebt(selectedCompany.id)}
                    disabled={(playerStats.gameTime?.actionsRemaining || 0) < 1 || selectedCompany.debt <= 0}
                    className="border border-purple-700/50 bg-purple-950/30 text-purple-400 hover:bg-purple-900/40 flex flex-col items-center justify-center p-3 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <i className="fas fa-sync-alt text-base mb-1"></i>
                    <span className="text-[9px] font-bold uppercase tracking-wider">Refinance</span>
                    <span className="text-[7px] text-slate-500">(1 AP)</span>
                  </button>

                  <button
                    onClick={() => handleDividendRecap(selectedCompany.id)}
                    disabled={(playerStats.gameTime?.actionsRemaining || 0) < 1}
                    className="border border-amber-700/50 bg-amber-950/30 text-amber-400 hover:bg-amber-900/40 flex flex-col items-center justify-center p-3 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <i className="fas fa-money-bill-wave text-base mb-1"></i>
                    <span className="text-[9px] font-bold uppercase tracking-wider">Dividend</span>
                    <span className="text-[7px] text-red-400">(1 AP) ⚠️</span>
                  </button>

                  <button
                    onClick={() => handlePrepareForExit(selectedCompany.id)}
                    disabled={(playerStats.gameTime?.actionsRemaining || 0) < 2}
                    className="border border-cyan-700/50 bg-cyan-950/30 text-cyan-400 hover:bg-cyan-900/40 flex flex-col items-center justify-center p-3 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <i className="fas fa-sign-out-alt text-base mb-1"></i>
                    <span className="text-[9px] font-bold uppercase tracking-wider">Prep Exit</span>
                    <span className="text-[7px] text-slate-500">(2 AP)</span>
                  </button>
                </div>
              )}

              {/* EXITING Actions */}
              {getSelectedCompanyStatus() === 'EXITING' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button
                    onClick={() => handleListForSale(selectedCompany.id)}
                    disabled={(playerStats.gameTime?.actionsRemaining || 0) < 2}
                    className="border border-emerald-700/50 bg-emerald-950/30 text-emerald-400 hover:bg-emerald-900/40 flex flex-col items-center justify-center p-4 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <i className="fas fa-tag text-lg mb-2"></i>
                    <span className="text-[10px] font-bold uppercase tracking-wider">List for Sale</span>
                    <span className="text-[8px] text-slate-500 mt-0.5">(2 AP)</span>
                  </button>

                  <button
                    onClick={() => setShowExitModal(selectedCompany)}
                    disabled={(playerStats.gameTime?.actionsRemaining || 0) < 1}
                    className="border border-blue-700/50 bg-blue-950/30 text-blue-400 hover:bg-blue-900/40 flex flex-col items-center justify-center p-4 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <i className="fas fa-handshake text-lg mb-2"></i>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Negotiate</span>
                    <span className="text-[8px] text-slate-500 mt-0.5">(1 AP)</span>
                  </button>

                  <button
                    onClick={() => setShowExitModal(selectedCompany)}
                    disabled={(playerStats.gameTime?.actionsRemaining || 0) < 2}
                    className="border border-amber-700/50 bg-amber-950/30 text-amber-400 hover:bg-amber-900/40 flex flex-col items-center justify-center p-4 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <i className="fas fa-bullhorn text-lg mb-2"></i>
                    <span className="text-[10px] font-bold uppercase tracking-wider">IPO Prep</span>
                    <span className="text-[8px] text-slate-500 mt-0.5">(2 AP)</span>
                  </button>

                  <button
                    onClick={() => handleCancelExit(selectedCompany.id)}
                    disabled={(playerStats.gameTime?.actionsRemaining || 0) < 1}
                    className="border border-red-800/50 bg-red-950/30 text-red-400 hover:bg-red-900/40 flex flex-col items-center justify-center p-4 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <i className="fas fa-undo text-lg mb-2"></i>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Cancel Exit</span>
                    <span className="text-[8px] text-slate-500 mt-0.5">(1 AP)</span>
                  </button>
                </div>
              )}
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

      {showExitModal && (
        <ExitStrategyModal
          company={showExitModal}
          playerStats={playerStats}
          marketVolatility={marketVolatility}
          onExecuteExit={handleExecuteExit}
          onClose={() => setShowExitModal(null)}
        />
      )}

      {showLeverageModal && (
        <LeverageModelModal
          company={showLeverageModal}
          onClose={() => setShowLeverageModal(null)}
          onApplyModel={handleApplyLeverageModel}
        />
      )}
    </div>
  );
});

PortfolioView.displayName = 'PortfolioView';

export default PortfolioView;
