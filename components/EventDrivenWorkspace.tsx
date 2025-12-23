/**
 * EventDrivenWorkspace Component
 *
 * The primary game workspace that replaces static activity menus
 * with the event-driven narrative experience.
 *
 * Key design principle: Events drive everything.
 * Instead of "choose from menu of activities," the core loop becomes:
 * - Event appears -> Player responds -> Consequence fires -> New events spawn
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useGame } from '../context/GameContext';
import { useRPGEvents } from '../contexts/RPGEventContext';
import { TerminalPanel, TerminalButton } from './TerminalUI';
import EventFeed from './EventFeed';
import EventCard from './EventCard';
import ConsequenceToast from './ConsequenceToast';
import type { StoryEvent, EventChoice, EventConsequences } from '../types/rpgEvents';
import type { StatChanges } from '../types';
import { Z_INDEX } from '../constants';
import { STORY_EVENTS, createEventMap } from '../constants/rpgContent';

interface EventDrivenWorkspaceProps {
  tutorialStep: number;
  onManageAssets: () => void;
  onShowPortfolioDashboard: () => void;
  onDealFlow: () => void;
  onAdvanceTime: () => void;
  activeDealsCount: number;
  addToast: (message: string, type: 'error' | 'success' | 'info') => void;
  addLogEntry: (message: string) => void;
  onSwitchTab?: (tab: 'ASSETS' | 'COMMS' | 'NEWS' | 'SYSTEM') => void;
  onTutorialComplete?: () => void;
}

const EventDrivenWorkspace: React.FC<EventDrivenWorkspaceProps> = ({
  tutorialStep,
  onManageAssets,
  onShowPortfolioDashboard,
  onDealFlow,
  onAdvanceTime,
  activeDealsCount,
  addToast,
  addLogEntry,
  onSwitchTab,
  onTutorialComplete,
}) => {
  const {
    playerStats,
    npcs,
    marketVolatility,
    updatePlayerStats,
  } = useGame();

  const {
    state: rpgState,
    currentEvent,
    currentPhase,
    worldFlags,
    makeChoice,
    applyConsequences,
    refreshEventQueue,
    getAvailableEvents,
    selectEvent,
    closeEventModal,
    advanceWeek,
    getFlowStatus,
  } = useRPGEvents();

  // Local state for consequence display
  const [activeConsequence, setActiveConsequence] = useState<{
    consequences: EventConsequences;
    playerLine?: string;
    immediateResponse?: string;
    epilogue?: string;
  } | null>(null);

  // Event map for lookups
  const eventMap = useMemo(() => createEventMap(), []);

  // Get available events
  const availableEvents = useMemo(() => {
    if (!playerStats) return [];
    return getAvailableEvents(playerStats, npcs, marketVolatility);
  }, [playerStats, npcs, marketVolatility, getAvailableEvents]);

  // Get current priority event from queue
  const priorityEvent = useMemo(() => {
    const queuedPriority = rpgState.eventQueue.priorityEvent;
    if (!queuedPriority) return null;
    return eventMap.get(queuedPriority.eventId) || null;
  }, [rpgState.eventQueue.priorityEvent, eventMap]);

  // Get optional events from queue
  const optionalEvents = useMemo(() => {
    return rpgState.eventQueue.optionalEvents
      .map(qe => eventMap.get(qe.eventId))
      .filter((e): e is StoryEvent => e !== undefined);
  }, [rpgState.eventQueue.optionalEvents, eventMap]);

  // Background messages
  const backgroundMessages = useMemo(() => {
    const messages: string[] = [];
    if (playerStats?.portfolio?.length) {
      const company = playerStats.portfolio[Math.floor(Math.random() * playerStats.portfolio.length)];
      messages.push(`${company.name}: Operations running normally`);
    }
    if (npcs.length > 0) {
      const npc = npcs[Math.floor(Math.random() * npcs.length)];
      messages.push(`${npc.name} is working on something`);
    }
    return messages;
  }, [playerStats?.portfolio, npcs]);

  // Ensure events are available on mount and when player stats change
  useEffect(() => {
    if (playerStats && tutorialStep === 0) {
      refreshEventQueue(playerStats, npcs, marketVolatility);
    }
  }, [playerStats?.gameTime?.week, tutorialStep]);

  // Handle event choice
  const handleEventChoice = useCallback((event: StoryEvent, choice: EventChoice) => {
    if (!playerStats) return;

    // Make the choice using RPG system, passing the event explicitly
    const result = makeChoice(choice, playerStats, npcs, event);

    // Apply consequences to game state
    const statChanges = applyConsequences(result.consequences);
    updatePlayerStats(statChanges);

    // Show consequence toast
    setActiveConsequence({
      consequences: result.consequences,
      playerLine: choice.playerLine,
      immediateResponse: choice.immediateResponse,
      epilogue: choice.epilogue,
    });

    // Log the action
    addLogEntry(`EVENT: ${event.title} - ${choice.label}`);

    // Handle tab switching from consequences (for onboarding)
    if (result.consequences.switchToTab && onSwitchTab) {
      onSwitchTab(result.consequences.switchToTab);
    }

    // Handle guided actions (highlight UI elements)
    if (result.consequences.guidedAction) {
      const { targetElement, pulseColor } = result.consequences.guidedAction;
      const element = document.querySelector(targetElement);
      if (element) {
        element.classList.add('guided-pulse');
        element.setAttribute('data-guided', 'true');
        element.setAttribute('data-pulse-color', pulseColor || 'amber');

        // Auto-clear after 10 seconds
        setTimeout(() => {
          element.classList.remove('guided-pulse');
          element.removeAttribute('data-guided');
          element.removeAttribute('data-pulse-color');
        }, 10000);
      }
    }

    // Check if tutorial is complete
    if (result.consequences.setsFlags?.includes('TUTORIAL_COMPLETE') && onTutorialComplete) {
      onTutorialComplete();
    }

    // Toast for immediate feedback
    if (result.consequences.notification) {
      // Convert warning to info since addToast only accepts error/success/info
      const toastType = result.consequences.notification.type === 'warning' ? 'info' : result.consequences.notification.type;
      addToast(result.consequences.notification.message, toastType as 'error' | 'success' | 'info');
    }
  }, [playerStats, npcs, makeChoice, applyConsequences, updatePlayerStats, addLogEntry, addToast, onSwitchTab, onTutorialComplete]);

  // Handle dismiss event (defer for later)
  const handleDismissEvent = useCallback((eventId: string) => {
    addToast('Event deferred to later', 'info');
    // The event stays in queue but moves to lower priority
    // In a full implementation, we'd modify the queue here
  }, [addToast]);

  // Handle advance week
  const handleAdvanceWeek = useCallback(() => {
    advanceWeek();
    onAdvanceTime();
  }, [advanceWeek, onAdvanceTime]);

  // Handle refresh events
  const handleRefreshEvents = useCallback(() => {
    if (playerStats) {
      refreshEventQueue(playerStats, npcs, marketVolatility);
      addToast('New events generated', 'info');
    }
  }, [playerStats, npcs, marketVolatility, refreshEventQueue, addToast]);

  // Check if onboarding events exist
  const onboardingEvent = useMemo(() => {
    // Find current onboarding event based on tutorial step / flags
    const onboardingEvents = availableEvents.filter(e => e.isOnboarding);
    if (onboardingEvents.length > 0) {
      // Return the first available onboarding event
      return onboardingEvents[0];
    }
    return null;
  }, [availableEvents]);

  // Legacy tutorial mode check - will be phased out
  const isTutorialActive = tutorialStep >= 1 && tutorialStep <= 6;

  if (!playerStats) {
    return (
      <TerminalPanel title="WORKSPACE_HOME" className="h-full p-4">
        <div className="flex items-center justify-center h-full text-slate-500">
          Loading...
        </div>
      </TerminalPanel>
    );
  }

  // NEW: If we have an onboarding event, show it through the event system
  // This replaces the legacy tutorial overlay approach
  if (onboardingEvent && !worldFlags.has('TUTORIAL_COMPLETE')) {
    return (
      <div style={{ zIndex: Z_INDEX.tutorialHighlight, position: 'relative' }}>
        <TerminalPanel
          title="ONBOARDING"
          className="h-full flex flex-col p-4 bg-black relative"
        >
          <EventFeed
            priorityEvent={onboardingEvent}
            optionalEvents={[]}
            backgroundMessages={['Welcome to Apex Capital...']}
            playerStats={playerStats}
            npcs={npcs}
            worldFlags={worldFlags}
            currentPhase="PRIORITY_EVENT"
            onChoice={handleEventChoice}
            onDismissEvent={() => {}} // No dismissing onboarding events
            onAdvanceWeek={() => {}} // No advancing during onboarding
            onRefreshEvents={() => {}} // No refreshing during onboarding
            className="flex-1"
          />
        </TerminalPanel>
      </div>
    );
  }

  // LEGACY: During tutorial (old system), show simplified view
  // This provides backward compatibility while we transition
  if (isTutorialActive) {
    return (
      <div style={{ zIndex: Z_INDEX.tutorialHighlight, position: 'relative' }}>
        <TerminalPanel
          title="WORKSPACE_HOME"
          className={`h-full flex flex-col p-4 bg-black relative`}
        >
          <div className="flex-1 border-t border-slate-800 pt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-500">PENDING_TASKS</span>
              <div
                className={tutorialStep === 1 ? 'relative' : ''}
                style={tutorialStep === 1 ? { zIndex: Z_INDEX.tutorialHighlight } : undefined}
              >
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

          <div className="text-slate-400 text-sm italic mb-4">
            URGENT: Review PackFancy Deal Memo.
          </div>
        </div>
        </TerminalPanel>
      </div>
    );
  }

  // Full event-driven experience
  return (
    <>
      <TerminalPanel title="COMMAND_CENTER" className="h-full flex flex-col bg-black">
        <EventFeed
          priorityEvent={priorityEvent}
          optionalEvents={optionalEvents}
          backgroundMessages={backgroundMessages}
          playerStats={playerStats}
          npcs={npcs}
          worldFlags={worldFlags}
          currentPhase={currentPhase}
          onChoice={handleEventChoice}
          onDismissEvent={handleDismissEvent}
          onAdvanceWeek={handleAdvanceWeek}
          onRefreshEvents={handleRefreshEvents}
          className="flex-1"
        />

        {/* Quick Actions Bar */}
        <div className="border-t border-slate-800 p-3 flex flex-wrap gap-2">
          <TerminalButton
            label="ASSETS"
            icon="fa-briefcase"
            onClick={onManageAssets}
          />
          <TerminalButton
            label="DASHBOARD"
            icon="fa-grid-2"
            onClick={onShowPortfolioDashboard}
          />
          {activeDealsCount > 0 && (
            <TerminalButton
              label={`DEALS (${activeDealsCount})`}
              icon="fa-gavel"
              onClick={onDealFlow}
              className="border-amber-500 text-amber-400"
            />
          )}
        </div>
      </TerminalPanel>

      {/* Consequence Toast */}
      {activeConsequence && (
        <ConsequenceToast
          consequences={activeConsequence.consequences}
          playerLine={activeConsequence.playerLine}
          immediateResponse={activeConsequence.immediateResponse}
          epilogue={activeConsequence.epilogue}
          onDismiss={() => setActiveConsequence(null)}
          autoDismissMs={6000}
        />
      )}
    </>
  );
};

export default EventDrivenWorkspace;
