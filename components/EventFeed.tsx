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
import type { StoryEvent, EventChoice, WeekPhase } from '../types/rpgEvents';
import type { PlayerStats, NPC, StatChanges } from '../types';
import type { VoiceInterjection, InnerVoiceId } from '../types/aiBlueprint';
import {
  getVoiceColor,
  getVoiceBgColor,
  getVoiceIcon,
} from '../services/innerMonologueService';
import EventCard from './EventCard';
import { TerminalButton } from './TerminalUI';

export interface DecisionPulse {
  eventTitle: string;
  choiceLabel: string;
  tone: 'success' | 'warning' | 'error' | 'info';
  summary: string;
  details: string[];
  nextBeat?: string;
}

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
  decisionPulse?: DecisionPulse | null;
  // Inner Monologue
  activeInterjections?: VoiceInterjection[];
  onDismissInterjection?: (voiceId: InnerVoiceId) => void;
  onSuppressVoice?: (voiceId: InnerVoiceId) => void;
}

// Phase descriptions for the UI
const phaseDescriptions: Record<WeekPhase, { title: string; description: string; icon: string }> = {
  MORNING_BRIEFING: {
    title: 'Morning Briefing',
    description: 'Coffee is cold. The inbox is not. Let\u2019s see what fresh chaos Monday brought.',
    icon: 'fa-sun',
  },
  PRIORITY_EVENT: {
    title: 'Priority Event',
    description: 'Something landed on your desk that won\u2019t wait. Handle it or it handles you.',
    icon: 'fa-exclamation-circle',
  },
  OPTIONAL_PHASE: {
    title: 'Your Move',
    description: 'The floor is yours. Spend your action points wisely \u2014 or don\u2019t. Nobody\u2019s watching. (Everyone is watching.)',
    icon: 'fa-chess',
  },
  FALLOUT: {
    title: 'Consequences',
    description: 'Remember that thing you did? The universe remembers too.',
    icon: 'fa-ripple',
  },
  WEEK_END: {
    title: 'Week Complete',
    description: 'Another week survived. Advance to discover what you\u2019ve set in motion.',
    icon: 'fa-calendar-check',
  },
};

