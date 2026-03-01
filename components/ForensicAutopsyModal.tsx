/**
 * Forensic Autopsy Modal
 *
 * "CSI: Private Equity"
 *
 * Interactive deal investigation where the player defends their decisions
 * before a risk committee. Includes evidence pinning and phased questioning.
 */

import React, { useState } from 'react';
import type { ForensicAutopsy, EvidenceItem, ForensicExaminer } from '../types/aiBlueprint';

interface ForensicAutopsyModalProps {
  autopsy: ForensicAutopsy;
  onPinEvidence: (evidenceId: string) => void;
  onUnpinEvidence: (evidenceId: string) => void;
  onSubmitDefense: (question: string, response: string) => void;
  onClose: () => void;
}

const ForensicAutopsyModal: React.FC<ForensicAutopsyModalProps> = ({
  autopsy,
  onPinEvidence,
  onUnpinEvidence,
  onSubmitDefense,
  onClose,
}) => {
  const [activeView, setActiveView] = useState<'evidence' | 'committee'>('evidence');
  const [defenseInput, setDefenseInput] = useState('');

  const currentPhase = autopsy.phases[autopsy.currentPhase];
  const isPrepPhase = activeView === 'evidence';

  const getCategoryIcon = (category: EvidenceItem['category']) => {
    switch (category) {
      case 'financial': return 'fa-chart-bar';
      case 'operational': return 'fa-cogs';
      case 'market': return 'fa-globe';
      case 'management': return 'fa-users';
      case 'strategic': return 'fa-chess';
    }
  };

  const getCategoryColor = (category: EvidenceItem['category']) => {
    switch (category) {
      case 'financial': return 'text-cyan-400';
      case 'operational': return 'text-green-400';
      case 'market': return 'text-purple-400';
      case 'management': return 'text-amber-400';
      case 'strategic': return 'text-blue-400';
    }
  };

  const getStrengthBadge = (strength: EvidenceItem['strength']) => {
    switch (strength) {
      case 'strong': return <span className="text-[8px] bg-emerald-900/50 text-emerald-400 px-1 py-0.5 rounded">STRONG</span>;
      case 'moderate': return <span className="text-[8px] bg-yellow-900/50 text-yellow-400 px-1 py-0.5 rounded">MODERATE</span>;
      case 'weak': return <span className="text-[8px] bg-red-900/50 text-red-400 px-1 py-0.5 rounded">WEAK</span>;
    }
  };

  const getPhaseLabel = (phase: string) => {
    switch (phase) {
      case 'timeline_review': return 'Timeline Review';
      case 'numbers_drill': return 'Numbers Drill';
      case 'judgment_call': return 'Judgment Call';
      case 'verdict': return 'Verdict';
      default: return phase;
    }
  };

  const getVerdictConfig = (verdict: ForensicAutopsy['finalVerdict']) => {
    switch (verdict) {
      case 'vindicated': return { label: 'VINDICATED', color: 'text-emerald-400', bg: 'bg-emerald-900/30', icon: 'fa-trophy' };
      case 'warned': return { label: 'FORMALLY WARNED', color: 'text-yellow-400', bg: 'bg-yellow-900/30', icon: 'fa-exclamation-triangle' };
      case 'demoted': return { label: 'DEMOTED', color: 'text-red-400', bg: 'bg-red-900/30', icon: 'fa-arrow-down' };
      case 'fired': return { label: 'TERMINATED', color: 'text-red-500', bg: 'bg-red-950/40', icon: 'fa-skull' };
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto border-2 border-amber-600 bg-slate-900 shadow-[0_0_50px_rgba(217,119,6,0.15)]">
        {/* Header */}
        <div className="bg-amber-900/30 px-4 py-3 flex items-center justify-between border-b border-amber-700">
          <div className="flex items-center gap-3">
            <i className="fas fa-gavel text-amber-400"></i>
            <div>
              <span className="font-bold text-amber-200">FORENSIC DEAL AUTOPSY</span>
              <div className="text-[10px] text-amber-400/60">Risk Committee Review — Confidential</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Phase indicators */}
            <div className="flex gap-1">
              {autopsy.phases.map((phase, i) => (
                <div
                  key={phase}
                  className={`w-2 h-2 rounded-full ${
                    i < autopsy.currentPhase ? 'bg-emerald-500'
                    : i === autopsy.currentPhase ? 'bg-amber-400 animate-pulse'
                    : 'bg-slate-700'
                  }`}
                  title={getPhaseLabel(phase)}
                />
              ))}
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        {/* Verdict display */}
        {autopsy.finalVerdict && (
          <div className={`${getVerdictConfig(autopsy.finalVerdict)?.bg} p-6 text-center border-b border-slate-700`}>
            <i className={`fas ${getVerdictConfig(autopsy.finalVerdict)?.icon} text-3xl ${getVerdictConfig(autopsy.finalVerdict)?.color} mb-2`}></i>
            <div className={`text-2xl font-bold ${getVerdictConfig(autopsy.finalVerdict)?.color}`}>
              {getVerdictConfig(autopsy.finalVerdict)?.label}
            </div>
            <div className="text-sm text-slate-400 mt-2">
              The committee has reached its decision.
            </div>
          </div>
        )}

        {/* Tab navigation */}
        {!autopsy.finalVerdict && (
          <div className="flex border-b border-slate-700">
            <button
              onClick={() => setActiveView('evidence')}
              className={`flex-1 px-4 py-2 text-sm ${activeView === 'evidence' ? 'bg-slate-800 text-amber-400 border-b-2 border-amber-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <i className="fas fa-file-alt mr-2"></i>
              Evidence Board ({autopsy.pinnedEvidence.length}/3 pinned)
            </button>
            <button
              onClick={() => setActiveView('committee')}
              className={`flex-1 px-4 py-2 text-sm ${activeView === 'committee' ? 'bg-slate-800 text-amber-400 border-b-2 border-amber-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <i className="fas fa-users mr-2"></i>
              Committee Room — {getPhaseLabel(currentPhase || 'timeline_review')}
            </button>
          </div>
        )}

        <div className="p-6">
          {/* Evidence Board */}
          {activeView === 'evidence' && !autopsy.finalVerdict && (
            <div>
              <div className="text-sm text-slate-400 mb-4">
                Review the evidence below and <span className="text-amber-400 font-bold">pin up to 3 items</span> to bring into the committee meeting.
                Choose wisely — the wrong evidence makes you look unprepared.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {autopsy.evidence.map(item => {
                  const isPinned = autopsy.pinnedEvidence.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        isPinned
                          ? 'border-amber-500 bg-amber-900/20 shadow-[0_0_15px_rgba(217,119,6,0.1)]'
                          : 'border-slate-700 bg-slate-800/30 hover:border-slate-500'
                      }`}
                      onClick={() => isPinned ? onUnpinEvidence(item.id) : onPinEvidence(item.id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <i className={`fas ${getCategoryIcon(item.category)} ${getCategoryColor(item.category)} text-xs`}></i>
                          <span className="text-xs font-bold text-slate-300">{item.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStrengthBadge(item.strength)}
                          {isPinned && <i className="fas fa-thumbtack text-amber-400 text-xs"></i>}
                        </div>
                      </div>
                      <p className="text-xs text-slate-400">{item.description}</p>
                      {item.data && (
                        <div className="mt-1.5 text-[10px] text-cyan-400 font-mono bg-slate-900/50 px-2 py-1 rounded">
                          {item.data}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setActiveView('committee')}
                  className="bg-amber-700 text-white px-6 py-2 rounded text-sm font-bold hover:bg-amber-600 transition-colors"
                >
                  Enter Committee Room <i className="fas fa-arrow-right ml-2"></i>
                </button>
              </div>
            </div>
          )}

          {/* Committee Room */}
          {activeView === 'committee' && !autopsy.finalVerdict && (
            <div>
              {/* Committee members */}
              <div className="flex gap-4 mb-6">
                {autopsy.committeeMembers.map(member => (
                  <div key={member.name} className="flex-1 bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-center">
                    <div className="w-10 h-10 rounded-full bg-slate-700 mx-auto mb-2 flex items-center justify-center">
                      <i className="fas fa-user text-slate-400"></i>
                    </div>
                    <div className="text-xs font-bold text-slate-300">{member.name}</div>
                    <div className="text-[9px] text-slate-500">{member.role}</div>
                    <div className="mt-2 w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          member.satisfactionScore > 70 ? 'bg-emerald-500' :
                          member.satisfactionScore > 40 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${member.satisfactionScore}%` }}
                      />
                    </div>
                    <div className="text-[9px] text-slate-600 mt-1">{member.satisfactionScore}% satisfied</div>
                  </div>
                ))}
              </div>

              {/* Current phase label */}
              <div className="bg-slate-800/50 border border-slate-700 rounded p-2 mb-4 text-center">
                <span className="text-[10px] uppercase tracking-widest text-amber-400 font-bold">
                  Phase: {getPhaseLabel(currentPhase)}
                </span>
              </div>

              {/* Defense log */}
              {autopsy.playerDefenseLog.length > 0 && (
                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                  {autopsy.playerDefenseLog.map((entry, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex items-start gap-2">
                        <i className="fas fa-user text-amber-400 text-xs mt-1"></i>
                        <p className="text-sm text-amber-300">"{entry.question}"</p>
                      </div>
                      <div className="flex items-start gap-2 ml-4">
                        <i className="fas fa-reply text-cyan-400 text-xs mt-1"></i>
                        <p className="text-sm text-slate-300">{entry.response}</p>
                      </div>
                      <div className="ml-4 text-[10px] text-slate-600">
                        Score: {entry.score > 0 ? '+' : ''}{entry.score}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Defense input */}
              <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
                <div className="text-xs text-slate-400 mb-2">
                  <i className="fas fa-microphone mr-1 text-cyan-400"></i>
                  The committee awaits your response. Type your defense below.
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={defenseInput}
                    onChange={(e) => setDefenseInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && defenseInput.trim()) {
                        onSubmitDefense(currentPhase, defenseInput.trim());
                        setDefenseInput('');
                      }
                    }}
                    placeholder="Defend your investment thesis..."
                    className="flex-1 bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    onClick={() => {
                      if (defenseInput.trim()) {
                        onSubmitDefense(currentPhase, defenseInput.trim());
                        setDefenseInput('');
                      }
                    }}
                    disabled={!defenseInput.trim()}
                    className="bg-cyan-700 text-white px-4 py-2 rounded text-sm hover:bg-cyan-600 disabled:bg-slate-700 disabled:text-slate-500 transition-colors"
                  >
                    Respond
                  </button>
                </div>

                {/* Pinned evidence reminder */}
                {autopsy.pinnedEvidence.length > 0 && (
                  <div className="mt-3 flex gap-2 flex-wrap">
                    <span className="text-[9px] text-slate-500">Pinned evidence:</span>
                    {autopsy.pinnedEvidence.map(id => {
                      const evidence = autopsy.evidence.find(e => e.id === id);
                      return evidence ? (
                        <span key={id} className="text-[9px] bg-amber-900/30 text-amber-400 px-1.5 py-0.5 rounded border border-amber-800/50">
                          {evidence.title}
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForensicAutopsyModal;
