/**
 * TypewriterText Component
 *
 * Renders text with a typewriter animation effect.
 * Supports markdown-like formatting and can be skipped.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';

interface TypewriterTextProps {
  /** The text to display */
  text: string;
  /** Speed in characters per second */
  speed?: number;
  /** Callback when animation completes */
  onComplete?: () => void;
  /** Whether to start immediately */
  autoStart?: boolean;
  /** Whether text is currently visible (for skip) */
  isComplete?: boolean;
  /** Class for the container */
  className?: string;
}

const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speed = 40,
  onComplete,
  autoStart = true,
  isComplete: externalComplete,
  className = '',
}) => {
  const [displayedLength, setDisplayedLength] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Strip HTML-like markdown for character count
  const plainTextLength = useMemo(() => {
    return text.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1').length;
  }, [text]);

  // Check if animation is complete
  const isComplete = externalComplete || displayedLength >= plainTextLength;

  // Start animation
  const startAnimation = useCallback(() => {
    if (isAnimating) return;
    setDisplayedLength(0);
    setIsAnimating(true);
  }, [isAnimating]);

  // Skip to end
  const skipToEnd = useCallback(() => {
    setDisplayedLength(plainTextLength);
    setIsAnimating(false);
    onComplete?.();
  }, [plainTextLength, onComplete]);

  // Auto-start effect
  useEffect(() => {
    if (autoStart) {
      startAnimation();
    }
  }, [text, autoStart, startAnimation]);

  // Animation loop
  useEffect(() => {
    if (!isAnimating || displayedLength >= plainTextLength) {
      if (displayedLength >= plainTextLength) {
        setIsAnimating(false);
        onComplete?.();
      }
      return;
    }

    const msPerChar = 1000 / speed;
    const timer = setTimeout(() => {
      setDisplayedLength(prev => prev + 1);
    }, msPerChar);

    return () => clearTimeout(timer);
  }, [isAnimating, displayedLength, plainTextLength, speed, onComplete]);

  // Parse markdown and apply typewriter effect
  const renderText = useCallback(() => {
    if (isComplete) {
      // Show full text with formatting
      return formatText(text);
    }

    // For partial text, we need to carefully slice while respecting formatting
    const partialText = sliceFormattedText(text, displayedLength);
    return formatText(partialText);
  }, [text, displayedLength, isComplete]);

  return (
    <div
      className={`typewriter-text ${className}`}
      onClick={!isComplete ? skipToEnd : undefined}
      style={{ cursor: !isComplete ? 'pointer' : 'default' }}
    >
      {renderText()}
      {!isComplete && <span className="animate-pulse text-green-400">▊</span>}
    </div>
  );
};

/**
 * Slice text while respecting markdown formatting
 */
function sliceFormattedText(text: string, charCount: number): string {
  let count = 0;
  let result = '';
  let i = 0;

  while (i < text.length && count < charCount) {
    // Check for ** (bold)
    if (text.slice(i, i + 2) === '**') {
      const endBold = text.indexOf('**', i + 2);
      if (endBold !== -1) {
        const boldContent = text.slice(i + 2, endBold);
        const charsNeeded = charCount - count;
        if (charsNeeded >= boldContent.length) {
          result += '**' + boldContent + '**';
          count += boldContent.length;
          i = endBold + 2;
        } else {
          result += '**' + boldContent.slice(0, charsNeeded) + '**';
          count += charsNeeded;
          i = endBold + 2;
        }
        continue;
      }
    }

    // Check for * (italic)
    if (text[i] === '*' && text[i + 1] !== '*') {
      const endItalic = text.indexOf('*', i + 1);
      if (endItalic !== -1 && text[endItalic - 1] !== '*') {
        const italicContent = text.slice(i + 1, endItalic);
        const charsNeeded = charCount - count;
        if (charsNeeded >= italicContent.length) {
          result += '*' + italicContent + '*';
          count += italicContent.length;
          i = endItalic + 1;
        } else {
          result += '*' + italicContent.slice(0, charsNeeded) + '*';
          count += charsNeeded;
          i = endItalic + 1;
        }
        continue;
      }
    }

    // Regular character
    result += text[i];
    if (text[i] !== '\n') count++;
    i++;
  }

  return result;
}

/**
 * Format text with markdown-like syntax
 */
function formatText(text: string): React.ReactNode {
  const paragraphs = text.split('\n\n');

  return paragraphs.map((paragraph, index) => {
    // Bold text **text**
    let parts = paragraph.split(/(\*\*[^*]+\*\*)/g);
    const elements: React.ReactNode[] = [];

    parts.forEach((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const content = part.slice(2, -2);
        elements.push(
          <strong key={`b-${i}`} className="text-green-400 font-semibold">
            {formatItalics(content)}
          </strong>
        );
      } else {
        elements.push(<React.Fragment key={`t-${i}`}>{formatItalics(part)}</React.Fragment>);
      }
    });

    // Check if this is a narrator comment (single * wrapping the whole thing)
    if (paragraph.match(/^\*[^*].*[^*]\*$/)) {
      return (
        <p
          key={index}
          className="text-gray-500 italic text-sm mt-4 border-l-2 border-gray-700 pl-3"
        >
          {elements}
        </p>
      );
    }

    return (
      <p key={index} className="mb-4 leading-relaxed">
        {elements}
      </p>
    );
  });
}

/**
 * Format italic text within content
 */
function formatItalics(text: string): React.ReactNode {
  const parts = text.split(/(\*[^*]+\*)/g);

  return parts.map((part, i) => {
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return (
        <em key={i} className="text-gray-400 italic">
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
}

export default TypewriterText;
