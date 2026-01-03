import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Z_INDEX } from '../constants/zIndex';

interface StatChange {
  stat: string;
  before: number;
  after: number;
  label: string;
}

interface ConsequenceDisplayProps {
  title: string;
  narrative?: string;
  changes: StatChange[];
  onDismiss: () => void;
  autoDismissMs?: number;
}

export const ConsequenceDisplay: React.FC<ConsequenceDisplayProps> = ({
  title,
  narrative,
  changes,
  onDismiss,
  autoDismissMs = 10000, // 10 seconds - give players time to read
}) => {
  const [visible, setVisible] = useState(true);
  const [animatingChanges, setAnimatingChanges] = useState<number[]>([]);

  useEffect(() => {
    // Stagger the stat change animations
    changes.forEach((_, idx) => {
      setTimeout(() => {
        setAnimatingChanges(prev => [...prev, idx]);
      }, idx * 100 + 200);
    });

    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300); // Wait for exit animation
    }, autoDismissMs);

    return () => clearTimeout(timer);
  }, [autoDismissMs, onDismiss, changes.length]);

  if (!visible) {
    return null;
  }

  const content = (
    <div
      className="fixed bottom-20 left-1/2 -translate-x-1/2 animate-fade-in"
      style={{ zIndex: Z_INDEX.toast }}
      onClick={() => {
        setVisible(false);
        setTimeout(onDismiss, 200);
      }}
    >
      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl shadow-black/50 p-4 min-w-[300px] max-w-[400px] cursor-pointer hover:border-slate-600 transition-colors">
        {/* Title */}
        <div className="text-sm font-bold text-green-400 mb-2 flex items-center gap-2">
          <i className="fas fa-check-circle"></i>
          {title}
        </div>

        {/* Narrative */}
        {narrative && (
          <p className="text-xs text-slate-300 italic mb-3 leading-relaxed">{narrative}</p>
        )}

        {/* Stat Changes */}
        {changes.length > 0 && (
          <div className="space-y-1.5 border-t border-slate-700/50 pt-3">
            {changes.map((change, idx) => {
              const delta = change.after - change.before;
              const isPositive = delta > 0;
              const isAnimated = animatingChanges.includes(idx);

              return (
                <div
                  key={`${change.stat}-${idx}`}
                  className={`flex items-center justify-between text-xs transition-all duration-300 ${
                    isAnimated ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                  }`}
                >
                  <span className="text-slate-400">{change.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 tabular-nums">{change.before}</span>
                    <span className="text-slate-600">&rarr;</span>
                    <span
                      className={`font-bold tabular-nums ${
                        isPositive ? 'text-green-400' : 'text-red-400'
                      } ${isAnimated ? 'scale-110' : 'scale-100'} transition-transform`}
                    >
                      {change.after}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded ${
                        isPositive
                          ? 'bg-green-900/50 text-green-400'
                          : 'bg-red-900/50 text-red-400'
                      }`}
                    >
                      {isPositive ? '+' : ''}
                      {delta}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Dismiss hint */}
        <div className="text-[10px] text-slate-600 mt-3 text-center">
          Click to dismiss
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export default ConsequenceDisplay;
