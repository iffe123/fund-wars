import React, { useState, useEffect } from 'react';

export interface SlideContent {
  id: string;
  title: string;
  narrative: string[];
  buttonText: string;
  buttonVariant?: 'primary' | 'secondary' | 'accent';
  showCharacterPortrait?: boolean;
  characterName?: string;
  characterRole?: string;
}

interface IntroSlideProps {
  slide: SlideContent;
  isActive: boolean;
  onContinue: () => void;
}

const IntroSlide: React.FC<IntroSlideProps> = ({ slide, isActive, onContinue }) => {
  const [contentVisible, setContentVisible] = useState(false);
  const [linesVisible, setLinesVisible] = useState<number[]>([]);

  useEffect(() => {
    if (isActive) {
      // Reset state when slide becomes active
      setContentVisible(false);
      setLinesVisible([]);

      // Fade in container
      const containerTimer = setTimeout(() => setContentVisible(true), 100);

      // Stagger narrative lines
      const lineTimers = slide.narrative.map((_, index) => {
        return setTimeout(() => {
          setLinesVisible(prev => [...prev, index]);
        }, 400 + (index * 300));
      });

      return () => {
        clearTimeout(containerTimer);
        lineTimers.forEach(timer => clearTimeout(timer));
      };
    }
  }, [isActive, slide.narrative]);

  const getButtonClasses = () => {
    const base = "px-8 py-3 font-mono text-sm uppercase tracking-widest transition-all duration-300 rounded-sm flex items-center gap-2";

    switch (slide.buttonVariant) {
      case 'accent':
        return `${base} bg-amber-500 hover:bg-amber-400 text-black font-bold shadow-lg shadow-amber-500/20`;
      case 'secondary':
        return `${base} border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-700/50`;
      default:
        return `${base} border border-white/30 hover:border-white/60 text-white hover:bg-white/10`;
    }
  };

  if (!isActive) return null;

  return (
    <div className={`
      absolute inset-0 flex items-center justify-center p-6
      transition-opacity duration-700 ease-out
      ${contentVisible ? 'opacity-100' : 'opacity-0'}
    `}>
      <div className="max-w-xl w-full">
        {/* Character Portrait (optional) */}
        {slide.showCharacterPortrait && slide.characterName && (
          <div className={`
            mb-6 flex items-center gap-4 p-4 bg-slate-800/40 border border-slate-700/50 rounded
            transition-all duration-500 delay-100
            ${contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
          `}>
            <div className="w-14 h-14 bg-slate-700 rounded-full flex items-center justify-center border-2 border-slate-600">
              <i className="fas fa-user-tie text-2xl text-slate-400"></i>
            </div>
            <div>
              <div className="text-lg font-bold text-white">{slide.characterName}</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider">{slide.characterRole}</div>
            </div>
          </div>
        )}

        {/* Title */}
        <h2 className={`
          text-2xl md:text-3xl font-bold text-white mb-6 font-mono
          transition-all duration-500
          ${contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
        `}>
          {slide.title}
        </h2>

        {/* Narrative Lines */}
        <div className="space-y-4 mb-8">
          {slide.narrative.map((line, index) => {
            const isQuote = line.startsWith('"') || line.startsWith('"');
            return (
              <p
                key={index}
                className={`
                  text-base md:text-lg leading-relaxed
                  transition-all duration-500 ease-out
                  ${linesVisible.includes(index) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                  ${isQuote ? 'text-amber-200/90 italic border-l-2 border-amber-500/50 pl-4' : 'text-slate-300'}
                `}
              >
                {line}
              </p>
            );
          })}
        </div>

        {/* Continue Button */}
        <div className={`
          transition-all duration-500 delay-700
          ${linesVisible.length === slide.narrative.length ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        `}>
          <button
            onClick={onContinue}
            className={getButtonClasses()}
          >
            {slide.buttonText}
            <i className="fas fa-arrow-right text-xs"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntroSlide;
