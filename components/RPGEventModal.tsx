/**
 * RPG Event Modal
 *
 * Displays story events with narrative text, choices, and consequences.
 * This is the primary player-facing interface for the event-driven RPG system.
 * Enhanced to support onboarding/tutorial events with mentor guidance.
 */

import React, { useState, useMemo } from 'react';
import type { StoryEvent, EventChoice, EventConsequences, MentorGuidance } from '../types/rpgEvents';
import type { PlayerStats, NPC } from '../types';
import { useRPGEvents, useChoiceAvailability } from '../contexts/RPGEventContext';
import { checkChoiceRequirements, performSkillCheck } from '../utils/eventQueueManager';
import { Z_INDEX } from '../constants/zIndex';

// Mentor avatar mappings
const MENTOR_AVATARS: Record<string, { icon: string; color: string; bgColor: string }> = {
  machiavelli: {
    icon: 'fa-user-secret',
    color: 'text-purple-400',
    bgColor: 'bg-purple-900/30',
  },
  sarah: {
    icon: 'fa-glasses',
    color: 'text-blue-400',
    bgColor: 'bg-blue-900/30',
  },
  system: {
    icon: 'fa-terminal',
    color: 'text-amber-400',
    bgColor: 'bg-amber-900/30',
  },
};

// Machiavelli Insight Component - More prominent advisor display
const MachiavelliInsight: React.FC<{
  hints: Record<string, string>;
  stakes: string;
  isExpanded: boolean;
  onToggle: () => void;
  onConsultAdvisor?: () => void;
}> = ({ hints, stakes, isExpanded, onToggle, onConsultAdvisor }) => {
  const machiavelliHint = hints.machiavelli || hints.Machiavelli;
  const hasHint = !!machiavelliHint;
  const isHighStakes = stakes === 'HIGH' || stakes === 'CRITICAL';

  if (!hasHint && !isHighStakes) return null;

  return (
    <div className={`mb-6 rounded-lg border-2 overflow-hidden transition-all ${
      isHighStakes
        ? 'border-purple-500/70 bg-gradient-to-br from-purple-900/40 to-slate-900/60'
        : 'border-purple-500/30 bg-purple-900/20'
    }`}>
      {/* Header - Always visible */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-purple-900/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-800/50 flex items-center justify-center border border-purple-500/50">
            <i className="fas fa-user-secret text-purple-400 text-lg"></i>
          </div>
          <div className="text-left">
            <div className="text-purple-400 font-bold text-sm tracking-wide">
              MACHIAVELLI AI
            </div>
            <div className="text-purple-300/70 text-xs">
              {isHighStakes ? 'Strategic Insight Available' : 'Advisor Analysis'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isHighStakes && (
            <span className="px-2 py-1 bg-purple-600/50 text-purple-200 text-xs rounded-full animate-pulse">
              Recommended
            </span>
          )}
          <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} text-purple-400`}></i>
        </div>
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-purple-500/20">
          {hasHint ? (
            <div className="mt-4">
              <p className="text-purple-100 text-sm leading-relaxed italic">
                "{machiavelliHint}"
              </p>

              {/* Other advisor hints if available */}
              {Object.entries(hints).filter(([key]) =>
                key.toLowerCase() !== 'machiavelli'
              ).map(([advisor, hint]) => (
                <div key={advisor} className="mt-3 pt-3 border-t border-purple-500/20">
                  <span className="text-slate-400 text-xs font-medium capitalize">
                    {advisor}:
                  </span>
                  <p className="text-slate-300 text-sm mt-1">{hint}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 text-center">
              <p className="text-purple-300/70 text-sm mb-3">
                This is a {stakes.toLowerCase()}-stakes decision. Consider consulting your advisor.
              </p>
            </div>
          )}

          {onConsultAdvisor && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onConsultAdvisor();
              }}
              className="mt-4 w-full py-2 px-4 bg-purple-700/50 hover:bg-purple-600/50 text-purple-200 text-sm font-medium rounded border border-purple-500/50 transition-colors flex items-center justify-center gap-2"
            >
              <i className="fas fa-comment-dots"></i>
              Ask Machiavelli for Detailed Analysis
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Mentor Guidance Component
const MentorGuidanceBox: React.FC<{ guidance: MentorGuidance }> = ({ guidance }) => {
  const mentor = MENTOR_AVATARS[guidance.character] || MENTOR_AVATARS.system;

  return (
    <div className={`mb-6 p-4 rounded-lg border-2 ${mentor.bgColor} border-dashed border-opacity-50`}
         style={{ borderColor: 'currentColor' }}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${mentor.bgColor}`}>
          <i className={`fas ${mentor.icon} ${mentor.color} text-lg`}></i>
        </div>
        <div className="flex-1">
          <div className={`text-xs font-bold uppercase tracking-wider ${mentor.color} mb-1`}>
            {guidance.character === 'system' ? 'System Guide' : guidance.character}
          </div>
          <p className="text-slate-200 text-sm leading-relaxed">
            {guidance.message}
          </p>
          {guidance.tip && (
            <div className="mt-2 p-2 bg-slate-800/50 rounded border-l-2 border-amber-500">
              <p className="text-amber-200 text-xs">
                <i className="fas fa-lightbulb mr-2 text-amber-400"></i>
                <strong>Tip:</strong> {guidance.tip}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface RPGEventModalProps {
  playerStats: PlayerStats;
  npcs: NPC[];
  onChoiceMade: (consequences: EventConsequences, choiceResult: {
    success: boolean;
    skillCheck?: { passed: boolean; roll: number; threshold: number };
  }) => void;
  onConsultAdvisor?: () => void;
}

const RPGEventModal: React.FC<RPGEventModalProps> = ({
  playerStats,
  npcs,
  onChoiceMade,
  onConsultAdvisor,
}) => {
  const { currentEvent, makeChoice, closeEventModal, worldFlags } = useRPGEvents();
  const availableChoices = useChoiceAvailability(playerStats, npcs);
  const [selectedChoice, setSelectedChoice] = useState<EventChoice | null>(null);
  const [showingResult, setShowingResult] = useState(false);
  const [advisorExpanded, setAdvisorExpanded] = useState(false);
  const [lastResult, setLastResult] = useState<{
    success: boolean;
    consequences: EventConsequences;
    skillCheck?: { passed: boolean; roll: number; threshold: number; critical: boolean };
    epilogue?: string;
  } | null>(null);

  // Auto-expand advisor for high-stakes events
  React.useEffect(() => {
    if (currentEvent && (currentEvent.stakes === 'HIGH' || currentEvent.stakes === 'CRITICAL')) {
      setAdvisorExpanded(true);
    } else {
      setAdvisorExpanded(false);
    }
  }, [currentEvent?.id]);

  if (!currentEvent) {
    return null;
  }

  const handleChoiceClick = (choice: EventChoice, isAvailable: boolean) => {
    if (!isAvailable) return;
    setSelectedChoice(choice);
  };

  const handleConfirmChoice = () => {
    if (!selectedChoice) return;

    const result = makeChoice(selectedChoice, playerStats, npcs);
    
    setLastResult({
      success: result.success,
      consequences: result.consequences,
      skillCheck: result.skillCheckResult ? {
        passed: result.skillCheckResult.passed,
        roll: result.skillCheckResult.rolled,
        threshold: result.skillCheckResult.threshold,
        critical: result.skillCheckResult.critical,
      } : undefined,
      epilogue: selectedChoice.epilogue,
    });
    setShowingResult(true);

    // Notify parent of choice
    onChoiceMade(result.consequences, {
      success: result.success,
      skillCheck: result.skillCheckResult ? {
        passed: result.skillCheckResult.passed,
        roll: result.skillCheckResult.rolled,
        threshold: result.skillCheckResult.threshold,
      } : undefined,
    });
  };

  const handleCloseResult = () => {
    setShowingResult(false);
    setSelectedChoice(null);
    setLastResult(null);
    closeEventModal();
  };

  // Render the result screen after a choice
  if (showingResult && lastResult) {
    return (
      <div 
        className="fixed inset-0 bg-black/80 flex items-center justify-center p-4"
        style={{ zIndex: Z_INDEX.modal }}
      >
        <div className="bg-slate-900 border border-amber-500/50 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Result Header */}
          <div className={`p-6 border-b ${
            lastResult.success 
              ? 'border-emerald-500/50 bg-emerald-900/20' 
              : 'border-red-500/50 bg-red-900/20'
          }`}>
            <h2 className={`text-2xl font-bold ${
              lastResult.success ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {lastResult.success ? 'Success' : 'Complications Arise'}
            </h2>
            
            {lastResult.skillCheck && (
              <div className="mt-2 text-sm">
                <span className="text-slate-400">Skill Check: </span>
                <span className={lastResult.skillCheck.passed ? 'text-emerald-400' : 'text-red-400'}>
                  Rolled {lastResult.skillCheck.roll} vs {lastResult.skillCheck.threshold}
                  {lastResult.skillCheck.critical && ' (Critical!)'}
                </span>
              </div>
            )}
          </div>

          {/* Result Body */}
          <div className="p-6">
            {/* Immediate Response */}
            {selectedChoice?.immediateResponse && (
              <div className="mb-4 p-4 bg-slate-800/50 rounded border-l-4 border-amber-500">
                <p className="text-slate-300 italic">
                  "{selectedChoice.immediateResponse}"
                </p>
              </div>
            )}

            {/* Epilogue */}
            {lastResult.epilogue && (
              <div className="mb-4">
                <p className="text-slate-200 leading-relaxed">
                  {lastResult.epilogue}
                </p>
              </div>
            )}

            {/* Notification */}
            {lastResult.consequences.notification && (
              <div className={`p-4 rounded mb-4 ${
                lastResult.consequences.notification.type === 'success' 
                  ? 'bg-emerald-900/30 border border-emerald-500/30'
                  : lastResult.consequences.notification.type === 'error'
                  ? 'bg-red-900/30 border border-red-500/30'
                  : 'bg-slate-800/50 border border-slate-600/30'
              }`}>
                <h4 className="font-bold text-amber-400">
                  {lastResult.consequences.notification.title}
                </h4>
                <p className="text-slate-300 text-sm mt-1">
                  {lastResult.consequences.notification.message}
                </p>
              </div>
            )}

            {/* Stat Changes Summary */}
            {lastResult.consequences.stats && Object.keys(lastResult.consequences.stats).length > 0 && (
              <div className="mt-4 p-4 bg-slate-800/30 rounded">
                <h4 className="text-sm font-medium text-slate-400 mb-2">Changes</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(lastResult.consequences.stats).map(([stat, value]) => {
                    // Only render numeric values
                    if (typeof value !== 'number') return null;
                    return (
                      <span 
                        key={stat}
                        className={`px-2 py-1 rounded text-sm ${
                          value > 0 
                            ? 'bg-emerald-900/50 text-emerald-400' 
                            : 'bg-red-900/50 text-red-400'
                        }`}
                      >
                        {stat}: {value > 0 ? '+' : ''}{value}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* NPC Effects */}
            {lastResult.consequences.npcEffects && lastResult.consequences.npcEffects.length > 0 && (
              <div className="mt-4 p-4 bg-slate-800/30 rounded">
                <h4 className="text-sm font-medium text-slate-400 mb-2">Relationship Changes</h4>
                <div className="space-y-2">
                  {lastResult.consequences.npcEffects.map((effect, idx) => {
                    const npc = npcs.find(n => n.id === effect.npcId);
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-slate-300">{npc?.name || effect.npcId}</span>
                        {effect.relationship !== undefined && (
                          <span className={`text-sm ${
                            effect.relationship > 0 ? 'text-emerald-400' : 'text-red-400'
                          }`}>
                            {effect.relationship > 0 ? '+' : ''}{effect.relationship} relationship
                          </span>
                        )}
                        {effect.trust !== undefined && (
                          <span className={`text-sm ${
                            effect.trust > 0 ? 'text-blue-400' : 'text-orange-400'
                          }`}>
                            {effect.trust > 0 ? '+' : ''}{effect.trust} trust
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Continue Button */}
          <div className="p-6 border-t border-slate-700">
            <button
              onClick={handleCloseResult}
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Get stakes styling
  const getStakesColor = (stakes: string) => {
    switch (stakes) {
      case 'CRITICAL': return 'text-red-400 border-red-500';
      case 'HIGH': return 'text-orange-400 border-orange-500';
      case 'MEDIUM': return 'text-amber-400 border-amber-500';
      case 'LOW': return 'text-slate-400 border-slate-500';
      default: return 'text-slate-400 border-slate-500';
    }
  };

  // Get alignment styling
  const getAlignmentIcon = (alignment: string | undefined) => {
    switch (alignment) {
      case 'BOLD': return '⚔️';
      case 'CAUTIOUS': return '🛡️';
      case 'DIPLOMATIC': return '🤝';
      case 'ETHICAL': return '⚖️';
      case 'RUTHLESS': return '🔥';
      default: return '💭';
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center p-4"
      style={{ zIndex: Z_INDEX.modal }}
    >
      <div className="bg-slate-900 border border-amber-500/50 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Event Header */}
        <div className="sticky top-0 bg-slate-900 p-6 border-b border-amber-500/30">
          {/* Onboarding Badge */}
          {currentEvent.isOnboarding && (
            <div className="mb-3 flex items-center gap-2">
              <span className="px-3 py-1 bg-gradient-to-r from-amber-600 to-amber-500 text-black text-xs font-bold uppercase tracking-wider rounded-full">
                <i className="fas fa-graduation-cap mr-1"></i>
                Tutorial
              </span>
              <span className="text-slate-500 text-xs">Learning the basics</span>
            </div>
          )}
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className={`text-xs uppercase tracking-wider ${getStakesColor(currentEvent.stakes)}`}>
                {currentEvent.stakes} Stakes • {currentEvent.category}
              </span>
              <h2 className="text-2xl font-bold text-amber-400 mt-1">
                {currentEvent.title}
              </h2>
              {currentEvent.sourceNpcId && (
                <p className="text-sm text-slate-400 mt-1">
                  via {npcs.find(n => n.id === currentEvent.sourceNpcId)?.name || currentEvent.sourceNpcId}
                </p>
              )}
            </div>
            {currentEvent.expiresInWeeks !== undefined && currentEvent.expiresInWeeks <= 1 && (
              <span className="px-2 py-1 bg-red-900/50 text-red-400 text-sm rounded">
                Expires {currentEvent.expiresInWeeks === 0 ? 'Today' : 'Next Week'}
              </span>
            )}
          </div>
        </div>

        {/* Event Body */}
        <div className="p-6">
          {/* Hook */}
          <div className="mb-4 p-4 bg-amber-900/20 border-l-4 border-amber-500 rounded-r">
            <p className="text-amber-200 font-medium italic">
              {currentEvent.hook}
            </p>
          </div>

          {/* Main Description */}
          <div className="prose prose-invert prose-sm max-w-none mb-6">
            {currentEvent.description.split('\n').map((paragraph, idx) => (
              <p key={idx} className="text-slate-300 leading-relaxed mb-3">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Context */}
          {currentEvent.context && (
            <div className="mb-6 p-3 bg-slate-800/50 rounded text-sm text-slate-400 italic">
              💡 {currentEvent.context}
            </div>
          )}

          {/* Mentor Guidance (Tutorial/Onboarding) */}
          {currentEvent.mentorGuidance && (
            <MentorGuidanceBox guidance={currentEvent.mentorGuidance} />
          )}

          {/* Machiavelli AI Insight - Prominent Advisor Section */}
          {(currentEvent.advisorHints || currentEvent.stakes === 'HIGH' || currentEvent.stakes === 'CRITICAL') && (
            <MachiavelliInsight
              hints={currentEvent.advisorHints || {}}
              stakes={currentEvent.stakes}
              isExpanded={advisorExpanded}
              onToggle={() => setAdvisorExpanded(!advisorExpanded)}
              onConsultAdvisor={onConsultAdvisor}
            />
          )}
        </div>

        {/* Choices */}
        <div className="p-6 bg-slate-800/30 border-t border-slate-700">
          <h3 className="text-lg font-bold text-slate-300 mb-4">Your Move</h3>
          <div className="space-y-3">
            {availableChoices.map((choice) => {
              const isSelected = selectedChoice?.id === choice.id;
              const isAvailable = choice.available;
              
              return (
                <button
                  key={choice.id}
                  onClick={() => handleChoiceClick(choice, isAvailable)}
                  disabled={!isAvailable}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-amber-500 bg-amber-900/30'
                      : isAvailable
                      ? 'border-slate-600 hover:border-slate-500 bg-slate-800/50 hover:bg-slate-800'
                      : 'border-slate-700 bg-slate-900/50 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl">
                      {getAlignmentIcon(choice.alignment)}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${isAvailable ? 'text-slate-200' : 'text-slate-500'}`}>
                          {choice.label}
                        </span>
                        {choice.skillCheck && (
                          <span className="text-xs px-2 py-0.5 bg-purple-900/50 text-purple-400 rounded">
                            Skill Check ({choice.skillCheck.skill}: {choice.skillCheck.threshold})
                          </span>
                        )}
                        {choice.successChance && choice.successChance < 100 && (
                          <span className="text-xs px-2 py-0.5 bg-amber-900/50 text-amber-400 rounded">
                            {choice.successChance}% success
                          </span>
                        )}
                      </div>
                      <p className={`text-sm mt-1 ${isAvailable ? 'text-slate-400' : 'text-slate-600'}`}>
                        {choice.description}
                      </p>
                      {!isAvailable && choice.reason && (
                        <p className="text-xs text-red-400 mt-2">
                          ⚠️ {choice.reason}
                        </p>
                      )}
                      {isSelected && choice.playerLine && (
                        <div className="mt-3 p-2 bg-slate-900/50 rounded border-l-2 border-emerald-500">
                          <p className="text-sm text-emerald-400 italic">
                            "{choice.playerLine}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Confirm Button */}
        <div className="sticky bottom-0 bg-slate-900 p-6 border-t border-slate-700">
          <div className="flex gap-3">
            <button
              onClick={closeEventModal}
              className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium rounded transition-colors"
            >
              Think About It
            </button>
            <button
              onClick={handleConfirmChoice}
              disabled={!selectedChoice}
              className={`flex-1 py-3 font-bold rounded transition-colors ${
                selectedChoice
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              {selectedChoice ? `Choose: ${selectedChoice.label}` : 'Select a Choice'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RPGEventModal;
