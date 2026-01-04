/**
 * EventCard Component
 *
 * Displays an individual story event with narrative context and choices.
 * This is the core building block of the event-driven RPG experience.
 */

import React, { useState, useCallback } from 'react';
import type { StoryEvent, EventChoice, EventConsequences } from '../types/rpgEvents';
import type { PlayerStats, NPC } from '../types';

interface EventCardProps {
  event: StoryEvent;
  playerStats: PlayerStats;
  npcs: NPC[];
  worldFlags: Set<string>;
  onChoice: (choice: EventChoice) => void;
  onDismiss?: () => void;
  onConsultAdvisor?: () => void;
  expanded?: boolean;
  className?: string;
}

// Urgency styling based on event stakes
const stakeStyles: Record<string, { border: string; badge: string; glow: string }> = {
  CRITICAL: {
    border: 'border-red-500',
    badge: 'bg-red-500 text-white',
    glow: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]',
  },
  HIGH: {
    border: 'border-amber-500',
    badge: 'bg-amber-500 text-black',
    glow: 'shadow-[0_0_12px_rgba(245,158,11,0.25)]',
  },
  MEDIUM: {
    border: 'border-blue-500',
    badge: 'bg-blue-500 text-white',
    glow: '',
  },
  LOW: {
    border: 'border-slate-600',
    badge: 'bg-slate-600 text-slate-200',
    glow: '',
  },
};

// Category icons
const categoryIcons: Record<string, string> = {
  DEAL: 'fa-briefcase',
  NPC: 'fa-user-tie',
  CRISIS: 'fa-exclamation-triangle',
  OPPORTUNITY: 'fa-door-open',
  PERSONAL: 'fa-heart',
  CAREER: 'fa-chart-line',
  MARKET: 'fa-chart-bar',
  OPERATIONS: 'fa-cogs',
};

// Choice alignment styling
const alignmentStyles: Record<string, string> = {
  RUTHLESS: 'border-red-700 hover:bg-red-900/30 text-red-400',
  DIPLOMATIC: 'border-blue-700 hover:bg-blue-900/30 text-blue-400',
  CAUTIOUS: 'border-slate-500 hover:bg-slate-700/30 text-slate-300',
  BOLD: 'border-amber-600 hover:bg-amber-900/30 text-amber-400',
  ETHICAL: 'border-emerald-600 hover:bg-emerald-900/30 text-emerald-400',
  NEUTRAL: 'border-slate-600 hover:bg-slate-800/30 text-slate-300',
};

// Check if a choice is available
const checkChoiceAvailability = (
  choice: EventChoice,
  playerStats: PlayerStats,
  npcs: NPC[],
  worldFlags: Set<string>
): { available: boolean; reason?: string } => {
  if (!choice.requires) return { available: true };

  const req = choice.requires;

  // Check stat requirements
  if (req.stat) {
    const statValue = (playerStats as any)[req.stat.name] ?? 0;
    if (req.stat.min !== undefined && statValue < req.stat.min) {
      return { available: false, reason: `Requires ${req.stat.name} ${req.stat.min}+` };
    }
    if (req.stat.max !== undefined && statValue > req.stat.max) {
      return { available: false, reason: `${req.stat.name} too high` };
    }
  }

  // Check flag requirements
  if (req.flag && !worldFlags.has(req.flag)) {
    return { available: false, reason: `Requires: ${req.flag.replace(/_/g, ' ')}` };
  }
  if (req.notFlag && worldFlags.has(req.notFlag)) {
    return { available: false, reason: `Blocked by: ${req.notFlag.replace(/_/g, ' ')}` };
  }

  // Check NPC relationship
  if (req.npcRelationship) {
    const npc = npcs.find(n => n.id === req.npcRelationship!.npcId);
    const relationship = npc?.relationship ?? 50;
    if (req.npcRelationship.min !== undefined && relationship < req.npcRelationship.min) {
      return { available: false, reason: `Requires better relationship with ${npc?.name || 'NPC'}` };
    }
  }

  // Check level requirements
  if (req.minLevel) {
    const levelOrder = ['ASSOCIATE', 'SENIOR_ASSOCIATE', 'VICE_PRESIDENT', 'PRINCIPAL', 'PARTNER', 'FOUNDER'];
    const playerLevelIndex = levelOrder.indexOf(playerStats.level);
    const reqLevelIndex = levelOrder.indexOf(req.minLevel);
    if (playerLevelIndex < reqLevelIndex) {
      return { available: false, reason: `Requires ${req.minLevel.replace(/_/g, ' ')}+` };
    }
  }

  return { available: true };
};

