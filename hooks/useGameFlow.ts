import { useCallback } from 'react';
import type {
  PlayerStats,
  StatChanges,
  Choice,
  GamePhase,
  PortfolioCompany,
  ChatMessage,
  CompanyActiveEvent,
  NPCDrama,
} from '../types';
import { DealType } from '../types';
import { DIFFICULTY_SETTINGS, SCENARIOS, COMPENSATION_BY_LEVEL } from '../constants';
import { logEvent } from '../services/analytics';

interface GameFlowDependencies {
  playerStats: PlayerStats | null;
  tutorialStep: number;
  activeDeals: any[];

  // Context actions
  setGamePhase: (phase: GamePhase) => void;
  updatePlayerStats: (changes: any) => void;
  setTutorialStep: (step: number) => void;
  advanceTime: () => void;
  addLogEntry: (entry: string) => void;
  generateNewDeals: () => void;
  resetGame: () => void;
  setActiveDrama: (drama: NPCDrama | null) => void;
  setActiveCompanyEvent: (event: CompanyActiveEvent | null) => void;

  // UI state setters
  setActiveTab: (tab: 'WORKSPACE' | 'ASSETS' | 'FOUNDER' | 'DEALS') => void;
  setActiveMobileTab: (tab: 'COMMS' | 'DESK' | 'NEWS' | 'MENU') => void;
  setBootComplete: (complete: boolean) => void;
  setShowPostTutorialGuide: (show: boolean) => void;

  // Utilities
  playSfx: (sfx: string) => void;
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
  clearToasts: () => void;
  appendChatMessage: (message: ChatMessage) => void;
  resetChatHistory: () => void;
  setSelectedNpcId: (id: string) => void;
  handleSendMessageToAdvisor: (msg: string) => Promise<void>;

  // Week transition
  startWeekTransition: () => void;
}

interface UseGameFlowReturn {
  handleIntroComplete: (stress: number) => void;
  handleStatChange: (changes: StatChanges) => void;
  handleChoice: (choice: Choice) => void;
  handleScenarioFallback: () => void;
  handleAdvanceTime: () => void;
  handleResetSimulation: () => void;
  handleConsultMachiavelli: (event: CompanyActiveEvent | NPCDrama) => Promise<void>;
  handleWarningActionWithNavigation: (warning: any) => void;
}

