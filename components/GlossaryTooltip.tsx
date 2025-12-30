import React, { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { getTermByName, type GlossaryTerm } from '../constants/glossary';
import { Z_INDEX } from '../constants/zIndex';

interface GlossaryTooltipProps {
  term: string;
  children: React.ReactNode;
}

interface TooltipPosition {
  top: number;
  left: number;
}

export const GlossaryTooltip: React.FC<GlossaryTooltipProps> = ({ term, children }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [position, setPosition] = useState<TooltipPosition | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const glossaryTerm = getTermByName(term);

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const tooltipWidth = 320;
    const tooltipHeight = 200; // Approximate

    // Try to center above the term
    let left = rect.left + rect.width / 2 - tooltipWidth / 2;
    let top = rect.top - tooltipHeight - 8;

    // If too close to top, show below
    if (top < 10) {
      top = rect.bottom + 8;
    }

    // Clamp to viewport
    left = Math.max(10, Math.min(left, window.innerWidth - tooltipWidth - 10));
    top = Math.max(10, Math.min(top, window.innerHeight - tooltipHeight - 10));

    setPosition({ top, left });
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    calculatePosition();
    setShowTooltip(true);
  }, [calculatePosition]);

  const handleMouseLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setShowTooltip(false);
    }, 150);
  }, []);

  if (!glossaryTerm) {
    return <>{children}</>;
  }

  const getDifficultyColor = (difficulty: GlossaryTerm['difficulty']) => {
    switch (difficulty) {
      case 'BASIC':
        return 'bg-green-900/50 text-green-400 border-green-700/50';
      case 'INTERMEDIATE':
        return 'bg-amber-900/50 text-amber-400 border-amber-700/50';
      case 'ADVANCED':
        return 'bg-red-900/50 text-red-400 border-red-700/50';
    }
  };

  const getCategoryIcon = (category: GlossaryTerm['category']) => {
    switch (category) {
      case 'VALUATION':
        return 'fa-chart-line';
      case 'DEALS':
        return 'fa-handshake';
      case 'FINANCE':
        return 'fa-coins';
      case 'LEGAL':
        return 'fa-balance-scale';
      case 'OPERATIONS':
        return 'fa-cogs';
    }
  };

  const tooltip = showTooltip && position && (
    <div
      className="fixed bg-slate-800 border border-slate-600 rounded-lg shadow-xl p-4 min-w-[280px] max-w-[320px] animate-fade-in"
      style={{
        zIndex: Z_INDEX.tooltip,
        top: position.top,
        left: position.left,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <span className="text-sm font-bold text-green-400">{glossaryTerm.term}</span>
          {glossaryTerm.fullName && (
            <span className="text-xs text-slate-400 ml-2">({glossaryTerm.fullName})</span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getDifficultyColor(glossaryTerm.difficulty)}`}>
            {glossaryTerm.difficulty}
          </span>
          <i className={`fas ${getCategoryIcon(glossaryTerm.category)} text-slate-500 text-xs`}></i>
        </div>
      </div>

      {/* Definition */}
      <p className="text-xs text-slate-300 mb-3 leading-relaxed">{glossaryTerm.definition}</p>

      {/* Formula */}
      {glossaryTerm.formula && (
        <div className="bg-slate-900/70 rounded-lg p-2.5 mb-3 font-mono text-xs text-amber-400 border border-slate-700/50">
          {glossaryTerm.formula}
        </div>
      )}

      {/* Example */}
      {glossaryTerm.example && (
        <div className="text-xs text-slate-400 italic mb-2">
          <span className="text-slate-500 not-italic font-medium">Example:</span> {glossaryTerm.example}
        </div>
      )}

      {/* Related Terms */}
      {glossaryTerm.relatedTerms && glossaryTerm.relatedTerms.length > 0 && (
        <div className="border-t border-slate-700/50 pt-2 mt-2">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">See also: </span>
          <span className="text-[10px] text-slate-400">
            {glossaryTerm.relatedTerms.join(', ')}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <>
      <span
        ref={triggerRef}
        className="border-b border-dotted border-green-500/50 cursor-help hover:text-green-400 hover:border-green-400 transition-colors"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </span>
      {typeof window !== 'undefined' && createPortal(tooltip, document.body)}
    </>
  );
};

export default GlossaryTooltip;
