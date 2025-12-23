import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Z_INDEX } from '../../constants/zIndex';

interface TutorialHighlightProps {
  targetSelector: string;
  isActive: boolean;
  pulseColor?: string;
}

interface HighlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const TutorialHighlight: React.FC<TutorialHighlightProps> = ({
  targetSelector,
  isActive,
  pulseColor = 'amber',
}) => {
  const [rect, setRect] = useState<HighlightRect | null>(null);

  useEffect(() => {
    if (!isActive) {
      setRect(null);
      return;
    }

    const updateRect = () => {
      const target = document.querySelector(targetSelector);
      if (!target) {
        setRect(null);
        return;
      }

      const targetRect = target.getBoundingClientRect();
      setRect({
        top: targetRect.top,
        left: targetRect.left,
        width: targetRect.width,
        height: targetRect.height,
      });
    };

    updateRect();

    // Update on resize/scroll
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);

    // Watch for DOM changes
    const observer = new MutationObserver(updateRect);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
      observer.disconnect();
    };
  }, [isActive, targetSelector]);

  if (!isActive || !rect) return null;

  const padding = 4;
  const borderWidth = 2;

  const highlight = (
    <div
      className="fixed pointer-events-none"
      style={{
        zIndex: Z_INDEX.tutorialHighlight,
        top: rect.top - padding,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      }}
    >
      {/* Glow effect */}
      <div
        className={`
          absolute inset-0 rounded-lg
          animate-pulse
          bg-${pulseColor}-500/20
          shadow-[0_0_20px_rgba(245,158,11,0.4)]
        `}
        style={{
          boxShadow: '0 0 20px rgba(245, 158, 11, 0.4), 0 0 40px rgba(245, 158, 11, 0.2)',
        }}
      />

      {/* Border */}
      <div
        className={`
          absolute inset-0 rounded-lg
          border-${borderWidth} border-${pulseColor}-500
        `}
        style={{
          borderWidth,
          borderColor: '#f59e0b',
          borderStyle: 'solid',
        }}
      />

      {/* Corner accents */}
      <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-amber-400 rounded-tl" />
      <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-amber-400 rounded-tr" />
      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-amber-400 rounded-bl" />
      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-amber-400 rounded-br" />
    </div>
  );

  return createPortal(highlight, document.body);
};

export default TutorialHighlight;
