
import React, { useState, useEffect, useCallback } from 'react';
import type { PlayerStats, Scenario, ChatMessage, Choice, StatChanges, GamePhase, PortfolioCompany, MarketVolatility, NPC, CompetitiveDeal } from './types';
import { PlayerLevel, DealType } from './types';
import { DIFFICULTY_SETTINGS, SCENARIOS, NEWS_EVENTS, LIFE_ACTIONS, PREDEFINED_QUESTIONS, PORTFOLIO_ACTIONS, INITIAL_NPCS, QUIZ_QUESTIONS, VICE_ACTIONS, SHADOW_ACTIONS, RIVAL_FUNDS, COMPENSATION_BY_LEVEL, AFFORDABILITY_THRESHOLDS } from './constants';
import NewsTicker from './components/NewsTicker';
import CommsTerminal from './components/CommsTerminal';
import PortfolioView from './components/PortfolioView';
import FounderDashboard from './components/FounderDashboard';
import SanityEffects from './components/SanityEffects';
import IntroSequence from './components/IntroSequence';
import SystemBoot from './components/SystemBoot';
import TutorialOverlay from './components/TutorialOverlay';
import PlayerStatsDisplay from './components/PlayerStats';
import BottomNav from './components/BottomNav';
import LoginScreen from './components/LoginScreen';
import LegalDisclaimer from './components/LegalDisclaimer';
import { TerminalPanel, TerminalButton, TerminalToast } from './components/TerminalUI';
import NpcListPanel from './components/NpcListPanel';
import WorkspacePanel from './components/WorkspacePanel';
import ScenarioPanel from './components/ScenarioPanel';
import { getAdvisorResponse, getNPCResponse } from './services/geminiService';
import { useGame } from './context/GameContext';
import { useAuth } from './context/AuthContext';
import { useAudio } from './context/AudioContext';
import { logEvent } from './services/analytics';
import { useToast } from './hooks/useToast';
import CompetitiveAuctionModal, { AuctionResult } from './components/CompetitiveAuctionModal';
import DealMarket from './components/DealMarket';
import RivalLeaderboard from './components/RivalLeaderboard';
import PortfolioCommandCenter from './components/PortfolioCommandCenter';

declare global {
  interface Window {
    google?: unknown;
  }
}

const TUTORIAL_STEPS_TEXT = [
    "", // Step 0 (Inactive)
    "The meat grinder is empty. Click [MANAGE_ASSETS] to see the deal Chad just threw at you.", // Step 1
    "Here it is. 'PackFancy'. Click the row to open the Deal Memo.", // Step 2
    "Look at that Revenue. Flat as a pancake. If you buy this now, you get fired. You need an edge. Click [ANALYZE] to dig deeper.", // Step 3
    "Analysis complete. We found a weird patent on Page 40. Ask your analyst Sarah about it. Go to [COMMS] (mobile users switch to COMMS tab).", // Step 4
    "Tell Sarah to check the patent. Type or tap the prompt.", // Step 5
    "Now we're talking. Valuation just doubled. Click [SUBMIT IOI] to lock it in.", // Step 6
];

const DEFAULT_CHAT: ChatMessage[] = [
    { sender: 'advisor', text: "SYSTEM READY. Awaiting inputs." }
];

