/**
 * Crisis Modal
 *
 * THE CHAOS ENGINE — "Market Events That Actually Hurt"
 *
 * Displays cascading crisis events with AI-generated briefings
 * and strategic response options.
 */

import React, { useState } from 'react';
import type { CrisisEvent, CrisisResponse, CrisisSeverity } from '../types/aiBlueprint';

interface CrisisModalProps {
  crisis: CrisisEvent;
  currentWeek: number;
  onRespond: (crisisId: string, responseId: string) => void;
  onDismiss: () => void;
}

const CrisisModal: React.FC<CrisisModalProps> = ({
  crisis,
  currentWeek,
  onRespond,
  onDismiss,
}) => {
  const [selectedResponse, setSelectedResponse] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const weeksRemaining = crisis.originWeek + crisis.playerResponseWindow - currentWeek;
  const isUrgent = weeksRemaining <= 1;

  const getSeverityConfig = (severity: CrisisSeverity) => {
    switch (severity) {
      case 1: return { label: 'LOW', color: 'text-blue-400', bg: 'bg-blue-900/30', border: 'border-blue-700', icon: 'fa-info-circle' };
      case 2: return { label: 'MODERATE', color: 'text-yellow-400', bg: 'bg-yellow-900/30', border: 'border-yellow-700', icon: 'fa-exclamation-circle' };
      case 3: return { label: 'ELEVATED', color: 'text-orange-400', bg: 'bg-orange-900/30', border: 'border-orange-700', icon: 'fa-exclamation-triangle' };
      case 4: return { label: 'SEVERE', color: 'text-red-400', bg: 'bg-red-900/30', border: 'border-red-700', icon: 'fa-radiation' };
      case 5: return { label: 'CRITICAL', color: 'text-red-500', bg: 'bg-red-950/40', border: 'border-red-500', icon: 'fa-skull-crossbones' };
    }
  };

  const severityConfig = getSeverityConfig(crisis.severity);

  const handleConfirm = () => {
    if (selectedResponse) {
      onRespond(crisis.id, selectedResponse);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto border-2 ${severityConfig.border} bg-slate-900 shadow-[0_0_60px_rgba(255,0,0,0.15)]`}>
        {/* Header - Alert Style */}
        <div className={`${severityConfig.bg} px-4 py-3 flex items-center justify-between border-b ${severityConfig.border}`}>
          <div className="flex items-center gap-3">
            <i className={`fas ${severityConfig.icon} ${severityConfig.color} text-lg ${crisis.severity >= 4 ? 'animate-pulse' : ''}`}></i>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] uppercase tracking-widest font-bold ${severityConfig.color}`}>
                  Crisis Alert — Severity {crisis.severity}/5
                </span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded ${severityConfig.bg} ${severityConfig.color} border ${severityConfig.border}`}>
                  {severityConfig.label}
                </span>
              </div>
              <div className="text-slate-400 text-[10px] mt-0.5">
                Sectors: {crisis.affectedSectors.join(', ')}
              </div>
            </div>
          </div>
          <div className={`text-right ${isUrgent ? 'animate-pulse' : ''}`}>
            <div className={`text-xs font-bold ${isUrgent ? 'text-red-400' : 'text-slate-400'}`}>
              {weeksRemaining > 0 ? `${weeksRemaining} week${weeksRemaining > 1 ? 's' : ''} to respond` : 'RESPOND NOW'}
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Headline */}
          <h2 className="text-lg font-bold text-slate-100 mb-4 leading-tight">
            {crisis.headline}
          </h2>

          {/* Briefing */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <i className="fas fa-file-alt text-cyan-400 text-xs"></i>
              <span className="text-[10px] uppercase tracking-widest text-cyan-400 font-bold">Situation Briefing</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {crisis.aiGeneratedBriefing}
            </p>
          </div>

          {/* Immediate Effects */}
          {crisis.immediateEffects.length > 0 && (
            <div className="mb-6">
              <div className="text-[10px] uppercase tracking-widest text-red-400 font-bold mb-2">
                <i className="fas fa-bolt mr-1"></i>Immediate Impact
              </div>
              <div className="space-y-1.5">
                {crisis.immediateEffects.map((effect, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="text-red-400">-</span>
                    <span className="text-slate-300">{effect.description}</span>
                    <span className="text-red-400 text-xs font-mono">({effect.magnitude > 0 ? '+' : ''}{effect.magnitude}%)</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Response Options */}
          <div className="mb-4">
            <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-3">
              <i className="fas fa-chess mr-1"></i>Strategic Response Options
            </div>
            <div className="space-y-3">
              {crisis.possibleResponses.map((response) => (
                <button
                  key={response.id}
                  onClick={() => {
                    setSelectedResponse(response.id);
                    setIsConfirming(true);
                  }}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    selectedResponse === response.id
                      ? 'border-cyan-500 bg-cyan-900/20 shadow-[0_0_20px_rgba(0,255,255,0.1)]'
                      : 'border-slate-700 bg-slate-800/30 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-bold text-sm text-slate-200">{response.label}</div>
                      <div className="text-xs text-slate-400 mt-1">{response.description}</div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      selectedResponse === response.id
                        ? 'border-cyan-400 bg-cyan-400'
                        : 'border-slate-600'
                    }`}>
                      {selectedResponse === response.id && (
                        <i className="fas fa-check text-[8px] text-slate-900"></i>
                      )}
                    </div>
                  </div>

                  {/* Effect preview */}
                  {selectedResponse === response.id && (
                    <div className="mt-3 pt-3 border-t border-slate-700/50">
                      <div className="text-[9px] uppercase tracking-widest text-slate-500 mb-1">Expected Outcomes</div>
                      {response.effects.map((effect, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <span className={effect.magnitude > 0 ? 'text-emerald-400' : 'text-red-400'}>
                            {effect.magnitude > 0 ? '+' : ''}{effect.magnitude}%
                          </span>
                          <span className="text-slate-400">{effect.description}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Cascade warning */}
          {crisis.cascadesInto && crisis.cascadesInto.length > 0 && (
            <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2">
                <i className="fas fa-exclamation-triangle text-amber-400 text-xs"></i>
                <span className="text-[10px] text-amber-400 font-bold uppercase">Warning</span>
              </div>
              <p className="text-xs text-amber-300/70 mt-1">
                This crisis may trigger follow-on events. Your response will shape the cascade.
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 mt-6">
            {!isConfirming ? (
              <button
                onClick={onDismiss}
                className="flex-1 bg-slate-800 text-slate-400 py-2.5 rounded-lg hover:bg-slate-700 text-sm transition-colors"
              >
                Review Later
              </button>
            ) : (
              <>
                <button
                  onClick={() => setIsConfirming(false)}
                  className="flex-1 bg-slate-800 text-slate-400 py-2.5 rounded-lg hover:bg-slate-700 text-sm transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!selectedResponse}
                  className="flex-1 bg-cyan-700 text-white py-2.5 rounded-lg hover:bg-cyan-600 disabled:bg-slate-700 disabled:text-slate-500 text-sm font-bold transition-colors"
                >
                  Confirm Response
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrisisModal;
