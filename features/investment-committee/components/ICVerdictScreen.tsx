/**
 * IC Verdict Screen Component
 *
 * Displays the final IC decision and feedback.
 */

import React from 'react';
import type { ICVerdict, ICPartner, ICOutcome } from '../types/icTypes';

interface ICVerdictScreenProps {
  verdict: ICVerdict;
  partners: ICPartner[];
  onAccept: () => void;
  onPushBack?: () => void;
}

const outcomeConfig: Record<ICOutcome, { label: string; color: string; icon: string; bg: string }> = {
  APPROVED: {
    label: 'APPROVED',
    color: 'text-emerald-400',
    icon: 'fa-check-circle',
    bg: 'bg-emerald-950/30 border-emerald-500/50',
  },
  CONDITIONALLY_APPROVED: {
    label: 'CONDITIONALLY APPROVED',
    color: 'text-amber-400',
    icon: 'fa-exclamation-circle',
    bg: 'bg-amber-950/30 border-amber-500/50',
  },
  TABLED: {
    label: 'TABLED',
    color: 'text-slate-400',
    icon: 'fa-pause-circle',
    bg: 'bg-slate-800/50 border-slate-500/50',
  },
  REJECTED: {
    label: 'REJECTED',
    color: 'text-red-400',
    icon: 'fa-times-circle',
    bg: 'bg-red-950/30 border-red-500/50',
  },
};

const voteConfig: Record<string, { color: string; icon: string }> = {
  YES: { color: 'text-emerald-400', icon: 'fa-check' },
  CONDITIONAL: { color: 'text-amber-400', icon: 'fa-question' },
  NO: { color: 'text-red-400', icon: 'fa-times' },
};

export const ICVerdictScreen: React.FC<ICVerdictScreenProps> = ({
  verdict,
  partners,
  onAccept,
  onPushBack,
}) => {
  const config = outcomeConfig[verdict.outcome];

  const getPartner = (partnerId: string): ICPartner | undefined => {
    return partners.find((p) => p.id === partnerId);
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className={`p-6 text-center border-b ${config.bg}`}>
        <div className="text-4xl mb-3">
          <i className={`fas ${config.icon} ${config.color}`} />
        </div>
        <h2 className={`text-2xl font-bold uppercase tracking-widest ${config.color}`}>
          {config.label}
        </h2>
        <p className="text-sm text-slate-400 mt-2">Investment Committee Decision</p>
      </div>

      {/* Partner Votes */}
      <div className="p-4 border-b border-slate-700/50">
        <h3 className="text-[11px] uppercase tracking-widest text-slate-500 font-bold mb-3">
          Partner Votes
        </h3>
        <div className="space-y-3">
          {verdict.partnerVotes.map((vote) => {
            const partner = getPartner(vote.partnerId);
            const voteStyle = voteConfig[vote.vote];

            return (
              <div
                key={vote.partnerId}
                className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/30"
              >
                <div className="text-xl">{partner?.avatar || '👤'}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-slate-200">
                      {vote.partnerName}
                    </span>
                    <span className={`flex items-center gap-1 text-xs ${voteStyle.color}`}>
                      <i className={`fas ${voteStyle.icon}`} />
                      {vote.vote}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    "{vote.reasoning}"
                  </p>
                  {vote.respectChange !== 0 && (
                    <div className={`mt-1 text-[10px] ${vote.respectChange > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {vote.respectChange > 0 ? '+' : ''}{vote.respectChange} Respect
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Conditions (if any) */}
      {verdict.conditions && verdict.conditions.length > 0 && (
        <div className="p-4 border-b border-slate-700/50">
          <h3 className="text-[11px] uppercase tracking-widest text-amber-500 font-bold mb-3 flex items-center gap-2">
            <i className="fas fa-list-check" />
            Conditions
          </h3>
          <ul className="space-y-2">
            {verdict.conditions.map((condition, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-sm text-slate-300"
              >
                <i className="fas fa-circle text-[6px] text-amber-500 mt-1.5" />
                {condition}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Feedback */}
      <div className="p-4 border-b border-slate-700/50">
        <h3 className="text-[11px] uppercase tracking-widest text-slate-500 font-bold mb-3">
          Feedback
        </h3>

        {/* Strengths */}
        {verdict.feedback.strengths.length > 0 && (
          <div className="mb-3">
            <div className="text-[10px] text-emerald-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <i className="fas fa-check" />
              Strengths
            </div>
            <ul className="space-y-1">
              {verdict.feedback.strengths.map((s, idx) => (
                <li key={idx} className="text-xs text-slate-300">• {s}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Weaknesses */}
        {verdict.feedback.weaknesses.length > 0 && (
          <div className="mb-3">
            <div className="text-[10px] text-red-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <i className="fas fa-times" />
              Areas to Improve
            </div>
            <ul className="space-y-1">
              {verdict.feedback.weaknesses.map((w, idx) => (
                <li key={idx} className="text-xs text-slate-300">• {w}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Specific Advice */}
        <div className="mt-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
          <div className="text-[10px] text-amber-500 uppercase tracking-wider mb-1 flex items-center gap-1">
            <i className="fas fa-lightbulb" />
            Advice
          </div>
          <p className="text-sm text-slate-300 italic">"{verdict.feedback.specificAdvice}"</p>
        </div>
      </div>

      {/* Consequences */}
      <div className="p-4 border-b border-slate-700/50">
        <h3 className="text-[11px] uppercase tracking-widest text-slate-500 font-bold mb-3">
          Consequences
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
            <div className="text-[10px] text-slate-500 uppercase mb-1">Deal Outcome</div>
            <div className={`text-sm font-bold ${
              verdict.consequences.dealOutcome === 'PROCEED' ? 'text-emerald-400' :
              verdict.consequences.dealOutcome === 'RENEGOTIATE' ? 'text-amber-400' :
              'text-red-400'
            }`}>
              {verdict.consequences.dealOutcome}
            </div>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
            <div className="text-[10px] text-slate-500 uppercase mb-1">Reputation</div>
            <div className={`text-sm font-bold ${
              verdict.consequences.reputationChange > 0 ? 'text-emerald-400' :
              verdict.consequences.reputationChange < 0 ? 'text-red-400' :
              'text-slate-400'
            }`}>
              {verdict.consequences.reputationChange > 0 ? '+' : ''}
              {verdict.consequences.reputationChange}
            </div>
          </div>
        </div>

        {/* Skill Points */}
        {Object.keys(verdict.consequences.skillPointsEarned).length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(verdict.consequences.skillPointsEarned).map(([skill, points]) => (
              points > 0 && (
                <div
                  key={skill}
                  className="px-2 py-1 bg-emerald-950/30 border border-emerald-700/30 rounded text-[10px] text-emerald-400"
                >
                  +{points} {skill}
                </div>
              )
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 flex gap-3 justify-center">
        <button
          onClick={onAccept}
          className="px-6 py-3 rounded-lg uppercase tracking-widest text-xs font-bold border border-emerald-500/70 text-emerald-400 bg-emerald-950/30 hover:bg-emerald-900/50 transition-colors"
        >
          <i className="fas fa-check mr-2" />
          Accept Decision
        </button>
        {onPushBack && verdict.outcome !== 'APPROVED' && (
          <button
            onClick={onPushBack}
            className="px-6 py-3 rounded-lg uppercase tracking-widest text-xs font-bold border border-slate-600 text-slate-400 bg-slate-800/30 hover:bg-slate-700/50 transition-colors"
          >
            <i className="fas fa-comment mr-2" />
            Push Back
          </button>
        )}
      </div>
    </div>
  );
};

export default ICVerdictScreen;
