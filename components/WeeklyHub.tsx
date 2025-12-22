/**
 * Weekly Hub Component
 * 
 * The main screen for each week, showing:
 * - Current week/phase status
 * - Priority events that must be addressed
 * - Optional events available
 * - Active story arcs
 * - Quick actions
 */

import React, { useMemo } from 'react';
import type { StoryEvent, StoryArc } from '../types/rpgEvents';
import type { PlayerStats, NPC, MarketVolatility } from '../types';
import { useRPGEvents, useNextPriorityEvent } from '../contexts/RPGEventContext';
import { Z_INDEX } from '../constants/zIndex';

interface WeeklyHubProps {
  playerStats: PlayerStats;
  npcs: NPC[];
  marketVolatility: MarketVolatility;
  onEventSelect: (eventId: string) => void;
  onAdvanceWeek: () => void;
  onOpenPortfolio: () => void;
  onOpenMessenger: () => void;
}

const WeeklyHub: React.FC<WeeklyHubProps> = ({
  playerStats,
  npcs,
  marketVolatility,
  onEventSelect,
  onAdvanceWeek,
  onOpenPortfolio,
  onOpenMessenger,
}) => {
  const { 
    state, 
    currentPhase, 
    activeArcs, 
    getAvailableEvents,
    weeklySummary,
  } = useRPGEvents();
  
  const nextPriorityEvent = useNextPriorityEvent(playerStats, npcs, marketVolatility);
  const availableEvents = useMemo(
    () => getAvailableEvents(playerStats, npcs, marketVolatility),
    [getAvailableEvents, playerStats, npcs, marketVolatility]
  );

  // Categorize events
  const priorityEvents = availableEvents.filter(e => e.type === 'PRIORITY');
  const optionalEvents = availableEvents.filter(e => e.type === 'OPTIONAL');
  const backgroundEvents = availableEvents.filter(e => e.type === 'BACKGROUND');

  // Get phase info
  const getPhaseInfo = () => {
    switch (currentPhase) {
      case 'MORNING_BRIEFING':
        return {
          title: 'Morning Briefing',
          description: 'Review your priorities and check for urgent matters.',
          icon: '☀️',
        };
      case 'PRIORITY_EVENT':
        return {
          title: 'Priority Event',
          description: 'Something demands your immediate attention.',
          icon: '🚨',
        };
      case 'OPTIONAL_PHASE':
        return {
          title: 'Main Day',
          description: 'Handle your business. Choose your battles.',
          icon: '⚔️',
        };
      case 'FALLOUT':
        return {
          title: 'Consequences',
          description: 'Your decisions ripple outward.',
          icon: '🌊',
        };
      case 'WEEK_END':
        return {
          title: 'Week Wrap-Up',
          description: 'The week draws to a close. Time to advance.',
          icon: '🌙',
        };
      default:
        return {
          title: 'Unknown Phase',
          description: '',
          icon: '❓',
        };
    }
  };

  const phaseInfo = getPhaseInfo();

  // Get stakes badge
  const getStakesBadge = (stakes: string) => {
    switch (stakes) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 bg-red-900/50 text-red-400 text-xs rounded">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 bg-orange-900/50 text-orange-400 text-xs rounded">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 bg-amber-900/50 text-amber-400 text-xs rounded">MEDIUM</span>;
      default:
        return <span className="px-2 py-0.5 bg-slate-700 text-slate-400 text-xs rounded">LOW</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{phaseInfo.icon}</span>
              <div>
                <h1 className="text-3xl font-bold text-amber-400">
                  Week {state.eventQueue.currentWeek}
                </h1>
                <p className="text-slate-400">{phaseInfo.title}</p>
              </div>
            </div>
            <p className="text-sm text-slate-500 mt-2">{phaseInfo.description}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-slate-400">Actions Remaining</div>
              <div className="text-2xl font-bold text-emerald-400">
                {playerStats.gameTime?.actionsRemaining || 2} / {playerStats.gameTime?.maxActions || 2}
              </div>
            </div>
            <button
              onClick={onAdvanceWeek}
              className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg transition-colors"
            >
              End Week →
            </button>
          </div>
        </div>

        {/* Priority Alert */}
        {nextPriorityEvent && (
          <div 
            className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg cursor-pointer hover:bg-red-900/30 transition-colors"
            onClick={() => onEventSelect(nextPriorityEvent.id)}
          >
            <div className="flex items-start gap-4">
              <span className="text-3xl">🚨</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-red-400">
                    {nextPriorityEvent.title}
                  </h3>
                  {getStakesBadge(nextPriorityEvent.stakes)}
                </div>
                <p className="text-slate-300 mt-1">{nextPriorityEvent.hook}</p>
                <p className="text-sm text-slate-400 mt-2">
                  {nextPriorityEvent.expiresInWeeks === 0 
                    ? 'Must be addressed today'
                    : `Expires in ${nextPriorityEvent.expiresInWeeks} week(s)`}
                </p>
              </div>
              <span className="text-amber-400 text-2xl">→</span>
            </div>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Events */}
          <div className="lg:col-span-2 space-y-6">
            {/* Optional Events */}
            {optionalEvents.length > 0 && (
              <div className="bg-slate-800/50 rounded-lg p-4">
                <h2 className="text-lg font-bold text-slate-300 mb-4 flex items-center gap-2">
                  <span>📋</span> Available Events
                </h2>
                <div className="space-y-3">
                  {optionalEvents.slice(0, 5).map(event => (
                    <button
                      key={event.id}
                      onClick={() => onEventSelect(event.id)}
                      className="w-full text-left p-4 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 hover:border-slate-600 transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-amber-400 font-medium">{event.title}</span>
                            {getStakesBadge(event.stakes)}
                            <span className="text-xs text-slate-500">{event.category}</span>
                          </div>
                          <p className="text-sm text-slate-400 mt-1">{event.hook}</p>
                        </div>
                        <span className="text-slate-500 text-lg">→</span>
                      </div>
                    </button>
                  ))}
                </div>
                {optionalEvents.length > 5 && (
                  <p className="text-sm text-slate-500 mt-3 text-center">
                    +{optionalEvents.length - 5} more events available
                  </p>
                )}
              </div>
            )}

            {/* Background Events Preview */}
            {backgroundEvents.length > 0 && (
              <div className="bg-slate-800/30 rounded-lg p-4 border border-dashed border-slate-600">
                <h2 className="text-lg font-bold text-slate-400 mb-3 flex items-center gap-2">
                  <span>🎲</span> Background Events
                </h2>
                <p className="text-sm text-slate-500">
                  {backgroundEvents.length} possible events may occur this week based on your situation.
                </p>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-slate-800/50 rounded-lg p-4">
              <h2 className="text-lg font-bold text-slate-300 mb-4 flex items-center gap-2">
                <span>⚡</span> Quick Actions
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={onOpenPortfolio}
                  className="p-4 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors text-left"
                >
                  <span className="text-2xl mb-2 block">📊</span>
                  <span className="font-medium text-slate-300">Portfolio</span>
                  <p className="text-xs text-slate-500 mt-1">
                    {playerStats.portfolio?.length || 0} companies
                  </p>
                </button>
                <button
                  onClick={onOpenMessenger}
                  className="p-4 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors text-left"
                >
                  <span className="text-2xl mb-2 block">💬</span>
                  <span className="font-medium text-slate-300">Messenger</span>
                  <p className="text-xs text-slate-500 mt-1">
                    Contact your network
                  </p>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Arcs & Status */}
          <div className="space-y-6">
            {/* Active Story Arcs */}
            <div className="bg-slate-800/50 rounded-lg p-4">
              <h2 className="text-lg font-bold text-slate-300 mb-4 flex items-center gap-2">
                <span>📖</span> Active Stories
              </h2>
              {activeArcs.length > 0 ? (
                <div className="space-y-3">
                  {activeArcs.map(arc => (
                    <div
                      key={arc.id}
                      className="p-3 bg-slate-800 rounded-lg border border-slate-700"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          arc.state === 'ACTIVE' ? 'bg-emerald-400' : 'bg-amber-400'
                        }`} />
                        <span className="font-medium text-slate-300">{arc.title}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{arc.teaser}</p>
                      {arc.stages && arc.currentStage !== undefined && (
                        <div className="mt-2 flex gap-1">
                          {arc.stages.map((stage, idx) => (
                            <div
                              key={idx}
                              className={`flex-1 h-1 rounded ${
                                idx < arc.currentStage
                                  ? 'bg-emerald-500'
                                  : idx === arc.currentStage
                                  ? 'bg-amber-500'
                                  : 'bg-slate-600'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                      {arc.stages[arc.currentStage] && (
                        <p className="text-xs text-amber-400 mt-2">
                          Stage: {arc.stages[arc.currentStage].title}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">
                  No active story arcs. Make decisions to unlock narratives.
                </p>
              )}
            </div>

            {/* World Flags / Status */}
            {state.worldFlags.size > 0 && (
              <div className="bg-slate-800/50 rounded-lg p-4">
                <h2 className="text-lg font-bold text-slate-300 mb-4 flex items-center gap-2">
                  <span>🏴</span> World State
                </h2>
                <div className="flex flex-wrap gap-2">
                  {Array.from(state.worldFlags).slice(0, 8).map(flag => (
                    <span
                      key={flag}
                      className="px-2 py-1 bg-slate-700 text-slate-400 text-xs rounded"
                    >
                      {flag.replace(/_/g, ' ').toLowerCase()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Weekly Summary */}
            {weeklySummary && (weeklySummary.optionalEventsHandled > 0 || weeklySummary.priorityEventTitle) && (
              <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-4">
                <h2 className="text-lg font-bold text-emerald-400 mb-3 flex items-center gap-2">
                  <span>📊</span> Last Week
                </h2>
                <div className="space-y-2 text-sm">
                  {weeklySummary.priorityEventTitle && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Priority Event</span>
                      <span className="text-emerald-400">{weeklySummary.priorityEventTitle}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-400">Optional Events</span>
                    <span className="text-emerald-400">{weeklySummary.optionalEventsHandled}</span>
                  </div>
                  {weeklySummary.arcProgressions.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Arcs Advanced</span>
                      <span className="text-emerald-400">{weeklySummary.arcProgressions.length}</span>
                    </div>
                  )}
                  {weeklySummary.keyConsequences.length > 0 && (
                    <div className="pt-2 border-t border-emerald-500/20">
                      <span className="text-slate-500 text-xs">
                        {weeklySummary.keyConsequences.length} key outcomes
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Player Quick Stats */}
            <div className="bg-slate-800/50 rounded-lg p-4">
              <h2 className="text-lg font-bold text-slate-300 mb-4 flex items-center gap-2">
                <span>📈</span> Your Stats
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Reputation</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-slate-700 rounded overflow-hidden">
                      <div 
                        className="h-full bg-amber-500 rounded"
                        style={{ width: `${playerStats.reputation}%` }}
                      />
                    </div>
                    <span className="text-sm text-slate-300 w-8">{playerStats.reputation}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Stress</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-slate-700 rounded overflow-hidden">
                      <div 
                        className={`h-full rounded ${
                          playerStats.stress > 70 ? 'bg-red-500' : 
                          playerStats.stress > 40 ? 'bg-orange-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${playerStats.stress}%` }}
                      />
                    </div>
                    <span className="text-sm text-slate-300 w-8">{playerStats.stress}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Cash</span>
                  <span className="text-emerald-400 font-medium">
                    ${playerStats.cash?.toLocaleString() || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyHub;
