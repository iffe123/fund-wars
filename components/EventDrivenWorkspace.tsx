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
import { useGame } from '../contexts/GameContext';
import { useRPGEvents } from '../contexts/RPGEventContext';
import { TerminalPanel, TerminalButton } from './TerminalUI';
import EventFeed from './EventFeed';
import EventCard from './EventCard';
// ConsequenceToast removed - consequences now route through central toast system
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
  onConsultAdvisor?: () => void;
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
  onConsultAdvisor,
}) => {
  const {
    playerStats,
    npcs,
    marketVolatility,
    updatePlayerStats,
    addActivity,
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
    dismissEvent,
  } = useRPGEvents();

  // Consequence display now uses central toast system

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

  // Background messages (stable based on week, not random per render)
  const backgroundMessages = useMemo(() => {
    const messages: string[] = [];
    const week = playerStats?.gameTime?.week ?? 0;
    if (playerStats?.portfolio?.length) {
      const idx = week % playerStats.portfolio.length;
      const company = playerStats.portfolio[idx];
      messages.push(`${company.name}: Operations running normally`);
    }
    if (npcs.length > 0) {
      const idx = week % npcs.length;
      const npc = npcs[idx];
      messages.push(`${npc.name} is working on something`);
    }
    return messages;
  }, [playerStats?.portfolio, playerStats?.gameTime?.week, npcs]);

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

    // Show consequence via central toast
    const consequenceMsg = choice.label + (result.consequences.notification?.message ? `: ${result.consequences.notification.message}` : ': Decision made.');
    const consequenceType = result.consequences.notification?.type === 'warning' ? 'info' : (result.consequences.notification?.type || 'success');
    addToast(consequenceMsg, consequenceType as 'error' | 'success' | 'info');

    // Log the action
    addLogEntry(`EVENT: ${event.title} - ${choice.label}`);

    // Add to Activity Feed
    const categoryToType: Record<string, 'deal' | 'relationship' | 'portfolio' | 'personal' | 'market' | 'time'> = {
      DEAL: 'deal', NPC: 'relationship', CRISIS: 'market', OPPORTUNITY: 'deal',
      PERSONAL: 'personal', CAREER: 'personal', MARKET: 'market', OPERATIONS: 'portfolio',
    };
    const stakeToSentiment: Record<string, 'positive' | 'neutral' | 'negative' | 'warning'> = {
      LOW: 'neutral', MEDIUM: 'neutral', HIGH: 'warning', CRITICAL: 'negative',
    };
    addActivity({
      type: categoryToType[event.category] || 'personal',
      icon: `fas fa-${event.category === 'DEAL' ? 'briefcase' : event.category === 'NPC' ? 'user-tie' : event.category === 'CRISIS' ? 'exclamation-triangle' : 'circle-info'}`,
      title: `${event.title}: ${choice.label}`,
      detail: result.consequences.notification?.message || undefined,
      sentiment: result.consequences.notification?.type === 'warning' ? 'warning' : (stakeToSentiment[event.stakes] || 'neutral'),
    });

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

    // Notification already handled above via central toast
  }, [playerStats, npcs, makeChoice, applyConsequences, updatePlayerStats, addLogEntry, addToast, onSwitchTab, onTutorialComplete]);

  // Handle dismiss event (remove from queue)
  const handleDismissEvent = useCallback((eventId: string) => {
    dismissEvent(eventId);
    addToast('Event deferred', 'info');
  }, [dismissEvent, addToast]);

  // Handle advance week
  const handleAdvanceWeek = useCallback(() => {
    advanceWeek();
    onAdvanceTime();
    addActivity({
      type: 'time',
      icon: 'fas fa-forward',
      title: 'Week Advanced',
      detail: `Moving to week ${(playerStats?.gameTime?.week ?? 0) + 1}`,
      sentiment: 'neutral',
    });
  }, [advanceWeek, onAdvanceTime, addActivity, playerStats?.gameTime?.week]);

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

  // Legacy tutorial system removed - RPG event system handles onboarding

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
  // IMPORTANT: Skip if legacy tutorial is active (tutorialStep > 0) to avoid dual-tutorial conflict
  if (onboardingEvent && !worldFlags.has('TUTORIAL_COMPLETE') && tutorialStep === 0) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center bg-[rgb(10,15,25)]"
        style={{ zIndex: Z_INDEX.tutorialBackdrop, backgroundColor: 'rgb(10, 15, 25)' }}
      >
        <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-4">
          <TerminalPanel
            title="ONBOARDING"
            className="flex flex-col p-4 bg-black"
          >
            <EventFeed
              priorityEvent={onboardingEvent}
              optionalEvents={[]}
              backgroundMessages={['Welcome to Sterling Partners...']}
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
      </div>
    );
  }

  // Full event-driven experience
  // If there's a priority event, show it as a fullscreen overlay so no background bleeds through
  if (priorityEvent) {
    return (
      <>
        <div
          className="fixed inset-0 flex items-center justify-center bg-[rgb(10,15,25)]"
          style={{ zIndex: Z_INDEX.tutorialBackdrop, backgroundColor: 'rgb(10, 15, 25)' }}
        >
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-4">
            <TerminalPanel
              title="PRIORITY_EVENT"
              className="flex flex-col p-4 bg-black"
            >
              <EventFeed
                priorityEvent={priorityEvent}
                optionalEvents={[]}
                backgroundMessages={[]}
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
            </TerminalPanel>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <TerminalPanel title="COMMAND_CENTER" className="h-full flex flex-col bg-black">
        <EventFeed
          priorityEvent={null}
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

      {/* Consequence feedback now handled via central toast system */}
    </>
  );
};

export default EventDrivenWorkspace;
