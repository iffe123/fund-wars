/**
 * EventFeed Component
 *
 * The central hub for event-driven gameplay.
 * Replaces static activity menus with a chronological feed of narrative events.
 *
 * Players experience the game through events that demand responses,
 * rather than choosing from disconnected activity menus.
 */

import React, { useMemo, useCallback, useState } from 'react';
import type { StoryEvent, EventChoice, EventConsequences, WeekPhase } from '../types/rpgEvents';
import type { PlayerStats, NPC, MarketVolatility } from '../types';
import EventCard from './EventCard';
import { TerminalButton } from './TerminalUI';

interface EventFeedProps {
  // Events
  priorityEvent: StoryEvent | null;
  optionalEvents: StoryEvent[];
  backgroundMessages: string[];

  // Game State
  playerStats: PlayerStats;
  npcs: NPC[];
  worldFlags: Set<string>;
  currentPhase: WeekPhase;

  // Handlers
  onChoice: (event: StoryEvent, choice: EventChoice) => void;
  onDismissEvent: (eventId: string) => void;
  onAdvanceWeek: () => void;
  onRefreshEvents: () => void;
  onConsultAdvisor?: () => void;

  // Optional
  className?: string;
}

// Phase descriptions for the UI
const phaseDescriptions: Record<WeekPhase, { title: string; description: string; icon: string }> = {
  MORNING_BRIEFING: {
    title: 'Morning Briefing',
    description: 'A new week begins. Check what needs your attention.',
    icon: 'fa-sun',
  },
  PRIORITY_EVENT: {
    title: 'Priority Event',
    description: 'Something urgent requires your immediate attention.',
    icon: 'fa-exclamation-circle',
  },
  OPTIONAL_PHASE: {
    title: 'Your Move',
    description: 'Choose how to spend your time this week.',
    icon: 'fa-chess',
  },
  FALLOUT: {
    title: 'Consequences',
    description: 'Your decisions are having an impact.',
    icon: 'fa-ripple',
  },
  WEEK_END: {
    title: 'Week Complete',
    description: 'Time to advance to the next week.',
    icon: 'fa-calendar-check',
  },
};

