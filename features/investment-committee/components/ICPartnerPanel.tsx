/**
 * IC Partner Panel Component
 *
 * Displays IC partners with their current mood/status.
 */

import React from 'react';
import type { ICPartner, PartnerMood } from '../types/icTypes';

interface ICPartnerPanelProps {
  partners: ICPartner[];
  partnerMoods: Record<string, PartnerMood>;
  currentPartnerId?: string;
  votes?: Record<string, 'YES' | 'CONDITIONAL' | 'NO'>;
}

const moodToColor: Record<PartnerMood, string> = {
  NEUTRAL: 'text-slate-400 border-slate-600',
  SKEPTICAL: 'text-amber-400 border-amber-600',
  INTERESTED: 'text-emerald-400 border-emerald-600',
  IMPRESSED: 'text-emerald-300 border-emerald-500',
  CONCERNED: 'text-orange-400 border-orange-600',
  HOSTILE: 'text-red-400 border-red-600',
};

const moodToDescription: Record<PartnerMood, string> = {
  NEUTRAL: 'Waiting',
  SKEPTICAL: 'Skeptical',
  INTERESTED: 'Interested',
  IMPRESSED: 'Impressed',
  CONCERNED: 'Concerned',
  HOSTILE: 'Hostile',
};

const voteToIcon: Record<string, { icon: string; color: string }> = {
  YES: { icon: 'fa-check', color: 'text-emerald-400' },
  CONDITIONAL: { icon: 'fa-question', color: 'text-amber-400' },
  NO: { icon: 'fa-times', color: 'text-red-400' },
};

export const ICPartnerPanel: React.FC<ICPartnerPanelProps> = ({
  partners,
  partnerMoods,
  currentPartnerId,
  votes,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {partners.map((partner) => {
        const mood = partnerMoods[partner.id] || 'NEUTRAL';
        const isActive = partner.id === currentPartnerId;
        const vote = votes?.[partner.id];
        const voteInfo = vote ? voteToIcon[vote] : null;

        return (
          <div
            key={partner.id}
            className={`
              relative p-3 rounded-lg border transition-all duration-300
              ${moodToColor[mood]}
              ${isActive ? 'ring-2 ring-amber-500 bg-slate-800/80' : 'bg-slate-900/50'}
            `}
          >
            {/* Active indicator */}
            {isActive && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full animate-pulse" />
            )}

            {/* Vote badge */}
            {voteInfo && (
              <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center ${voteInfo.color}`}>
                <i className={`fas ${voteInfo.icon} text-xs`} />
              </div>
            )}

            {/* Avatar */}
            <div className="text-2xl mb-2">{partner.avatar}</div>

            {/* Name & Role */}
            <div className="text-xs font-bold truncate">{partner.name}</div>
            <div className="text-[10px] text-slate-500 truncate">{partner.nickname}</div>

            {/* Mood indicator */}
            <div className="mt-2 text-[9px] uppercase tracking-wider opacity-70">
              {moodToDescription[mood]}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ICPartnerPanel;
