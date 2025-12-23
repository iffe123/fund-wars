
import React, { useState, useEffect, useCallback } from 'react';
import type { PlayerStats, Scenario, ChatMessage, Choice, StatChanges, GamePhase, PortfolioCompany, MarketVolatility, NPC, CompetitiveDeal, CompanyActiveEvent, NPCDrama } from './types';
import { PlayerLevel, DealType } from './types';
import { DIFFICULTY_SETTINGS, SCENARIOS, NEWS_EVENTS, LIFE_ACTIONS, PREDEFINED_QUESTIONS, PORTFOLIO_ACTIONS, INITIAL_NPCS, QUIZ_QUESTIONS, VICE_ACTIONS, SHADOW_ACTIONS, RIVAL_FUNDS, COMPENSATION_BY_LEVEL, AFFORDABILITY_THRESHOLDS, Z_INDEX } from './constants';
import NewsTicker from './components/NewsTicker';
import CommsTerminal from './components/CommsTerminal';
import PortfolioView from './components/PortfolioView';
import FounderDashboard from './components/FounderDashboard';
import SanityEffects from './components/SanityEffects';
import IntroSequence from './components/IntroSequence';
import SystemBoot from './components/SystemBoot';
import TutorialOverlay from './components/TutorialOverlay';
import PostTutorialGuide from './components/PostTutorialGuide';
import PlayerStatsDisplay from './components/PlayerStats';
import BottomNav from './components/BottomNav';
import LoginScreen from './components/LoginScreen';
import LegalDisclaimer from './components/LegalDisclaimer';
import { TerminalPanel, TerminalButton, TerminalToast } from './components/TerminalUI';
import NpcListPanel from './components/NpcListPanel';
import WorkspacePanel from './components/WorkspacePanel';
import ScenarioPanel from './components/ScenarioPanel';
import { getAdvisorResponse, getNPCResponse, getDynamicNewsEvents } from './services/geminiService';
import { useGame } from './context/GameContext';
import { useAuth } from './context/AuthContext';
import { useAudio } from './context/AudioContext';
import { logEvent } from './services/analytics';
import { useToast } from './hooks/useToast';
import { useEnhancedToast } from './hooks/useEnhancedToast';
import { ToastContainer } from './components/ui/Toast';
import ActivityFeed from './components/ActivityFeed';
import WeekTransition from './components/WeekTransition';
import { useWeekTransition } from './hooks/useWeekTransition';
import CompetitiveAuctionModal, { AuctionResult } from './components/CompetitiveAuctionModal';
import DealMarket from './components/DealMarket';
import RivalLeaderboard from './components/RivalLeaderboard';
import PortfolioCommandCenter from './components/PortfolioCommandCenter';
import StatsExplainerModal from './components/StatsExplainerModal';
import WarningPanel from './components/WarningPanel';
import GameEndModal from './components/GameEndModal';
import TransparencyModal from './components/TransparencyModal';
import EventDrivenWorkspace from './components/EventDrivenWorkspace';

declare global {
  interface Window {
    google?: unknown;
  }
}

const TUTORIAL_STEPS_TEXT = [
    "", // Step 0 (Inactive)
    "The meat grinder is empty. Click [MANAGE_ASSETS] to see the deal Chad (your MD) just threw at you. He expects results.", // Step 1
    "Here it is. 'PackFancy Inc.' - a cardboard box company. Click the row to open the Deal Memo and see what you're dealing with.", // Step 2
    "Look at that Revenue. Flat as a pancake. If you buy this now, you get fired. You need an edge. Click [ANALYZE] to dig deeper.", // Step 3
    "Analysis complete. We found a weird patent on Page 40. Time to meet SARAH - your Senior Analyst. She's been up 40 hours crunching models. Tap the COMMS tab below, then tap SARAH (look for the glowing button with CLICK indicator).", // Step 4
    "Sarah already found something. She's proactive like that. Ask her to dig deeper on the patent by clicking the prompt.", // Step 5
    "PATENT #8829 is real. Hydrophobic coating tech could be a game-changer. Now you have leverage. Click [SUBMIT IOI] to lock in the deal. PRO TIP: After the tutorial, ask Machiavelli (your advisor) about deal structures like LBO vs Growth Equity.", // Step 6
];

const DEFAULT_CHAT: ChatMessage[] = [
    { sender: 'advisor', text: "SYSTEM READY. Awaiting inputs." }
];