const EventFeed: React.FC<EventFeedProps> = ({
  priorityEvent,
  optionalEvents,
  backgroundMessages,
  playerStats,
  npcs,
  worldFlags,
  currentPhase,
  onChoice,
  onDismissEvent,
  onAdvanceWeek,
  onRefreshEvents,
  onConsultAdvisor,
  className = '',
}) => {
  const [expandedEventId, setExpandedEventId] = useState<string | null>(
    priorityEvent?.id || optionalEvents[0]?.id || null
  );

  // Get phase info
  const phaseInfo = phaseDescriptions[currentPhase] || phaseDescriptions.OPTIONAL_PHASE;

  // Determine what to show based on phase
  const hasEvents = priorityEvent || optionalEvents.length > 0;
  const canAdvanceWeek = currentPhase === 'OPTIONAL_PHASE' || currentPhase === 'WEEK_END';
  const apRemaining = playerStats.gameTime?.actionsRemaining ?? 0;

  // Handle event choice
  const handleChoice = useCallback((event: StoryEvent, choice: EventChoice) => {
    onChoice(event, choice);
    // Auto-expand next event if available
    if (priorityEvent && priorityEvent.id === event.id && optionalEvents.length > 0) {
      setExpandedEventId(optionalEvents[0].id);
    }
  }, [onChoice, priorityEvent, optionalEvents]);

  // Sort optional events by stakes
  const sortedOptional = useMemo(() => {
    const stakeOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    return [...optionalEvents].sort((a, b) =>
      (stakeOrder[a.stakes] ?? 3) - (stakeOrder[b.stakes] ?? 3)
    );
  }, [optionalEvents]);

  return (
    <div className={`flex flex-col h-full bg-black ${className}`}>
      {/* Phase Header */}
      <div className="border-b border-slate-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-amber-400">
              <i className={`fas ${phaseInfo.icon}`}></i>
            </div>
            <div>
              <h2 className="font-bold text-white">{phaseInfo.title}</h2>
              <p className="text-xs text-slate-500">{phaseInfo.description}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500">
              Week {playerStats.gameTime?.week ?? 1}, Year {playerStats.gameTime?.year ?? 1}
            </div>
            <div className={`text-sm font-bold ${apRemaining > 0 ? 'text-cyan-400' : 'text-red-400'}`}>
              {apRemaining} AP remaining
            </div>
          </div>
        </div>
      </div>

      {/* Event List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Priority Event - Must handle first */}
        {priorityEvent && (
          <div className="relative">
            <div className="absolute -left-2 top-0 bottom-0 w-1 bg-amber-500 rounded-full"></div>
            <EventCard
              event={priorityEvent}
              playerStats={playerStats}
              npcs={npcs}
              worldFlags={worldFlags}
              onChoice={(choice) => handleChoice(priorityEvent, choice)}
              onConsultAdvisor={onConsultAdvisor}
              expanded={expandedEventId === priorityEvent.id}
              className="ml-2"
            />
          </div>
        )}

        {/* Optional Events */}
        {sortedOptional.length > 0 && (
          <div className="space-y-3">
            {!priorityEvent && (
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <span>Events Requiring Attention</span>
                <span className="px-2 py-0.5 bg-slate-800 rounded-full">
                  {sortedOptional.length}
                </span>
              </div>
            )}
            {priorityEvent && (
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-6">
                Other Events (handle priority first)
              </div>
            )}
            {sortedOptional.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                playerStats={playerStats}
                npcs={npcs}
                worldFlags={worldFlags}
                onChoice={(choice) => handleChoice(event, choice)}
                onDismiss={() => onDismissEvent(event.id)}
                onConsultAdvisor={onConsultAdvisor}
                expanded={expandedEventId === event.id && !priorityEvent}
                className={priorityEvent ? 'opacity-60 pointer-events-none' : ''}
              />
            ))}
          </div>
        )}

        {/* Background Messages */}
        {backgroundMessages.length > 0 && (
          <div className="mt-6 space-y-2">
            <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Background Activity
            </div>
            {backgroundMessages.map((msg, i) => (
              <div
                key={i}
                className="text-xs text-slate-500 flex items-center gap-2 py-1"
              >
                <i className="fas fa-circle text-[6px] text-slate-700"></i>
                {msg}
              </div>
            ))}
          </div>
        )}

        {/* No Events State */}
        {!hasEvents && backgroundMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
              <i className="fas fa-inbox text-2xl text-slate-600"></i>
            </div>
            <p className="text-slate-400 font-medium mb-2">No pending events</p>
            <p className="text-sm text-slate-500 mb-4">
              The office is quiet. Time to advance the week?
            </p>
            <TerminalButton
              label="Generate Events"
              icon="fa-rotate"
              onClick={onRefreshEvents}
            />
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="border-t border-slate-800 p-4 space-y-3">
        {/* Quick Stats */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            <i className="fas fa-bolt mr-1 text-yellow-500"></i>
            Energy: {playerStats.energy ?? 100}
          </span>
          <span>
            <i className="fas fa-brain mr-1 text-purple-500"></i>
            Stress: {playerStats.stress ?? 0}
          </span>
          <span>
            <i className="fas fa-dollar-sign mr-1 text-green-500"></i>
            Cash: ${(playerStats.cash ?? 0).toLocaleString()}
          </span>
        </div>

        {/* Advance Week Button */}
        {canAdvanceWeek && (
          <button
            data-tutorial="advance-btn"
            onClick={onAdvanceWeek}
            disabled={!!priorityEvent}
            className={`
              w-full py-3 rounded border transition-all flex items-center justify-center gap-3
              ${priorityEvent
                ? 'border-slate-700 text-slate-600 cursor-not-allowed'
                : 'border-amber-600 text-amber-400 hover:bg-amber-900/30 hover:border-amber-500'
              }
            `}
          >
            <i className={`fas fa-forward ${!priorityEvent ? 'animate-pulse' : ''}`}></i>
            <span className="text-sm font-bold uppercase tracking-wide">
              {priorityEvent ? 'Handle Priority Event First' : 'Advance to Next Week'}
            </span>
          </button>
        )}

        {/* Hint for priority events */}
        {priorityEvent && currentPhase === 'PRIORITY_EVENT' && (
          <p className="text-xs text-center text-amber-500/70">
            <i className="fas fa-exclamation-triangle mr-1"></i>
            Priority events must be resolved before advancing
          </p>
        )}
      </div>
    </div>
  );
};

export default EventFeed;
