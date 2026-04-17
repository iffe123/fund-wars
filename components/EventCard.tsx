/**
 * EventCard Component
 *
 * Displays an individual story event with narrative context and choices.
 * This is the core building block of the event-driven RPG experience.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { StoryEvent, EventChoice } from '../types/rpgEvents';
import type { PlayerStats, NPC } from '../types';
import { formatCurrency } from '../utils/formatCurrency';
import { STRESS_THRESHOLDS } from '../constants/difficulty';

// Classify a choice's burnout risk against current stress. Returns:
//   'fatal'   → choice would push stress past BREAKDOWN (disable)
//   'risky'   → burnout imminent and choice raises stress further
//   'safe'    → otherwise
const classifyBurnoutRisk = (
  choice: EventChoice,
  playerStats: PlayerStats,
): 'fatal' | 'risky' | 'safe' => {
  const stressDelta = choice.consequences?.stats?.stress;
  if (typeof stressDelta !== 'number' || stressDelta <= 0) return 'safe';
  const projected = (playerStats.stress ?? 0) + stressDelta;
  if (projected >= STRESS_THRESHOLDS.BREAKDOWN) return 'fatal';
  if ((playerStats.stress ?? 0) >= STRESS_THRESHOLDS.WARNING) return 'risky';
  return 'safe';
};

/**
 * Render inline markdown (***bold italic***, **bold**, *italic*) to React nodes
 */
