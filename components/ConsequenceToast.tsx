/**
 * ConsequenceToast Component
 *
 * Displays rich feedback for event consequences.
 * Shows stat changes, NPC effects, and narrative outcomes in an engaging format.
 */

import React, { useEffect, useState, useCallback } from 'react';
import type { EventConsequences } from '../types/rpgEvents';

interface ConsequenceToastProps {
  consequences: EventConsequences;
  playerLine?: string;
  immediateResponse?: string;
  epilogue?: string;
  onDismiss: () => void;
  autoDismissMs?: number;
}

// Stat display configuration
const statConfig: Record<string, { icon: string; positive: string; negative: string; label: string }> = {
  reputation: {
    icon: 'fa-star',
    positive: 'text-amber-400',
    negative: 'text-amber-600',
    label: 'Reputation',
  },
  stress: {
    icon: 'fa-brain',
    positive: 'text-green-400', // Stress going down is good
    negative: 'text-red-400',   // Stress going up is bad
    label: 'Stress',
  },
  cash: {
    icon: 'fa-dollar-sign',
    positive: 'text-green-400',
    negative: 'text-red-400',
    label: 'Cash',
  },
  energy: {
    icon: 'fa-bolt',
    positive: 'text-yellow-400',
    negative: 'text-yellow-700',
    label: 'Energy',
  },
  health: {
    icon: 'fa-heart',
    positive: 'text-red-400',
    negative: 'text-red-700',
    label: 'Health',
  },
  analystRating: {
    icon: 'fa-chart-line',
    positive: 'text-blue-400',
    negative: 'text-blue-700',
    label: 'Analyst Rating',
  },
  financialEngineering: {
    icon: 'fa-calculator',
    positive: 'text-purple-400',
    negative: 'text-purple-700',
    label: 'Fin. Engineering',
  },
  ethics: {
    icon: 'fa-balance-scale',
    positive: 'text-emerald-400',
    negative: 'text-emerald-700',
    label: 'Ethics',
  },
  score: {
    icon: 'fa-trophy',
    positive: 'text-gold-400',
    negative: 'text-slate-500',
    label: 'Score',
  },
};

