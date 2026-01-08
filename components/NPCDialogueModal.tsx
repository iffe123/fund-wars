/**
 * NPC Dialogue Modal Component
 *
 * Interactive conversation system where players chat with NPCs.
 * Choices affect relationships and story progression.
 */

import React, { useState, useCallback, useEffect } from 'react';
import type { NPCDialogue, DialogueNode, DialogueResponse, DialogueResult, DialogueEffects } from '../types/npcDialogue';
import { Z_INDEX } from '../constants/zIndex';

interface NPCDialogueModalProps {
  dialogue: NPCDialogue;
  playerStats: {
    reputation: number;
    financialEngineering: number;
  };
  flags: string[];
  onComplete: (result: DialogueResult) => void;
}

const NPCDialogueModal: React.FC<NPCDialogueModalProps> = ({
  dialogue,
  playerStats,
  flags,
  onComplete,
}) => {
  const [currentNodeId, setCurrentNodeId] = useState(dialogue.startNodeId);
  const [history, setHistory] = useState<string[]>([]);
  const [relationshipDelta, setRelationshipDelta] = useState(0);
  const [infoGained, setInfoGained] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [displayedText, setDisplayedText] = useState('');

  const currentNode = dialogue.nodes[currentNodeId];

  // Typewriter effect for dialogue
  useEffect(() => {
    if (!currentNode) return;

    setIsTyping(true);
    setDisplayedText('');

    const text = currentNode.text;
    let index = 0;

    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [currentNodeId, currentNode?.text]);

  // Skip typewriter on click
  const handleSkipTyping = useCallback(() => {
    if (isTyping && currentNode) {
      setDisplayedText(currentNode.text);
      setIsTyping(false);
    }
  }, [isTyping, currentNode]);

  // Check if response requirements are met
  const isResponseAvailable = useCallback((response: DialogueResponse): boolean => {
    if (!response.requirements) return true;

    const { minReputation, minFinancialEngineering, requiredFlags } = response.requirements;

    if (minReputation && playerStats.reputation < minReputation) return false;
    if (minFinancialEngineering && playerStats.financialEngineering < minFinancialEngineering) return false;
    if (requiredFlags && !requiredFlags.every(f => flags.includes(f))) return false;

    return true;
  }, [playerStats, flags]);

  // Handle response selection
  const handleResponse = useCallback((response: DialogueResponse) => {
    // Apply response effects
    if (response.effects) {
      if (response.effects.relationship) {
        setRelationshipDelta(prev => prev + response.effects.relationship!);
      }
      if (response.effects.unlockInfo) {
        setInfoGained(prev => [...prev, response.effects.unlockInfo!]);
      }
    }

    // Update history
    setHistory(prev => [...prev, currentNodeId]);

    // Check if this is an end node
    const nextNode = dialogue.nodes[response.nextNodeId];
    if (!nextNode || (!nextNode.responses && !nextNode.autoAdvance && !nextNode.nextNodeId)) {
      // End of dialogue
      finishDialogue(response.effects);
      return;
    }

    setCurrentNodeId(response.nextNodeId);
  }, [currentNodeId, dialogue.nodes]);

  // Handle auto-advance nodes
  useEffect(() => {
    if (!currentNode) return;

    if (currentNode.autoAdvance && currentNode.nextNodeId) {
      const timer = setTimeout(() => {
        setHistory(prev => [...prev, currentNodeId]);
        setCurrentNodeId(currentNode.nextNodeId!);
      }, 2000);
      return () => clearTimeout(timer);
    }

    // Check for end node (no responses, not auto-advance)
    if (!currentNode.responses && !currentNode.autoAdvance && !currentNode.nextNodeId) {
      // Apply node effects
      if (currentNode.effects) {
        if (currentNode.effects.relationship) {
          setRelationshipDelta(prev => prev + currentNode.effects.relationship!);
        }
        if (currentNode.effects.unlockInfo) {
          setInfoGained(prev => [...prev, currentNode.effects.unlockInfo!]);
        }
      }

      // Auto-close after delay
      const timer = setTimeout(() => {
        finishDialogue(currentNode.effects);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [currentNode, currentNodeId]);

  const finishDialogue = (lastEffects?: DialogueEffects) => {
    // Determine outcome based on relationship delta
    let outcome: 'success' | 'failure' | 'neutral' = 'neutral';
    if (relationshipDelta >= 10) outcome = 'success';
    else if (relationshipDelta <= -10) outcome = 'failure';

    const outcomeEffects = dialogue.outcomes[outcome] || {};

    const result: DialogueResult = {
      dialogueId: dialogue.id,
      npcId: dialogue.npcId,
      outcome,
      effects: {
        ...outcomeEffects,
        ...(lastEffects || {}),
        relationship: relationshipDelta,
      },
      infoGained: infoGained.length > 0 ? infoGained : undefined,
    };

    onComplete(result);
  };

  const getEmotionStyle = (emotion?: string) => {
    switch (emotion) {
      case 'happy': return 'border-emerald-500/50 bg-emerald-900/10';
      case 'angry': return 'border-red-500/50 bg-red-900/10';
      case 'sad': return 'border-blue-500/50 bg-blue-900/10';
      case 'suspicious': return 'border-amber-500/50 bg-amber-900/10';
      case 'impressed': return 'border-purple-500/50 bg-purple-900/10';
      case 'dismissive': return 'border-slate-500/50 bg-slate-800/50';
      default: return 'border-slate-600/50 bg-slate-800/30';
    }
  };

  const getToneStyle = (tone?: string) => {
    switch (tone) {
      case 'professional': return 'border-blue-600 hover:border-blue-400 hover:bg-blue-900/30';
      case 'aggressive': return 'border-red-600 hover:border-red-400 hover:bg-red-900/30';
      case 'friendly': return 'border-emerald-600 hover:border-emerald-400 hover:bg-emerald-900/30';
      case 'sarcastic': return 'border-purple-600 hover:border-purple-400 hover:bg-purple-900/30';
      case 'humble': return 'border-amber-600 hover:border-amber-400 hover:bg-amber-900/30';
      default: return 'border-slate-600 hover:border-slate-400 hover:bg-slate-800';
    }
  };

  if (!currentNode) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/90 flex items-center justify-center p-4"
      style={{ zIndex: Z_INDEX.modal + 5 }}
      onClick={handleSkipTyping}
    >
      <div className="max-w-3xl w-full bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-slate-800 p-4 border-b border-slate-700">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-slate-700 flex items-center justify-center border-2 border-slate-600">
              <i className="fas fa-user text-2xl text-slate-400"></i>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">{dialogue.npcName}</h2>
              <p className="text-sm text-slate-400">{dialogue.npcRole}</p>
            </div>
            {relationshipDelta !== 0 && (
              <div className={`ml-auto px-3 py-1 rounded text-sm ${
                relationshipDelta > 0 ? 'bg-emerald-900/50 text-emerald-400' : 'bg-red-900/50 text-red-400'
              }`}>
                {relationshipDelta > 0 ? '+' : ''}{relationshipDelta} Relationship
              </div>
            )}
          </div>
        </div>

        {/* Dialogue Content */}
        <div className="p-6">
          {/* Speaker Name & Dialogue Box */}
          <div className={`p-5 rounded-lg border-2 ${getEmotionStyle(currentNode.emotion)} mb-6`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {currentNode.speaker}
              </span>
              {currentNode.emotion && currentNode.emotion !== 'neutral' && (
                <span className="text-xs text-slate-500 italic">
                  ({currentNode.emotion})
                </span>
              )}
            </div>
            <p className="text-lg text-slate-200 leading-relaxed">
              {displayedText}
              {isTyping && <span className="animate-pulse">|</span>}
            </p>
          </div>

          {/* Response Options */}
          {currentNode.responses && !isTyping && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">
                Choose your response:
              </p>
              {currentNode.responses.map((response) => {
                const available = isResponseAvailable(response);
                const hidden = response.hidden && !available;

                if (hidden) return null;

                return (
                  <button
                    key={response.id}
                    onClick={() => available && handleResponse(response)}
                    disabled={!available}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      available
                        ? getToneStyle(response.tone)
                        : 'border-slate-700 bg-slate-900/50 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <p className={`${available ? 'text-slate-200' : 'text-slate-500'}`}>
                      "{response.text}"
                    </p>
                    {!available && response.requirements && (
                      <p className="text-xs text-red-400 mt-2">
                        {response.requirements.minReputation && (
                          <span>Requires {response.requirements.minReputation}+ Reputation</span>
                        )}
                        {response.requirements.minFinancialEngineering && (
                          <span>Requires {response.requirements.minFinancialEngineering}+ Financial Engineering</span>
                        )}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Auto-advance indicator */}
          {currentNode.autoAdvance && (
            <div className="text-center text-slate-500 text-sm animate-pulse">
              ...
            </div>
          )}

          {/* End node - no responses */}
          {!currentNode.responses && !currentNode.autoAdvance && !currentNode.nextNodeId && !isTyping && (
            <div className="text-center">
              <p className="text-slate-500 text-sm mb-4">
                {currentNode.speaker === 'System' ? '' : 'The conversation ends.'}
              </p>
              <div className="w-8 h-8 mx-auto border-2 border-slate-600 border-t-amber-500 rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* Info Gained */}
        {infoGained.length > 0 && (
          <div className="px-6 pb-4">
            <div className="p-3 bg-amber-900/20 border border-amber-500/30 rounded">
              <p className="text-xs text-amber-400 uppercase tracking-wider mb-1">
                <i className="fas fa-lightbulb mr-2"></i>Information Gained
              </p>
              {infoGained.map((info, idx) => (
                <p key={idx} className="text-sm text-amber-200">{info}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NPCDialogueModal;