const App: React.FC = () => {
  // Use Context
  const {
    user, playerStats, npcs, activeScenario, gamePhase, difficulty, marketVolatility, tutorialStep, actionLog,
    activities,
    setGamePhase, updatePlayerStats, sendNpcMessage, setTutorialStep, advanceTime, addLogEntry, addActivity,
    rivalFunds, activeDeals, updateRivalFund, removeDeal, generateNewDeals, resetGame,
    // Living World System
    activeWarnings, activeDrama, activeCompanyEvent, eventQueue, pendingDecision,
    dismissWarning, handleWarningAction, setActiveDrama, setActiveCompanyEvent, handleEventDecision,
    // Time & Action System
    useAction,
  } = useGame();
  
  const { loading: authLoading } = useAuth();
  const { playSfx, playAmbience } = useAudio();
  const { toasts: oldToasts, addToast: addOldToast, removeToast, clearToasts } = useToast();
  const { toasts, removeToast: removeEnhancedToast, toast } = useEnhancedToast();
  const { isTransitioning: isWeekTransitioning, startTransition: startWeekTransition } = useWeekTransition();

  // --- CORE STATE ---
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [bootComplete, setBootComplete] = useState(false);
  const [activeTab, setActiveTab] = useState<'WORKSPACE' | 'ASSETS' | 'FOUNDER' | 'DEALS'>('WORKSPACE');
  const [activeMobileTab, setActiveMobileTab] = useState<'COMMS' | 'DESK' | 'NEWS' | 'MENU'>('DESK');
  const [showActivityFeed, setShowActivityFeed] = useState(false);
  
  // --- UI STATE ---
  const [selectedNpcId, setSelectedNpcId] = useState<string>('advisor');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(DEFAULT_CHAT);
  const [isAdvisorLoading, setIsAdvisorLoading] = useState(false);
  const [showPortfolioDashboard, setShowPortfolioDashboard] = useState(false);
  const [dynamicNews, setDynamicNews] = useState<import('./types').NewsEvent[]>([]);

  // --- AUCTION STATE ---
  const [currentAuction, setCurrentAuction] = useState<CompetitiveDeal | null>(null);
  const [lastAuctionResult, setLastAuctionResult] = useState<AuctionResult | null>(null);

  // --- STATS MODAL STATE ---
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [hasSeenStatsTutorial, setHasSeenStatsTutorial] = useState(() => {
    return localStorage.getItem('HAS_SEEN_STATS_TUTORIAL') === 'true';
  });

  // --- POST-TUTORIAL GUIDE STATE ---
  const [showPostTutorialGuide, setShowPostTutorialGuide] = useState(false);

  // --- TRANSPARENCY MODAL STATE ---
  const [showTransparencyModal, setShowTransparencyModal] = useState(false);

  const currentScenario = activeScenario || SCENARIOS?.[0] || { id: 0, title: 'Loading...', description: '', choices: [], structureOptions: [] };
  const scenarioChoices = (currentScenario.choices && currentScenario.choices.length > 0)
    ? currentScenario.choices
    : (currentScenario.structureOptions
        ? currentScenario.structureOptions.flatMap(option =>
            (option.followUpChoices || []).map(choice => ({
              ...choice,
              text: `${option.type}: ${choice.text}`,
              description: choice.description || option.description,
            }))
          )
        : []);
  const founderUnlocked = playerStats
    ? (playerStats.personalFinances?.bankBalance ?? playerStats.cash ?? 0) >= 1_000_000
    : false;

  // Dev-only or explicit reset via query param
  useEffect(() => {
      const url = new URL(window.location.href);
      const shouldReset = url.searchParams.get('reset') === '1';

      if (shouldReset) {
          resetGame();
          setBootComplete(false);
          setChatHistory(DEFAULT_CHAT);
          setSelectedNpcId('advisor');
          clearToasts();
          addToast('Session reset via query flag.', 'info');

          url.searchParams.delete('reset');
          const nextSearch = url.searchParams.toString();
          const newUrl = `${url.pathname}${nextSearch ? `?${nextSearch}` : ''}${url.hash}`;
          window.history.replaceState({}, '', newUrl);
      }
  }, [resetGame]);

  // Check Legal Consent
  useEffect(() => {
      logEvent('app_init');
      if (localStorage.getItem('LEGAL_CONSENT') === 'true') {
          setLegalAccepted(true);
      }
  }, []);

  // Kill the boot ticking/ambience once the main UI is live
  useEffect(() => {
      if (bootComplete) {
          playAmbience(false);
      }
  }, [bootComplete, playAmbience]);

  // Auto-switch to ASSETS view on Step 6
  useEffect(() => {
      if (tutorialStep === 6 && activeTab !== 'ASSETS') {
          setActiveTab('ASSETS');
          if (window.innerWidth < 768) setActiveMobileTab('DESK');
      }
  }, [tutorialStep, activeTab]);

  // Auto-switch to COMMS on tutorial step 4 for mobile users to avoid confusion
  useEffect(() => {
      if (tutorialStep === 4 && window.innerWidth < 768 && activeMobileTab !== 'COMMS') {
          setActiveMobileTab('COMMS');
      }
  }, [tutorialStep, activeMobileTab]);

  // Send Sarah's proactive first message during tutorial step 5
  const [sarahProactiveMessageSent, setSarahProactiveMessageSent] = useState(false);
  useEffect(() => {
      if (tutorialStep === 5 && !sarahProactiveMessageSent) {
          // Check if Sarah's chat doesn't already have many messages
          const sarah = npcs.find(n => n.id === 'sarah');
          if (sarah && sarah.dialogueHistory && sarah.dialogueHistory.length <= 2) {
              // Send Sarah's proactive message
              sendNpcMessage('sarah', "Hey! Perfect timing. I've been in the data room all night. Found something weird on page 40 of the CIM - there's a patent reference they buried in the footnotes. PATENT #8829. Hydrophobic coating tech. If this is real, it could be a game-changer. Want me to dig deeper?", 'npc', 'Sarah');
              setSarahProactiveMessageSent(true);
          }
      }
  }, [tutorialStep, sarahProactiveMessageSent, npcs, sendNpcMessage]);

  // Ensure the market is live once the tutorial is cleared
  useEffect(() => {
      if (tutorialStep === 0 && bootComplete && gamePhase === 'LIFE_MANAGEMENT' && activeDeals.length === 0) {
          generateNewDeals();
      }
  }, [tutorialStep, bootComplete, gamePhase, activeDeals.length, generateNewDeals]);

  // Dynamic news: refresh on each time tick (weekly advance)
  useEffect(() => {
      if (!playerStats) return;
      if (gamePhase === 'INTRO') return;
      const tick = playerStats.timeCursor ?? 0;
      // Avoid generating during tutorial rail spam; generate after tutorial or once per tick anyway
      let cancelled = false;
      (async () => {
          try {
              const items = await getDynamicNewsEvents(playerStats, marketVolatility, actionLog);
              if (!cancelled && items?.length) {
                  setDynamicNews(items);
              }
          } catch {
              // ignore; service has its own fallback
          }
      })();
      return () => {
          cancelled = true;
      };
  }, [playerStats?.timeCursor, marketVolatility]);


  // Auto-complete boot sequence if loading saved game (playerStats exists but not in INTRO)
  useEffect(() => {
      if (!bootComplete && playerStats && gamePhase !== 'INTRO') {
          // Small delay to show the loading message, then complete boot
          const timer = setTimeout(() => {
              setBootComplete(true);
          }, 500);
          return () => clearTimeout(timer);
      }
  }, [bootComplete, playerStats, gamePhase]);

  const handleLegalAccept = () => {
      localStorage.setItem('LEGAL_CONSENT', 'true');
      setLegalAccepted(true);
      playSfx('KEYPRESS');
  };

  // --- HANDLERS ---
  const handleIntroComplete = (stress: number) => {
      // Init Stats with standard settings and mandatory PackFancy setup
      const diffSettings = DIFFICULTY_SETTINGS['Normal'];
      const initialPortfolio: PortfolioCompany[] = [{
        id: 1,
        name: "PackFancy Inc.",
        ceo: "Doris Chen",
        investmentCost: 0,
        ownershipPercentage: 0,
        currentValuation: 55000000,
        latestCeoReport: "Pending Analysis...",
        nextBoardMeeting: "TBD",
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
        pendingDecisions: []
      }];

      // Apply difficulty settings
      updatePlayerStats({
          ...diffSettings.initialStats,
          stress: diffSettings.initialStats.stress + stress,
          playedScenarioIds: [SCENARIOS?.[0]?.id ?? 1],
          portfolio: initialPortfolio
      });

      setGamePhase('LIFE_MANAGEMENT'); // Start in workspace, but with tutorial rail
      setActiveTab('WORKSPACE'); // Ensure we are on the workspace tab
      setTutorialStep(1); // Start Tutorial
      setBootComplete(true);
      logEvent('tutorial_start');
      addLogEntry(`INIT: Career Sequence Started. Role: Analyst.`);
      setChatHistory(prev => [...prev, { sender: 'system', text: `[SYSTEM_LOG] Player accepted offer. Starting stress: ${diffSettings.initialStats.stress + stress}` }]);
      playSfx('BOOT');
  };

  const handleStatChange = (changes: StatChanges) => {
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
                  loanRate: 0.22
              };
              addToast(`Auto-bridge loan wired: $${loanSize.toLocaleString()}`, 'info');
              addLogEntry('Emergency loan drawn to cover negative cash.');
          }
      }

      updatePlayerStats(finalChanges);
      if (changes.cash && changes.cash < 0) addToast(`Funds Debited: $${Math.abs(changes.cash)}`, 'info');
      if (changes.reputation && changes.reputation < 0) addToast(`Reputation Hit: ${changes.reputation}`, 'error');
  };

  const handleChoice = (choice: Choice) => {
      handleStatChange(choice.outcome.statChanges);
      addToast("ACTION_EXECUTED: " + choice.text, 'success');
      addLogEntry(`CHOICE: ${choice.text}`);
      
      // Narrative Bridge: Inject choice into Chat History
      setChatHistory(prev => [...prev, { 
          sender: 'system', 
          text: `[SYSTEM_LOG] Player chose: "${choice.text}". Outcome: ${choice.outcome.description}` 
      }]);

      playSfx('KEYPRESS');
      
      setTimeout(() => {
        setGamePhase('LIFE_MANAGEMENT');
      }, 1000);
  };

  const handleScenarioFallback = () => {
      addToast('No actionable intel. Returning to desk.', 'info');
      addLogEntry(`Scenario Cleared: ${currentScenario.title} contained no decisions.`);
      setGamePhase('LIFE_MANAGEMENT');
      setActiveTab('WORKSPACE');
  };
  
  const handleAdvanceTime = () => {
      if (!playerStats) return;

      if (tutorialStep > 0) {
          addToast("COMPLETE TUTORIAL FIRST", 'error');
          return;
      }

      if (playerStats.loanBalance > 0) {
          // Clamp loan rate to reasonable bounds (5% to 50% APR)
          const activeRate = Math.max(0.05, Math.min(0.50, playerStats.loanRate || 0.28));
          const rawMonthlyInterest = Math.ceil(playerStats.loanBalance * activeRate / 12);
          // Cap monthly interest at 10% of loan balance to prevent runaway compounding
          const maxMonthlyInterest = Math.ceil(playerStats.loanBalance * 0.10);
          const monthlyInterest = Math.min(rawMonthlyInterest, maxMonthlyInterest);
          // Only charge interest if player has enough cash, otherwise add to loan balance only
          const cashToDeduct = Math.min(monthlyInterest, Math.max(0, playerStats.cash));
          const interestToCapitalize = monthlyInterest - cashToDeduct;
          updatePlayerStats({
              loanBalanceChange: interestToCapitalize > 0 ? interestToCapitalize : undefined,
              cash: cashToDeduct > 0 ? -cashToDeduct : undefined,
              stress: +3
          });
          addToast(`Interest Accrued: $${monthlyInterest.toLocaleString()}`, 'error');
          addLogEntry(`Loan interest compounded at ${(activeRate * 100).toFixed(1)}% APR`);
      }
      advanceTime();
      generateNewDeals(); // Generate new competitive deals
      playSfx('KEYPRESS');
      addToast("TIME_ADVANCED: WEEK_CYCLE_COMPLETE", 'success');
      setChatHistory(prev => [...prev, { sender: 'system', text: "[SYSTEM_LOG] Time advanced 1 week." }]);
      
      if (activeDeals.length > 0) {
          addToast(`${activeDeals.length} DEAL${activeDeals.length > 1 ? 'S' : ''} IN PIPELINE`, 'info');
      }
      
      // Trigger week transition animation
      startWeekTransition();
  };

  // --- AUCTION HANDLERS ---
  const handleStartAuction = (deal: CompetitiveDeal) => {
      setCurrentAuction(deal);
      playSfx('NOTIFICATION');
      addLogEntry(`AUCTION ENTERED: ${deal.companyName}`);
      setChatHistory(prev => [...prev, { 
          sender: 'system', 
          text: `[SYSTEM_LOG] You entered the auction for ${deal.companyName}. Competitors: ${deal.interestedRivals.length}` 
      }]);
  };

  const handleAuctionComplete = (result: AuctionResult) => {
      setCurrentAuction(null);
      setLastAuctionResult(result);
      removeDeal(result.deal.id);
      
      updatePlayerStats(result.statChanges);
      
      if (result.won && result.portfolioCompany) {
          updatePlayerStats({ addPortfolioCompany: result.portfolioCompany });
      }
      
      if (!result.won && result.winnerId !== 'none' && result.winnerId !== 'player') {
          const winningFund = rivalFunds.find(f => f.id === result.winnerId);
          if (winningFund) {
              updateRivalFund(result.winnerId, {
                  totalDeals: winningFund.totalDeals + 1,
                  winStreak: winningFund.winStreak + 1,
                  dryPowder: winningFund.dryPowder - result.finalPrice,
                  portfolio: [...winningFund.portfolio, {
                      name: result.deal.companyName,
                      dealType: result.deal.dealType,
                      acquisitionPrice: result.finalPrice,
                      currentValue: result.deal.fairValue,
                      acquiredMonth: playerStats?.gameMonth || 1,
                      acquiredYear: playerStats?.gameYear || 1
                  }]
              });
          }
      }
      
      addLogEntry(result.won 
          ? `AUCTION WON: ${result.deal.companyName} for $${(result.finalPrice / 1000000).toFixed(1)}M`
          : `AUCTION LOST: ${result.deal.companyName} to ${result.winnerName}`
      );
      
      if (result.rivalTaunt) {
          setChatHistory(prev => [...prev, { 
              sender: 'npc', 
              senderName: 'Hunter',
              text: result.rivalTaunt!
          }]);
          playSfx('NOTIFICATION');
      }
      
      if (result.won) {
          addToast(`DEAL CLOSED: ${result.deal.companyName}`, 'success');
          playSfx('SUCCESS');
      } else {
          addToast(`DEAL LOST to ${result.winnerName}`, 'error');
          playSfx('ERROR');
      }
  };

  const handleResetSimulation = () => {
      resetGame();
      setBootComplete(false);
      setActiveTab('WORKSPACE');
      setActiveMobileTab('DESK');
      setChatHistory(DEFAULT_CHAT);
      setSelectedNpcId('advisor');
      clearToasts();
      addToast('Simulation reset. Rebooting intro...', 'info');
      addLogEntry('Simulation reset to cold open.');
  };

  const handleDismissDeal = (dealId: number) => {
      removeDeal(dealId);
      addToast("DEAL DISMISSED", 'info');
      playSfx('KEYPRESS');
  };

  // --- LIVING WORLD HANDLERS ---
  const handleConsultMachiavelli = async (event: CompanyActiveEvent | NPCDrama) => {
    // Pre-populate advisor with context about the decision
    const contextMessage = `[DECISION REQUIRED: ${event.title}] ${event.description}`;
    const optionsContext = 'options' in event
      ? event.options.map((opt: { label: string; description: string }) => `Option: ${opt.label} - ${opt.description}`).join('\n')
      : event.choices.map((choice: Choice) => `Option: ${choice.text} - ${choice.description || ''}`).join('\n');

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
  };

  const handleWarningActionWithNavigation = (warning: typeof activeWarnings[0]) => {
    handleWarningAction(warning);

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
  };

  const handleChatBackToPortfolio = () => {
      setShowPortfolioDashboard(true);
      setActiveTab('ASSETS');
      if (window.innerWidth < 768) setActiveMobileTab('DESK');
  };

  const handleStatsClick = () => {
      setShowStatsModal(true);
  };

  const handleStatsModalClose = () => {
      setShowStatsModal(false);
      if (!hasSeenStatsTutorial) {
          setHasSeenStatsTutorial(true);
          localStorage.setItem('HAS_SEEN_STATS_TUTORIAL', 'true');
      }
  };

  // --- CHAT HANDLERS ---
  const handleSendMessageToAdvisor = async (msg: string) => {
      const newMsg: ChatMessage = { sender: 'player', text: msg };
      setChatHistory(prev => [...prev, newMsg]);
      playSfx('KEYPRESS');
      setIsAdvisorLoading(true);
      try {
          const response = await getAdvisorResponse(msg, chatHistory, playerStats, activeScenario);
          setChatHistory(prev => [...prev, { sender: 'advisor', text: response }]);
          playSfx('NOTIFICATION');
      } catch (error) {
          console.error('Advisor response error:', error);
          setChatHistory(prev => [...prev, { sender: 'advisor', text: 'Connection error. The advisor is temporarily unavailable.' }]);
          addToast('Advisor connection failed', 'error');
      } finally {
          setIsAdvisorLoading(false);
      }
  };

  const handleSendMessageToNPC = async (npcId: string, msg: string) => {
      // 1. Add Player Message to UI Immediately
      sendNpcMessage(npcId, msg);
      playSfx('KEYPRESS');

      const targetNPC = npcs.find(n => n.id === npcId);
      if(targetNPC && targetNPC.dialogueHistory && playerStats) {
           const updatedHistory: ChatMessage[] = [...targetNPC.dialogueHistory, { sender: 'player' as const, text: msg }];
           // 2. Fetch AI Response
           try {
               const response = await getNPCResponse(msg, targetNPC, updatedHistory, playerStats, activeScenario);

               if (tutorialStep === 5 && /patent/i.test(msg)) {
                   setTutorialStep(6);
               }

               if (response.functionCalls) {
                  // Handle game state updates from AI tools
                  response.functionCalls.forEach(call => {
                      if (call.name === 'updateGameState' && call.args) {
                          const args = call.args;
                          const changes: StatChanges = {};
                          
                          if (args.reputationChange) changes.reputation = args.reputationChange;
                          if (args.stressChange) changes.stress = args.stressChange;
                          if (args.aumChange) changes.aum = args.aumChange; // Founder Mode

                          // If relationship changed
                          if (args.relationshipChange) {
                              changes.npcRelationshipUpdate = {
                                  npcId: npcId,
                                  change: args.relationshipChange,
                                  memory: args.logMessage || "Interaction outcome"
                              };
                          }

                          updatePlayerStats(changes);
                          if (args.logMessage) addToast(args.logMessage, args.relationshipChange < 0 ? 'error' : 'success');
                      }
                  });
               }
               
                 const npcReply = response.text || `${targetNPC?.name || 'NPC'} stares and slowly nods.`;
                 sendNpcMessage(npcId, npcReply, 'npc', targetNPC?.name || 'NPC');
                 addToast(`${targetNPC.name} responded`, 'info');

           } catch (e) {
               console.error("NPC Chat Error", e);
               addToast("COMMS_ERROR: Signal Lost", 'error');
           }
      }
  };

  // --- RENDER HELPERS ---
  const handleNpcSelect = useCallback((npcId: string) => {
    setSelectedNpcId(npcId);
    playSfx('KEYPRESS');
  }, [playSfx]);

  const handleTutorialStep5 = useCallback(() => {
    setTutorialStep(5);
  }, [setTutorialStep]);

  const renderCenterPanel = () => {
      // 1. Asset Manager View
      if (activeTab === 'ASSETS' && playerStats) {
          // LIFT PANEL ABOVE OVERLAY FOR ALL TUTORIAL STEPS to prevent black screen during transitions
          const isTutorialActive = tutorialStep >= 1 && tutorialStep <= 6;

          return (
              <TerminalPanel
                title="ASSET_MANAGER"
                className={`h-full ${isTutorialActive ? 'relative' : ''}`}
                style={isTutorialActive ? { zIndex: Z_INDEX.tutorialHighlight } : undefined}
              >
                  <PortfolioView
                      playerStats={playerStats}
                      onAction={(id, action) => {
                          // Special logic for Submit IOI in tutorial
                          if (tutorialStep === 6 && action.id === 'submit_ioi') {
                              setTutorialStep(0); // END TUTORIAL
                              setShowPostTutorialGuide(true); // Show guidance before scenario
                              logEvent('tutorial_complete');
                              setChatHistory(prev => [...prev, { sender: 'system', text: "[SYSTEM_LOG] Tutorial Complete. First Deal IOI Submitted." }]);
                          } else {
                              handleStatChange(action.outcome.statChanges);
                              addToast(action.outcome.logMessage, 'info');
                              addLogEntry(action.outcome.logMessage);
                              setChatHistory(prev => [...prev, { sender: 'system', text: `[SYSTEM_LOG] Portfolio Action: ${action.text}` }]);
                          }
                      }}
                      onBack={() => {
                          if (tutorialStep > 0) {
                              addToast('Complete the tutorial first!', 'error');
                              return;
                          }
                          setActiveTab('WORKSPACE');
                          playSfx('KEYPRESS');
                      }}
                      onJumpShip={() => {
                          if (!founderUnlocked) {
                              addToast('Founder Mode locked. Requires $1M in personal funds.', 'error');
                              return;
                          }
                          setActiveTab('FOUNDER');
                      }}
                      canAccessFounder={founderUnlocked}
                      backDisabled={tutorialStep > 0}
                      onDiscuss={(company, advisorType) => {
                          // Map advisor type to NPC ID
                          const npcId = advisorType === 'sarah' ? 'sarah' : 'advisor';
                          setSelectedNpcId(npcId);

                          // Switch to COMMS view on mobile
                          if (window.innerWidth < 768) {
                              setActiveMobileTab('COMMS');
                          }

                          // Send context message about the deal
                          const contextMessage = advisorType === 'sarah'
                              ? `I'd like to discuss the ${company.name} deal. It's a ${company.dealType} opportunity with $${(company.ebitda / 1000000).toFixed(1)}M EBITDA and ${(company.revenueGrowth * 100).toFixed(1)}% growth.`
                              : `I need strategic advice on ${company.name}. What's your read on this deal?`;

                          sendNpcMessage(npcId, contextMessage, 'player');
                          addLogEntry(`Discussing ${company.name} with ${advisorType === 'sarah' ? 'Sarah' : 'Machiavelli'}`);
                      }}
                  />
              </TerminalPanel>
          )
      }
      
      // 2. Founder Mode
      if (activeTab === 'FOUNDER' && playerStats) {
          return (
              <TerminalPanel title="FOUNDER_DASHBOARD" className="h-full">
                  <FounderDashboard 
                      playerStats={playerStats}
                      npcs={npcs}
                      onRecruit={(npcId) => {
                          updatePlayerStats({ employees: [...playerStats.employees, npcId], cash: -20000 }); // Recruit cost
                          addToast("New hire onboarded.", 'success');
                          playSfx('SUCCESS');
                      }}
                      onOpenChat={(npcId) => {
                         setSelectedNpcId(npcId);
                         if (window.innerWidth < 768) {
                             setActiveMobileTab('COMMS');
                         }
                      }}
                  />
              </TerminalPanel>
          )
      }

      // 3. Deal Market (Competitive Auctions)
      if (activeTab === 'DEALS' && playerStats) {
          return (
              <div className="h-full grid grid-rows-[1fr_auto] md:grid-rows-1 md:grid-cols-[1fr_300px] gap-2">
                  <DealMarket
                      deals={activeDeals}
                      playerStats={playerStats}
                      onSelectDeal={handleStartAuction}
                      onDismissDeal={handleDismissDeal}
                  />
                  <div className="hidden md:block">
                      <RivalLeaderboard
                          rivalFunds={rivalFunds}
                          playerStats={playerStats}
                          className="h-full"
                      />
                  </div>
              </div>
          );
      }

      // 4. Scenario Workspace
      if (gamePhase === 'SCENARIO') {
          return (
              <ScenarioPanel
                  scenario={currentScenario}
                  choices={scenarioChoices}
                  onChoice={handleChoice}
                  onFallback={handleScenarioFallback}
              />
          );
      }

      // 5. Event-Driven Workspace - The core gameplay experience
      // Events drive everything: narrative-first, systems-second
      return (
          <EventDrivenWorkspace
            tutorialStep={tutorialStep}
            onManageAssets={() => {
              setActiveTab('ASSETS');
              if (tutorialStep === 1) setTutorialStep(2);
              playSfx('KEYPRESS');
            }}
            onShowPortfolioDashboard={() => setShowPortfolioDashboard(true)}
            onDealFlow={() => {
              setActiveTab('DEALS');
              playSfx('KEYPRESS');
            }}
            onAdvanceTime={handleAdvanceTime}
            activeDealsCount={activeDeals.length}
            addToast={(msg, type) => addToast(msg, type)}
            addLogEntry={addLogEntry}
            onSwitchTab={(tab) => {
              // Handle tab switching from onboarding events
              if (tab === 'ASSETS') {
                setActiveTab('ASSETS');
                if (window.innerWidth < 768) setActiveMobileTab('DESK');
              } else if (tab === 'COMMS') {
                if (window.innerWidth < 768) setActiveMobileTab('COMMS');
              }
              playSfx('KEYPRESS');
            }}
            onTutorialComplete={() => {
              // Handle tutorial completion from onboarding events
              setTutorialStep(0);
              setShowPostTutorialGuide(false);
              setGamePhase('SCENARIO');
              logEvent('tutorial_complete');
              addLogEntry('ONBOARDING: Complete. Ready for real deals.');
              playSfx('SUCCESS');
            }}
          />
      );
  };

  // --- MAIN RENDER ---
  if (authLoading) {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-green-500 text-2xl font-mono animate-pulse">FUND WARS OS</div>
          <div className="text-slate-500 text-xs mt-4">Initializing secure connection...</div>
          <div className="mt-4 flex justify-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return <LoginScreen />;

  if (!legalAccepted) return <LegalDisclaimer onAccept={handleLegalAccept} />;

  if (!bootComplete) {
      if (gamePhase === 'INTRO') return <IntroSequence onComplete={handleIntroComplete} />;
      // If we loaded a game and are not in Intro, skip boot sequence
      if (playerStats) {
          // Use useEffect pattern to avoid setting state during render
          // Show a brief loading state while transitioning
          return (
              <div className="h-screen w-screen bg-black flex items-center justify-center">
                  <div className="text-center">
                      <div className="text-green-500 text-xl font-mono animate-pulse">RESTORING SESSION...</div>
                      <div className="text-slate-500 text-xs mt-2">Loading portfolio data</div>
                  </div>
              </div>
          );
      }
      return <SystemBoot onComplete={() => setBootComplete(true)} />;
  }

  return (
    <div className="h-screen w-screen bg-black text-slate-200 flex flex-col overflow-hidden font-terminal">
        {/* End-state overlay so the game flow always resolves visibly */}
        {playerStats && ['GAME_OVER', 'PRISON', 'ALONE', 'VICTORY'].includes(gamePhase) && (
            <GameEndModal
                phase={gamePhase}
                stats={playerStats}
                actionLog={actionLog}
                onRestart={handleResetSimulation}
                onClose={() => {
                    // Allow player to keep browsing the UI, but make the end state explicit.
                    // They can restart from the modal at any time.
                    addToast('End state acknowledged. You can restart from the menu.', 'info');
                }}
            />
        )}

        {import.meta.env.DEV && (
            <button
                className="fixed top-2 right-2 bg-slate-800 text-white text-[10px] px-3 py-1 border border-slate-600 rounded hover:bg-slate-700"
                style={{ zIndex: Z_INDEX.max }}
                onClick={() => {
                    resetGame();
                    setBootComplete(false);
                    setChatHistory(DEFAULT_CHAT);
                    setSelectedNpcId('advisor');
                    clearToasts();
                    addToast('Session reset.', 'success');
                }}
            >
                Reset Game
            </button>
        )}
        {/* Mobile Status Bar / Safe Area Top */}
        <div className="pt-[env(safe-area-inset-top)] bg-slate-900 border-b border-slate-700 md:pt-0">
             {playerStats && (
                <PlayerStatsDisplay
                    stats={playerStats}
                    marketVolatility={marketVolatility}
                    onStatsClick={handleStatsClick}
                    onOpenTransparency={() => setShowTransparencyModal(true)}
                />
             )}
        </div>
        
        {/* DESKTOP GRID LAYOUT (Hidden on Mobile) */}
        <div className="hidden md:grid flex-1 grid-cols-[250px_1fr_250px] overflow-hidden relative">
            {/* Left Panel (Comms) */}
            <div 
                className={`border-r border-slate-700 bg-black ${tutorialStep === 4 ? 'relative' : ''}`}
                style={tutorialStep === 4 ? { zIndex: Z_INDEX.tutorialHighlight } : undefined}
            >
                <NpcListPanel
                  npcs={npcs}
                  selectedNpcId={selectedNpcId}
                  onSelectNpc={handleNpcSelect}
                  tutorialStep={tutorialStep}
                  onTutorialAdvance={handleTutorialStep5}
                />
            </div>
            
            {/* Center Column (Workspace) */}
            {/* Lift during tutorial interactions - include step 4 to prevent black screen after analyze */}
            <div 
                className={`bg-black relative flex flex-col`}
                style={(tutorialStep >= 1 && tutorialStep <= 6) ? { zIndex: Z_INDEX.tutorialHighlight } : undefined}
            >
                {/* Desktop Tab Bar */}
                <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex border border-slate-700 rounded-lg overflow-hidden bg-black">
                        {(['WORKSPACE', 'ASSETS', 'FOUNDER', 'DEALS'] as const).map((tab) => {
                            const tabLabels = {
                                'WORKSPACE': 'WORKSPACE',
                                'ASSETS': 'ASSETS',
                                'FOUNDER': 'FOUNDER',
                                'DEALS': 'DEALS'
                            };
                            const isDisabled = tab === 'FOUNDER' && !founderUnlocked;
                            return (
                                <button
                                    key={tab}
                                    onClick={() => !isDisabled && setActiveTab(tab)}
                                    disabled={isDisabled}
                                    className={`px-3 py-2 text-xs font-bold uppercase transition-colors ${
                                        activeTab === tab
                                            ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-black'
                                            : isDisabled
                                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                    }`}
                                >
                                    {tabLabels[tab]}
                                    {isDisabled && <i className="fas fa-lock ml-1"></i>}
                                </button>
                            );
                        })}
                    </div>
                    
                    {/* Activity Feed Toggle */}
                    <button
                      onClick={() => setShowActivityFeed(!showActivityFeed)}
                      className={`
                        px-3 py-2 rounded-lg border text-xs font-bold uppercase
                        transition-all duration-200
                        ${showActivityFeed
                          ? 'bg-blue-900/50 border-blue-500/60 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                          : 'bg-slate-800/50 border-slate-600/50 text-slate-400 hover:bg-slate-700/50 hover:border-slate-500'
                        }
                      `}
                    >
                      <i className="fas fa-list-ul mr-1"></i>
                      Activity
                      {activities && activities.length > 0 && (
                        <span className="ml-1.5 px-1.5 py-0.5 bg-blue-500 text-white text-[10px] rounded-full">
                          {activities.length > 99 ? '99+' : activities.length}
                        </span>
                      )}
                    </button>
                </div>
                {renderCenterPanel()}
            </div>
            
            {/* Right Panel (News) */}
            <div className="border-l border-slate-700 bg-black">
                 <NewsTicker events={[...dynamicNews, ...NEWS_EVENTS]} systemLogs={actionLog} />
            </div>
            
            <TutorialOverlay instruction={TUTORIAL_STEPS_TEXT[tutorialStep]} step={tutorialStep} />
        </div>

        {/* MOBILE LAYOUT (View Switcher) */}
        <div className="md:hidden flex-1 flex flex-col overflow-hidden relative">
            {activeMobileTab === 'COMMS' && (
                <>
                    <CommsTerminal
                        mode="MOBILE_EMBED"
                        isOpen={true}
                        npcList={npcs}
                        selectedNpcId={selectedNpcId} // Pass this prop
                        advisorMessages={chatHistory}
                        onSendMessageToAdvisor={handleSendMessageToAdvisor}
                        onSendMessageToNPC={handleSendMessageToNPC}
                        isLoadingAdvisor={isAdvisorLoading}
                        predefinedQuestions={PREDEFINED_QUESTIONS}
                        onClose={handleChatBackToPortfolio}
                        onBackToPortfolio={handleChatBackToPortfolio}
                    />
                    <TutorialOverlay instruction={TUTORIAL_STEPS_TEXT[tutorialStep]} step={tutorialStep} />
                </>
            )}
            
            {activeMobileTab === 'DESK' && (
                <div 
                    className={`flex-1 overflow-hidden relative bg-black`}
                    style={(tutorialStep >= 1 && tutorialStep <= 6) ? { zIndex: Z_INDEX.tutorialHighlight } : undefined}
                >
                    {renderCenterPanel()}
                    <TutorialOverlay instruction={TUTORIAL_STEPS_TEXT[tutorialStep]} step={tutorialStep} />
                </div>
            )}
            
            {activeMobileTab === 'NEWS' && (
                <div className="flex-1 overflow-hidden">
                     <NewsTicker events={[...dynamicNews, ...NEWS_EVENTS]} systemLogs={actionLog} />
                </div>
            )}

             {activeMobileTab === 'MENU' && (
                <div className="flex-1 bg-slate-900 p-6 space-y-4 overflow-auto">
                    <h2 className="text-xl font-bold text-white mb-4">SYSTEM_MENU</h2>

                    {/* Quick Stats Preview */}
                    <div className="space-y-2 text-sm text-slate-400 font-mono">
                        <div className="flex justify-between p-2 border border-slate-700 bg-black">
                             <span>Reputation</span>
                             <span className="text-blue-500">{playerStats?.reputation}/100</span>
                        </div>
                        <div className="flex justify-between p-2 border border-slate-700 bg-black">
                             <span>Analyst Rating</span>
                             <span className="text-amber-500">{playerStats?.analystRating}/100</span>
                        </div>
                        <div className="flex justify-between p-2 border border-slate-700 bg-black">
                             <span>Level</span>
                             <span className="text-green-500">{playerStats?.level}</span>
                        </div>
                    </div>

                    {/* View Full Stats Button */}
                    <button
                        className="w-full bg-gradient-to-r from-amber-600 to-amber-500 text-black py-3 uppercase font-bold text-xs tracking-widest hover:from-amber-500 hover:to-amber-400 rounded-lg flex items-center justify-center gap-2 transition-all"
                        onClick={handleStatsClick}
                    >
                        <i className="fas fa-chart-bar"></i>
                        View Full Stats & Explanation
                    </button>

                    {/* Transparency Button */}
                    <button
                        className="w-full border border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 text-slate-200 py-3 uppercase font-bold text-xs tracking-widest rounded-lg flex items-center justify-center gap-2 transition-all"
                        onClick={() => setShowTransparencyModal(true)}
                    >
                        <i className="fas fa-eye"></i>
                        Transparency & Rules
                    </button>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                        <button
                            className="p-3 border border-slate-700 bg-slate-800/50 rounded-lg text-slate-300 text-xs font-bold hover:bg-slate-700/50 flex flex-col items-center gap-1 transition-colors"
                            onClick={() => { setActiveMobileTab('DESK'); setActiveTab('ASSETS'); }}
                        >
                            <i className="fas fa-briefcase text-emerald-400"></i>
                            <span>Portfolio</span>
                        </button>
                        <button
                            className="p-3 border border-slate-700 bg-slate-800/50 rounded-lg text-slate-300 text-xs font-bold hover:bg-slate-700/50 flex flex-col items-center gap-1 transition-colors"
                            onClick={() => { setActiveMobileTab('DESK'); setActiveTab('DEALS'); }}
                        >
                            <i className="fas fa-gavel text-amber-400"></i>
                            <span>Deal Market</span>
                        </button>
                    </div>

                    {/* Danger Zone */}
                    <div className="pt-4 border-t border-slate-800">
                        <div className="text-xs text-slate-400 mb-2 uppercase tracking-wider">Danger Zone</div>
                        <button
                            className="w-full border border-red-900 text-red-500 py-3 uppercase font-bold text-xs tracking-widest hover:bg-red-900/20 rounded-lg transition-colors"
                            onClick={handleResetSimulation}
                        >
                            Reset Simulation
                        </button>
                    </div>

                    {/* User Info */}
                    <div className="pt-4 border-t border-slate-800">
                         <div className="text-xs text-slate-400 mb-2">Authenticated as:</div>
                         <div className="flex items-center space-x-3 text-slate-300 mb-4">
                            {user.picture && <img src={user.picture} alt="Profile" className="w-8 h-8 rounded-full border border-slate-600" />}
                            <span>{user.email}</span>
                         </div>
                    </div>
                </div>
            )}
        </div>
        
        {/* DESKTOP BOTTOM BAR: CMD LINE */}
        <div className="hidden md:flex h-8 bg-slate-900 border-t border-slate-700 items-center px-2 text-xs font-mono text-green-500">
            <span className="mr-2">{">"}</span>
            <span className="animate-pulse">_</span>
        </div>

        {/* DESKTOP FLOATING CHAT TERMINAL - Always on top of content panels */}
        <div className="hidden md:block">
            <CommsTerminal
                npcList={npcs}
                selectedNpcId={selectedNpcId} // Pass this prop
                advisorMessages={chatHistory}
                onSendMessageToAdvisor={handleSendMessageToAdvisor}
                onSendMessageToNPC={handleSendMessageToNPC}
                isLoadingAdvisor={isAdvisorLoading}
                predefinedQuestions={PREDEFINED_QUESTIONS}
                onClose={handleChatBackToPortfolio}
                onBackToPortfolio={handleChatBackToPortfolio}
            />
        </div>

        <PortfolioCommandCenter
            isOpen={showPortfolioDashboard}
            onClose={() => setShowPortfolioDashboard(false)}
            onJumpToAssets={() => {
                setShowPortfolioDashboard(false);
                setActiveTab('ASSETS');
                if (window.innerWidth < 768) setActiveMobileTab('DESK');
            }}
        />

        {/* COMPETITIVE AUCTION MODAL */}
        {currentAuction && playerStats && (
            <CompetitiveAuctionModal
                deal={currentAuction}
                playerCash={playerStats.cash}
                playerReputation={playerStats.reputation}
                onComplete={handleAuctionComplete}
                onClose={() => setCurrentAuction(null)}
            />
        )}

        {/* POST-TUTORIAL GUIDE MODAL */}
        <PostTutorialGuide
            isOpen={showPostTutorialGuide}
            onClose={() => {
                setShowPostTutorialGuide(false);
                setGamePhase('SCENARIO');
                setActiveTab('WORKSPACE');
                addToast("IOI SUBMITTED. Time to choose your deal structure.", "success");
            }}
            onContinue={() => {
                setShowPostTutorialGuide(false);
                setGamePhase('SCENARIO');
                setActiveTab('WORKSPACE');
                addToast("IOI SUBMITTED. Time to choose your deal structure.", "success");
                playSfx('SUCCESS');
            }}
        />

        {/* MOBILE BOTTOM NAV */}
        <BottomNav activeTab={activeMobileTab} onTabChange={setActiveMobileTab} />

        {/* WARNING PANEL - Living World System */}
        <WarningPanel
            warnings={activeWarnings}
            onDismiss={dismissWarning}
            onAction={handleWarningActionWithNavigation}
        />

        {/* TRANSPARENCY / RULES MODAL */}
        {playerStats && (
            <TransparencyModal
                isOpen={showTransparencyModal}
                stats={playerStats}
                marketVolatility={marketVolatility}
                onClose={() => setShowTransparencyModal(false)}
            />
        )}

        {/* COMPANY EVENT DECISION MODAL */}
        {activeCompanyEvent && (
            <div 
                className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                style={{ zIndex: Z_INDEX.modalOverlay }}
            >
                <div className="w-full max-w-lg bg-slate-900 border border-amber-500/50 rounded-lg shadow-2xl">
                    <div className="p-4 border-b border-amber-500/30 bg-amber-500/10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                                <i className="fas fa-exclamation-triangle text-amber-400"></i>
                            </div>
                            <div>
                                <div className="text-xs text-amber-400/70 uppercase tracking-wider">Company Event (1 AP)</div>
                                <div className="text-lg font-bold text-white">{activeCompanyEvent.title}</div>
                            </div>
                        </div>
                    </div>
                    <div className="p-4">
                        <p className="text-sm text-slate-300 mb-4">{activeCompanyEvent.description}</p>
                        {(playerStats?.gameTime?.actionsRemaining || 0) < 1 && (
                            <div className="bg-red-950/50 border border-red-800/50 p-3 rounded mb-4">
                                <div className="text-red-400 text-sm font-bold">No AP remaining</div>
                                <div className="text-red-400/70 text-xs">Advance time to get more actions</div>
                            </div>
                        )}
                        <div className="space-y-2">
                            {activeCompanyEvent.options.map((option, idx) => {
                                // Risk is 0-100 number: 0-30 = low, 31-60 = medium, 61+ = high
                                const riskLevel = (option.risk || 0) >= 60 ? 'high' : (option.risk || 0) >= 30 ? 'medium' : 'low';
                                const riskPercent = option.risk || 0;
                                return (
                                <button
                                    key={idx}
                                    disabled={(playerStats?.gameTime?.actionsRemaining || 0) < 1}
                                    onClick={() => {
                                        if (!useAction(1)) {
                                            addToast('Not enough AP this week.', 'error');
                                            return;
                                        }
                                        handleEventDecision(activeCompanyEvent.id, option.id);
                                        addToast(`DECISION: ${option.label} — ${option.outcomeText}`, riskLevel === 'high' ? 'error' : 'success');
                                        addLogEntry(`EVENT: ${activeCompanyEvent.title} - Chose: ${option.label}`);
                                    }}
                                    className={`w-full text-left p-3 border rounded transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                                        riskLevel === 'high'
                                            ? 'border-red-500/50 hover:border-red-400 hover:bg-red-900/20'
                                            : riskLevel === 'medium'
                                            ? 'border-amber-500/50 hover:border-amber-400 hover:bg-amber-900/20'
                                            : 'border-green-500/50 hover:border-green-400 hover:bg-green-900/20'
                                    }`}
                                >
                                    <div className="text-sm font-bold text-white">{option.label}</div>
                                    <div className="text-xs text-slate-400 mt-1">{option.description}</div>
                                    <div className={`text-[10px] mt-1 ${
                                        riskLevel === 'high' ? 'text-red-400' : riskLevel === 'medium' ? 'text-amber-400' : 'text-green-400'
                                    }`}>
                                        Risk: {riskPercent}% ({riskLevel.toUpperCase()})
                                    </div>
                                </button>
                            );})}
                        </div>
                        <button
                            onClick={() => handleConsultMachiavelli(activeCompanyEvent)}
                            className="w-full mt-4 p-3 border border-purple-500/50 hover:border-purple-400 hover:bg-purple-900/20 rounded text-purple-400 text-sm flex items-center justify-center gap-2"
                        >
                            <i className="fas fa-user-secret"></i>
                            Consult Machiavelli (Free)
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* NPC DRAMA DECISION MODAL */}
        {activeDrama && (
            <div 
                className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                style={{ zIndex: Z_INDEX.modalOverlay }}
            >
                <div className="w-full max-w-lg bg-slate-900 border border-purple-500/50 rounded-lg shadow-2xl">
                    <div className="p-4 border-b border-purple-500/30 bg-purple-500/10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                                <i className="fas fa-theater-masks text-purple-400"></i>
                            </div>
                            <div>
                                <div className="text-xs text-purple-400/70 uppercase tracking-wider">Office Drama (1 AP)</div>
                                <div className="text-lg font-bold text-white">{activeDrama.title}</div>
                            </div>
                        </div>
                    </div>
                    <div className="p-4">
                        <p className="text-sm text-slate-300 mb-4">{activeDrama.description}</p>
                        {activeDrama.involvedNpcs && activeDrama.involvedNpcs.length > 0 && (
                            <div className="text-xs text-slate-500 mb-3">
                                <i className="fas fa-users mr-1"></i>
                                Involved: {activeDrama.involvedNpcs.join(', ')}
                            </div>
                        )}
                        {(playerStats?.gameTime?.actionsRemaining || 0) < 1 && (
                            <div className="bg-red-950/50 border border-red-800/50 p-3 rounded mb-4">
                                <div className="text-red-400 text-sm font-bold">No AP remaining</div>
                                <div className="text-red-400/70 text-xs">Advance time to get more actions</div>
                            </div>
                        )}
                        <div className="space-y-2">
                            {activeDrama.choices.map((choice, idx) => (
                                <button
                                    key={idx}
                                    disabled={(playerStats?.gameTime?.actionsRemaining || 0) < 1}
                                    onClick={() => {
                                        if (!useAction(1)) {
                                            addToast('Not enough AP this week.', 'error');
                                            return;
                                        }
                                        updatePlayerStats(choice.outcome.statChanges);
                                        if (choice.outcome.npcEffects) {
                                            choice.outcome.npcEffects.forEach(effect => {
                                                updatePlayerStats({
                                                    npcRelationshipUpdate: {
                                                        npcId: effect.npcId,
                                                        change: effect.relationshipChange,
                                                        memory: `Drama: ${activeDrama.title} - ${choice.text}`
                                                    }
                                                });
                                            });
                                        }
                                        setActiveDrama(null);
                                        addToast(`DECISION: ${choice.text} — ${choice.outcome.description}`, 'info');
                                        addLogEntry(`DRAMA: ${activeDrama.title} - Chose: ${choice.text}`);
                                    }}
                                    className="w-full text-left p-3 border border-slate-600 hover:border-purple-400 hover:bg-purple-900/10 rounded transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <div className="text-sm font-bold text-white">{choice.text}</div>
                                    {choice.description && (
                                        <div className="text-xs text-slate-400 mt-1">{choice.description}</div>
                                    )}
                                    <div className="text-[10px] text-cyan-500 mt-1">(1 AP)</div>
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => handleConsultMachiavelli(activeDrama)}
                            className="w-full mt-4 p-3 border border-purple-500/50 hover:border-purple-400 hover:bg-purple-900/20 rounded text-purple-400 text-sm flex items-center justify-center gap-2"
                        >
                            <i className="fas fa-user-secret"></i>
                            Consult Machiavelli (Free)
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* TOAST LAYER */}
        <TerminalToast toasts={toasts} removeToast={removeToast} />

        {/* WEEK TRANSITION */}
        {playerStats?.gameTime && (
          <WeekTransition
            isActive={isWeekTransitioning}
            currentWeek={playerStats.gameTime.week}
            year={playerStats.gameTime.year}
            quarter={playerStats.gameTime.quarter}
          />
        )}

        {/* GLITCH EFFECTS */}
        {playerStats && <SanityEffects stress={playerStats.stress} dependency={playerStats.dependency} />}

        {/* STATS EXPLAINER MODAL */}
        {showStatsModal && playerStats && (
            <StatsExplainerModal
                stats={playerStats}
                marketVolatility={marketVolatility}
                onClose={handleStatsModalClose}
                isFirstTime={!hasSeenStatsTutorial}
            />
        )}
      {/* Activity Feed Slide-out Panel */}
      <div
        className={`
          fixed top-0 right-0 h-full w-80 bg-slate-900 border-l border-slate-700 shadow-2xl
          transform transition-transform duration-300 ease-in-out
          ${showActivityFeed ? 'translate-x-0' : 'translate-x-full'}
        `}
        style={{ zIndex: Z_INDEX.modal - 1 }}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <i className="fas fa-list-ul text-blue-400"></i>
              Activity Feed
            </h3>
            <button
              onClick={() => setShowActivityFeed(false)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
          
          {/* Activity Feed */}
          <div className="flex-1 overflow-hidden">
            <ActivityFeed activities={activities || []} className="h-full" />
          </div>
        </div>
      </div>

      {/* Activity Feed Overlay (mobile) */}
      {showActivityFeed && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden"
          style={{ zIndex: Z_INDEX.modal - 2 }}
          onClick={() => setShowActivityFeed(false)}
        />
      )}

      {/* Enhanced Toast System */}
      <ToastContainer toasts={toasts} onDismiss={removeEnhancedToast} />
    </div>
  );
};

export default App;