function renderMarkdown(text: string): React.ReactNode {
  return text.split('\n\n').map((paragraph, pIdx) => {
    const parts = paragraph.split(/(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*]+\*)/g);
    const elements = parts.map((part, i) => {
      if (part.startsWith('***') && part.endsWith('***') && part.length > 6) {
        return <strong key={i} className="text-green-400 font-semibold italic">{part.slice(3, -3)}</strong>;
      }
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        return <strong key={i} className="text-green-400 font-semibold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
        return <em key={i} className="text-slate-300 italic">{part.slice(1, -1)}</em>;
      }
      return part;
    });
    return <span key={pIdx}>{elements}{pIdx < text.split('\n\n').length - 1 ? <><br /><br /></> : null}</span>;
  });
}

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
    const statDisplayNames: Record<string, string> = {
      cash: 'cash', reputation: 'reputation', stress: 'stress', energy: 'energy',
      analystRating: 'Analyst Rating', financialEngineering: 'Financial Engineering',
      ethics: 'ethics', auditRisk: 'Audit Risk',
    };
    const displayName = statDisplayNames[req.stat.name] || req.stat.name.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim();
    if (req.stat.min !== undefined && statValue < req.stat.min) {
      return { available: false, reason: `Requires ${displayName} ${req.stat.min}+` };
    }
    if (req.stat.max !== undefined && statValue > req.stat.max) {
      return { available: false, reason: `${displayName} too high` };
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
  // Tracks repeated risky-choice clicks while burnout is imminent, so we can
  // surface in-fiction terminal chatter on the third attempt (counted per
  // choice id).
  const riskyClickCountsRef = useRef<Record<string, number>>({});
  const [burnoutChatter, setBurnoutChatter] = useState<string | null>(null);

  const style = stakeStyles[event.stakes] || stakeStyles.LOW;
  const categoryIcon = categoryIcons[event.category] || 'fa-circle-info';

  const handleChoiceClick = useCallback((choice: EventChoice) => {
    const risk = classifyBurnoutRisk(choice, playerStats);

    // Repeated risky clicks while burnout is imminent: surface in-fiction
    // terminal chatter on the 3rd attempt instead of a modal.
    if (risk === 'risky') {
      const count = (riskyClickCountsRef.current[choice.id] ?? 0) + 1;
      riskyClickCountsRef.current[choice.id] = count;
      if (count >= 3) {
        setBurnoutChatter('SYSTEM: You are running on fumes. Pick your battles.');
      } else if (count === 2) {
        setBurnoutChatter('SYSTEM: Risky move. Your stress is already in the red.');
      }
    }

    if (choice.requiresConfirmation) {
      setSelectedChoice(choice.id);
      setShowConfirm(true);
    } else {
      onChoice(choice);
    }
  }, [onChoice, playerStats]);

  // Keyboard shortcuts (1/2/3) fire the matching choice when the card is
  // expanded. While active, the App-level tab shortcuts yield via
  // document.body.dataset.eventActive.
  useEffect(() => {
    if (!isExpanded) return;

    document.body.dataset.eventActive = 'true';

    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
      if (showConfirm) return;

      const index = ['1', '2', '3', '4', '5'].indexOf(e.key);
      if (index === -1) return;

      const choice = event.choices[index];
      if (!choice) return;

      const { available } = checkChoiceAvailability(choice, playerStats, npcs, worldFlags);
      if (!available) return;

      e.preventDefault();
      handleChoiceClick(choice);
    };

    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
      delete document.body.dataset.eventActive;
    };
  }, [isExpanded, event.choices, playerStats, npcs, worldFlags, handleChoiceClick, showConfirm]);

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

  const statDisplayNames: Record<string, string> = {
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

  const formatStatName = (key: string): string =>
    statDisplayNames[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim();

  const describeChoiceImpact = (choice: EventChoice): string | null => {
    const stats = choice.consequences?.stats;
    if (!stats) return null;

    const parts: string[] = [];
    for (const [key, value] of Object.entries(stats)) {
      if (typeof value !== 'number' || value === 0) continue;
      if (key === 'cash') {
        parts.push(`${value > 0 ? '+' : '-'}${formatCurrency(Math.abs(value))} Cash`);
      } else {
        parts.push(`${value > 0 ? '+' : ''}${value} ${formatStatName(key)}`);
      }
    }

    return parts.length > 0 ? parts.join(' • ') : null;
  };

  return (
    <div
      className={`
        border rounded-lg bg-[#090d13]/95 backdrop-blur-sm transition-all duration-300
        ${style.border} ${style.glow}
        ${isExpanded ? 'p-4' : 'p-3'}
        ${className}
      `}
    >
      {/* Header */}
      <button
        type="button"
        className="terminal-focus flex w-full items-start gap-3 text-left"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        {/* Category Icon */}
        <div className={`
          w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border
          ${event.type === 'PRIORITY' ? 'bg-amber-500/20 text-amber-400 border-amber-700/50' : 'bg-slate-800 text-slate-400 border-slate-700/70'}
        `}>
          <i className={`fas ${categoryIcon}`}></i>
        </div>

        {/* Title and Hook */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-white break-words">{event.title}</h3>
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
          <p className="text-sm text-slate-400 italic">{renderMarkdown(event.hook)}</p>
          {sourceNpc && (
            <p className="text-xs text-slate-500 mt-1">
              <i className="fas fa-user mr-1"></i>
              {sourceNpc.name}
            </p>
          )}
        </div>

        {/* Expand/Collapse */}
        <span
          className="text-slate-500 p-1 shrink-0"
          aria-hidden="true"
        >
          <i className={`fas ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
        </span>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-4 space-y-4 animate-fade-in">
          {/* Full Description */}
          <div className="text-sm text-slate-300 whitespace-pre-line border-l-2 border-slate-700 pl-3">
            {renderMarkdown(event.description)}
          </div>

          {/* Context if exists */}
          {event.context && (
            <div className="text-xs text-slate-500 italic bg-slate-800/50 p-2 rounded">
              <i className="fas fa-lightbulb mr-2 text-amber-500"></i>
              {event.context}
            </div>
          )}

          {/* Machiavelli AI Advisor Panel — hide from priority/onboarding/story events (BUG A fix) */}
          {onConsultAdvisor && !event.isOnboarding && event.type !== 'PRIORITY' && (event.advisorHints?.machiavelli || event.stakes === 'HIGH' || event.stakes === 'CRITICAL' || (playerStats.stress ?? 0) >= STRESS_THRESHOLDS.WARNING) && (
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
                  {(playerStats.stress ?? 0) >= STRESS_THRESHOLDS.WARNING && (
                    <p className="text-purple-200 text-xs italic mt-2 leading-relaxed">
                      "You are fraying. A tired mind makes enemies cheaply. Sleep before you sign."
                    </p>
                  )}
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
            {event.choices.map((choice, choiceIndex) => {
              const baseAvailability = checkChoiceAvailability(choice, playerStats, npcs, worldFlags);
              const burnoutRisk = classifyBurnoutRisk(choice, playerStats);
              const available = baseAvailability.available && burnoutRisk !== 'fatal';
              const reason = burnoutRisk === 'fatal'
                ? 'Burnout: this choice would push stress past breakdown.'
                : baseAvailability.reason;
              const alignment = choice.alignment || 'NEUTRAL';
              const alignStyle = alignmentStyles[alignment];
              const impactPreview = describeChoiceImpact(choice);
              const hotkey = choiceIndex < 5 ? `${choiceIndex + 1}` : null;

              return (
                <button
                  key={choice.id}
                  onClick={() => available && handleChoiceClick(choice)}
                  disabled={!available}
                  className={`
                    terminal-focus w-full text-left min-h-[88px] p-3 rounded-lg border transition-all
                    ${available ? alignStyle : 'border-slate-800 opacity-50 cursor-not-allowed'}
                    ${selectedChoice === choice.id ? 'ring-2 ring-white' : ''}
                  `}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-medium break-words">
                      {hotkey && (
                        <span
                          aria-hidden="true"
                          className="mr-2 text-[10px] uppercase tracking-wider opacity-70"
                        >
                          [{hotkey}]
                        </span>
                      )}
                      {choice.label}
                    </span>
                    <div className="flex items-center gap-2 text-xs">
                      {burnoutRisk !== 'safe' && (
                        <span className="px-1.5 py-0.5 bg-amber-950/50 border border-amber-800/50 text-amber-300 rounded text-[10px] uppercase tracking-wider">
                          [RISK]
                        </span>
                      )}
                      {choice.skillCheck && (
                        <span className="px-1.5 py-0.5 bg-yellow-900/50 text-yellow-400 rounded">
                          <i className="fas fa-dice mr-1"></i>
                          {formatStatName(choice.skillCheck.skill)}
                        </span>
                      )}
                      {choice.icon && <i className={`fas ${choice.icon}`}></i>}
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{choice.description}</p>
                  {impactPreview && (
                    <p className="text-[11px] text-cyan-300/80 mt-2 rounded border border-cyan-900/40 bg-cyan-950/10 px-2 py-1">
                      <i className="fas fa-chart-line mr-1"></i>
                      Potential impact: {impactPreview}
                    </p>
                  )}
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
            {burnoutChatter && (
              <p
                className="mt-2 text-[11px] text-amber-300/80 font-mono uppercase tracking-wider"
                role="status"
                aria-live="polite"
              >
                &gt; {burnoutChatter}
              </p>
            )}
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
            <h4 className="text-lg font-bold text-white mb-2">Point of No Return</h4>
            <p className="text-slate-400 mb-4">
              This one sticks. No take-backs, no "strategic pivots," no pretending it was someone else's idea.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleConfirm}
                className="terminal-focus flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded font-bold"
              >
                Confirm
              </button>
              <button
                onClick={handleCancel}
                className="terminal-focus flex-1 px-4 py-2 border border-slate-600 hover:border-slate-500 text-slate-300 rounded"
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

export default EventCard;
