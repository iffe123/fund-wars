import React, { memo, useMemo } from 'react';
import type { PlayerStats, StatChanges, CompetitiveDeal, LifeAction } from '../types';
import { TerminalPanel, TerminalButton } from './TerminalUI';
import { LIFE_ACTIONS, COMPENSATION_BY_LEVEL, AFFORDABILITY_THRESHOLDS } from '../constants';
import { useGame } from '../contexts/GameContext';

interface WorkspacePanelProps {
  playerStats: PlayerStats | null;
  tutorialStep: number;
  activeDeals: CompetitiveDeal[];
  onStatChange: (changes: StatChanges) => void;
  onManageAssets: () => void;
  onShowPortfolioDashboard: () => void;
  onDealFlow: () => void;
  onAdvanceTime: () => void;
  addToast: (message: string, type: 'error' | 'success' | 'info') => void;
  addLogEntry: (message: string) => void;
  updatePlayerStats: (changes: StatChanges) => void;
}

const WorkspacePanel: React.FC<WorkspacePanelProps> = memo(({
  playerStats,
  tutorialStep,
  activeDeals,
  onStatChange,
  onManageAssets,
  onShowPortfolioDashboard,
  onDealFlow,
  onAdvanceTime,
  addToast,
  addLogEntry,
  updatePlayerStats
}) => {
  const { useAction } = useGame();

  // Calculate affordability and loan access
  const compensation = useMemo(
    () => playerStats ? COMPENSATION_BY_LEVEL[playerStats.level] : null,
    [playerStats?.level]
  );

  const canAccessLoan = compensation?.canAccessLoan ?? false;
  const loanLimit = compensation?.loanLimit ?? 0;
  const currentLoanBalance = playerStats?.loanBalance ?? 0;
  const expensiveThreshold = playerStats ? AFFORDABILITY_THRESHOLDS[playerStats.level] : 200;
  const actionsRemaining = playerStats?.gameTime?.actionsRemaining ?? 0;

  const handleLifeAction = (action: LifeAction) => {
    if (tutorialStep > 0) return; // Lock during tutorial
    if (!playerStats) return;

    const actionCost = Math.abs(action.outcome.statChanges.cash || 0);
    const apCost = action.apCost;
    const canAfford = playerStats.cash >= actionCost;
    const hasEnoughAP = actionsRemaining >= apCost;
    const feelsExpensive = actionCost >= expensiveThreshold;

    // Check AP availability first
    if (!hasEnoughAP) {
      addToast(`Not enough action points! Need ${apCost} AP, have ${actionsRemaining}`, 'error');
      return;
    }

    // Bridge Loan - locked for Associates
    if (action.id === 'hard_money_loan') {
      if (!canAccessLoan) {
        addToast('Loan access locked. Get promoted to Senior Associate first.', 'error');
        addLogEntry('Bridge loan denied: insufficient seniority.');
        return;
      }
      if (playerStats.loanBalance > 0) {
        addToast('Existing bridge loan outstanding.', 'error');
        return;
      }
      if (currentLoanBalance + 50000 > loanLimit) {
        addToast(`Loan would exceed your $${loanLimit.toLocaleString()} limit.`, 'error');
        return;
      }
      // Deduct AP cost
      if (!useAction(apCost)) {
        addToast('Not enough action points!', 'error');
        return;
      }
      onStatChange(action.outcome.statChanges);
      addToast('Bridge loan funded at predatory terms.', 'info');
      addLogEntry('Took a hard money bridge loan.');
      return;
    }

    // Loan payment
    if (action.id === 'loan_payment') {
      if (playerStats.loanBalance <= 0) {
        addToast('No lender breathing down your neck right now.', 'error');
        return;
      }
      const payment = Math.min(10000, playerStats.loanBalance, playerStats.cash);
      if (payment <= 0) {
        addToast('Insufficient cash to pay down debt.', 'error');
        return;
      }
      // Deduct AP cost
      if (!useAction(apCost)) {
        addToast('Not enough action points!', 'error');
        return;
      }
      updatePlayerStats({ cash: -payment, loanBalanceChange: -payment, stress: -2, score: +25 });
      addToast(`Debt payment sent: $${payment.toLocaleString()}`, 'success');
      addLogEntry('Paid down high-interest debt.');
      return;
    }

    // Affordability check for all actions
    if (actionCost > 0 && !canAfford) {
      addToast(`Can't afford this. Need $${actionCost.toLocaleString()}`, 'error');
      return;
    }

    // Deduct AP cost
    if (!useAction(apCost)) {
      addToast('Not enough action points!', 'error');
      return;
    }

    // Warning for expensive actions (but still allow)
    if (feelsExpensive && actionCost > 0) {
      addToast(`Splurging $${actionCost.toLocaleString()} on ${action.text}`, 'info');
    }

    onStatChange(action.outcome.statChanges);
    addToast(action.text, 'success');
    addLogEntry(`ACTION: ${action.text}`);
  };

  const isTutorialActive = tutorialStep >= 1 && tutorialStep <= 6;

  return (
    <TerminalPanel
      title="WORKSPACE_HOME"
      className={`h-full flex flex-col p-4 bg-black ${isTutorialActive ? 'relative z-[100]' : ''}`}
    >
      {/* Hide Life Actions during Tutorial Step 1 to prevent pushing content down */}
      {tutorialStep !== 1 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {LIFE_ACTIONS.map(action => {
            const actionCost = Math.abs(action.outcome.statChanges.cash || 0);
            const apCost = action.apCost;
            const canAfford = playerStats ? playerStats.cash >= actionCost : false;
            const hasEnoughAP = actionsRemaining >= apCost;
            const feelsExpensive = actionCost >= expensiveThreshold;
            const isLoanAction = action.id === 'hard_money_loan';
            const loanLocked = isLoanAction && !canAccessLoan;
            const isDisabled = tutorialStep > 0 || loanLocked || !hasEnoughAP || (!canAfford && actionCost > 0);

            return (
              <button
                key={action.id}
                onClick={() => handleLifeAction(action)}
                disabled={isDisabled}
                className={`aspect-square border border-slate-700 hover:bg-slate-800 hover:border-blue-500 flex flex-col items-center justify-center p-2 text-center group transition-all active:scale-95 active:border-amber-500 active:shadow-[0_0_12px_rgba(245,158,11,0.4)] ${tutorialStep > 0 ? 'opacity-30 cursor-not-allowed' : ''} ${loanLocked ? 'opacity-40 border-red-900' : ''} ${!hasEnoughAP ? 'opacity-40 border-slate-800 cursor-not-allowed' : ''} ${!canAfford && actionCost > 0 ? 'opacity-50 border-slate-800' : ''}`}
              >
                <i className={`fas ${action.icon} text-2xl mb-2 ${loanLocked || !hasEnoughAP ? 'text-red-900' : !canAfford && actionCost > 0 ? 'text-slate-400' : feelsExpensive && actionCost > 0 ? 'text-amber-600' : 'text-slate-500'} group-hover:text-blue-500`}></i>
                <span className="text-[10px] uppercase font-bold text-slate-400 group-hover:text-white">{action.text}</span>
                {/* Display AP cost */}
                <span className={`text-[8px] font-bold ${!hasEnoughAP ? 'text-red-500' : 'text-amber-400'}`}>
                  {apCost} AP
                </span>
                {actionCost > 0 && (
                  <span className={`text-[8px] ${!canAfford ? 'text-red-500' : feelsExpensive ? 'text-amber-500' : 'text-slate-400'}`}>
                    ${actionCost.toLocaleString()}
                  </span>
                )}
                {loanLocked && <span className="text-[8px] text-red-500">LOCKED</span>}
                {!hasEnoughAP && !loanLocked && <span className="text-[8px] text-red-500">NO AP</span>}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex-1 border-t border-slate-800 pt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-slate-500">PENDING_TASKS</span>
          <div className={tutorialStep === 1 ? 'relative z-[100]' : ''}>
            <TerminalButton
              label="MANAGE_ASSETS"
              icon="fa-briefcase"
              onClick={onManageAssets}
              className={tutorialStep === 1 ? '!bg-green-500 !text-black !border-green-300 animate-pulse shadow-[0_0_25px_rgba(34,197,94,0.8)] ring-2 ring-green-400' : ''}
            />
            <div className="mt-2">
              <TerminalButton
                label="PORTFOLIO_DASHBOARD"
                icon="fa-grid-2"
                onClick={onShowPortfolioDashboard}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* DEAL FLOW BUTTON */}
        {tutorialStep === 0 && (
          <div className="mb-4">
            <TerminalButton
              label={`DEAL_FLOW ${activeDeals.length > 0 ? `(${activeDeals.length})` : ''}`}
              icon="fa-gavel"
              onClick={onDealFlow}
              className={`w-full ${activeDeals.length > 0 ? 'border-amber-500 text-amber-400 hover:bg-amber-900/20' : ''}`}
            />
          </div>
        )}

        <div className="text-slate-400 text-sm italic mb-4">
          {tutorialStep > 0 ? "URGENT: Review PackFancy Deal Memo." : "Review portfolio or advance timeline."}
        </div>

        {tutorialStep === 0 && (
          <div className="text-[12px] text-slate-500 space-y-1 border border-slate-800 p-3 bg-slate-950/40">
            <div className="font-bold text-amber-400 text-xs">HINT FEED</div>
            <div>- NPC chat is powered by Gemini; ask for valuations, red flags, or gossip.</div>
            <div>- If cash runs dry, grab a bridge loan from LIFE_ACTIONS or we auto-wire one.</div>
            <div>- The Portfolio Dashboard button above jumps straight to company actions.</div>
          </div>
        )}

        {/* ADVANCE WEEK BUTTON */}
        {tutorialStep === 0 && (
          <button
            onClick={onAdvanceTime}
            className="w-full border border-slate-600 hover:border-amber-500 hover:bg-slate-900 text-slate-400 hover:text-amber-500 py-4 flex items-center justify-center space-x-3 transition-all group"
          >
            <i className="fas fa-forward group-hover:animate-pulse"></i>
            <span className="text-xs font-bold tracking-widest uppercase">Advance Timeline (Next Week)</span>
          </button>
        )}
      </div>
    </TerminalPanel>
  );
});

WorkspacePanel.displayName = 'WorkspacePanel';

export default WorkspacePanel;
