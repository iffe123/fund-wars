/**
 * Inner Monologue Component
 *
 * Renders the competing inner voices that represent different aspects
 * of the player's PE psychology. Voices appear as stylized interjections
 * that slide in during key moments.
 */

import React, { useState, useEffect } from 'react';
import type { VoiceInterjection, InnerVoice, InnerVoiceId } from '../types/aiBlueprint';
import { getVoiceColor, getVoiceBgColor, getVoiceIcon } from '../services/innerMonologueService';

interface InnerMonologueProps {
  interjections: VoiceInterjection[];
  voices: InnerVoice[];
  onDismiss: (voiceId: InnerVoiceId) => void;
  onSuppress: (voiceId: InnerVoiceId) => void;
  onListen: (voiceId: InnerVoiceId) => void;
}

const InnerMonologue: React.FC<InnerMonologueProps> = ({
  interjections,
  voices,
  onDismiss,
  onSuppress,
  onListen,
}) => {
  const [visibleInterjections, setVisibleInterjections] = useState<VoiceInterjection[]>([]);
  const [animatingOut, setAnimatingOut] = useState<Set<string>>(new Set());

  useEffect(() => {
    const active = interjections.filter(i => !i.dismissed);
    setVisibleInterjections(active);
  }, [interjections]);

  const handleDismiss = (voiceId: InnerVoiceId) => {
    setAnimatingOut(prev => new Set(prev).add(voiceId));
    setTimeout(() => {
      onDismiss(voiceId);
      setAnimatingOut(prev => {
        const next = new Set(prev);
        next.delete(voiceId);
        return next;
      });
    }, 300);
  };

  if (visibleInterjections.length === 0) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-30 space-y-2 pointer-events-none">
      {visibleInterjections.map((interjection) => {
        const voice = voices.find(v => v.id === interjection.voiceId);
        if (!voice) return null;

        const isAnimatingOut = animatingOut.has(interjection.voiceId);

        return (
          <div
            key={`${interjection.voiceId}-${interjection.tick}`}
            className={`
              pointer-events-auto
              border rounded-lg p-3 shadow-lg backdrop-blur-sm
              ${getVoiceBgColor(interjection.voiceId)}
              transition-all duration-300
              ${isAnimatingOut ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
              animate-slide-in-right
            `}
          >
            {/* Voice header */}
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <i className={`fas ${getVoiceIcon(interjection.voiceId)} ${getVoiceColor(interjection.voiceId)} text-xs`}></i>
                <span className={`text-[10px] uppercase tracking-widest font-bold ${getVoiceColor(interjection.voiceId)}`}>
                  {voice.name}
                </span>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: Math.ceil(voice.currentIntensity / 25) }, (_, i) => (
                    <div
                      key={i}
                      className={`w-1 h-1 rounded-full ${getVoiceColor(interjection.voiceId).replace('text-', 'bg-')}`}
                    />
                  ))}
                </div>
              </div>
              <button
                onClick={() => handleDismiss(interjection.voiceId)}
                className="text-slate-500 hover:text-slate-300 text-xs"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Voice text */}
            <p className="text-sm text-slate-200 italic leading-relaxed">
              "{interjection.text}"
            </p>

            {/* Hidden choice unlocked */}
            {interjection.unlocksChoice && (
              <div className="mt-2 pt-2 border-t border-slate-700/50">
                <span className="text-[9px] uppercase tracking-widest text-amber-500">New option revealed</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => onListen(interjection.voiceId)}
                className={`text-[10px] px-2 py-0.5 rounded ${getVoiceBgColor(interjection.voiceId)} ${getVoiceColor(interjection.voiceId)} hover:brightness-125 transition-all`}
              >
                Listen
              </button>
              <button
                onClick={() => onSuppress(interjection.voiceId)}
                className="text-[10px] px-2 py-0.5 rounded bg-slate-800/60 text-slate-500 hover:text-red-400 transition-all"
                title={`Suppressing costs ${voice.suppressionCost.stress} stress${voice.suppressionCost.ethics ? ` and ${Math.abs(voice.suppressionCost.ethics)} ethics` : ''}`}
              >
                Suppress
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ==================== VOICE STATUS PANEL ====================

interface VoiceStatusPanelProps {
  voices: InnerVoice[];
  onToggleSuppress: (voiceId: InnerVoiceId) => void;
}

export const VoiceStatusPanel: React.FC<VoiceStatusPanelProps> = ({ voices, onToggleSuppress }) => {
  return (
    <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-3">
        <i className="fas fa-brain text-purple-400 text-xs"></i>
        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Inner Voices</span>
      </div>

      <div className="space-y-2">
        {voices.map(voice => (
          <div
            key={voice.id}
            className={`flex items-center justify-between p-2 rounded ${
              voice.isSuppressed ? 'bg-slate-800/30 opacity-50' : getVoiceBgColor(voice.id)
            }`}
          >
            <div className="flex items-center gap-2">
              <i className={`fas ${getVoiceIcon(voice.id)} ${voice.isSuppressed ? 'text-slate-600' : getVoiceColor(voice.id)} text-xs`}></i>
              <span className={`text-xs font-bold ${voice.isSuppressed ? 'text-slate-600 line-through' : getVoiceColor(voice.id)}`}>
                {voice.name}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Intensity bar */}
              <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getVoiceColor(voice.id).replace('text-', 'bg-')}`}
                  style={{ width: `${voice.currentIntensity}%` }}
                />
              </div>

              {/* Suppress toggle */}
              <button
                onClick={() => onToggleSuppress(voice.id)}
                className={`text-[9px] px-1.5 py-0.5 rounded ${
                  voice.isSuppressed
                    ? 'bg-slate-700 text-slate-400 hover:text-green-400'
                    : 'bg-slate-800 text-slate-500 hover:text-red-400'
                }`}
              >
                {voice.isSuppressed ? 'Unsuppress' : 'Suppress'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InnerMonologue;
