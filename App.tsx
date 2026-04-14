
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import type { PlayerStats, ChatMessage, Choice, StatChanges, CompetitiveDeal, CompanyActiveEvent, NPCDrama } from './types';
import { SCENARIOS, NEWS_EVENTS, PREDEFINED_QUESTIONS, Z_INDEX } from './constants';
import { getMachiavelliSystemAddendum } from './services/blueprintAIService';
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
import { TerminalPanel, TerminalButton } from './components/TerminalUI';
import NpcListPanel from './components/NpcListPanel';
import WorkspacePanel from './components/WorkspacePanel';
import ScenarioPanel from './components/ScenarioPanel';
import { getDynamicNewsEvents } from './services/geminiService';
import { useGame } from './contexts/GameContext';
import { useAuth } from './contexts/AuthContext';
import { useAudio } from './contexts/AudioContext';
import { logEvent } from './services/analytics';
import { useEnhancedToast } from './hooks/useEnhancedToast';
import { ToastContainer } from './components/ui/Toast';
import ActivityFeed, { type ActivityItem } from './components/ActivityFeed';
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
import { useRPGEvents } from './contexts/RPGEventContext';
import StoryMilestoneModal from './components/StoryMilestoneModal';
import CompanyEventModal from './components/CompanyEventModal';
import NPCDramaModal from './components/NPCDramaModal';
import { useStoryMilestones } from './hooks/useStoryMilestones';
import { PanelErrorBoundary } from './components/PanelErrorBoundary';

declare global {
  interface Window {
    google?: unknown;
  }
}

