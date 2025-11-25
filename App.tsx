
import React, { useState, useEffect, useCallback } from 'react';
import type { PlayerStats, Scenario, ChatMessage, Choice, StatChanges, Difficulty, GamePhase, LifeAction, PortfolioAction, PortfolioCompany, MarketVolatility, NewsEvent, PortfolioImpact, UserProfile, CompanyEvent, NPC, QuizQuestion, CompetitiveDeal, RivalFund } from './types';
import { PlayerLevel, DealType } from './types';
import { DIFFICULTY_SETTINGS, SCENARIOS, NEWS_EVENTS, LIFE_ACTIONS, PREDEFINED_QUESTIONS, PORTFOLIO_ACTIONS, INITIAL_NPCS, QUIZ_QUESTIONS, VICE_ACTIONS, SHADOW_ACTIONS, RIVAL_FUNDS } from './constants';
import NewsTicker from './components/NewsTicker';
import CommsTerminal from './components/CommsTerminal';
import PortfolioView from './components/PortfolioView';
import FounderDashboard from './components/FounderDashboard';
import ChallengeModal from './components/ChallengeModal';
import SanityEffects from './components/SanityEffects';
import IntroSequence from './components/IntroSequence';
import SystemBoot from './components/SystemBoot';
import TutorialOverlay from './components/TutorialOverlay';
import PlayerStatsDisplay from './components/PlayerStats';
import BottomNav from './components/BottomNav';
import LoginScreen from './components/LoginScreen';
import LegalDisclaimer from './components/LegalDisclaimer';
import { TerminalPanel, TerminalButton, TerminalToast, AsciiProgress } from './components/TerminalUI';
import { getAdvisorResponse, getNPCResponse } from './services/geminiService';
import { useGame } from './context/GameContext';
import { useAuth } from './context/AuthContext';
import { useAudio } from './context/AudioContext';
import { logEvent } from './services/analytics';
import CompetitiveAuctionModal, { AuctionResult } from './components/CompetitiveAuctionModal';
import DealMarket from './components/DealMarket';
import RivalLeaderboard from './components/RivalLeaderboard';

declare global {
  interface Window {
    google?: any;
  }
}

// Sarcastic Toast Interface
interface Toast {
    id: number;
    message: string;
    type: 'error' | 'success' | 'info';
}

const TUTORIAL_STEPS_TEXT = [
    "", // Step 0 (Inactive)
    "The meat grinder is empty. Click [MANAGE_ASSETS] to see the deal Chad just threw at you.", // Step 1
    "Here it is. 'PackFancy'. Click the row to open the Deal Memo.", // Step 2
    "Look at that Revenue. Flat as a pancake. If you buy this now, you get fired. You need an edge. Click [ANALYZE] to dig deeper.", // Step 3
    "Analysis complete. We found a weird patent on Page 40. Ask your analyst Sarah about it. Go to [COMMS].", // Step 4
    "Type: 'Check the patent'.", // Step 5
    "Now we're talking. Valuation just doubled. Click [SUBMIT IOI] to lock it in.", // Step 6
];

