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
import EventFeed, { type DecisionPulse } from './EventFeed';
import type { StoryEvent, EventChoice } from '../types/rpgEvents';
import type { StatChanges, PlayerStats, NPC } from '../types';
import { Z_INDEX } from '../constants';
import { createEventMap } from '../constants/rpgContent';
import type { ChoiceResult } from '../utils/eventQueueManager';
import {
  updateVoiceActivation,
  getSceneInterjections,
} from '../services/innerMonologueService';
import { buildCompactGameState } from '../services/blueprintAIService';
import type { VoiceInterjection, InnerVoiceId } from '../types/aiBlueprint';
import {
  getVoiceColor,
  getVoiceBgColor,
  getVoiceIcon,
} from '../services/innerMonologueService';

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

// Only show the stats players actually care about in consequence summaries
const impactStatLabels: Partial<Record<keyof StatChanges, string>> = {
  cash: 'Cash',
  reputation: 'Rep',
  stress: 'Stress',
  energy: 'Energy',
  analystRating: 'Analyst Rating',
  financialEngineering: 'Financial Engineering',
  ethics: 'Ethics',
  auditRisk: 'Audit Risk',
  score: 'Score',
  health: 'Health',
  dependency: 'Dependency',
};

const formatStatDetail = (key: keyof StatChanges, value: number): string => {
  const label = impactStatLabels[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim();
  if (key === 'cash') {
    return `${value > 0 ? '+' : '-'}$${Math.abs(value).toLocaleString()} ${label}`;
  }
  return `${value > 0 ? '+' : ''}${value} ${label}`;
};

const buildDecisionPulse = (
  event: StoryEvent,
  choice: EventChoice,
  result: ChoiceResult,
  playerStats: PlayerStats,
  npcs: NPC[],
  eventMap: Map<string, StoryEvent>,
): DecisionPulse => {
  const details: string[] = [];
  const { consequences } = result;

  if (result.skillCheckResult) {
    const skillRaw = (result.skillCheckResult as Record<string, unknown>).skill as string | undefined;
    const skillName = skillRaw
      ? (impactStatLabels[skillRaw as keyof StatChanges] || skillRaw.replace(/([A-Z])/g, ' $1').replace(/^./, (s: string) => s.toUpperCase()).trim())
      : 'Skill';
    details.push(
      result.skillCheckResult.passed
        ? `${skillName} Check Passed`
        : `${skillName} Check Failed`
    );
  }

  const statEntries = Object.entries(consequences.stats || {})
    .filter(([, value]) => typeof value === 'number' && value !== 0)
    .slice(0, 3) as Array<[keyof StatChanges, number]>;
  for (const [key, value] of statEntries) {
    details.push(formatStatDetail(key, value));
  }

  for (const effect of consequences.npcEffects?.slice(0, 2) || []) {
    const npc = npcs.find(candidate => candidate.id === effect.npcId);
    const npcChanges = [
      typeof effect.relationship === 'number' && `${effect.relationship > 0 ? '+' : ''}${effect.relationship} relationship`,
      typeof effect.trust === 'number' && `${effect.trust > 0 ? '+' : ''}${effect.trust} trust`,
      typeof effect.mood === 'number' && `${effect.mood > 0 ? '+' : ''}${effect.mood} mood`,
    ].filter(Boolean).join(' | ');

    if (npcChanges) {
      details.push(`${npc?.name || effect.npcId}: ${npcChanges}`);
    }
  }

  for (const effect of consequences.companyEffects?.slice(0, 1) || []) {
    const company = playerStats.portfolio.find(candidate => candidate.id === effect.companyId);
    if (typeof effect.changes.currentValuation === 'number') {
      details.push(
        `${company?.name || `Company ${effect.companyId}`}: now framed at $${(effect.changes.currentValuation / 1_000_000).toFixed(1)}M`
      );
    }
  }

  const queuedNextBeat = consequences.queuesEvent
    ? eventMap.get(consequences.queuesEvent.eventId)?.title
    : undefined;
  const triggeredNextBeat = result.triggeredEvents[0]
    ? eventMap.get(result.triggeredEvents[0])?.title
    : undefined;

  return {
    eventTitle: event.title,
    choiceLabel: choice.label,
    tone: consequences.notification?.type || 'info',
    summary:
      consequences.notification?.message ||
      result.narrative.response ||
      choice.immediateResponse ||
      'The room shifts the moment you commit.',
    details: details.slice(0, 4),
    nextBeat: queuedNextBeat || triggeredNextBeat,
  };
};

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
    useAction,
    blueprintAI,
    addVoiceInterjection,
    dismissInterjection,
    suppressVoice: suppressVoiceAction,
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

  // Event map for lookups
  const eventMap = useMemo(() => createEventMap(), []);
  const [decisionPulse, setDecisionPulse] = useState<DecisionPulse | null>(null);
  const [activeInterjections, setActiveInterjections] = useState<VoiceInterjection[]>([]);

  // Inner Monologue: get current voice state from blueprint AI
  const innerMonologueState = blueprintAI?.innerMonologue;

  // Trigger inner voice interjections after a choice
  const triggerInnerVoices = useCallback(async (
    event: StoryEvent,
    choice: EventChoice,
  ) => {
    if (!playerStats || !innerMonologueState) return;

    // Map event category to trigger type
    const categoryTriggerMap: Record<string, string> = {
      DEAL: 'deal_opportunity',
      NPC: 'rival_activity',
      CRISIS: 'red_flag_found',
      OPPORTUNITY: 'high_return_deal',
      PERSONAL: 'general',
      CAREER: 'promotion_event',
      MARKET: 'general',
      OPERATIONS: 'management_change',
    };
    const trigger = (categoryTriggerMap[event.category] || 'general') as any;
    const context = `${event.title}: Player chose "${choice.label}". ${event.hook}`;

    // Update voice activation based on current stats
    const updatedState = updateVoiceActivation(
      innerMonologueState,
      playerStats,
      playerStats.gameTime?.week ?? 0,
    );

    const gameState = buildCompactGameState(playerStats, marketVolatility);

    try {
      const interjections = await getSceneInterjections(
        updatedState,
        trigger,
        context,
        gameState,
      );
      if (interjections.length > 0) {
        setActiveInterjections(interjections);
        // Also persist to reducer
        for (const ij of interjections) {
          addVoiceInterjection(ij);
        }
      }
    } catch {
      // Offline fallbacks are handled inside getSceneInterjections
    }
  }, [playerStats, innerMonologueState, marketVolatility, addVoiceInterjection]);

  // Auto-dismiss interjections after 12 seconds
  useEffect(() => {
    if (activeInterjections.length === 0) return;
    const timer = setTimeout(() => setActiveInterjections([]), 12000);
    return () => clearTimeout(timer);
  }, [activeInterjections]);

  // Get available events
  const availableEvents = useMemo(() => {
    if (!playerStats) return [];
    return getAvailableEvents(playerStats, npcs, marketVolatility);
  }, [playerStats, npcs, marketVolatility, getAvailableEvents]);
  const hasOnboardingEvent = useMemo(
    () => availableEvents.some(event => event.isOnboarding),
    [availableEvents]
  );

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

  // Background messages — SQI-flavored ambient status
  const backgroundMessages = useMemo(() => {
    const messages: string[] = [];
    const week = playerStats?.gameTime?.week ?? 0;

    // Company flavor text (rotates deterministically by week)
    const companyLines = [
      (name: string) => `${name}: EBITDA still positive. The analysts celebrate with instant coffee.`,
      (name: string) => `${name}: Management sent a PowerPoint. It has 47 slides and no conclusions.`,
      (name: string) => `${name}: Quarterly board call tomorrow. Someone will say "synergies."`,
      (name: string) => `${name}: Operations humming. Nobody's quit this week, which counts as a win.`,
      (name: string) => `${name}: The CFO used the phrase "cautiously optimistic." That's never a good sign.`,
      (name: string) => `${name}: Revenue flat. The optimists call it "stability." The realists call it "stalling."`,
    ];
    if (playerStats?.portfolio?.length) {
      const idx = week % playerStats.portfolio.length;
      const company = playerStats.portfolio[idx];
      const lineIdx = week % companyLines.length;
      messages.push(companyLines[lineIdx](company.name));
    }

    // NPC flavor text (rotates deterministically)
    const npcLines = [
      (name: string) => `${name} is updating a spreadsheet nobody asked for`,
      (name: string) => `${name} just sent a "quick follow-up" email. It's not quick.`,
      (name: string) => `${name} is in a meeting that could have been a Slack message`,
      (name: string) => `${name} booked a conference room for a "strategic alignment session"`,
      (name: string) => `${name} is reviewing your last deal memo. They have opinions.`,
      (name: string) => `${name} just CC'd the entire floor on a reply-all. Classic.`,
    ];
    if (npcs.length > 0) {
      const idx = week % npcs.length;
      const npc = npcs[idx];
      const lineIdx = (week + 3) % npcLines.length;
      messages.push(npcLines[lineIdx](npc.name));
    }

    return messages;
  }, [playerStats?.portfolio, playerStats?.gameTime?.week, npcs]);

  // Ensure events are available on mount and when player stats change
  useEffect(() => {
    const shouldRefreshQueue = tutorialStep === 0 && (!hasOnboardingEvent || worldFlags.has('TUTORIAL_COMPLETE'));
    if (playerStats && shouldRefreshQueue) {
      refreshEventQueue(playerStats, npcs, marketVolatility);
    }
  }, [playerStats, tutorialStep, hasOnboardingEvent, worldFlags, refreshEventQueue, npcs, marketVolatility]);

  // Handle event choice
  const handleEventChoice = useCallback((event: StoryEvent, choice: EventChoice) => {
    if (!playerStats) return;

    // Consume 1 AP for non-onboarding event choices
    if (!event.isOnboarding) {
      useAction(1);
    }

    // Make the choice using RPG system, passing the event explicitly
    const result = makeChoice(choice, playerStats, npcs, event);

    // Apply consequences to game state
    const statChanges = applyConsequences(result.consequences);
    updatePlayerStats(statChanges);
    setDecisionPulse(buildDecisionPulse(event, choice, result, playerStats, npcs, eventMap));

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

    // Trigger inner voice reactions (non-blocking, async)
    if (!event.isOnboarding) {
      triggerInnerVoices(event, choice);
    }
  }, [playerStats, npcs, makeChoice, applyConsequences, updatePlayerStats, addLogEntry, addToast, onSwitchTab, onTutorialComplete, eventMap, triggerInnerVoices]);

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

  // Inner Monologue handlers
  const handleDismissInterjection = useCallback((voiceId: InnerVoiceId) => {
    setActiveInterjections(prev => prev.filter(ij => ij.voiceId !== voiceId));
    dismissInterjection(voiceId);
  }, [dismissInterjection]);

  const handleSuppressVoice = useCallback((voiceId: InnerVoiceId) => {
    setActiveInterjections(prev => prev.filter(ij => ij.voiceId !== voiceId));
    suppressVoiceAction(voiceId);
    addToast(`Suppressed inner voice: ${voiceId.toUpperCase()}. The cost is stress.`, 'info');
  }, [suppressVoiceAction, addToast]);

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
              decisionPulse={decisionPulse}
              activeInterjections={activeInterjections}
              onDismissInterjection={handleDismissInterjection}
              onSuppressVoice={handleSuppressVoice}
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
                decisionPulse={decisionPulse}
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
          decisionPulse={decisionPulse}
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
