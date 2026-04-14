/**
 * EventCard Component
 *
 * Displays an individual story event with narrative context and choices.
 * This is the core building block of the event-driven RPG experience.
 */

import React, { useState, useCallback } from 'react';
import type { StoryEvent, EventChoice } from '../types/rpgEvents';
import type { PlayerStats, NPC } from '../types';
import { formatCurrency } from '../utils/formatCurrency';

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
  /** When true, this card is the dominant "active decision" on the page. */
  isSpotlight?: boolean;
  className?: string;
}

// Urgency styling based on event stakes.
// Color grammar: red = threat/critical, amber = warning/high, cyan = neutral info, slate = ambient.
const stakeStyles: Record<string, { border: string; badge: string; glow: string }> = {
  CRITICAL: {
    border: 'border-red-400/80',
    badge: 'bg-red-500 text-white',
    glow: 'shadow-[0_0_18px_rgba(248,113,113,0.35)]',
  },
  HIGH: {
    border: 'border-amber-400/80',
    badge: 'bg-amber-400 text-black',
    glow: 'shadow-[0_0_14px_rgba(251,191,36,0.30)]',
  },
  MEDIUM: {
    border: 'border-cyan-500/70',
    badge: 'bg-cyan-500 text-black',
    glow: '',
  },
  LOW: {
    border: 'border-slate-600',
    badge: 'bg-slate-600 text-slate-100',
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

// Choice alignment styling — choice buttons should *look* clickable.
// Each alignment combines a raised elevated bg, a colored border, and a
// left accent bar so intent + affordance read instantly.
const alignmentStyles: Record<string, string> = {
  RUTHLESS:   'border-red-500/60 bg-red-950/25 hover:bg-red-900/40 hover:border-red-400 text-red-200',
  DIPLOMATIC: 'border-blue-500/60 bg-blue-950/25 hover:bg-blue-900/40 hover:border-blue-400 text-blue-200',
  CAUTIOUS:   'border-slate-500/70 bg-slate-800/60 hover:bg-slate-700/70 hover:border-slate-400 text-slate-100',
  BOLD:       'border-amber-500/70 bg-amber-950/25 hover:bg-amber-900/40 hover:border-amber-400 text-amber-200',
  ETHICAL:    'border-emerald-500/60 bg-emerald-950/25 hover:bg-emerald-900/40 hover:border-emerald-400 text-emerald-200',
  NEUTRAL:    'border-slate-500/70 bg-slate-800/60 hover:bg-slate-700/70 hover:border-slate-400 text-slate-100',
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
  isSpotlight = false,
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
        border-2 rounded-lg bg-[#090d13]/95 backdrop-blur-sm transition-all duration-300
        ${style.border} ${style.glow}
        ${isExpanded ? 'p-4 md:p-5' : 'p-3 md:p-4'}
        ${isSpotlight ? 'spotlight-glow' : ''}
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
          rounded-lg flex items-center justify-center shrink-0 border
          ${isSpotlight ? 'w-12 h-12 text-lg' : 'w-10 h-10'}
          ${event.type === 'PRIORITY' ? 'bg-amber-500/20 text-amber-300 border-amber-500/60' : 'bg-slate-800 text-slate-300 border-slate-600'}
        `}>
          <i className={`fas ${categoryIcon}`}></i>
        </div>

        {/* Title and Hook */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <h3 className={`
              font-prose font-bold text-white break-words
              ${isSpotlight ? 'text-xl md:text-2xl leading-tight' : 'text-base md:text-lg leading-snug'}
            `}>
              {event.title}
            </h3>
            {event.type === 'PRIORITY' && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${style.badge}`}>
                Priority
              </span>
            )}
            {event.expiresInWeeks !== undefined && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-900/60 text-red-200 font-bold uppercase tracking-wider">
                {event.expiresInWeeks === 0 ? 'Urgent' : `${event.expiresInWeeks}w left`}
              </span>
            )}
          </div>
          <p className={`font-prose italic text-slate-300 ${isSpotlight ? 'text-base leading-relaxed' : 'text-sm leading-relaxed'}`}>
            {renderMarkdown(event.hook)}
          </p>
          {sourceNpc && (
            <p className="text-xs text-slate-400 mt-1.5 font-mono">
              <i className="fas fa-user mr-1"></i>
              {sourceNpc.name}
            </p>
          )}
        </div>

        {/* Expand/Collapse */}
        <span
          className="text-slate-400 p-1 shrink-0"
          aria-hidden="true"
        >
          <i className={`fas ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
        </span>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-4 space-y-4 animate-fade-in">
          {/* Full Description — prose font, relaxed line-height for readability */}
          <div className="font-prose text-[15px] leading-relaxed text-slate-200 whitespace-pre-line border-l-2 border-amber-500/60 pl-4">
            {renderMarkdown(event.description)}
          </div>

          {/* Context if exists */}
          {event.context && (
            <div className="font-prose text-sm leading-relaxed text-slate-300 italic bg-slate-800/60 p-3 rounded border border-slate-700">
              <i className="fas fa-lightbulb mr-2 text-amber-400"></i>
              {event.context}
            </div>
          )}

          {/* Machiavelli AI Advisor Panel — dark slate bg with purple accent, NOT purple-on-purple */}
          {onConsultAdvisor && !event.isOnboarding && event.type !== 'PRIORITY' && (event.advisorHints?.machiavelli || event.stakes === 'HIGH' || event.stakes === 'CRITICAL') && (
            <div className="rounded-lg border border-purple-500/50 bg-slate-950/70 overflow-hidden transition-all">
              {/* Advisor Header - Always Visible */}
              <button
                onClick={() => setAdvisorExpanded(!advisorExpanded)}
                className="w-full p-3 flex items-center justify-between hover:bg-slate-900/70 transition-colors terminal-focus"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-purple-600/30 flex items-center justify-center border border-purple-400/60">
                    <i className="fas fa-user-secret text-purple-200 text-sm"></i>
                  </div>
                  <div className="text-left">
                    <div className="text-purple-200 font-bold text-xs tracking-wide">
                      MACHIAVELLI AI
                    </div>
                    <div className="text-slate-300 text-[11px]">
                      {event.advisorHints?.machiavelli ? 'Strategic insight available' : 'High-stakes — advice recommended'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {(event.stakes === 'HIGH' || event.stakes === 'CRITICAL') && (
                    <span className="px-2 py-0.5 bg-purple-600/50 text-purple-100 text-[10px] rounded font-bold uppercase tracking-wider animate-pulse">
                      Consult
                    </span>
                  )}
                  <i className={`fas fa-chevron-${advisorExpanded ? 'up' : 'down'} text-purple-300 text-xs`}></i>
                </div>
              </button>

              {/* Advisor Content - Expandable */}
              {advisorExpanded && (
                <div className="px-3 pb-3 border-t border-purple-500/25 animate-fade-in">
                  {event.advisorHints?.machiavelli && (
                    <p className="font-prose text-purple-100 text-sm italic mt-3 leading-relaxed">
                      &ldquo;{event.advisorHints.machiavelli}&rdquo;
                    </p>
                  )}
                  {event.advisorHints?.sarah && (
                    <div className="mt-2 pt-2 border-t border-slate-800">
                      <span className="text-blue-300 text-[11px] font-bold">Sarah:</span>{' '}
                      <span className="font-prose text-blue-100 text-sm italic">&ldquo;{event.advisorHints.sarah}&rdquo;</span>
                    </div>
                  )}
                  {!event.advisorHints?.machiavelli && (
                    <p className="text-slate-300 text-sm mt-2">
                      This is a {event.stakes.toLowerCase()}-stakes decision. Consider getting advice.
                    </p>
                  )}
                  {onConsultAdvisor && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onConsultAdvisor();
                      }}
                      className="choice-btn mt-3 w-full py-2 px-3 bg-purple-700/50 hover:bg-purple-600/60 text-purple-50 text-xs font-bold uppercase tracking-wider rounded border-2 border-purple-400/60 flex items-center justify-center gap-2"
                    >
                      <i className="fas fa-comment-dots"></i>
                      Ask Machiavelli
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Choices — CTAs; each one is a raised, clickable affordance */}
          <div className="space-y-3">
            <div className="text-[11px] font-bold text-slate-300 uppercase tracking-[0.18em] flex items-center gap-2">
              <span className="h-px w-4 bg-amber-400/70" aria-hidden="true" />
              Your Move
            </div>
            {event.choices.map((choice) => {
              const { available, reason } = checkChoiceAvailability(choice, playerStats, npcs, worldFlags);
              const alignment = choice.alignment || 'NEUTRAL';
              const alignStyle = alignmentStyles[alignment];
              const impactPreview = describeChoiceImpact(choice);

              return (
                <button
                  key={choice.id}
                  onClick={() => available && handleChoiceClick(choice)}
                  disabled={!available}
                  className={`
                    choice-btn w-full text-left min-h-[88px] p-4 rounded-lg border-2
                    ${available ? alignStyle : 'border-slate-800 bg-slate-900/40 opacity-50 cursor-not-allowed'}
                    ${selectedChoice === choice.id ? 'ring-2 ring-cyan-300' : ''}
                  `}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className={`font-prose font-semibold break-words ${isSpotlight ? 'text-base md:text-lg' : 'text-sm md:text-base'}`}>
                      {choice.label}
                    </span>
                    <div className="flex items-center gap-2 text-xs shrink-0">
                      {choice.skillCheck && (
                        <span className="px-2 py-0.5 bg-amber-900/60 text-amber-200 rounded font-mono uppercase tracking-wider text-[10px]">
                          <i className="fas fa-dice mr-1"></i>
                          {formatStatName(choice.skillCheck.skill)}
                        </span>
                      )}
                      {choice.icon && <i className={`fas ${choice.icon} text-base`} aria-hidden="true"></i>}
                    </div>
                  </div>
                  <p className="font-prose text-[13px] leading-relaxed text-slate-300 mt-1.5">
                    {choice.description}
                  </p>
                  {impactPreview && (
                    <p className="text-[11px] text-cyan-200 mt-2.5 rounded border border-cyan-800/60 bg-cyan-950/30 px-2 py-1 font-mono">
                      <i className="fas fa-chart-line mr-1"></i>
                      Potential impact: {impactPreview}
                    </p>
                  )}
                  {!available && reason && (
                    <p className="text-xs text-red-300 mt-2 font-mono">
                      <i className="fas fa-lock mr-1"></i>{reason}
                    </p>
                  )}
                  {choice.playerLine && available && (
                    <p className="font-prose text-[13px] text-slate-400 mt-2.5 italic">
                      &ldquo;{choice.playerLine}&rdquo;
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 animate-fade-in">
          <div className="bg-slate-900 border-2 border-amber-500/60 p-6 rounded-lg max-w-md shadow-[0_0_40px_rgba(251,191,36,0.25)]">
            <h4 className="font-prose text-xl font-bold text-white mb-2">Point of No Return</h4>
            <p className="font-prose text-slate-200 leading-relaxed mb-5">
              This one sticks. No take-backs, no &ldquo;strategic pivots,&rdquo; no pretending it was someone else&rsquo;s idea.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleConfirm}
                className="choice-btn flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black rounded font-bold uppercase tracking-widest text-sm border-2 border-amber-400"
              >
                Confirm
              </button>
              <button
                onClick={handleCancel}
                className="choice-btn flex-1 px-4 py-2.5 border-2 border-slate-500 hover:border-slate-400 text-slate-100 rounded font-bold uppercase tracking-widest text-sm"
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