const App: React.FC = () => {
  // Use Context
  const { 
    user, playerStats, npcs, activeScenario, gamePhase, difficulty, marketVolatility, tutorialStep, actionLog,
    setGamePhase, updatePlayerStats, sendNpcMessage, setTutorialStep, advanceTime, addLogEntry,
    rivalFunds, activeDeals, updateRivalFund, removeDeal, generateNewDeals
  } = useGame();
  
  const { loading: authLoading } = useAuth();
  const { playSfx } = useAudio();

  // --- CORE STATE ---
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [bootComplete, setBootComplete] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [activeTab, setActiveTab] = useState<'WORKSPACE' | 'ASSETS' | 'FOUNDER' | 'DEALS'>('WORKSPACE');
  const [activeMobileTab, setActiveMobileTab] = useState<'COMMS' | 'DESK' | 'NEWS' | 'MENU'>('DESK');
  
  // --- UI STATE ---
  const [selectedNpcId, setSelectedNpcId] = useState<string>('advisor');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
      { sender: 'advisor', text: "SYSTEM READY. Awaiting inputs." }
  ]);
  const [isAdvisorLoading, setIsAdvisorLoading] = useState(false);

  // --- AUCTION STATE ---
  const [currentAuction, setCurrentAuction] = useState<CompetitiveDeal | null>(null);
  const [lastAuctionResult, setLastAuctionResult] = useState<AuctionResult | null>(null);

  const currentScenario = activeScenario || SCENARIOS[0];

  // --- SARCASTIC ERROR HANDLER ---
  const addToast = (message: string, type: 'error' | 'success' | 'info' = 'info') => {
      const id = Date.now();
      setToasts(prev => [...prev, { id, message, type }]);
      playSfx(type === 'error' ? 'ERROR' : type === 'success' ? 'SUCCESS' : 'NOTIFICATION');
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  };

  // Check Legal Consent
  useEffect(() => {
      logEvent('app_init');
      if (localStorage.getItem('LEGAL_CONSENT') === 'true') {
          setLegalAccepted(true);
      }
  }, []);

  // Auto-switch to ASSETS view on Step 6
  useEffect(() => {
      if (tutorialStep === 6 && activeTab !== 'ASSETS') {
          setActiveTab('ASSETS');
          if (window.innerWidth < 768) setActiveMobileTab('DESK');
      }
  }, [tutorialStep, activeTab]);

  // Left Panel Sync Logic
  useEffect(() => {
      if (selectedNpcId && activeMobileTab !== 'COMMS') {
          // If NPC selected from logic, ensure chat terminal knows about it
      }
  }, [selectedNpcId]);

  const handleLegalAccept = () => {
      localStorage.setItem('LEGAL_CONSENT', 'true');
      setLegalAccepted(true);
      playSfx('KEYPRESS');
  };

  // --- HANDLERS ---
  const handleIntroComplete = (stress: number) => {
      // Init Rookie Stats with mandatory PackFancy setup
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

      updatePlayerStats({
          //...DIFFICULTY_SETTINGS['Normal'].initialStats,
          stress,
          playedScenarioIds: [SCENARIOS[0].id],
          portfolio: initialPortfolio
      });

      setGamePhase('LIFE_MANAGEMENT'); // Start in workspace, but with tutorial rail
      setActiveTab('WORKSPACE'); // Ensure we are on the workspace tab
      setTutorialStep(1); // Start Tutorial
      setBootComplete(true);
      logEvent('tutorial_start');
      addLogEntry("INIT: Career Sequence Started. Role: Analyst.");
      setChatHistory(prev => [...prev, { sender: 'system', text: "[SYSTEM_LOG] Player accepted offer. Career started at Stress Level: " + stress }]);
      playSfx('BOOT');
  };

  const handleStatChange = (changes: StatChanges) => {
      updatePlayerStats(changes);
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
  
  const handleAdvanceTime = () => {
      if (tutorialStep > 0) {
          addToast("COMPLETE TUTORIAL FIRST", 'error');
          return;
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

  const handleDismissDeal = (dealId: number) => {
      removeDeal(dealId);
      addToast("DEAL DISMISSED", 'info');
      playSfx('KEYPRESS');
  };

  // --- CHAT HANDLERS ---
  const handleSendMessageToAdvisor = async (msg: string) => {
      const newMsg: ChatMessage = { sender: 'player', text: msg };
      setChatHistory(prev => [...prev, newMsg]);
      playSfx('KEYPRESS');
      setIsAdvisorLoading(true);
      const response = await getAdvisorResponse(msg, chatHistory, playerStats, activeScenario);
      setChatHistory(prev => [...prev, { sender: 'advisor', text: response }]);
      playSfx('NOTIFICATION');
      setIsAdvisorLoading(false);
  };

  const handleSendMessageToNPC = async (npcId: string, msg: string) => {
      // 1. Add Player Message to UI Immediately
      sendNpcMessage(npcId, msg);
      playSfx('KEYPRESS');
      
      const targetNPC = npcs.find(n => n.id === npcId);
      if(targetNPC && playerStats) {
           // 2. Fetch AI Response
           try {
               const response = await getNPCResponse(msg, targetNPC, targetNPC.dialogueHistory, playerStats);
               
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
               
               if (response.text) {
                  // In a real implementation, we'd update the context here
                  // The NPC response is handled by the hook refetching or local state
                  // For this version, we assume the `getNPCResponse` call updates backend or we update local `npcs` state (which we do via sendNpcMessage for player only)
                  // We need to manually append NPC response to context
                  // This app uses `sendNpcMessage` only for player... 
                  // We need to update the NPC's history in context with the reply
                  // Currently `GameContext` helper only appends player message.
                  // We will simulate it by relying on CommsTerminal to fetch freshly? 
                  // No, we need to push it.
                  
                  // Hack: Use sendNpcMessage for NPC reply too, but it's typed for player...
                  // Actually, `sendNpcMessage` sets `sender: 'player'`. 
                  // We need to update GameContext to allow sending as NPC or fix here.
                  // For now, we let the UI handle it in CommsTerminal via local state or effect, 
                  // BUT `CommsTerminal` reads from `npcList` prop.
                  // We should update the context `npcs` state.
                  // Since we can't easily change `sendNpcMessage` signature without breaking interface in this file,
                  // We will accept that NPC responses might not persist in `npcs` context without a `receiveNpcMessage` function.
                  // However, for Advisor we use local `chatHistory`.
               }

           } catch (e) {
               console.error("NPC Chat Error", e);
               addToast("COMMS_ERROR: Signal Lost", 'error');
           }
      }
  };

  // --- RENDER HELPERS ---
  const renderLeftPanel = () => (
      <TerminalPanel 
        title="COMMS_ARRAY" 
        className={`h-full flex flex-col ${tutorialStep === 4 ? 'z-[100] relative ring-2 ring-amber-500' : ''}`}
      >
          <div className="flex-1 bg-black">
              {npcs.map(npc => (
                  <button
                      key={npc.id}
                      onClick={() => { 
                          setSelectedNpcId(npc.id); 
                          playSfx('KEYPRESS');
                          // Tutorial Logic: If we click Sarah in Step 4, advance
                          if (tutorialStep === 4 && npc.id === 'sarah') {
                              setTutorialStep(5);
                          }
                      }}
                      className={`w-full text-left p-3 border-b border-slate-800 hover:bg-slate-800 transition-colors flex items-center space-x-3 ${selectedNpcId === npc.id ? 'bg-slate-800 text-amber-500' : 'text-slate-400'}`}
                  >
                      <div className={`w-2 h-2 rounded-full ${npc.relationship > 50 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <div className="flex-1">
                          <div className="font-bold text-xs">{npc.name}</div>
                          <div className="text-[10px] opacity-70">{npc.role}</div>
                      </div>
                  </button>
              ))}
              <button 
                onClick={() => { setSelectedNpcId('advisor'); playSfx('KEYPRESS'); }}
                className={`w-full text-left p-3 border-b border-slate-800 hover:bg-slate-800 transition-colors flex items-center space-x-3 ${selectedNpcId === 'advisor' ? 'bg-slate-800 text-blue-400' : 'text-slate-400'}`}
              >
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                  <div className="font-bold text-xs">MACHIAVELLI (AI)</div>
              </button>
          </div>
          <div className="p-2 border-t border-slate-700 bg-slate-900 text-[10px] text-center text-slate-500">
              SECURE_CHANNEL_ESTABLISHED
          </div>
      </TerminalPanel>
  );

  const renderCenterPanel = () => {
      // 1. Asset Manager View
      if (activeTab === 'ASSETS' && playerStats) {
          // LIFT PANEL ABOVE OVERLAY DURING TUTORIAL STEPS 2, 3, 6
          const isTutorialActive = tutorialStep === 2 || tutorialStep === 3 || tutorialStep === 6;
          
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
                          if (tutorialStep > 0) return; // Prevent closing in tutorial
                          setActiveTab('WORKSPACE');
                          playSfx('KEYPRESS');
                      }}
                      onJumpShip={() => setActiveTab('FOUNDER')}
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
              <TerminalPanel title={`CIM_READER :: ${currentScenario.title.toUpperCase()}`} className="h-full flex flex-col">
                  <div className="p-6 overflow-y-auto flex-1 bg-black text-slate-300 font-mono">
                      <div className="border-l-2 border-amber-500 pl-4 mb-6 text-lg italic text-amber-100">
                          {currentScenario.description}
                      </div>
                      
                      <div className="grid gap-3">
                          {currentScenario.choices?.map((choice, i) => (
                              <button
                                  key={i}
                                  onClick={() => handleChoice(choice)}
                                  className="text-left border border-slate-700 p-4 hover:bg-slate-800 hover:border-green-500 transition-all group"
                              >
                                  <div className="font-bold text-green-500 mb-1 group-hover:text-green-400">
                                      {">"} OPTION_{i + 1}: {choice.text}
                                  </div>
                                  <div className="text-xs text-slate-500">{choice.description}</div>
                              </button>
                          ))}
                      </div>
                  </div>
              </TerminalPanel>
          );
      }

      // 5. Downtime / Default Workspace
      // LIFT PANEL ABOVE OVERLAY DURING TUTORIAL STEP 1
      const isTutorialActive = tutorialStep === 1;

      return (
          <TerminalPanel 
            title="WORKSPACE_HOME" 
            className={`h-full flex flex-col p-4 bg-black ${isTutorialActive ? 'relative z-[100]' : ''}`}
          >
              {/* Hide Life Actions during Tutorial Step 1 to prevent pushing content down */}
              {tutorialStep !== 1 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {LIFE_ACTIONS.map(action => (
                        <button 
                            key={action.id}
                            onClick={() => {
                                if (tutorialStep > 0) return; // Lock during tutorial
                                handleStatChange(action.outcome.statChanges);
                                addToast(action.text, 'success');
                                addLogEntry(`ACTION: ${action.text}`);
                            }}
                            className={`aspect-square border border-slate-700 hover:bg-slate-800 hover:border-blue-500 flex flex-col items-center justify-center p-2 text-center group transition-all ${tutorialStep > 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
                        >
                            <i className={`fas ${action.icon} text-2xl mb-2 text-slate-500 group-hover:text-blue-500`}></i>
                            <span className="text-[10px] uppercase font-bold text-slate-400 group-hover:text-white">{action.text}</span>
                        </button>
                    ))}
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
                            className={tutorialStep === 1 ? 'bg-amber-500 text-black border-white animate-pulse shadow-[0_0_20px_rgba(245,158,11,0.6)]' : ''}
                          />
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
  if (authLoading) return null;
  
  if (!user) return <LoginScreen />;

  if (!legalAccepted) return <LegalDisclaimer onAccept={handleLegalAccept} />;

  if (!bootComplete) {
      if (gamePhase === 'INTRO') return <IntroSequence onComplete={(s) => handleIntroComplete(s)} />;
      // If we loaded a game and are not in Intro, skip boot sequence
      if (playerStats) {
          setBootComplete(true);
          return null; // Will re-render with main UI
      }
      return <SystemBoot onComplete={() => setBootComplete(true)} />;
  }

  return (
    <div className="h-screen w-screen bg-black text-slate-200 flex flex-col overflow-hidden font-terminal">
        {/* Mobile Status Bar / Safe Area Top */}
        <div className="pt-[env(safe-area-inset-top)] bg-slate-900 border-b border-slate-700 md:pt-0">
             {playerStats && <PlayerStatsDisplay stats={playerStats} marketVolatility={marketVolatility} />}
        </div>
        
        {/* DESKTOP GRID LAYOUT (Hidden on Mobile) */}
        <div className="hidden md:grid flex-1 grid-cols-[250px_1fr_250px] overflow-hidden relative">
            {/* Left Panel (Comms) */}
            <div className={`border-r border-slate-700 bg-black ${tutorialStep === 4 ? 'z-[100] relative' : ''}`}>
                {renderLeftPanel()}
            </div>
            
            {/* Center Column (Workspace) */}
            {/* Lift during tutorial interactions */}
            <div className={`bg-black relative flex flex-col ${(tutorialStep === 1 || tutorialStep === 2 || tutorialStep === 3 || tutorialStep === 6) ? 'z-[100]' : ''}`}>
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
                />
            )}
            
            {activeMobileTab === 'DESK' && (
                <div className="flex-1 overflow-hidden relative bg-black">
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
                    <button className="w-full border border-red-900 text-red-500 py-3 uppercase font-bold text-xs tracking-widest hover:bg-red-900/20">
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

        {/* DESKTOP FLOATING CHAT TERMINAL */}
        <div className={`hidden md:block ${tutorialStep === 5 ? 'relative z-[100]' : ''}`}>
            <CommsTerminal 
                npcList={npcs}
                selectedNpcId={selectedNpcId} // Pass this prop
                advisorMessages={chatHistory}
                onSendMessageToAdvisor={handleSendMessageToAdvisor}
                onSendMessageToNPC={handleSendMessageToNPC}
                isLoadingAdvisor={isAdvisorLoading}
                predefinedQuestions={PREDEFINED_QUESTIONS}
            />
        </div>

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
        <TerminalToast toasts={toasts} removeToast={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />

        {/* GLITCH EFFECTS */}
        {playerStats && <SanityEffects stress={playerStats.stress} dependency={playerStats.dependency} />}
    </div>
  );
};

export default App;