const statLabels: Partial<Record<keyof StatChanges, string>> = {
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

const positiveStats = new Set<keyof StatChanges>([
  'cash',
  'reputation',
  'energy',
  'analystRating',
  'financialEngineering',
  'ethics',
  'score',
]);

const negativeStats = new Set<keyof StatChanges>([
  'stress',
  'auditRisk',
]);

const formatCompactImpact = (key: keyof StatChanges, value: number): string => {
  if (key === 'cash') {
    return `${value > 0 ? '+' : '-'}$${Math.abs(value).toLocaleString()}`;
  }
  const label = statLabels[key] || (key as string).replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim();
  return `${value > 0 ? '+' : ''}${value} ${label}`;
};

const getChoicePressureProfile = (choice: EventChoice) => {
  const stats = choice.consequences.stats;
  if (!stats) {
    return {
      rewardScore: 0,
      riskScore: choice.consequences.notification?.type === 'error' ? 2 : 0,
      rewardText: '',
      riskText: choice.consequences.notification?.type === 'error' ? 'backfire risk' : '',
    };
  }

  const rewardSignals: string[] = [];
  const riskSignals: string[] = [];
  let rewardScore = 0;
  let riskScore = 0;

  for (const [rawKey, rawValue] of Object.entries(stats)) {
    if (typeof rawValue !== 'number' || rawValue === 0) continue;

    const key = rawKey as keyof StatChanges;
    const value = rawValue;
    const magnitude = key === 'cash' ? Math.abs(value) / 2500 : Math.abs(value);

    if ((positiveStats.has(key) && value > 0) || (negativeStats.has(key) && value < 0)) {
      rewardScore += magnitude;
      rewardSignals.push(formatCompactImpact(key, value));
    }

    if ((negativeStats.has(key) && value > 0) || (positiveStats.has(key) && value < 0)) {
      riskScore += magnitude;
      riskSignals.push(formatCompactImpact(key, value));
    }
  }

  if (choice.consequences.notification?.type === 'success') rewardScore += 2;
  if (choice.consequences.notification?.type === 'warning') riskScore += 1.5;
  if (choice.consequences.notification?.type === 'error') riskScore += 3;

  return {
    rewardScore,
    riskScore,
    rewardText: rewardSignals.slice(0, 3).join(' | '),
    riskText: riskSignals.slice(0, 3).join(' | '),
  };
};

const getPressureLabel = (event: StoryEvent): { label: string; accent: string } => {
  if (event.expiresInWeeks === 0 || event.stakes === 'CRITICAL') {
    return { label: 'REDLINE', accent: 'text-red-300' };
  }
  if (event.expiresInWeeks === 1 || event.stakes === 'HIGH') {
    return { label: 'HOT', accent: 'text-amber-300' };
  }
  if (event.stakes === 'MEDIUM') {
    return { label: 'LIVE', accent: 'text-cyan-300' };
  }
  return { label: 'STABLE', accent: 'text-emerald-300' };
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
  decisionPulse = null,
  activeInterjections = [],
  onDismissInterjection,
  onSuppressVoice,
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
  const nextOptionalEventId = sortedOptional[0]?.id ?? null;
  const spotlightEvent = priorityEvent || sortedOptional[0] || null;
  const spotlightProfile = useMemo(() => {
    if (!spotlightEvent) return null;

    const rewardCandidate = spotlightEvent.choices
      .map(choice => ({ choice, profile: getChoicePressureProfile(choice) }))
      .sort((a, b) => b.profile.rewardScore - a.profile.rewardScore)[0];
    const riskCandidate = spotlightEvent.choices
      .map(choice => ({ choice, profile: getChoicePressureProfile(choice) }))
      .sort((a, b) => b.profile.riskScore - a.profile.riskScore)[0];

    return {
      pressure: getPressureLabel(spotlightEvent),
      reward: rewardCandidate && rewardCandidate.profile.rewardScore > 0 && rewardCandidate.profile.rewardText
        ? rewardCandidate.profile.rewardText
        : 'Find a new edge before the room cools off.',
      risk: riskCandidate && riskCandidate.profile.riskScore > 0 && riskCandidate.profile.riskText
        ? riskCandidate.profile.riskText
        : 'Letting this drift costs momentum.',
    };
  }, [spotlightEvent]);

  const handleContinue = useCallback(() => {
    if (priorityEvent) {
      setExpandedEventId(priorityEvent.id);
      return;
    }
    if (nextOptionalEventId) {
      setExpandedEventId(nextOptionalEventId);
    }
  }, [priorityEvent, nextOptionalEventId]);

  return (
    <div className={`flex flex-col h-full bg-transparent ${className}`}>
      {/* Phase Header */}
      <div className="border-b border-slate-800/80 p-4 md:p-5 bg-[#070b10]/80">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-700/70 flex items-center justify-center text-amber-400 shrink-0">
              <i className={`fas ${phaseInfo.icon}`}></i>
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-white">{phaseInfo.title}</h2>
              <p className="text-xs text-slate-500 leading-relaxed">{phaseInfo.description}</p>
            </div>
          </div>
          <div className="flex items-center justify-between lg:block lg:text-right gap-3 rounded-lg border border-slate-800 bg-black/30 px-3 py-2 shrink-0">
            <div className="text-xs text-slate-500">
              Week {playerStats.gameTime?.week ?? 1}, Year {playerStats.gameTime?.year ?? 1}
            </div>
            <div className={`text-sm font-bold ${apRemaining > 0 ? 'text-cyan-400' : 'text-red-400'}`}>
              {apRemaining} AP remaining
            </div>
          </div>
        </div>
        <div className="mt-3 text-[11px] text-slate-500 flex items-start gap-2 leading-relaxed">
          <i className="fas fa-chevron-down text-slate-600"></i>
          <span>Tip: Click the chevron on any event card to collapse old events and keep new options visible.</span>
        </div>
        {spotlightEvent && spotlightProfile && (
          <div className="mt-4 rounded-lg border border-cyan-900/50 bg-[#08111a]/90 p-3 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500">This Week&apos;s Edge</div>
                <div className="text-sm font-semibold text-white">{spotlightEvent.title}</div>
              </div>
              <div className={`text-xs font-bold uppercase tracking-widest ${spotlightProfile.pressure.accent}`}>
                {spotlightProfile.pressure.label}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="rounded border border-red-900/60 bg-red-950/20 p-2">
                <div className="text-[10px] uppercase tracking-wider text-red-300/70">Clock</div>
                <div className="mt-1 text-slate-200">
                  {spotlightEvent.expiresInWeeks === undefined
                    ? 'No hard deadline yet'
                    : spotlightEvent.expiresInWeeks === 0
                    ? 'This blows up now'
                    : `${spotlightEvent.expiresInWeeks} week${spotlightEvent.expiresInWeeks > 1 ? 's' : ''} to act`}
                </div>
              </div>
              <div className="rounded border border-emerald-900/60 bg-emerald-950/20 p-2">
                <div className="text-[10px] uppercase tracking-wider text-emerald-300/70">Best Payoff</div>
                <div className="mt-1 text-slate-200">{spotlightProfile.reward}</div>
              </div>
              <div className="rounded border border-amber-900/60 bg-amber-950/20 p-2">
                <div className="text-[10px] uppercase tracking-wider text-amber-300/70">Costliest Miss</div>
                <div className="mt-1 text-slate-200">{spotlightProfile.risk}</div>
              </div>
            </div>
            <div className="text-xs text-slate-400 border-t border-slate-800 pt-2">
              {spotlightEvent.context || spotlightEvent.hook}
            </div>
          </div>
        )}
      </div>

      {decisionPulse && (
        <div className="px-4 pt-4">
          <div className={`
            rounded-lg border p-3 bg-black/30
            ${decisionPulse.tone === 'success' ? 'border-emerald-800/70 bg-emerald-950/20' : ''}
            ${decisionPulse.tone === 'warning' ? 'border-amber-800/70 bg-amber-950/20' : ''}
            ${decisionPulse.tone === 'error' ? 'border-red-800/70 bg-red-950/20' : ''}
            ${decisionPulse.tone === 'info' ? 'border-cyan-800/70 bg-cyan-950/20' : ''}
          `}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500">Last Move</div>
                <div className="text-sm font-semibold text-white">{decisionPulse.eventTitle}: {decisionPulse.choiceLabel}</div>
              </div>
              <div className="text-[10px] uppercase tracking-widest text-slate-400">
                Immediate Impact
              </div>
            </div>
            <p className="mt-2 text-sm text-slate-200">{decisionPulse.summary}</p>
            {decisionPulse.details.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {decisionPulse.details.map((detail, index) => (
                  <span key={`${decisionPulse.choiceLabel}-${index}`} className="px-2 py-1 rounded border border-slate-800 bg-black/30 text-xs text-slate-300">
                    {detail}
                  </span>
                ))}
              </div>
            )}
            {decisionPulse.nextBeat && (
              <div className="mt-3 text-xs text-cyan-300/80">
                <i className="fas fa-arrow-right mr-1"></i>
                Next beat: {decisionPulse.nextBeat}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Inner Voice Interjections */}
      {activeInterjections.length > 0 && (
        <div className="px-4 pt-3 space-y-2">
          {activeInterjections.map((ij) => (
            <div
              key={`voice-${ij.voiceId}-${ij.tick}`}
              className={`rounded-lg border p-3 ${getVoiceBgColor(ij.voiceId)} animate-fade-in`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <i className={`fas ${getVoiceIcon(ij.voiceId)} ${getVoiceColor(ij.voiceId)} text-sm`}></i>
                  <span className={`text-[10px] uppercase tracking-[0.2em] font-bold ${getVoiceColor(ij.voiceId)}`}>
                    {ij.voiceId}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {onSuppressVoice && (
                    <button
                      onClick={() => onSuppressVoice(ij.voiceId)}
                      className="text-[10px] text-slate-500 hover:text-red-400 transition-colors px-1"
                      title={`Suppress ${ij.voiceId} (costs stress)`}
                    >
                      <i className="fas fa-volume-xmark"></i>
                    </button>
                  )}
                  {onDismissInterjection && (
                    <button
                      onClick={() => onDismissInterjection(ij.voiceId)}
                      className="text-slate-500 hover:text-white transition-colors px-1"
                    >
                      <i className="fas fa-times text-xs"></i>
                    </button>
                  )}
                </div>
              </div>
              <p className={`mt-1.5 text-sm italic ${getVoiceColor(ij.voiceId)} opacity-90`}>
                &ldquo;{ij.text}&rdquo;
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Event List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 min-h-0" style={{ WebkitOverflowScrolling: 'touch' }}>
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
          <div className="mt-6 space-y-2 rounded-lg border border-slate-800/70 bg-black/30 p-3">
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
          <div className="flex flex-col items-center justify-center h-64 text-center rounded-lg border border-slate-800/80 bg-black/30 p-6">
            <div className="w-16 h-16 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center mb-4">
              <i className="fas fa-inbox text-2xl text-slate-600"></i>
            </div>
            <p className="text-slate-400 font-medium mb-2">The inbox is empty</p>
            <p className="text-sm text-slate-500 mb-4">
              Suspiciously quiet. Either nothing is happening, or everything is happening behind your back. Advance the week to find out which.
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
      <div className="border-t border-slate-800/80 bg-[#070b10]/90 p-4 space-y-3">
        {/* Quick Stats */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={handleContinue}
              disabled={!priorityEvent && sortedOptional.length === 0}
              className={`
                w-full py-3 rounded border transition-all flex items-center justify-center gap-2
                ${(!priorityEvent && sortedOptional.length === 0)
                  ? 'border-slate-700 text-slate-600 cursor-not-allowed'
                  : 'border-cyan-700 text-cyan-300 hover:bg-cyan-900/20 hover:border-cyan-500'
                }
              `}
            >
              <i className="fas fa-arrow-down"></i>
              <span className="text-xs font-bold uppercase tracking-wide">Continue Event Feed</span>
            </button>
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
          </div>
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
