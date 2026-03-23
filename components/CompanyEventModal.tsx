import React from 'react';
import type { CompanyActiveEvent, PlayerStats } from '../types';
import { Z_INDEX } from '../constants';

interface CompanyEventModalProps {
  event: CompanyActiveEvent;
  playerStats: PlayerStats;
  onDecide: (eventId: string, optionId: string) => void;
  onConsultMachiavelli: (event: CompanyActiveEvent) => void;
  useAction: (cost: number) => boolean;
  addToast: (msg: string, type: 'error' | 'success' | 'info') => void;
  addLogEntry: (msg: string) => void;
}

const CompanyEventModal: React.FC<CompanyEventModalProps> = ({
  event,
  playerStats,
  onDecide,
  onConsultMachiavelli,
  useAction,
  addToast,
  addLogEntry,
}) => {
  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      style={{ zIndex: Z_INDEX.modalOverlay }}
    >
      <div className="w-full max-w-lg bg-slate-900 border border-amber-500/50 rounded-lg shadow-2xl">
        <div className="p-4 border-b border-amber-500/30 bg-amber-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <i className="fas fa-exclamation-triangle text-amber-400"></i>
            </div>
            <div>
              <div className="text-xs text-amber-400/70 uppercase tracking-wider">Company Event (1 AP)</div>
              <div className="text-lg font-bold text-white">{event.title}</div>
            </div>
          </div>
        </div>
        <div className="p-4">
          <p className="text-sm text-slate-300 mb-4">{event.description}</p>
          {(playerStats?.gameTime?.actionsRemaining || 0) < 1 && (
            <div className="bg-red-950/50 border border-red-800/50 p-3 rounded mb-4">
              <div className="text-red-400 text-sm font-bold">No AP remaining</div>
              <div className="text-red-400/70 text-xs">Advance time to get more actions</div>
            </div>
          )}
          <div className="space-y-2">
            {event.options.map((option, idx) => {
              const riskLevel = (option.risk || 0) >= 60 ? 'high' : (option.risk || 0) >= 30 ? 'medium' : 'low';
              const riskPercent = option.risk || 0;
              return (
                <button
                  key={idx}
                  disabled={(playerStats?.gameTime?.actionsRemaining || 0) < 1}
                  onClick={() => {
                    if (!useAction(1)) {
                      addToast('Not enough AP this week.', 'error');
                      return;
                    }
                    onDecide(event.id, option.id);
                    addToast(`DECISION: ${option.label} — ${option.outcomeText}`, riskLevel === 'high' ? 'error' : 'success');
                    addLogEntry(`EVENT: ${event.title} - Chose: ${option.label}`);
                  }}
                  className={`w-full text-left p-3 border rounded transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                    riskLevel === 'high'
                      ? 'border-red-500/50 hover:border-red-400 hover:bg-red-900/20'
                      : riskLevel === 'medium'
                      ? 'border-amber-500/50 hover:border-amber-400 hover:bg-amber-900/20'
                      : 'border-green-500/50 hover:border-green-400 hover:bg-green-900/20'
                  }`}
                >
                  <div className="text-sm font-bold text-white">{option.label}</div>
                  <div className="text-xs text-slate-400 mt-1">{option.description}</div>
                  <div className={`text-[10px] mt-1 ${
                    riskLevel === 'high' ? 'text-red-400' : riskLevel === 'medium' ? 'text-amber-400' : 'text-green-400'
                  }`}>
                    Risk: {riskPercent}% ({riskLevel.toUpperCase()})
                  </div>
                </button>
              );
            })}
          </div>
          <button
            onClick={() => onConsultMachiavelli(event)}
            className="w-full mt-4 p-3 border border-purple-500/50 hover:border-purple-400 hover:bg-purple-900/20 rounded text-purple-400 text-sm flex items-center justify-center gap-2"
          >
            <i className="fas fa-user-secret"></i>
            Consult Machiavelli (Free)
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyEventModal;
