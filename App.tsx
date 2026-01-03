
import React, { useState, useEffect, useCallback } from 'react';
import type { PlayerStats, ChatMessage, Choice, StatChanges, CompetitiveDeal, CompanyActiveEvent, NPCDrama } from './types';
import { SCENARIOS, NEWS_EVENTS, PREDEFINED_QUESTIONS, Z_INDEX } from './constants';
import NewsTicker from './components/NewsTicker';
import CommsTerminal from './components/CommsTerminal';
import PortfolioView from './components/PortfolioView';
import FounderDashboard from './components/FounderDashboard';
import SanityEffects from './components/SanityEffects';
import { IntroSequence } from './components/intro';
import SystemBoot from './components/SystemBoot';
// Legacy tutorial components removed - now using RPG event-driven onboarding
import PlayerStatsDisplay from './components/PlayerStats';
import BottomNav from './components/BottomNav';
import LoginScreen from './components/LoginScreen';
import LegalDisclaimer from './components/LegalDisclaimer';
import { TerminalPanel, TerminalButton, TerminalToast } from './components/TerminalUI';
import NpcListPanel from './components/NpcListPanel';
import WorkspacePanel from './components/WorkspacePanel';
import ScenarioPanel from './components/ScenarioPanel';
import { getDynamicNewsEvents } from './services/geminiService';
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
import { useAppUIState } from './hooks/useAppUIState';
import { useAuctionFlow } from './hooks/useAuctionFlow';
import { useChatHandlers } from './hooks/useChatHandlers';
// useTutorialEffects removed - using RPG event-driven onboarding
import { useGameFlow } from './hooks/useGameFlow';
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

// DEFAULT_CHAT moved to useChatHandlers hook

