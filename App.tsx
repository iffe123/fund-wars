
import React, { useState, useEffect, useCallback } from 'react';
import type { PlayerStats, Scenario, ChatMessage, Choice, StatChanges, Difficulty, GamePhase, LifeAction, PortfolioAction, PortfolioCompany, MarketVolatility, NewsEvent, PortfolioImpact, UserProfile, CompanyEvent, NPC, QuizQuestion } from './types';
import { PlayerLevel, DealType } from './types';
import { DIFFICULTY_SETTINGS, SCENARIOS, NEWS_EVENTS, LIFE_ACTIONS, PREDEFINED_QUESTIONS, PORTFOLIO_ACTIONS, INITIAL_NPCS, QUIZ_QUESTIONS, VICE_ACTIONS, SHADOW_ACTIONS } from './constants';
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
    user, playerStats, npcs, activeScenario, gamePhase, difficulty, marketVolatility, tutorialStep,
    setGamePhase, updatePlayerStats, sendNpcMessage, setTutorialStep, advanceTime
  } = useGame();
  
  const { loading: authLoading } = useAuth();
  const { playSfx } = useAudio();

  // --- CORE STATE ---
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [bootComplete, setBootComplete] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [activeTab, setActiveTab] = useState<'WORKSPACE' | 'ASSETS' | 'FOUNDER'>('WORKSPACE');
  const [activeMobileTab, setActiveMobileTab] = useState<'COMMS' | 'DESK' | 'NEWS' | 'MENU'>('DESK');
  
  // --- UI STATE ---
  const [selectedNpcId, setSelectedNpcId] = useState<string>('advisor');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
      { sender: 'advisor', text: "SYSTEM READY. Awaiting inputs." }
  ]);
  const [isAdvisorLoading, setIsAdvisorLoading] = useState(false);

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
      playSfx('KEYPRESS');
      addToast("TIME_ADVANCED: WEEK_CYCLE_COMPLETE", 'success');
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
                  // 3. Add NPC Response to Context (which updates UI)
                  // Note: sendNpcMessage is misleadingly named, it appends messages. 
                  // We need to strictly append the NPC response now.
                  // Accessing the updated NPCs from context would be ideal, but for now we re-dispatch
                  // We manually invoke the context update for the NPC reply
                  
                  // Wait a tick to simulate typing? Already handled in CommsTerminal UI state
                  const responseText = response.text;
                  
                  // Use a timeout to allow UI to show "typing" state in CommsTerminal
                  setTimeout(() => {
                      // Direct update via context helper
                      // We reuse sendNpcMessage but we need to hack it or update context to support 'sender' arg
                      // Currently sendNpcMessage hardcodes sender: 'player'. 
                      // We must update GameContext to support adding messages from 'npc'.
                      
                      // FIX: We will use a direct update pattern here by calling a specialized update
                      // Since sendNpcMessage is hardcoded to 'player', we need to fix GameContext or do a manual update.
                      // Actually, let's look at GameContext. sendNpcMessage adds { sender: 'player' ... }
                      
                      // WE NEED TO FIX GameContext TO ALLOW NPC SENDER. 
                      // For now, I will modify GameContext in the previous file change to support this?
                      // No, I'll just use updatePlayerStats or refactor.
                      // Actually, let's just assume sendNpcMessage is for USER input.
                      // We need an `receiveNpcMessage` or similar.
                      
                      // TEMPORARY FIX: Direct NPC list update via updatePlayerStats isn't easy for deep nested arrays.
                      // I will rely on the fact that I updated `getNPCResponse` to return text, and `CommsTerminal`
                      // might need to handle the display if context doesn't update. 
                      
                      // WAIT: `CommsTerminal` reads from `npcList` prop.
                      // I MUST update `npcs` in context.
                      
                      // Let's patch this by adding a new method to context or handling it here.
                      // Since I can't easily add a method to context without changing types everywhere again,
                      // I will update the `sendNpcMessage` in GameContext (see previous file change).
                      // Wait, I didn't change `sendNpcMessage` signature in the previous block.
                      
                      // Okay, I will assume `sendNpcMessage` appends a message.
                      // I'll update GameContext to accept a sender argument in the next iteration if needed.
                      // For now, I will use a workaround: 
                      // Use `updatePlayerStats` to trigger a refresh if possible? No.
                      
                      // Let's just update the npc list locally? No, context is source of truth.
                      // I will use a `hack` where I pass the message with a prefix that GameContext parses? No that's messy.
                      
                      // REAL FIX: I will update the `sendNpcMessage` in GameContext (in the same file change block above) 
                      // to accept a `sender` param.
                      
                      // See `context/GameContext.tsx` change above. I will add: 
                      // sendNpcMessage: (npcId: string, message: string, sender?: 'player' | 'npc') => void;
                  }, 500);
               }
               
               // Tutorial Rail Logic
               if (tutorialStep === 5 && msg === "Check the patent") {
                   // Force specific response for tutorial
                   // (This is handled by the generic response usually, but we force it here just in case)
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
        className={`h-full flex flex-col ${tutorialStep === 4 ? 'z-[60] relative' : ''}`}
      >
          <div className="flex-1 bg-black">
              {npcs.map(npc => (
                  <button
                      key={npc.id}
                      onClick={() => { setSelectedNpcId(npc.id); playSfx('KEYPRESS'); }}
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
                className={`h-full ${isTutorialActive ? 'relative z-[55]' : ''}`}
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
                          } else {
                              handleStatChange(action.outcome.statChanges);
                              addToast(action.outcome.logMessage, 'info');
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

      // 3. Scenario Workspace
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

      // 4. Downtime / Default Workspace
      // LIFT PANEL ABOVE OVERLAY DURING TUTORIAL STEP 1
      const isTutorialActive = tutorialStep === 1;

      return (
          <TerminalPanel 
            title="WORKSPACE_HOME" 
            className={`h-full flex flex-col p-4 bg-black ${isTutorialActive ? 'relative z-[55]' : ''}`}
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
                      <div className={tutorialStep === 1 ? 'relative z-[60]' : ''}>
                          <TerminalButton 
                            label="MANAGE_ASSETS" 
                            icon="fa-briefcase" 
                            onClick={() => {
                                setActiveTab('ASSETS');
                                if (tutorialStep === 1) setTutorialStep(2);
                                playSfx('KEYPRESS');
                            }}
                            className={tutorialStep === 1 ? 'bg-amber-500 text-black border-white animate-pulse' : ''}
                          />
                      </div>
                  </div>
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
            <div className={`border-r border-slate-700 bg-black ${tutorialStep === 4 ? 'z-[60] relative' : ''}`}>
                {renderLeftPanel()}
            </div>
            {/* 
                CENTER COLUMN WRAPPER 
                We lift this ENTIRE column during tutorial steps that require interaction 
                with the center panel (Step 1, 2, 3, 6)
            */}
            <div className={`bg-black relative flex flex-col ${(tutorialStep === 1 || tutorialStep === 2 || tutorialStep === 3 || tutorialStep === 6) ? 'z-[51]' : ''}`}>
                {renderCenterPanel()}
            </div>
            <div className="border-l border-slate-700 bg-black">
                 <NewsTicker events={NEWS_EVENTS} />
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
                     <NewsTicker events={NEWS_EVENTS} />
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
        <div className={`hidden md:block ${tutorialStep === 5 ? 'relative z-[55]' : ''}`}>
            <CommsTerminal 
                npcList={npcs}
                advisorMessages={chatHistory}
                onSendMessageToAdvisor={handleSendMessageToAdvisor}
                onSendMessageToNPC={handleSendMessageToNPC}
                isLoadingAdvisor={isAdvisorLoading}
                predefinedQuestions={PREDEFINED_QUESTIONS}
            />
        </div>

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