export const useGameFlow = (deps: GameFlowDependencies): UseGameFlowReturn => {
  const {
    playerStats,
    tutorialStep,
    activeDeals,
    setGamePhase,
    updatePlayerStats,
    setTutorialStep,
    advanceTime,
    addLogEntry,
    generateNewDeals,
    resetGame,
    setActiveDrama,
    setActiveCompanyEvent,
    setActiveTab,
    setActiveMobileTab,
    setBootComplete,
    setShowPostTutorialGuide,
    playSfx,
    addToast,
    clearToasts,
    appendChatMessage,
    resetChatHistory,
    setSelectedNpcId,
    handleSendMessageToAdvisor,
    startWeekTransition,
  } = deps;

  const handleIntroComplete = useCallback((stress: number) => {
    // Init Stats with standard settings and mandatory PackFancy setup
    const diffSettings = DIFFICULTY_SETTINGS['Normal'];
    const initialPortfolio: PortfolioCompany[] = [
      {
        id: 1,
        name: 'PackFancy Inc.',
        ceo: 'Doris Chen',
        investmentCost: 0,
        ownershipPercentage: 0,
        currentValuation: 55000000,
        latestCeoReport: 'Pending Analysis...',
        nextBoardMeeting: 'TBD',
        dealType: DealType.LBO,
        revenue: 120000000,
        ebitda: 15000000,
        debt: 0,
        revenueGrowth: 0.02,
        acquisitionDate: { year: 1, month: 1 },
        eventHistory: [],
        isAnalyzed: false,
        // Enhanced Living World fields
        employeeCount: 450,
        employeeGrowth: 0.01,
        ebitdaMargin: 0.125,
        cashBalance: 8000000,
        runwayMonths: 18,
        customerChurn: 0.05,
        ceoPerformance: 70,
        boardAlignment: 65,
        managementTeam: [],
        dealClosed: false,
        isInExitProcess: false,
        nextBoardMeetingWeek: 12,
        lastFinancialUpdate: 0,
        // Deal phase state machine fields
        dealPhase: 'PIPELINE',
        actionsThisWeek: [],
        lastManagementActions: {},
        pendingDecisions: [],
      },
    ];

    // Apply difficulty settings
    updatePlayerStats({
      ...diffSettings.initialStats,
      stress: diffSettings.initialStats.stress + stress,
      playedScenarioIds: [SCENARIOS?.[0]?.id ?? 1],
      portfolio: initialPortfolio,
    });

    setGamePhase('LIFE_MANAGEMENT'); // Start in workspace, but with tutorial rail
    setActiveTab('WORKSPACE'); // Ensure we are on the workspace tab
    setTutorialStep(1); // Start Tutorial
    setBootComplete(true);
    logEvent('tutorial_start');
    addLogEntry('INIT: Career Sequence Started. Role: Analyst.');
    appendChatMessage({
      sender: 'system',
      text: `[SYSTEM_LOG] Player accepted offer. Starting stress: ${diffSettings.initialStats.stress + stress}`,
    });
    playSfx('BOOT');
  }, [
    updatePlayerStats,
    setGamePhase,
    setActiveTab,
    setTutorialStep,
    setBootComplete,
    addLogEntry,
    appendChatMessage,
    playSfx,
  ]);

  const handleStatChange = useCallback((changes: StatChanges) => {
    let finalChanges = { ...changes };

    // Check if player can access loans (Senior Associate+ only)
    const compensation = playerStats ? COMPENSATION_BY_LEVEL[playerStats.level] : null;
    const canAccessLoan = compensation?.canAccessLoan ?? false;
    const loanLimit = compensation?.loanLimit ?? 0;
    const currentLoanBalance = playerStats?.loanBalance ?? 0;
    const availableLoanRoom = Math.max(0, loanLimit - currentLoanBalance);

    // Handle negative cash scenarios
    if (playerStats && typeof changes.cash === 'number' && changes.cash < 0) {
      const projectedCash = playerStats.cash + changes.cash;
      if (projectedCash < 0) {
        const deficit = Math.abs(projectedCash);

        if (!canAccessLoan) {
          // FIRED: Associates can't take loans and went negative
          addToast('INSUFFICIENT FUNDS. You cannot afford this.', 'error');
          addLogEntry('Expense rejected: insufficient funds and no loan access.');

          // Check if this would trigger firing (cash already very low)
          if (playerStats.cash < 100) {
            addToast('WARNING: You are nearly broke. Get promoted to access emergency loans.', 'error');
          }
          return; // Block the action
        }

        // Has loan access - check if within limit
        const loanSize = Math.max(25000, Math.ceil(deficit * 1.1));
        if (loanSize > availableLoanRoom) {
          addToast(`Loan limit exceeded. Max available: $${availableLoanRoom.toLocaleString()}`, 'error');
          addLogEntry('Emergency loan denied: credit limit reached.');
          return; // Block the action
        }

        // Merge loan into changes
        finalChanges = {
          ...finalChanges,
          cash: (finalChanges.cash || 0) + loanSize,
          loanBalanceChange: (finalChanges.loanBalanceChange || 0) + loanSize,
          loanRate: 0.22,
        };
        addToast(`Auto-bridge loan wired: $${loanSize.toLocaleString()}`, 'info');
        addLogEntry('Emergency loan drawn to cover negative cash.');
      }
    }

    updatePlayerStats(finalChanges);
    if (changes.cash && changes.cash < 0) addToast(`Funds Debited: $${Math.abs(changes.cash)}`, 'info');
    if (changes.reputation && changes.reputation < 0) addToast(`Reputation Hit: ${changes.reputation}`, 'error');
  }, [playerStats, updatePlayerStats, addToast, addLogEntry]);

  const handleChoice = useCallback((choice: Choice) => {
    handleStatChange(choice.outcome.statChanges);
    addToast('ACTION_EXECUTED: ' + choice.text, 'success');
    addLogEntry(`CHOICE: ${choice.text}`);

    // Narrative Bridge: Inject choice into Chat History
    appendChatMessage({
      sender: 'system',
      text: `[SYSTEM_LOG] Player chose: "${choice.text}". Outcome: ${choice.outcome.description}`,
    });

    playSfx('KEYPRESS');

    setTimeout(() => {
      setGamePhase('LIFE_MANAGEMENT');
    }, 1000);
  }, [handleStatChange, addToast, addLogEntry, appendChatMessage, playSfx, setGamePhase]);

  const handleScenarioFallback = useCallback(() => {
    addToast('No actionable intel. Returning to desk.', 'info');
    addLogEntry('Scenario Cleared: contained no decisions.');
    setGamePhase('LIFE_MANAGEMENT');
    setActiveTab('WORKSPACE');
  }, [addToast, addLogEntry, setGamePhase, setActiveTab]);

  const handleAdvanceTime = useCallback(() => {
    if (!playerStats) return;

    if (tutorialStep > 0) {
      addToast('COMPLETE TUTORIAL FIRST', 'error');
      return;
    }

    if (playerStats.loanBalance > 0) {
      // Clamp loan rate to reasonable bounds (5% to 50% APR)
      const activeRate = Math.max(0.05, Math.min(0.5, playerStats.loanRate || 0.28));
      const rawMonthlyInterest = Math.ceil((playerStats.loanBalance * activeRate) / 12);
      // Cap monthly interest at 10% of loan balance to prevent runaway compounding
      const maxMonthlyInterest = Math.ceil(playerStats.loanBalance * 0.1);
      const monthlyInterest = Math.min(rawMonthlyInterest, maxMonthlyInterest);
      // Only charge interest if player has enough cash, otherwise add to loan balance only
      const cashToDeduct = Math.min(monthlyInterest, Math.max(0, playerStats.cash));
      const interestToCapitalize = monthlyInterest - cashToDeduct;
      updatePlayerStats({
        loanBalanceChange: interestToCapitalize > 0 ? interestToCapitalize : undefined,
        cash: cashToDeduct > 0 ? -cashToDeduct : undefined,
        stress: +3,
      });
      addToast(`Interest Accrued: $${monthlyInterest.toLocaleString()}`, 'error');
      addLogEntry(`Loan interest compounded at ${(activeRate * 100).toFixed(1)}% APR`);
    }
    advanceTime();
    generateNewDeals(); // Generate new competitive deals
    playSfx('KEYPRESS');
    addToast('TIME_ADVANCED: WEEK_CYCLE_COMPLETE', 'success');
    appendChatMessage({ sender: 'system', text: '[SYSTEM_LOG] Time advanced 1 week.' });

    if (activeDeals.length > 0) {
      addToast(`${activeDeals.length} DEAL${activeDeals.length > 1 ? 'S' : ''} IN PIPELINE`, 'info');
    }

    // Trigger week transition animation
    startWeekTransition();
  }, [
    playerStats,
    tutorialStep,
    activeDeals,
    updatePlayerStats,
    advanceTime,
    generateNewDeals,
    playSfx,
    addToast,
    addLogEntry,
    appendChatMessage,
    startWeekTransition,
  ]);

  const handleResetSimulation = useCallback(() => {
    resetGame();
    setBootComplete(false);
    setActiveTab('WORKSPACE');
    setActiveMobileTab('DESK');
    resetChatHistory();
    clearToasts();
    addToast('Simulation reset. Rebooting intro...', 'info');
    addLogEntry('Simulation reset to cold open.');
  }, [
    resetGame,
    setBootComplete,
    setActiveTab,
    setActiveMobileTab,
    resetChatHistory,
    clearToasts,
    addToast,
    addLogEntry,
  ]);

  const handleConsultMachiavelli = useCallback(async (event: CompanyActiveEvent | NPCDrama) => {
    // Pre-populate advisor with context about the decision
    const optionsContext =
      'options' in event
        ? event.options
            .map((opt: { label: string; description: string }) => `Option: ${opt.label} - ${opt.description}`)
            .join('\n')
        : event.choices
            .map((choice: Choice) => `Option: ${choice.text} - ${choice.description || ''}`)
            .join('\n');

    const advisorQuery = `I need your counsel on this situation:\n\n${event.description}\n\nMy options are:\n${optionsContext}\n\nWhat would you advise?`;

    // Close the modal first - check if it's a CompanyEvent (has options) or Drama (has choices)
    if ('options' in event) {
      setActiveCompanyEvent(null);
    } else {
      setActiveDrama(null);
    }

    // Navigate to advisor chat
    setSelectedNpcId('advisor');
    if (window.innerWidth < 768) setActiveMobileTab('COMMS');

    // Send the query to advisor
    await handleSendMessageToAdvisor(advisorQuery);

    addLogEntry(`Consulting advisor about: ${event.title}`);
  }, [
    setActiveCompanyEvent,
    setActiveDrama,
    setSelectedNpcId,
    setActiveMobileTab,
    handleSendMessageToAdvisor,
    addLogEntry,
  ]);

  const handleWarningActionWithNavigation = useCallback((warning: any) => {
    // Navigate based on warning type
    switch (warning.type) {
      case 'PORTFOLIO':
        setActiveTab('ASSETS');
        if (window.innerWidth < 768) setActiveMobileTab('DESK');
        break;
      case 'CASH':
      case 'LOAN':
        // Could open financial modal here if we had one
        addToast('Check the workspace for financial options', 'info');
        break;
      case 'HEALTH':
      case 'STRESS':
        // Could navigate to life actions
        addToast('Consider taking time off or reducing workload', 'info');
        break;
      case 'DEADLINE':
        setActiveTab('ASSETS');
        if (window.innerWidth < 768) setActiveMobileTab('DESK');
        break;
    }
  }, [setActiveTab, setActiveMobileTab, addToast]);

  return {
    handleIntroComplete,
    handleStatChange,
    handleChoice,
    handleScenarioFallback,
    handleAdvanceTime,
    handleResetSimulation,
    handleConsultMachiavelli,
    handleWarningActionWithNavigation,
  };
};

export default useGameFlow;