const EventCard: React.FC<EventCardProps> = ({
  event,
  playerStats,
  npcs,
  worldFlags,
  onChoice,
  onDismiss,
  onConsultAdvisor,
  expanded = false,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [advisorExpanded, setAdvisorExpanded] = useState(
    event.stakes === 'HIGH' || event.stakes === 'CRITICAL'
  );

  const style = stakeStyles[event.stakes] || stakeStyles.LOW;
  const categoryIcon = categoryIcons[event.category] || 'fa-circle-info';

  const handleChoiceClick = useCallback((choice: EventChoice) => {
    if (choice.requiresConfirmation) {
      setSelectedChoice(choice.id);
      setShowConfirm(true);
    } else {
      onChoice(choice);
    }
  }, [onChoice]);

  const handleConfirm = useCallback(() => {
    const choice = event.choices.find(c => c.id === selectedChoice);
    if (choice) {
      onChoice(choice);
    }
    setShowConfirm(false);
    setSelectedChoice(null);
  }, [event.choices, selectedChoice, onChoice]);

  const handleCancel = useCallback(() => {
    setShowConfirm(false);
    setSelectedChoice(null);
  }, []);

  // Get source NPC if exists
  const sourceNpc = event.sourceNpcId ? npcs.find(n => n.id === event.sourceNpcId) : null;

  return (
    <div
      className={`
        border rounded-lg bg-slate-900/80 backdrop-blur-sm transition-all duration-300
        ${style.border} ${style.glow}
        ${isExpanded ? 'p-4' : 'p-3'}
        ${className}
      `}
    >
      {/* Header */}
      <div
        className="flex items-start gap-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Category Icon */}
        <div className={`
          w-10 h-10 rounded-full flex items-center justify-center shrink-0
          ${event.type === 'PRIORITY' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-400'}
        `}>
          <i className={`fas ${categoryIcon}`}></i>
        </div>

        {/* Title and Hook */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-white truncate">{event.title}</h3>
            {event.type === 'PRIORITY' && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${style.badge}`}>
                PRIORITY
              </span>
            )}
            {event.expiresInWeeks !== undefined && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-900/50 text-red-300">
                {event.expiresInWeeks === 0 ? 'URGENT' : `${event.expiresInWeeks}w`}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400 italic">{event.hook}</p>
          {sourceNpc && (
            <p className="text-xs text-slate-500 mt-1">
              <i className="fas fa-user mr-1"></i>
              {sourceNpc.name}
            </p>
          )}
        </div>

        {/* Expand/Collapse */}
        <button
          className="text-slate-500 hover:text-white transition-colors p-1"
          onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
        >
          <i className={`fas ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
        </button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-4 space-y-4 animate-fadeIn">
          {/* Full Description */}
          <div className="text-sm text-slate-300 whitespace-pre-line border-l-2 border-slate-700 pl-3">
            {event.description}
          </div>

          {/* Context if exists */}
          {event.context && (
            <div className="text-xs text-slate-500 italic bg-slate-800/50 p-2 rounded">
              <i className="fas fa-lightbulb mr-2 text-amber-500"></i>
              {event.context}
            </div>
          )}

          {/* Machiavelli AI Advisor Panel */}
          {(event.advisorHints?.machiavelli || event.stakes === 'HIGH' || event.stakes === 'CRITICAL') && (
            <div className={`rounded-lg border overflow-hidden transition-all ${
              event.stakes === 'HIGH' || event.stakes === 'CRITICAL'
                ? 'border-purple-500/60 bg-gradient-to-br from-purple-900/30 to-slate-900/50'
                : 'border-purple-700/40 bg-purple-900/20'
            }`}>
              {/* Advisor Header - Always Visible */}
              <button
                onClick={() => setAdvisorExpanded(!advisorExpanded)}
                className="w-full p-3 flex items-center justify-between hover:bg-purple-900/20 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-purple-800/50 flex items-center justify-center border border-purple-500/50">
                    <i className="fas fa-user-secret text-purple-400 text-sm"></i>
                  </div>
                  <div className="text-left">
                    <div className="text-purple-400 font-bold text-xs tracking-wide">
                      MACHIAVELLI AI
                    </div>
                    <div className="text-purple-300/60 text-[10px]">
                      {event.advisorHints?.machiavelli ? 'Strategic insight available' : 'High-stakes - advice recommended'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {(event.stakes === 'HIGH' || event.stakes === 'CRITICAL') && (
                    <span className="px-1.5 py-0.5 bg-purple-600/50 text-purple-200 text-[10px] rounded animate-pulse">
                      Consult
                    </span>
                  )}
                  <i className={`fas fa-chevron-${advisorExpanded ? 'up' : 'down'} text-purple-400 text-xs`}></i>
                </div>
              </button>

              {/* Advisor Content - Expandable */}
              {advisorExpanded && (
                <div className="px-3 pb-3 border-t border-purple-500/20">
                  {event.advisorHints?.machiavelli && (
                    <p className="text-purple-200 text-xs italic mt-2 leading-relaxed">
                      "{event.advisorHints.machiavelli}"
                    </p>
                  )}
                  {event.advisorHints?.sarah && (
                    <div className="mt-2 pt-2 border-t border-purple-500/20">
                      <span className="text-blue-400 text-[10px] font-bold">Sarah:</span>{' '}
                      <span className="text-blue-300/80 text-xs italic">"{event.advisorHints.sarah}"</span>
                    </div>
                  )}
                  {!event.advisorHints?.machiavelli && (
                    <p className="text-purple-300/60 text-xs mt-2">
                      This is a {event.stakes.toLowerCase()}-stakes decision. Consider getting advice.
                    </p>
                  )}
                  {onConsultAdvisor && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onConsultAdvisor();
                      }}
                      className="mt-2 w-full py-1.5 px-3 bg-purple-700/40 hover:bg-purple-600/40 text-purple-200 text-xs font-medium rounded border border-purple-500/40 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <i className="fas fa-comment-dots"></i>
                      Ask Machiavelli
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Choices */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Your Options
            </div>
            {event.choices.map((choice) => {
              const { available, reason } = checkChoiceAvailability(choice, playerStats, npcs, worldFlags);
              const alignment = choice.alignment || 'NEUTRAL';
              const alignStyle = alignmentStyles[alignment];

              return (
                <button
                  key={choice.id}
                  onClick={() => available && handleChoiceClick(choice)}
                  disabled={!available}
                  className={`
                    w-full text-left p-3 rounded border transition-all
                    ${available ? alignStyle : 'border-slate-800 opacity-50 cursor-not-allowed'}
                    ${selectedChoice === choice.id ? 'ring-2 ring-white' : ''}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{choice.label}</span>
                    <div className="flex items-center gap-2 text-xs">
                      {choice.skillCheck && (
                        <span className="px-1.5 py-0.5 bg-yellow-900/50 text-yellow-400 rounded">
                          <i className="fas fa-dice mr-1"></i>
                          {choice.skillCheck.skill}
                        </span>
                      )}
                      {choice.icon && <i className={`fas ${choice.icon}`}></i>}
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{choice.description}</p>
                  {!available && reason && (
                    <p className="text-xs text-red-500 mt-1">
                      <i className="fas fa-lock mr-1"></i>{reason}
                    </p>
                  )}
                  {choice.playerLine && available && (
                    <p className="text-xs text-slate-500 mt-2 italic">
                      "{choice.playerLine}"
                    </p>
                  )}
                </button>
              );
            })}
          </div>

          {/* Dismiss button for optional events */}
          {event.type !== 'PRIORITY' && onDismiss && (
            <button
              onClick={onDismiss}
              className="w-full text-center text-xs text-slate-500 hover:text-slate-300 py-2 border-t border-slate-800"
            >
              <i className="fas fa-clock mr-2"></i>
              Deal with this later
            </button>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-lg max-w-md">
            <h4 className="text-lg font-bold text-white mb-2">Confirm Decision</h4>
            <p className="text-slate-400 mb-4">
              Are you sure? This choice may have significant consequences.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleConfirm}
                className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded font-bold"
              >
                Confirm
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 border border-slate-600 hover:border-slate-500 text-slate-300 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.25s ease-out;
  }
`;
if (!document.getElementById('event-card-styles')) {
  style.id = 'event-card-styles';
  document.head.appendChild(style);
}

export default EventCard;
