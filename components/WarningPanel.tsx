import React, { useState } from 'react';
import type { Warning } from '../types';
import { Z_INDEX } from '../constants/zIndex';

interface WarningPanelProps {
  warnings: Warning[];
  onDismiss: (id: string) => void;
  onAction: (warning: Warning) => void;
}

// Limit visible warnings to prevent UI blocking
const MAX_VISIBLE_WARNINGS = 2;

/**
 * WarningPanel Component
 *
 * Displays warning notifications for critical player state issues:
 * - Low cash
 * - Low health
 * - High stress
 * - Portfolio company crises
 * - Approaching deadlines
 * - Loan burden
 *
 * Now with smart stacking: shows max 2 warnings at a time with
 * expand/collapse and dismiss all functionality.
 */
const WarningPanel: React.FC<WarningPanelProps> = ({ warnings, onDismiss, onAction }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (warnings.length === 0) return null;

  const getSeverityStyle = (severity: Warning['severity']) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-900/80 border-red-500 animate-pulse';
      case 'HIGH':
        return 'bg-amber-900/70 border-amber-500';
      case 'MEDIUM':
        return 'bg-yellow-900/50 border-yellow-600';
      case 'LOW':
        return 'bg-slate-800 border-slate-600';
    }
  };

  const getIcon = (type: Warning['type']) => {
    switch (type) {
      case 'CASH':
        return 'fa-wallet';
      case 'HEALTH':
        return 'fa-heart-pulse';
      case 'STRESS':
        return 'fa-brain';
      case 'REPUTATION':
        return 'fa-star';
      case 'PORTFOLIO':
        return 'fa-briefcase';
      case 'LOAN':
        return 'fa-hand-holding-dollar';
      case 'DEADLINE':
        return 'fa-clock';
    }
  };

  const getSeverityLabel = (severity: Warning['severity']) => {
    switch (severity) {
      case 'CRITICAL':
        return 'CRITICAL';
      case 'HIGH':
        return 'URGENT';
      case 'MEDIUM':
        return 'WARNING';
      case 'LOW':
        return 'INFO';
    }
  };

  // Sort warnings by severity (critical first)
  const sortedWarnings = [...warnings].sort((a, b) => {
    const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  // Determine visible warnings based on expanded state
  const visibleWarnings = isExpanded ? sortedWarnings : sortedWarnings.slice(0, MAX_VISIBLE_WARNINGS);
  const hiddenCount = sortedWarnings.length - visibleWarnings.length;
  const hasHiddenWarnings = hiddenCount > 0;

  // Dismiss all warnings
  const handleDismissAll = () => {
    warnings.forEach(w => onDismiss(w.id));
  };

  return (
    <div
      className="fixed top-16 right-4 space-y-2 max-w-sm"
      style={{ zIndex: Z_INDEX.toast }} // Below tutorial (140) but above most content
    >
      {/* Header with counts when multiple warnings */}
      {warnings.length > 1 && (
        <div className="flex items-center justify-between bg-slate-900/90 border border-slate-700 rounded-lg px-3 py-2 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <i className="fas fa-exclamation-triangle text-amber-400"></i>
            <span className="text-xs font-bold text-slate-200">
              {warnings.length} Active Warning{warnings.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {hasHiddenWarnings && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs text-cyan-400 hover:text-cyan-300 px-2 py-1 rounded hover:bg-slate-800 transition-colors"
              >
                {isExpanded ? 'Collapse' : `Show ${hiddenCount} more`}
              </button>
            )}
            <button
              onClick={handleDismissAll}
              className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-slate-800 transition-colors"
              title="Dismiss all warnings"
            >
              <i className="fas fa-times-circle mr-1"></i>
              Dismiss All
            </button>
          </div>
        </div>
      )}

      {/* Warning cards */}
      {visibleWarnings.map(warning => (
        <div
          key={warning.id}
          className={`border rounded-lg p-3 shadow-lg backdrop-blur-sm ${getSeverityStyle(warning.severity)}`}
        >
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="flex-shrink-0">
              <i className={`fas ${getIcon(warning.type)} text-lg mt-1`}></i>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Header with title and severity badge */}
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-sm truncate">{warning.title}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                    warning.severity === 'CRITICAL'
                      ? 'bg-red-500 text-white'
                      : warning.severity === 'HIGH'
                      ? 'bg-amber-500 text-black'
                      : warning.severity === 'MEDIUM'
                      ? 'bg-yellow-500 text-black'
                      : 'bg-slate-500 text-white'
                  }`}
                >
                  {getSeverityLabel(warning.severity)}
                </span>
              </div>

              {/* Message */}
              <div className="text-xs text-slate-300 mt-1">{warning.message}</div>

              {/* Threshold indicator (if applicable) */}
              {warning.threshold !== undefined && warning.currentValue !== undefined && (
                <div className="mt-2">
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>Current: {warning.currentValue.toLocaleString()}</span>
                    <span>Threshold: {warning.threshold.toLocaleString()}</span>
                  </div>
                  <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        warning.severity === 'CRITICAL' ? 'bg-red-500' : 'bg-amber-500'
                      }`}
                      style={{
                        width: `${Math.min(100, (warning.currentValue / warning.threshold) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Suggested action button */}
              {warning.suggestedAction && (
                <button
                  onClick={() => onAction(warning)}
                  className="text-xs text-amber-400 hover:text-amber-300 mt-2 underline underline-offset-2 flex items-center gap-1"
                >
                  <i className="fas fa-arrow-right text-[10px]"></i>
                  {warning.suggestedAction}
                </button>
              )}
            </div>

            {/* Dismiss button */}
            <button
              onClick={() => onDismiss(warning.id)}
              className="text-slate-500 hover:text-white text-sm flex-shrink-0 w-6 h-6 flex items-center justify-center rounded hover:bg-slate-700/50 transition-colors"
              title="Dismiss"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      ))}

      {/* Hidden warnings indicator */}
      {hasHiddenWarnings && !isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full bg-slate-800/80 border border-slate-700 rounded-lg p-2 text-center backdrop-blur-sm hover:bg-slate-700/80 transition-colors"
        >
          <span className="text-xs text-slate-400">
            <i className="fas fa-chevron-down mr-1"></i>
            {hiddenCount} more warning{hiddenCount !== 1 ? 's' : ''} hidden
          </span>
        </button>
      )}
    </div>
  );
};

/**
 * Compact warning indicator for mobile/small screens
 */
export const WarningIndicator: React.FC<{
  warnings: Warning[];
  onClick: () => void;
}> = ({ warnings, onClick }) => {
  if (warnings.length === 0) return null;

  const criticalCount = warnings.filter(w => w.severity === 'CRITICAL').length;
  const highCount = warnings.filter(w => w.severity === 'HIGH').length;

  return (
    <button
      onClick={onClick}
      className={`relative p-2 rounded-lg transition-colors ${
        criticalCount > 0
          ? 'bg-red-900/50 text-red-400 animate-pulse'
          : highCount > 0
          ? 'bg-amber-900/50 text-amber-400'
          : 'bg-slate-800 text-slate-400'
      }`}
      title={`${warnings.length} warning${warnings.length !== 1 ? 's' : ''}`}
    >
      <i className="fas fa-exclamation-triangle"></i>
      {warnings.length > 0 && (
        <span
          className={`absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-[10px] font-bold rounded-full ${
            criticalCount > 0 ? 'bg-red-500' : 'bg-amber-500'
          } text-white`}
        >
          {warnings.length}
        </span>
      )}
    </button>
  );
};

export default WarningPanel;