const ConsequenceToast: React.FC<ConsequenceToastProps> = ({
  consequences,
  playerLine,
  immediateResponse,
  epilogue,
  onDismiss,
  autoDismissMs = 12000, // 12 seconds - give players time to read consequences
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    setTimeout(onDismiss, 300); // Wait for animation
  }, [onDismiss]);

  // Auto-dismiss after delay
  useEffect(() => {
    if (autoDismissMs > 0) {
      const timer = setTimeout(handleDismiss, autoDismissMs);
      return () => clearTimeout(timer);
    }
  }, [autoDismissMs, handleDismiss]);

  // Parse stat changes
  const statChanges = Object.entries(consequences.stats || {})
    .filter(([_, value]) => value !== undefined && value !== 0)
    .map(([key, value]) => ({
      key,
      value: value as number,
      config: statConfig[key] || {
        icon: 'fa-circle',
        positive: 'text-green-400',
        negative: 'text-red-400',
        label: key,
      },
    }));

  // Get notification style
  const notificationType = consequences.notification?.type || 'info';
  const notificationStyles: Record<string, string> = {
    success: 'border-emerald-500 bg-emerald-900/30',
    warning: 'border-amber-500 bg-amber-900/30',
    error: 'border-red-500 bg-red-900/30',
    info: 'border-blue-500 bg-blue-900/30',
  };

  return (
    <div
      className={`
        fixed bottom-4 right-4 z-50 max-w-md w-full
        transform transition-all duration-300 ease-out
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
      `}
    >
      <div
        className={`
          rounded-lg border shadow-2xl overflow-hidden
          ${notificationStyles[notificationType]}
        `}
      >
        {/* Header with notification */}
        {consequences.notification && (
          <div className="px-4 py-3 border-b border-slate-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {notificationType === 'success' && <i className="fas fa-check-circle text-emerald-400"></i>}
                {notificationType === 'warning' && <i className="fas fa-exclamation-triangle text-amber-400"></i>}
                {notificationType === 'error' && <i className="fas fa-times-circle text-red-400"></i>}
                {notificationType === 'info' && <i className="fas fa-info-circle text-blue-400"></i>}
                <span className="font-bold text-white">{consequences.notification.title}</span>
              </div>
              <button
                onClick={handleDismiss}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <p className="text-sm text-slate-300 mt-1">{consequences.notification.message}</p>
          </div>
        )}

        {/* Narrative section */}
        {(playerLine || immediateResponse || epilogue) && (
          <div className="px-4 py-3 space-y-2 border-b border-slate-700/50">
            {playerLine && (
              <p className="text-sm text-slate-400">
                <span className="text-cyan-400 font-medium">You:</span> "{playerLine}"
              </p>
            )}
            {immediateResponse && (
              <p className="text-sm text-slate-400">
                {immediateResponse}
              </p>
            )}
            {epilogue && (
              <p className="text-sm italic text-slate-500">
                {epilogue}
              </p>
            )}
          </div>
        )}

        {/* Stat Changes */}
        {statChanges.length > 0 && (
          <div className="px-4 py-3">
            <div className="flex flex-wrap gap-3">
              {statChanges.map(({ key, value, config }) => {
                // For stress, down is good (positive color), up is bad (negative color)
                const isStressReduction = key === 'stress' && value < 0;
                const isPositiveChange = key === 'stress' ? value < 0 : value > 0;
                const colorClass = isPositiveChange ? config.positive : config.negative;

                return (
                  <div
                    key={key}
                    className={`flex items-center gap-1.5 text-sm ${colorClass}`}
                  >
                    <i className={`fas ${config.icon} text-xs`}></i>
                    <span className="font-mono font-bold">
                      {value > 0 ? '+' : ''}{value}
                    </span>
                    <span className="text-xs text-slate-500">{config.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* NPC Effects (collapsed by default) */}
        {consequences.npcEffects && consequences.npcEffects.length > 0 && (
          <div className="px-4 py-2 border-t border-slate-700/50">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1"
            >
              <i className={`fas ${showDetails ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
              {showDetails ? 'Hide' : 'Show'} relationship changes
            </button>
            {showDetails && (
              <div className="mt-2 space-y-1">
                {consequences.npcEffects.map((effect, i) => (
                  <div key={i} className="text-xs flex items-center gap-2">
                    <i className="fas fa-user-circle text-slate-500"></i>
                    <span className="text-slate-400">{effect.npcId}:</span>
                    {effect.relationship && (
                      <span className={effect.relationship > 0 ? 'text-green-400' : 'text-red-400'}>
                        {effect.relationship > 0 ? '+' : ''}{effect.relationship} relationship
                      </span>
                    )}
                    {effect.trust && (
                      <span className={effect.trust > 0 ? 'text-blue-400' : 'text-amber-400'}>
                        {effect.trust > 0 ? '+' : ''}{effect.trust} trust
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Flags set (debug/flavor) */}
        {consequences.setsFlags && consequences.setsFlags.length > 0 && (
          <div className="px-4 py-2 border-t border-slate-700/50">
            <div className="flex flex-wrap gap-1">
              {consequences.setsFlags.map((flag) => (
                <span
                  key={flag}
                  className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-500 rounded"
                >
                  {flag.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Progress bar for auto-dismiss */}
        {autoDismissMs > 0 && (
          <div className="h-1 bg-slate-800">
            <div
              className="h-full bg-slate-600 transition-all ease-linear"
              style={{
                width: '100%',
                animation: `shrink ${autoDismissMs}ms linear forwards`,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Add shrink animation for progress bar
const style = document.createElement('style');
style.textContent = `
  @keyframes shrink {
    from { width: 100%; }
    to { width: 0%; }
  }
`;
if (!document.getElementById('consequence-toast-styles')) {
  style.id = 'consequence-toast-styles';
  document.head.appendChild(style);
}

export default ConsequenceToast;
