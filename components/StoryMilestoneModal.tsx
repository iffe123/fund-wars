/**
 * StoryMilestoneModal
 *
 * Fullscreen modal that renders a story scene from storyContent.ts
 * inside the sandbox simulator. When the player makes a choice,
 * effects are applied to the simulator's playerStats and the modal closes.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Scene, Choice, ChoiceEffects } from '../types/storyEngine';
import type { StatChanges } from '../types';
import { STORY_SCENES } from '../content/storyContent';
import { renderMarkdown } from '../utils/renderMarkdown';

interface StoryMilestoneModalProps {
  sceneId: string;
  onComplete: (effects: StatChanges | null) => void;
  onDismiss: () => void;
}

// Build a lookup map once
const sceneMap = new Map<string, Scene>();
for (const scene of STORY_SCENES) {
  sceneMap.set(scene.id, scene);
}

const StoryMilestoneModal: React.FC<StoryMilestoneModalProps> = ({
  sceneId,
  onComplete,
  onDismiss,
}) => {
  const scene = useMemo(() => sceneMap.get(sceneId), [sceneId]);
  const [textRevealed, setTextRevealed] = useState(false);
  const [showChoices, setShowChoices] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<Choice | null>(null);
  const [showConsequences, setShowConsequences] = useState(false);

  // Reveal text after a brief delay, then show choices
  useEffect(() => {
    const textTimer = setTimeout(() => setTextRevealed(true), 300);
    const choiceTimer = setTimeout(() => setShowChoices(true), 1200);
    return () => {
      clearTimeout(textTimer);
      clearTimeout(choiceTimer);
    };
  }, [sceneId]);

  // Convert story ChoiceEffects → simulator StatChanges
  const convertEffects = useCallback((effects?: ChoiceEffects): StatChanges | null => {
    if (!effects) return null;
    const changes: StatChanges = {};

    if (effects.stats) {
      if (effects.stats.reputation !== undefined) changes.reputation = effects.stats.reputation;
      if (effects.stats.stress !== undefined) changes.stress = effects.stats.stress;
      if (effects.stats.ethics !== undefined) changes.ethics = effects.stats.ethics;
      if (effects.stats.money !== undefined) changes.cash = effects.stats.money;
    }
    if (effects.money !== undefined) {
      changes.cash = (changes.cash ?? 0) + effects.money;
    }

    // NPC relationship updates
    if (effects.relationships && effects.relationships.length > 0) {
      const first = effects.relationships[0];
      changes.npcRelationshipUpdate = {
        npcId: first.npcId,
        change: first.change,
        memory: first.memory,
      };
      if (effects.relationships.length > 1) {
        const second = effects.relationships[1];
        changes.npcRelationshipUpdate2 = {
          npcId: second.npcId,
          change: second.change,
          memory: second.memory,
        };
      }
    }

    // Flags
    if (effects.setFlags) {
      changes.setsFlags = effects.setFlags;
    }

    return changes;
  }, []);

  const handleChoiceSelect = useCallback((choice: Choice) => {
    setSelectedChoice(choice);
    setShowConsequences(true);

    // After showing consequence briefly, complete
    setTimeout(() => {
      const statChanges = convertEffects(choice.effects);
      onComplete(statChanges);
    }, 2000);
  }, [convertEffects, onComplete]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!showChoices || selectedChoice) return;
      if (!scene) return;

      const num = parseInt(e.key);
      if (num >= 1 && num <= scene.choices.length) {
        handleChoiceSelect(scene.choices[num - 1]);
      }
      if (e.key === 'Escape') {
        onDismiss();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showChoices, selectedChoice, scene, handleChoiceSelect, onDismiss]);

  if (!scene) {
    // Scene not found — auto-dismiss
    onDismiss();
    return null;
  }

  const atmosphereBorder = {
    crisis: 'border-l-red-500',
    celebration: 'border-l-yellow-500',
    meeting: 'border-l-blue-500',
    party: 'border-l-purple-500',
    office: 'border-l-green-500/50',
    quiet: 'border-l-slate-500',
  }[scene.atmosphere ?? 'office'] ?? 'border-l-green-500/50';

  const categoryIcon = {
    crisis: 'fa-triangle-exclamation',
    celebration: 'fa-trophy',
    meeting: 'fa-handshake',
    party: 'fa-champagne-glasses',
    office: 'fa-building',
    quiet: 'fa-moon',
  }[scene.atmosphere ?? 'office'] ?? 'fa-building';

  return (
    <div
      className="fixed inset-0 z-[950] bg-black flex items-center justify-center p-4"
      style={{ backgroundColor: '#000000', zIndex: 950 }}
    >
      {/* Subtle background grid */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-500/20 border border-amber-500/40 rounded flex items-center justify-center">
              <i className={`fas ${categoryIcon} text-amber-400 text-xs`} />
            </div>
            <div>
              <div className="text-xs font-mono text-amber-500/60 uppercase tracking-widest">
                Story Event
              </div>
              <h2 className="text-xl font-bold text-slate-100">{scene.title}</h2>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="flex items-center gap-2 px-3 py-1.5 rounded border border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 hover:border-slate-500 text-slate-400 hover:text-slate-200 text-xs font-mono uppercase tracking-wider transition-all"
          >
            <i className="fas fa-forward-step text-[10px]"></i>
            Skip
            <kbd className="text-[9px] px-1.5 py-0.5 rounded bg-slate-700 border border-slate-600 text-slate-400">ESC</kbd>
          </button>
        </div>

        {/* Speaker portrait */}
        {scene.speaker && (
          <div className="flex items-center gap-3 mb-4 p-3 bg-slate-900/50 border border-slate-800 rounded">
            <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
              <i className={`fas ${scene.speaker.avatar || 'fa-user'} text-slate-400`} />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-200">{scene.speaker.name}</div>
              {scene.speaker.mood && (
                <div className="text-xs text-slate-500 capitalize">{scene.speaker.mood}</div>
              )}
            </div>
          </div>
        )}

        {/* Narrative text */}
        <div
          className={`
            border-l-4 pl-6 py-4 mb-6
            ${atmosphereBorder}
            transition-opacity duration-700
            ${textRevealed ? 'opacity-100' : 'opacity-0'}
          `}
        >
          {scene.narrative.split('\n\n').map((paragraph, i) => (
            <p
              key={i}
              className="text-slate-300 leading-relaxed mb-3 last:mb-0"
              style={{
                transitionDelay: `${i * 200}ms`,
                opacity: textRevealed ? 1 : 0,
                transform: textRevealed ? 'translateY(0)' : 'translateY(8px)',
                transition: 'opacity 0.5s, transform 0.5s',
              }}
            >
              {renderMarkdown(paragraph)}
            </p>
          ))}
        </div>

        {/* Consequence display */}
        {showConsequences && selectedChoice && (
          <div className="mb-6 p-4 bg-slate-900/80 border border-amber-500/30 rounded animate-pulse">
            <div className="text-amber-400 text-sm font-mono mb-2">
              CONSEQUENCE
            </div>
            {selectedChoice.effects?.stats && (
              <div className="flex flex-wrap gap-3 text-xs font-mono">
                {Object.entries(selectedChoice.effects.stats).map(([key, value]) => (
                  <span
                    key={key}
                    className={typeof value === 'number' && value > 0 ? 'text-green-400' : 'text-red-400'}
                  >
                    {key}: {typeof value === 'number' && value > 0 ? '+' : ''}{value}
                  </span>
                ))}
              </div>
            )}
            {selectedChoice.effects?.relationships?.map((rel, i) => (
              <div key={i} className="text-xs font-mono text-blue-400 mt-1">
                {rel.npcId} relationship: {rel.change > 0 ? '+' : ''}{rel.change}
                {rel.memory && <span className="text-slate-500 ml-2">({rel.memory})</span>}
              </div>
            ))}
            {selectedChoice.narratorComment && (
              <div className="text-xs text-slate-500 italic mt-2">
                {renderMarkdown(selectedChoice.narratorComment)}
              </div>
            )}
          </div>
        )}

        {/* Choices */}
        {showChoices && !selectedChoice && (
          <div className="space-y-3">
            {scene.choices.map((choice, index) => {
              const styleColors = {
                risky: 'border-red-500/40 hover:border-red-400 hover:bg-red-500/10',
                safe: 'border-green-500/40 hover:border-green-400 hover:bg-green-500/10',
                ethical: 'border-blue-500/40 hover:border-blue-400 hover:bg-blue-500/10',
                unethical: 'border-purple-500/40 hover:border-purple-400 hover:bg-purple-500/10',
                hidden: 'border-slate-600/40 hover:border-slate-400 hover:bg-slate-500/10',
                normal: 'border-slate-700 hover:border-amber-500/60 hover:bg-amber-500/5',
              }[choice.style ?? 'normal'];

              return (
                <button
                  key={choice.id}
                  onClick={() => handleChoiceSelect(choice)}
                  className={`
                    w-full text-left p-4 border rounded
                    ${styleColors}
                    transition-all duration-200 group
                  `}
                  style={{
                    opacity: showChoices ? 1 : 0,
                    transform: showChoices ? 'translateX(0)' : 'translateX(-16px)',
                    transition: `opacity 0.3s ${index * 100}ms, transform 0.3s ${index * 100}ms`,
                  }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-mono text-slate-600 mt-0.5 group-hover:text-amber-500 transition-colors">
                      [{index + 1}]
                    </span>
                    <div className="flex-1">
                      <div className="text-sm text-slate-200 group-hover:text-white transition-colors">
                        {renderMarkdown(choice.text)}
                      </div>
                      {choice.subtext && (
                        <div className="text-xs text-slate-500 mt-1">{renderMarkdown(choice.subtext)}</div>
                      )}
                      {choice.style && choice.style !== 'normal' && (
                        <span className="inline-block text-[10px] uppercase tracking-wider mt-1 px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          {choice.style}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* No choices — just a continue button */}
        {showChoices && scene.choices.length === 0 && !selectedChoice && (
          <button
            onClick={() => onComplete(null)}
            className="w-full p-4 border border-amber-500/40 rounded text-amber-400 font-mono text-sm hover:bg-amber-500/10 transition-colors"
          >
            [ CONTINUE ]
          </button>
        )}
      </div>
    </div>
  );
};

export default StoryMilestoneModal;