const buildActivityFromLogEntry = (entry: string, index: number): ActivityItem => {
  const [rawTimestamp, rawMessage = entry] = entry.split(' // ');
  const title = rawMessage.trim() || 'System update';
  const normalizedTitle = title.toLowerCase();

  let type: ActivityItem['type'] = 'personal';
  let icon = 'fas fa-circle-info';
  let sentiment: ActivityItem['sentiment'] = 'neutral';

  if (normalizedTitle.includes('new deal') || normalizedTitle.includes('auction') || normalizedTitle.includes('ioi')) {
    type = 'deal';
    icon = 'fas fa-briefcase';
    sentiment = normalizedTitle.includes('lost') ? 'negative' : 'positive';
  } else if (normalizedTitle.includes('relationship') || normalizedTitle.includes('trust') || normalizedTitle.includes('mood')) {
    type = 'relationship';
    icon = 'fas fa-user-friends';
    sentiment = normalizedTitle.includes('cooled') ? 'warning' : 'neutral';
  } else if (normalizedTitle.includes('week') || normalizedTitle.includes('payroll') || normalizedTitle.includes('salary')) {
    type = 'time';
    icon = 'fas fa-calendar-alt';
    sentiment = 'positive';
  } else if (normalizedTitle.includes('market')) {
    type = 'market';
    icon = 'fas fa-chart-line';
  } else if (normalizedTitle.includes('portfolio') || normalizedTitle.includes('company event')) {
    type = 'portfolio';
    icon = 'fas fa-building';
  }

  const timestamp = new Date();
  const timeMatch = rawTimestamp?.match(/(\d{1,2}):(\d{2}):(\d{2})/);
  if (timeMatch) {
    timestamp.setHours(Number(timeMatch[1]), Number(timeMatch[2]), Number(timeMatch[3]), 0);
  } else {
    timestamp.setTime(timestamp.getTime() - index * 60_000);
  }

  return {
    id: `action-log-${index}-${title}`,
    timestamp,
    type,
    icon,
    title,
    sentiment,
  };
};

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
    // Blueprint AI
    blueprintAI,
    markNewspaperRead,
  } = useGame();
  
  const { loading: authLoading } = useAuth();
  const { playSfx } = useAudio();
  const { toasts, removeToast: removeEnhancedToast, toast, clearToasts } = useEnhancedToast();
  const { isTransitioning: isWeekTransitioning, startTransition: startWeekTransition } = useWeekTransition();
  const { visibleMilestone, dismissMilestone } = useStoryMilestones();
  const { state: rpgState } = useRPGEvents();

  // --- CORE STATE (from hooks) ---
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [bootComplete, setBootComplete] = useState(false);
  const [dynamicNews, setDynamicNews] = useState<import('./types').NewsEvent[]>([]);
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 1024);
  const [seenActivityCount, setSeenActivityCount] = useState(0);

  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

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

  const activityFeedItems = useMemo<ActivityItem[]>(() => {
    if (activities && activities.length > 0) {
      return activities;
    }

    if (!actionLog || actionLog.length === 0) {
      return [];
    }

    return actionLog.slice(0, 20).map((entry, index) => buildActivityFromLogEntry(entry, index));
  }, [activities, actionLog]);

  const unseenActivityCount = Math.max(0, activityFeedItems.length - seenActivityCount);

  useEffect(() => {
    if (!showActivityFeed || typeof document === 'undefined') {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowActivityFeed(false);
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [showActivityFeed, setShowActivityFeed]);

  // Unified addToast wrapper using enhanced toast system
  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    toast[type](message);
  }, [toast]);

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
    machiavelliAddendum: blueprintAI?.machiavelliState
      ? getMachiavelliSystemAddendum(blueprintAI.machiavelliState)
      : undefined,
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

  // Derived: whether Founder Mode is unlocked (must be declared before any hook that reads it)
  const founderUnlocked = playerStats
    ? (playerStats.personalFinances?.bankBalance ?? playerStats.cash ?? 0) >= 1_000_000
    : false;

  // --- KEYBOARD SHORTCUTS ---
  useEffect(() => {
    if (!bootComplete || !playerStats) return;

    const handleKeyboardShortcuts = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

      // Number keys 1-5 switch tabs (desktop)
      if (e.key === '1') { setActiveMobileTab('WORKSPACE'); setActiveTab('workspace'); }
      if (e.key === '2') { setActiveMobileTab('ASSETS'); setActiveTab('assets'); }
      if (e.key === '3') { setActiveMobileTab('DEALS'); setActiveTab('deals'); }
      if (e.key === '4') { setActiveMobileTab('RIVALS'); setActiveTab('rivals'); }
      if (e.key === '5' && founderUnlocked) { setActiveMobileTab('FOUNDER'); setActiveTab('founder'); }

      // 'a' for Activity Feed toggle
      if (e.key === 'a' && !e.ctrlKey && !e.metaKey) {
        setShowActivityFeed(prev => !prev);
      }

      // 'p' for Portfolio dashboard toggle
      if (e.key === 'p' && !e.ctrlKey && !e.metaKey) {
        setShowPortfolioDashboard(prev => !prev);
      }

      // 's' for Stats modal
      if (e.key === 's' && !e.ctrlKey && !e.metaKey) {
        handleStatsClick();
      }

      // Escape closes modals (handled individually, but also catch-all)
      if (e.key === 'Escape') {
        setShowActivityFeed(false);
        setShowPortfolioDashboard(false);
      }
    };

    window.addEventListener('keydown', handleKeyboardShortcuts);
    return () => window.removeEventListener('keydown', handleKeyboardShortcuts);
  }, [bootComplete, playerStats, founderUnlocked, setActiveMobileTab, setActiveTab, setShowActivityFeed, setShowPortfolioDashboard, handleStatsClick]);

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

  // (Ambience removed — no audio to stop)

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

  // IB_CHAT open/close state for desktop layout integration
  const [isChatOpen, setIsChatOpen] = useState(false);
  const handleChatClose = useCallback(() => {
      setIsChatOpen(false);
  }, []);
  const handleChatOpen = useCallback(() => {
      setIsChatOpen(true);
  }, []);

  // Wrapper for warning action that also calls the context action
  const handleWarningWithContext = useCallback((warning: typeof activeWarnings[0]) => {
    handleWarningAction(warning);
    handleWarningActionWithNavigation(warning);
  }, [handleWarningAction, handleWarningActionWithNavigation]);

  // Modal stack: only show ONE modal at a time, prioritized
  const activeModal = useMemo(() => {
    if (['GAME_OVER', 'PRISON', 'ALONE', 'VICTORY'].includes(gamePhase)) return 'GAME_END';
    if (currentAuction) return 'AUCTION';
    if (activeCompanyEvent) return 'COMPANY_EVENT';
    if (activeDrama) return 'DRAMA';
    if (visibleMilestone) return 'MILESTONE';
    if (showStatsModal) return 'STATS';
    if (showTransparencyModal) return 'TRANSPARENCY';
    return null;
  }, [gamePhase, currentAuction, activeCompanyEvent, activeDrama, visibleMilestone, showStatsModal, showTransparencyModal]);

  const renderCenterPanel = () => {
      // 1. Asset Manager View
      if (activeTab === 'ASSETS' && playerStats) {
          return (
              <TerminalPanel
                title="ASSET_MANAGER"
                className="h-full"
              >
                  <PanelErrorBoundary panelName="PortfolioView" fallbackMessage="Portfolio data failed to load">
                  <PortfolioView
                      playerStats={playerStats}
                      onAction={(id, action) => {
                          handleStatChange(action.outcome.statChanges);
                          addToast(action.outcome.logMessage, 'info');
                          addLogEntry(action.outcome.logMessage);
                          appendChatMessage({ sender: 'system', text: `[SYSTEM_LOG] Portfolio action taken: ${action.text}` });
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
                  </PanelErrorBoundary>
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
          <PanelErrorBoundary panelName="EventDrivenWorkspace" fallbackMessage="Workspace failed to load">
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
              // Continue in LIFE_MANAGEMENT phase (not SCENARIO, which requires an initialized scenario)
              setGamePhase('LIFE_MANAGEMENT');
              setActiveTab('WORKSPACE');
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
          </PanelErrorBoundary>
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
      // If we loaded a game and are not in Intro, skip boot sequence
      if (playerStats && gamePhase !== 'INTRO') {
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

  if (gamePhase === 'INTRO') {
      const quickStart = localStorage.getItem('fundwars_skip_intro') === 'true';
      return <IntroSequence onComplete={handleIntroComplete} quickStart={quickStart} />;
  }

  return (
    <div className="h-[100dvh] w-screen app-shell-grid text-slate-200 flex flex-col overflow-hidden font-terminal">
        {/* Modal Stack: Only one modal shown at a time, prioritized */}
        {activeModal === 'GAME_END' && playerStats && (
            <GameEndModal
                phase={gamePhase}
                stats={playerStats}
                actionLog={actionLog}
                onRestart={handleResetSimulation}
                onClose={() => {
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
        <div className="pt-[env(safe-area-inset-top)] bg-[#070b10]/95 border-b border-slate-700/70 lg:pt-0">
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
        <div className={`hidden lg:grid flex-1 min-h-0 overflow-hidden relative gap-2 p-2 ${isChatOpen ? 'grid-cols-[minmax(210px,260px)_minmax(420px,1fr)_minmax(220px,280px)_minmax(380px,480px)]' : 'grid-cols-[minmax(210px,260px)_minmax(420px,1fr)_minmax(220px,280px)]'}`} style={{ isolation: 'isolate' }}>
            {/* Left Panel (Comms) */}
            <div className="rounded-lg border border-slate-700/70 bg-black/80 min-w-0 shrink-0 overflow-hidden">
                <NpcListPanel
                  npcs={npcs}
                  selectedNpcId={selectedNpcId}
                  onSelectNpc={(npcId) => { handleNpcSelect(npcId); setIsChatOpen(true); }}
                />
            </div>

            {/* Center Column (Workspace) */}
            <div className="rounded-lg border border-slate-700/70 bg-black/70 relative flex flex-col overflow-hidden min-w-0">
                {/* Desktop Tab Bar */}
                <div className="p-3 bg-[#070b10]/95 border-b border-slate-800 flex items-center justify-between gap-3">
                    <div className="grid grid-cols-4 h-10 border border-slate-700 rounded-lg overflow-hidden bg-black min-w-[360px]">
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
                                    onClick={() => {
                                        if (isDisabled) {
                                            addToast('Founder Mode unlocks when you reach $1M in personal funds. Keep grinding!', 'info');
                                            return;
                                        }
                                        setActiveTab(tab);
                                    }}
                                    data-tutorial={tutorialAttr}
                                    title={isDisabled ? 'Unlocks when you reach $1M in personal funds' : undefined}
                                    aria-current={activeTab === tab ? 'page' : undefined}
                                    className={`terminal-focus px-3 py-2 text-xs font-bold uppercase transition-colors shrink-0 border-r border-slate-800 last:border-r-0 ${
                                        activeTab === tab
                                            ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-black'
                                            : isDisabled
                                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                    }`}
                                >
                                    <span className="relative group/tab">
                                        {tabLabels[tab]}
                                        {isDisabled && <i className="fas fa-lock ml-1"></i>}
                                        {isDisabled && (
                                            <span className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-48 px-3 py-2 text-[10px] text-slate-300 bg-slate-900 border border-slate-600 rounded shadow-lg opacity-0 group-hover/tab:opacity-100 transition-opacity pointer-events-none z-50 normal-case tracking-normal font-normal">
                                                <i className="fas fa-info-circle text-amber-400 mr-1"></i>
                                                Reach <strong className="text-amber-400">$1M</strong> in personal funds to unlock Founder Mode and start your own fund.
                                            </span>
                                        )}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Activity Feed Toggle */}
                    <button
                      onClick={() => {
                        const opening = !showActivityFeed;
                        setShowActivityFeed(opening);
                        if (opening) {
                          setSeenActivityCount(activityFeedItems.length);
                        }
                      }}
                      aria-label={unseenActivityCount > 0 ? `Activity feed, ${unseenActivityCount} unread` : 'Activity feed'}
                      className={`
                        terminal-focus px-3 py-2 rounded-lg border text-xs font-bold uppercase
                        inline-flex items-center gap-1.5 whitespace-nowrap
                        transition-all duration-200
                        ${showActivityFeed
                          ? 'bg-blue-900/50 border-blue-500/60 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                          : 'bg-slate-800/50 border-slate-600/50 text-slate-400 hover:bg-slate-700/50 hover:border-slate-500'
                        }
                      `}
                    >
                      <i className="fas fa-list-ul mr-1"></i>
                      <span>Activity</span>
                      {unseenActivityCount > 0 && (
                        <span aria-hidden="true" className="px-1.5 py-0.5 bg-blue-500 text-white text-[10px] rounded-full">
                          {unseenActivityCount > 99 ? '99+' : unseenActivityCount}
                        </span>
                      )}
                    </button>
                </div>
                {isDesktop && renderCenterPanel()}
            </div>
            
            {/* Right Panel (News) */}
            <div className="rounded-lg border border-slate-700/70 bg-black/80 overflow-hidden min-w-0">
                 <NewsTicker events={[...dynamicNews, ...NEWS_EVENTS]} systemLogs={actionLog} newspaper={blueprintAI?.newspaper} onMarkNewspaperRead={markNewspaperRead} activeGossip={blueprintAI?.reputationWeb?.activeGossip} />
            </div>

            {/* Chat Panel (4th column, shown when chat is open) */}
            {isChatOpen && (
                <div className="rounded-lg border border-slate-700/70 bg-slate-950/95 min-w-0 min-h-0 h-full overflow-hidden flex flex-col">
                    {/* Chat Panel Header */}
                    <div className="bg-slate-800 p-2 flex justify-between items-center border-b border-amber-500/30 shrink-0">
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-amber-500 font-bold ml-2 tracking-widest text-sm">BLOOMBERG_IB</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={handleChatBackToPortfolio}
                                className="text-slate-800 bg-amber-300 hover:bg-amber-200 font-bold px-3 py-1 rounded-sm uppercase text-[10px] tracking-widest"
                            >
                                Portfolio
                            </button>
                            <button onClick={handleChatClose} className="text-slate-500 hover:text-amber-500" title="Minimize chat">
                                <i className="fas fa-minus"></i>
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 min-h-0 overflow-hidden">
                        <PanelErrorBoundary panelName="CommsTerminal" fallbackMessage="Chat failed to load">
                        <CommsTerminal
                            key="desktop-comms-inline"
                            mode="MOBILE_EMBED"
                            isOpen={true}
                            npcList={npcs}
                            selectedNpcId={selectedNpcId}
                            advisorMessages={chatHistory}
                            onSendMessageToAdvisor={handleSendMessageToAdvisor}
                            onSendMessageToNPC={handleSendMessageToNPC}
                            isLoadingAdvisor={isAdvisorLoading}
                            predefinedQuestions={PREDEFINED_QUESTIONS}
                            onClose={handleChatClose}
                            onBackToPortfolio={handleChatBackToPortfolio}
                        />
                        </PanelErrorBoundary>
                    </div>
                </div>
            )}
        </div>

        {/* MOBILE LAYOUT (View Switcher) */}
        <div className="lg:hidden flex-1 flex flex-col overflow-y-auto overflow-x-hidden relative bg-[#05070a]">
            {activeMobileTab === 'COMMS' && (
                <CommsTerminal
                    key="mobile-comms"
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
                <div className="flex-1 overflow-y-auto overflow-x-hidden relative bg-transparent animate-fade-in" style={{ WebkitOverflowScrolling: 'touch' }}>
                    {!isDesktop && renderCenterPanel()}
                </div>
            )}

            {activeMobileTab === 'NEWS' && (
                <div className="flex-1 overflow-y-auto overflow-x-hidden animate-fade-in" style={{ WebkitOverflowScrolling: 'touch' }}>
                     <NewsTicker events={[...dynamicNews, ...NEWS_EVENTS]} systemLogs={actionLog} newspaper={blueprintAI?.newspaper} onMarkNewspaperRead={markNewspaperRead} activeGossip={blueprintAI?.reputationWeb?.activeGossip} />
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
        
        {/* DESKTOP BOTTOM BAR: CMD LINE + Save Indicator */}
        <div className="hidden lg:flex h-8 bg-slate-900 border-t border-slate-700 items-center px-2 text-xs font-mono text-green-500 justify-between">
            <div className="flex items-center">
                <span className="mr-2">{">"}</span>
                <span className="animate-pulse">_</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 text-[10px]" aria-live="polite">
                <i className="fas fa-cloud-arrow-up text-emerald-600"></i>
                <span>Auto-saved</span>
            </div>
        </div>

        {/* DESKTOP CHAT LAUNCHER BUTTON (only shows when chat is closed) */}
        {!isChatOpen && (
            <button
                onClick={handleChatOpen}
                className="hidden lg:flex fixed bottom-6 right-6 bg-amber-500 text-black font-mono text-sm py-3 px-4 shadow-[0_0_15px_rgba(245,158,11,0.5)] z-40 items-center space-x-2 transition-transform duration-200 hover:scale-105 hover:bg-amber-400 rounded-md"
            >
                <div className="relative">
                    <i className="fas fa-terminal animate-pulse"></i>
                </div>
                <span className="font-bold tracking-widest">IB_CHAT // CONNECT</span>
            </button>
        )}

        <PortfolioCommandCenter
            isOpen={showPortfolioDashboard}
            onClose={() => setShowPortfolioDashboard(false)}
            onJumpToAssets={() => {
                setShowPortfolioDashboard(false);
                setActiveTab('ASSETS');
                if (window.innerWidth < 768) setActiveMobileTab('DESK');
            }}
        />

        {/* AUCTION MODAL */}
        {activeModal === 'AUCTION' && currentAuction && playerStats && (
            <CompetitiveAuctionModal
                deal={currentAuction}
                playerCash={playerStats.cash}
                playerReputation={playerStats.reputation}
                onComplete={handleAuctionComplete}
                onClose={closeAuction}
            />
        )}

        {/* COMPANY EVENT MODAL */}
        {activeModal === 'COMPANY_EVENT' && activeCompanyEvent && playerStats && (
            <CompanyEventModal
                event={activeCompanyEvent}
                playerStats={playerStats}
                onDecide={handleEventDecision}
                onConsultMachiavelli={handleConsultMachiavelli}
                useAction={useAction}
                addToast={addToast}
                addLogEntry={addLogEntry}
            />
        )}

        {/* NPC DRAMA MODAL */}
        {activeModal === 'DRAMA' && activeDrama && playerStats && (
            <NPCDramaModal
                drama={activeDrama}
                playerStats={playerStats}
                onResolve={() => setActiveDrama(null)}
                onConsultMachiavelli={handleConsultMachiavelli}
                useAction={useAction}
                updatePlayerStats={updatePlayerStats}
                addToast={addToast}
                addLogEntry={addLogEntry}
            />
        )}

        {/* STORY MILESTONE MODAL */}
        {activeModal === 'MILESTONE' && visibleMilestone && (
            <StoryMilestoneModal
                sceneId={visibleMilestone.sceneId}
                onComplete={(effects) => {
                    if (effects) updatePlayerStats(effects);
                    dismissMilestone();
                    playSfx('SUCCESS');
                }}
                onDismiss={() => {
                    dismissMilestone();
                    playSfx('KEYPRESS');
                }}
            />
        )}

        {/* STATS EXPLAINER MODAL */}
        {activeModal === 'STATS' && showStatsModal && playerStats && (
            <StatsExplainerModal
                stats={playerStats}
                marketVolatility={marketVolatility}
                onClose={handleStatsModalClose}
                isFirstTime={!hasSeenStatsTutorial}
            />
        )}

        {/* TRANSPARENCY / RULES MODAL */}
        {activeModal === 'TRANSPARENCY' && playerStats && (
            <TransparencyModal
                isOpen={showTransparencyModal}
                stats={playerStats}
                marketVolatility={marketVolatility}
                onClose={() => setShowTransparencyModal(false)}
            />
        )}

        {/* MOBILE BOTTOM NAV */}
        <BottomNav activeTab={activeMobileTab} onTabChange={setActiveMobileTab} />

        {/* WARNING PANEL - Living World System (hidden during modals and story/priority events to avoid overlap) */}
        {!activeModal && !rpgState.eventQueue.priorityEvent && (
            <WarningPanel
                warnings={activeWarnings}
                onDismiss={dismissWarning}
                onAction={handleWarningWithContext}
            />
        )}

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

      {/* Activity Feed — rendered via Portal to avoid layout interference */}
      {showActivityFeed && createPortal(
        <>
          <div
            className="fixed inset-0 bg-black/40"
            style={{ zIndex: Z_INDEX.modalBackdrop }}
            onClick={() => setShowActivityFeed(false)}
          />
          <div className="fixed inset-y-0 right-0 pointer-events-none" style={{ zIndex: Z_INDEX.modal }}>
            <div
              className="pointer-events-auto h-full w-80 bg-slate-900 border-l border-slate-700 shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-label="Activity feed"
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
                  <ActivityFeed activities={activityFeedItems} className="h-full" />
                </div>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* Enhanced Toast System */}
      <ToastContainer toasts={toasts} onDismiss={removeEnhancedToast} />
    </div>
  );
};

export default App;
