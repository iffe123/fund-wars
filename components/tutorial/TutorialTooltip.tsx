import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Z_INDEX } from '../../constants/zIndex';

export interface TutorialStep {
  id: string;
  targetSelector: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  requiredTab?: string;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'desk',
    targetSelector: '[data-tutorial="desk-tab"]',
    title: 'Your Desk',
    content: 'This is your desk. Your active deals live here.',
    position: 'bottom',
    requiredTab: 'WORKSPACE',
  },
  {
    id: 'packfancy',
    targetSelector: '[data-tutorial="deal-card"]',
    title: 'Active Deal',
    content: 'Click on a deal to see details and run analysis.',
    position: 'right',
    requiredTab: 'ASSETS',
  },
  {
    id: 'diligence',
    targetSelector: '[data-tutorial="diligence-btn"]',
    title: 'Diligence',
    content: 'Spend AP to dig deeper. More diligence = better intel.',
    position: 'left',
  },
  {
    id: 'leverage',
    targetSelector: '[data-tutorial="leverage-btn"]',
    title: 'Leverage Model',
    content: 'Run the numbers. This is free and shows deal potential.',
    position: 'top',
  },
  {
    id: 'comms',
    targetSelector: '[data-tutorial="comms-tab"]',
    title: 'Communications',
    content: 'Need advice? Machiavelli (your advisor) is one message away.',
    position: 'right',
  },
  {
    id: 'advance',
    targetSelector: '[data-tutorial="advance-btn"]',
    title: 'Advance Week',
    content: 'When you\'re ready, advance the week. The clock is ticking.',
    position: 'top',
  },
];

interface TooltipPosition {
  top: number;
  left: number;
  arrowPosition: 'top' | 'bottom' | 'left' | 'right';
}

interface TutorialTooltipProps {
  currentStep: number;
  totalSteps: number;
  onDismiss: () => void;
  onSkip: () => void;
  isVisible: boolean;
}

const TutorialTooltip: React.FC<TutorialTooltipProps> = ({
  currentStep,
  totalSteps,
  onDismiss,
  onSkip,
  isVisible,
}) => {
  const [position, setPosition] = useState<TooltipPosition | null>(null);
  const [targetVisible, setTargetVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<MutationObserver | null>(null);

  const step = TUTORIAL_STEPS[currentStep];

  useEffect(() => {
    if (!isVisible || !step) {
      setPosition(null);
      setTargetVisible(false);
      return;
    }

    const updatePosition = () => {
      const target = document.querySelector(step.targetSelector);

      if (!target) {
        setTargetVisible(false);
        return;
      }

      const rect = target.getBoundingClientRect();
      const tooltipWidth = 280;
      const tooltipHeight = 140;
      const padding = 12;
      const arrowSize = 8;

      // Check if target is visible in viewport
      const isInViewport =
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= window.innerHeight &&
        rect.right <= window.innerWidth;

      if (!isInViewport) {
        setTargetVisible(false);
        return;
      }

      setTargetVisible(true);

      let top = 0;
      let left = 0;
      let arrowPosition: TooltipPosition['arrowPosition'] = 'top';

      const preferredPosition = step.position || 'auto';

      // Calculate position based on preference
      if (preferredPosition === 'auto' || preferredPosition === 'bottom') {
        // Try bottom first
        if (rect.bottom + tooltipHeight + padding < window.innerHeight) {
          top = rect.bottom + padding + arrowSize;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          arrowPosition = 'top';
        } else {
          // Fallback to top
          top = rect.top - tooltipHeight - padding - arrowSize;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          arrowPosition = 'bottom';
        }
      } else if (preferredPosition === 'top') {
        top = rect.top - tooltipHeight - padding - arrowSize;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        arrowPosition = 'bottom';
      } else if (preferredPosition === 'right') {
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.right + padding + arrowSize;
        arrowPosition = 'left';
      } else if (preferredPosition === 'left') {
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.left - tooltipWidth - padding - arrowSize;
        arrowPosition = 'right';
      }

      // Clamp to viewport
      left = Math.max(padding, Math.min(left, window.innerWidth - tooltipWidth - padding));
      top = Math.max(padding, Math.min(top, window.innerHeight - tooltipHeight - padding));

      setPosition({ top, left, arrowPosition });
    };

    // Initial position calculation
    updatePosition();

    // Watch for DOM changes
    observerRef.current = new MutationObserver(updatePosition);
    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style'],
    });

    // Also update on resize and scroll
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      observerRef.current?.disconnect();
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isVisible, step, currentStep]);

  if (!isVisible || !step || !position || !targetVisible) {
    return null;
  }

  const getArrowStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'absolute',
      width: 0,
      height: 0,
    };

    switch (position.arrowPosition) {
      case 'top':
        return {
          ...base,
          top: -8,
          left: '50%',
          transform: 'translateX(-50%)',
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderBottom: '8px solid #f59e0b',
        };
      case 'bottom':
        return {
          ...base,
          bottom: -8,
          left: '50%',
          transform: 'translateX(-50%)',
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop: '8px solid #f59e0b',
        };
      case 'left':
        return {
          ...base,
          left: -8,
          top: '50%',
          transform: 'translateY(-50%)',
          borderTop: '8px solid transparent',
          borderBottom: '8px solid transparent',
          borderRight: '8px solid #f59e0b',
        };
      case 'right':
        return {
          ...base,
          right: -8,
          top: '50%',
          transform: 'translateY(-50%)',
          borderTop: '8px solid transparent',
          borderBottom: '8px solid transparent',
          borderLeft: '8px solid #f59e0b',
        };
    }
  };

  const tooltip = (
    <>
      {/* Subtle overlay */}
      <div
        className="fixed inset-0 bg-black/30 pointer-events-none"
        style={{ zIndex: Z_INDEX.tutorialOverlay }}
      />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed bg-slate-900 border border-amber-500 rounded-lg shadow-xl shadow-amber-500/20 animate-fade-in"
        style={{
          zIndex: Z_INDEX.tutorial,
          top: position.top,
          left: position.left,
          width: 280,
        }}
      >
        {/* Arrow */}
        <div style={getArrowStyles()} />

        {/* Header */}
        <div className="px-4 py-2 border-b border-amber-500/30 bg-amber-500/10 flex items-center justify-between">
          <span className="text-xs font-mono text-amber-400 uppercase tracking-wider">
            Step {currentStep + 1} of {totalSteps}
          </span>
          <button
            onClick={onSkip}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            Skip All
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <h4 className="text-sm font-bold text-white mb-2">{step.title}</h4>
          <p className="text-xs text-slate-300 leading-relaxed">{step.content}</p>
        </div>

        {/* Footer */}
        <div className="px-4 pb-4">
          <button
            onClick={onDismiss}
            className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold uppercase tracking-wider rounded transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </>
  );

  return createPortal(tooltip, document.body);
};

export default TutorialTooltip;