const App: React.FC = () => {
  // Use Context
  const {
    user, playerStats, npcs, activeScenario, gamePhase, difficulty, marketVolatility, tutorialStep, actionLog,
    setGamePhase, updatePlayerStats, sendNpcMessage, setTutorialStep, advanceTime, addLogEntry,
    rivalFunds, activeDeals, updateRivalFund, removeDeal, generateNewDeals, resetGame
  } = useGame();
  
  const { loading: authLoading } = useAuth();
  const { playSfx, playAmbience } = useAudio();
  const { toasts, addToast, removeToast, clearToasts } = useToast();

  // --- CORE STATE ---
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [bootComplete, setBootComplete] = useState(false);
  const [activeTab, setActiveTab] = useState<'WORKSPACE' | 'ASSETS' | 'FOUNDER' | 'DEALS'>('WORKSPACE');
  const [activeMobileTab, setActiveMobileTab] = useState<'COMMS' | 'DESK' | 'NEWS' | 'MENU'>('DESK');
  
  // --- UI STATE ---
  const [selectedNpcId, setSelectedNpcId] = useState<string>('advisor');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(DEFAULT_CHAT);
  const [isAdvisorLoading, setIsAdvisorLoading] = useState(false);
  const [showPortfolioDashboard, setShowPortfolioDashboard] = useState(false);

  // --- AUCTION STATE ---
  const [currentAuction, setCurrentAuction] = useState<CompetitiveDeal | null>(null);
  const [lastAuctionResult, setLastAuctionResult] = useState<AuctionResult | null>(null);

  const currentScenario = activeScenario || SCENARIOS[0];
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
  const founderUnlocked = playerStats ? playerStats.reputation >= 50 : false;

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

  // Ensure the market is live once the tutorial is cleared
  useEffect(() => {
      if (tutorialStep === 0 && bootComplete && gamePhase === 'LIFE_MANAGEMENT' && activeDeals.length === 0) {
          generateNewDeals();
      }
  }, [tutorialStep, bootComplete, gamePhase, activeDeals.length, generateNewDeals]);


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
      const diffSettings = DIFFICULTY_SETTINGS['NORMAL'];
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
        isAnalyzed: false
      }];

      // Apply difficulty settings
      updatePlayerStats({
          ...diffSettings.initialStats,
          stress: diffSettings.initialStats.stress + stress,
          playedScenarioIds: [SCENARIOS[0].id],
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

  const handleChatBackToPortfolio = () => {
      setShowPortfolioDashboard(true);
      setActiveTab('ASSETS');
      if (window.innerWidth < 768) setActiveMobileTab('DESK');
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
      if(targetNPC && playerStats) {
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
               
                 const npcReply = response.text || `${targetNPC.name} stares and slowly nods.`;
                 sendNpcMessage(npcId, npcReply, 'npc', targetNPC.name);
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
                className={`h-full ${isTutorialActive ? 'relative z-[100]' : ''}`}
              >
                  <PortfolioView
                      playerStats={playerStats}
                      onAction={(id, action) => {
                          // Special logic for Submit IOI in tutorial
                          if (tutorialStep === 6 && action.id === 'submit_ioi') {
                              setGamePhase('SCENARIO');
                              setActiveTab('WORKSPACE');
                              setTutorialStep(0); // END TUTORIAL
                              addToast("IOI SUBMITTED. DEAL PHASE INITIATED.", "success");
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
                              addToast('Founder Mode locked. Build more reputation first.', 'error');
                              return;
                          }
                          setActiveTab('FOUNDER');
                      }}
                      canAccessFounder={founderUnlocked}
                      backDisabled={tutorialStep > 0}
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

      // 5. Downtime / Default Workspace
      // LIFT PANEL ABOVE OVERLAY FOR ALL TUTORIAL STEPS to prevent black screen during transitions
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
                        // Calculate affordability for this action
                        const actionCost = Math.abs(action.outcome.statChanges.cash || 0);
                        const canAfford = playerStats ? playerStats.cash >= actionCost : false;
                        const expensiveThreshold = playerStats ? AFFORDABILITY_THRESHOLDS[playerStats.level] : 200;
                        const feelsExpensive = actionCost >= expensiveThreshold;

                        // Check loan access for bridge loan action
                        const compensation = playerStats ? COMPENSATION_BY_LEVEL[playerStats.level] : null;
                        const canAccessLoan = compensation?.canAccessLoan ?? false;
                        const loanLimit = compensation?.loanLimit ?? 0;
                        const currentLoanBalance = playerStats?.loanBalance ?? 0;
                        const isLoanAction = action.id === 'hard_money_loan';
                        const loanLocked = isLoanAction && !canAccessLoan;

                        return (
                        <button
                            key={action.id}
                            onClick={() => {
                                if (tutorialStep > 0) return; // Lock during tutorial
                                if (!playerStats) return;

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
                                    handleStatChange(action.outcome.statChanges);
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

                                // Warning for expensive actions (but still allow)
                                if (feelsExpensive && actionCost > 0) {
                                    addToast(`Splurging $${actionCost.toLocaleString()} on ${action.text}`, 'info');
                                }

                                handleStatChange(action.outcome.statChanges);
                                addToast(action.text, 'success');
                                addLogEntry(`ACTION: ${action.text}`);
                            }}
                            className={`aspect-square border border-slate-700 hover:bg-slate-800 hover:border-blue-500 flex flex-col items-center justify-center p-2 text-center group transition-all active:scale-95 active:border-amber-500 active:shadow-[0_0_12px_rgba(245,158,11,0.4)] ${tutorialStep > 0 ? 'opacity-30 cursor-not-allowed' : ''} ${loanLocked ? 'opacity-40 border-red-900' : ''} ${!canAfford && actionCost > 0 ? 'opacity-50 border-slate-800' : ''}`}
                        >
                            <i className={`fas ${action.icon} text-2xl mb-2 ${loanLocked ? 'text-red-900' : !canAfford && actionCost > 0 ? 'text-slate-600' : feelsExpensive && actionCost > 0 ? 'text-amber-600' : 'text-slate-500'} group-hover:text-blue-500`}></i>
                            <span className="text-[10px] uppercase font-bold text-slate-400 group-hover:text-white">{action.text}</span>
                            {actionCost > 0 && (
                                <span className={`text-[8px] ${!canAfford ? 'text-red-500' : feelsExpensive ? 'text-amber-500' : 'text-slate-600'}`}>
                                    ${actionCost.toLocaleString()}
                                </span>
                            )}
                            {loanLocked && <span className="text-[8px] text-red-500">LOCKED</span>}
                        </button>
                    );})}
                </div>
              )}
              
              <div className="flex-1 border-t border-slate-800 pt-4">
                  <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-slate-500">PENDING_TASKS</span>
                      <div className={tutorialStep === 1 ? 'relative z-[100]' : ''}>
                          <TerminalButton
                            label="MANAGE_ASSETS"
                            icon="fa-briefcase"
                            onClick={() => {
                                setActiveTab('ASSETS');
                                if (tutorialStep === 1) setTutorialStep(2);
                                playSfx('KEYPRESS');
                            }}
                            className={tutorialStep === 1 ? '!bg-green-500 !text-black !border-green-300 animate-pulse shadow-[0_0_25px_rgba(34,197,94,0.8)] ring-2 ring-green-400' : ''}
                          />
                          <div className="mt-2">
                              <TerminalButton
                                label="PORTFOLIO_DASHBOARD"
                                icon="fa-grid-2"
                                onClick={() => setShowPortfolioDashboard(true)}
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
                            onClick={() => {
                                setActiveTab('DEALS');
                                playSfx('KEYPRESS');
                            }}
                            className={`w-full ${activeDeals.length > 0 ? 'border-amber-500 text-amber-400 hover:bg-amber-900/20' : ''}`}
                          />
                      </div>
                  )}

                  <div className="text-slate-600 text-sm italic mb-4">
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

                  {/* NEW: ADVANCE WEEK BUTTON */}
                  {tutorialStep === 0 && (
                      <button 
                        onClick={handleAdvanceTime}
                        className="w-full border border-slate-600 hover:border-amber-500 hover:bg-slate-900 text-slate-400 hover:text-amber-500 py-4 flex items-center justify-center space-x-3 transition-all group"
                      >
                          <i className="fas fa-forward group-hover:animate-pulse"></i>
                          <span className="text-xs font-bold tracking-widest uppercase">Advance Timeline (Next Week)</span>
                      </button>
                  )}
              </div>
          </TerminalPanel>
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
        {import.meta.env.DEV && (
            <button
                className="fixed top-2 right-2 z-[200] bg-slate-800 text-white text-[10px] px-3 py-1 border border-slate-600 rounded hover:bg-slate-700"
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
             {playerStats && <PlayerStatsDisplay stats={playerStats} marketVolatility={marketVolatility} />}
        </div>
        
        {/* DESKTOP GRID LAYOUT (Hidden on Mobile) */}
        <div className="hidden md:grid flex-1 grid-cols-[250px_1fr_250px] overflow-hidden relative">
            {/* Left Panel (Comms) */}
            <div className={`border-r border-slate-700 bg-black ${tutorialStep === 4 ? 'z-[100] relative' : ''}`}>
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
            <div className={`bg-black relative flex flex-col ${(tutorialStep >= 1 && tutorialStep <= 6) ? 'z-[100]' : ''}`}>
                {renderCenterPanel()}
            </div>
            
            {/* Right Panel (News) */}
            <div className="border-l border-slate-700 bg-black">
                 <NewsTicker events={NEWS_EVENTS} systemLogs={actionLog} />
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
                <div className={`flex-1 overflow-hidden relative bg-black ${(tutorialStep >= 1 && tutorialStep <= 6) ? 'z-[100]' : ''}`}>
                    {renderCenterPanel()}
                    <TutorialOverlay instruction={TUTORIAL_STEPS_TEXT[tutorialStep]} step={tutorialStep} />
                </div>
            )}
            
            {activeMobileTab === 'NEWS' && (
                <div className="flex-1 overflow-hidden">
                     <NewsTicker events={NEWS_EVENTS} systemLogs={actionLog} />
                </div>
            )}

             {activeMobileTab === 'MENU' && (
                <div className="flex-1 bg-slate-900 p-6 space-y-4">
                    <h2 className="text-xl font-bold text-white mb-4">SYSTEM_MENU</h2>
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
                    <button
                        className="w-full border border-red-900 text-red-500 py-3 uppercase font-bold text-xs tracking-widest hover:bg-red-900/20"
                        onClick={handleResetSimulation}
                    >
                        Reset Simulation
                    </button>
                    <div className="pt-8 border-t border-slate-800">
                         <div className="text-xs text-slate-600 mb-2">Authenticated as:</div>
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

        {/* MOBILE BOTTOM NAV */}
        <BottomNav activeTab={activeMobileTab} onTabChange={setActiveMobileTab} />

        {/* TOAST LAYER */}
        <TerminalToast toasts={toasts} removeToast={removeToast} />

        {/* GLITCH EFFECTS */}
        {playerStats && <SanityEffects stress={playerStats.stress} dependency={playerStats.dependency} />}
    </div>
  );
};

export default App;
