/**
 * IC Pitch Input Component
 *
 * Text input for player's pitch or response with character count.
 */

import React, { useState, useRef, useEffect } from 'react';

interface ICPitchInputProps {
  maxCharacters: number;
  placeholder: string;
  onSubmit: (text: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
  buttonLabel?: string;
}

export const ICPitchInput: React.FC<ICPitchInputProps> = ({
  maxCharacters,
  placeholder,
  onSubmit,
  disabled = false,
  isLoading = false,
  buttonLabel = 'SUBMIT',
}) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const charCount = text.length;
  const isOverLimit = charCount > maxCharacters;
  const isEmpty = text.trim().length === 0;

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  const handleSubmit = () => {
    if (!isOverLimit && !isEmpty && !disabled && !isLoading) {
      onSubmit(text.trim());
      setText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const getCharCountColor = () => {
    if (isOverLimit) return 'text-red-400';
    if (charCount > maxCharacters * 0.9) return 'text-amber-400';
    return 'text-slate-500';
  };

  return (
    <div className="border-t border-slate-700/50 p-4 bg-slate-900/50">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          className={`
            w-full min-h-[100px] max-h-[300px] p-3 rounded-lg
            bg-slate-800/80 border
            text-sm text-slate-200 placeholder-slate-500
            resize-none focus:outline-none transition-colors
            ${isOverLimit ? 'border-red-500/50 focus:border-red-400' : 'border-slate-600/50 focus:border-emerald-500/50'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          rows={3}
        />

        {/* Character count */}
        <div className={`absolute bottom-3 right-3 text-xs font-mono ${getCharCountColor()}`}>
          {charCount}/{maxCharacters}
        </div>
      </div>

      {/* Submit area */}
      <div className="flex items-center justify-between mt-3">
        <div className="text-[10px] text-slate-500">
          <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-400">⌘</kbd>
          <span className="mx-1">+</span>
          <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-400">Enter</kbd>
          <span className="ml-2">to submit</span>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isOverLimit || isEmpty || disabled || isLoading}
          className={`
            px-6 py-2 rounded-lg uppercase tracking-widest text-xs font-bold
            border transition-all duration-150
            ${isOverLimit || isEmpty || disabled || isLoading
              ? 'border-slate-600 text-slate-500 bg-slate-800/30 cursor-not-allowed'
              : 'border-emerald-500/70 text-emerald-400 bg-emerald-950/30 hover:bg-emerald-900/50 hover:text-emerald-300'
            }
          `}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-slate-500 border-t-amber-500 rounded-full animate-spin" />
              Processing...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <i className="fas fa-paper-plane" />
              {buttonLabel}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default ICPitchInput;
