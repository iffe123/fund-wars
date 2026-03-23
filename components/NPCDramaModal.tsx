import React from 'react';
import type { NPCDrama, Choice, PlayerStats, StatChanges } from '../types';
import { Z_INDEX } from '../constants';

interface NPCDramaModalProps {
  drama: NPCDrama;
  playerStats: PlayerStats;
  onResolve: (choice: Choice) => void;
  onConsultMachiavelli: (drama: NPCDrama) => void;
  useAction: (cost: number) => boolean;
  updatePlayerStats: (changes: StatChanges) => void;
  addToast: (msg: string, type: 'error' | 'success' | 'info') => void;
  addLogEntry: (msg: string) => void;
}

const NPCDramaModal: React.FC<NPCDramaModalProps> = ({
  drama,
  playerStats,
  onResolve,
  onConsultMachiavelli,
  useAction,
  updatePlayerStats,
  addToast,
  addLogEntry,
}) => {
  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      style={{ zIndex: Z_INDEX.modalOverlay }}
    >
      <div className="w-full max-w-lg bg-slate-900 border border-purple-500/50 rounded-lg shadow-2xl">
        <div className="p-4 border-b border-purple-500/30 bg-purple-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
              <i className="fas fa-theater-masks text-purple-400"></i>
            </div>
            <div>
              <div className="text-xs text-purple-400/70 uppercase tracking-wider">Office Drama (1 AP)</div>
              <div className="text-lg font-bold text-white">{drama.title}</div>
            </div>
          </div>
        </div>
        <div className="p-4">
          <p className="text-sm text-slate-300 mb-4">{drama.description}</p>
          {drama.involvedNpcs && drama.involvedNpcs.length > 0 && (
            <div className="text-xs text-slate-500 mb-3">
              <i className="fas fa-users mr-1"></i>
              Involved: {drama.involvedNpcs.join(', ')}
            </div>
          )}
          {(playerStats?.gameTime?.actionsRemaining || 0) < 1 && (
            <div className="bg-red-950/50 border border-red-800/50 p-3 rounded mb-4">
              <div className="text-red-400 text-sm font-bold">No AP remaining</div>
              <div className="text-red-400/70 text-xs">Advance time to get more actions</div>
            </div>
          )}
          <div className="space-y-2">
            {drama.choices.map((choice, idx) => (
              <button
                key={idx}
                disabled={(playerStats?.gameTime?.actionsRemaining || 0) < 1}
                onClick={() => {
                  if (!useAction(1)) {
                    addToast('Not enough AP this week.', 'error');
                    return;
                  }
                  updatePlayerStats(choice.outcome.statChanges);
                  if (choice.outcome.npcEffects) {
                    choice.outcome.npcEffects.forEach(effect => {
                      updatePlayerStats({
                        npcRelationshipUpdate: {
                          npcId: effect.npcId,
                          change: effect.relationshipChange,
                          memory: `Drama: ${drama.title} - ${choice.text}`
                        }
                      });
                    });
                  }
                  onResolve(choice);
                  addToast(`DECISION: ${choice.text} — ${choice.outcome.description}`, 'info');
                  addLogEntry(`DRAMA: ${drama.title} - Chose: ${choice.text}`);
                }}
                className="w-full text-left p-3 border border-slate-600 hover:border-purple-400 hover:bg-purple-900/10 rounded transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <div className="text-sm font-bold text-white">{choice.text}</div>
                {choice.description && (
                  <div className="text-xs text-slate-400 mt-1">{choice.description}</div>
                )}
                <div className="text-[10px] text-cyan-500 mt-1">(1 AP)</div>
              </button>
            ))}
          </div>
          <button
            onClick={() => onConsultMachiavelli(drama)}
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

export default NPCDramaModal;