const App: React.FC = () => {
  // Use Context
  const {
    user, playerStats, npcs, activeScenario, gamePhase, difficulty, marketVolatility, actionLog,
    activities,
    setGamePhase, updatePlayerStats, sendNpcMessage, advanceTime, addLogEntry, addActivity,
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

  // --- CORE STATE (from hooks) ---
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [bootComplete, setBootComplete] = useState(false);
  const [dynamicNews, setDynamicNews] = useState<import('./types').NewsEvent[]>([]);

  // --- UI STATE (from useAppUIState hook) ---
  const {
    activeTab,
    activeMobileTab,
    showActivityFeed,
    showPortfolioDashboard,
    showStatsModal,
    showTransparencyModal,
    hasSeenStatsTutorial,
    setActiveTab,
    setActiveMobileTab,
    setShowActivityFeed,
    setShowPortfolioDashboard,
    setShowStatsModal,
    setShowTransparencyModal,
    handleStatsClick,
    handleStatsModalClose,
    navigateToAssets,
  } = useAppUIState();

  // Wrapper for addToast to match expected signature
  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    addOldToast(message, type);
  }, [addOldToast]);

  // --- CHAT STATE (from useChatHandlers hook) ---
  const {
    selectedNpcId,
    chatHistory,
    isAdvisorLoading,
    setSelectedNpcId,
    setChatHistory,
    handleSendMessageToAdvisor,
    handleSendMessageToNPC,
    handleNpcSelect,
    appendChatMessage,
    resetChatHistory,
  } = useChatHandlers({
    playerStats,
    activeScenario,
    npcs,
    playSfx,
    addToast,
    sendNpcMessage,
    updatePlayerStats,
  });

  // --- AUCTION STATE (from useAuctionFlow hook) ---
  const {
    currentAuction,
    lastAuctionResult,
    handleStartAuction,
    handleAuctionComplete,
    handleDismissDeal,
    closeAuction,
  } = useAuctionFlow({
    playerStats,
    rivalFunds,
    playSfx,
    addLogEntry,
    addToast,
    removeDeal,
    updatePlayerStats,
    updateRivalFund,
    appendChatMessage,
  });

  // --- GAME FLOW (from useGameFlow hook) ---
  const {
    handleIntroComplete,
    handleStatChange,
    handleChoice,
    handleScenarioFallback,
    handleAdvanceTime,
    handleResetSimulation,
    handleConsultMachiavelli,
    handleWarningActionWithNavigation,
  } = useGameFlow({
    playerStats,
    activeDeals,
    setGamePhase,
    updatePlayerStats,
    advanceTime,
    addLogEntry,
    generateNewDeals,
    resetGame,
    setActiveDrama,
    setActiveCompanyEvent,
    setActiveTab,
    setActiveMobileTab,
    setBootComplete,
    playSfx,
    addToast,
    clearToasts,
    appendChatMessage,
    resetChatHistory,
    setSelectedNpcId,
    handleSendMessageToAdvisor,
    startWeekTransition,
  });

  // Legacy tutorial effects removed - now using RPG event-driven onboarding

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
          resetChatHistory();
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

  // Ensure the market is live when ready (onboarding complete handled by RPG events)
  useEffect(() => {
      if (bootComplete && gamePhase === 'LIFE_MANAGEMENT' && activeDeals.length === 0) {
          generateNewDeals();
      }
  }, [bootComplete, gamePhase, activeDeals.length, generateNewDeals]);

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

  // --- HANDLERS (now provided by custom hooks) ---
  // handleIntroComplete, handleStatChange, handleChoice, handleScenarioFallback,
  // handleAdvanceTime, handleResetSimulation -> useGameFlow
  // handleStartAuction, handleAuctionComplete, handleDismissDeal -> useAuctionFlow
  // handleSendMessageToAdvisor, handleSendMessageToNPC, handleNpcSelect -> useChatHandlers
  // handleStatsClick, handleStatsModalClose -> useAppUIState
  // handleConsultMachiavelli, handleWarningActionWithNavigation -> useGameFlow

  const handleChatBackToPortfolio = useCallback(() => {
      setShowPortfolioDashboard(true);
      navigateToAssets();
  }, [setShowPortfolioDashboard, navigateToAssets]);

  // Wrapper for warning action that also calls the context action
  const handleWarningWithContext = useCallback((warning: typeof activeWarnings[0]) => {
    handleWarningAction(warning);
    handleWarningActionWithNavigation(warning);
  }, [handleWarningAction, handleWarningActionWithNavigation]);

  const renderCenterPanel = () => {
      // 1. Asset Manager View
      if (activeTab === 'ASSETS' && playerStats) {
          return (
              <TerminalPanel
                title="ASSET_MANAGER"
                className="h-full"
              >
                  <PortfolioView
                      playerStats={playerStats}
                      onAction={(id, action) => {
                          handleStatChange(action.outcome.statChanges);
                          addToast(action.outcome.logMessage, 'info');
                          addLogEntry(action.outcome.logMessage);
                          appendChatMessage({ sender: 'system', text: `[SYSTEM_LOG] Portfolio Action: ${action.text}` });
                      }}
                      onBack={() => {
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
                      backDisabled={false}
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
            tutorialStep={0}
            onManageAssets={() => {
              setActiveTab('ASSETS');
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
              setGamePhase('SCENARIO');
              logEvent('tutorial_complete');
              addLogEntry('ONBOARDING: Complete. Ready for real deals.');
              playSfx('SUCCESS');
            }}
            onConsultAdvisor={() => {
              // Open the advisor chat
              setSelectedNpcId('advisor');
              // On mobile, switch to COMMS tab
              if (window.innerWidth < 768) {
                setActiveMobileTab('COMMS');
              }
              playSfx('KEYPRESS');
              addLogEntry('CONSULTING: Machiavelli AI for strategic advice.');
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
                    resetChatHistory();
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
            <div className="border-r border-slate-700 bg-black">
                <NpcListPanel
                  npcs={npcs}
                  selectedNpcId={selectedNpcId}
                  onSelectNpc={handleNpcSelect}
                />
            </div>

            {/* Center Column (Workspace) */}
            <div className="bg-black relative flex flex-col">
                {/* Desktop Tab Bar */}
                <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex border border-slate-700 rounded-lg overflow-hidden bg-black">
                        {(['WORKSPACE', 'ASSETS', 'FOUNDER', 'DEALS'] as const).map((tab) => {
                            const tabLabels = {
                                'WORKSPACE': 'DESK',
                                'ASSETS': 'ASSETS',
                                'FOUNDER': 'FOUNDER',
                                'DEALS': 'DEALS'
                            };
                            const isDisabled = tab === 'FOUNDER' && !founderUnlocked;
                            // Add tutorial data attributes for tooltip targeting
                            const tutorialAttr = tab === 'WORKSPACE' ? 'desk-tab' : undefined;
                            return (
                                <button
                                    key={tab}
                                    onClick={() => !isDisabled && setActiveTab(tab)}
                                    disabled={isDisabled}
                                    data-tutorial={tutorialAttr}
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
        </div>

        {/* MOBILE LAYOUT (View Switcher) */}
        <div className="md:hidden flex-1 flex flex-col overflow-hidden relative">
            {activeMobileTab === 'COMMS' && (
                <CommsTerminal
                    mode="MOBILE_EMBED"
                    isOpen={true}
                    npcList={npcs}
                    selectedNpcId={selectedNpcId}
                    advisorMessages={chatHistory}
                    onSendMessageToAdvisor={handleSendMessageToAdvisor}
                    onSendMessageToNPC={handleSendMessageToNPC}
                    isLoadingAdvisor={isAdvisorLoading}
                    predefinedQuestions={PREDEFINED_QUESTIONS}
                    onClose={handleChatBackToPortfolio}
                    onBackToPortfolio={handleChatBackToPortfolio}
                />
            )}
            
            {activeMobileTab === 'DESK' && (
                <div className="flex-1 overflow-hidden relative bg-black">
                    {renderCenterPanel()}
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
                onClose={closeAuction}
            />
        )}

        {/* Legacy PostTutorialGuide removed - now using RPG event-driven onboarding */}

        {/* MOBILE BOTTOM NAV */}
        <BottomNav activeTab={activeMobileTab} onTabChange={setActiveMobileTab} />

        {/* WARNING PANEL - Living World System */}
        <WarningPanel
            warnings={activeWarnings}
            onDismiss={dismissWarning}
            onAction={handleWarningWithContext}
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

        {/* Legacy TutorialTooltip/TutorialHighlight removed - using RPG event-driven onboarding */}

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
