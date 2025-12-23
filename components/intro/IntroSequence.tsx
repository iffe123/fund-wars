import React, { useState, useCallback } from 'react';
import IntroSlide, { SlideContent } from './IntroSlide';

interface IntroSequenceProps {
  onComplete: (stressLevel: number) => void;
}

const INTRO_SLIDES: SlideContent[] = [
  {
    id: 'elevator',
    title: 'The Elevator',
    narrative: [
      'The elevator opens to mahogany and money.',
      'Welcome to Apex Capital Partners. $2.4 billion AUM. Top-quartile returns.',
      'A place where careers are made—or destroyed in a single bad quarter.',
    ],
    buttonText: 'Step Inside',
    buttonVariant: 'primary',
  },
  {
    id: 'desk',
    title: 'Your Desk',
    narrative: [
      'Your desk awaits in the analyst bullpen. Coffee\'s already getting cold.',
      'Somewhere across the trading floor, a Managing Director is about to drop something on your desk that will define your next six months.',
    ],
    buttonText: 'Sit Down',
    buttonVariant: 'primary',
  },
  {
    id: 'assignment',
    title: 'The Assignment',
    narrative: [
      '"New analyst? Good. PackFancy Inc. Packaging company. Boring as hell but the numbers might work. Run the model. Don\'t embarrass me."',
      'He\'s already walking away.',
    ],
    buttonText: 'Get Started',
    buttonVariant: 'secondary',
    showCharacterPortrait: true,
    characterName: 'Chad Worthington',
    characterRole: 'Managing Director',
  },
  {
    id: 'mission',
    title: 'Your Mission',
    narrative: [
      'You have ONE WEEK to analyze this deal before the IOI deadline.',
      'Miss it, and Chad will find someone who won\'t.',
    ],
    buttonText: 'Enter Apex Capital',
    buttonVariant: 'accent',
  },
];

const IntroSequence: React.FC<IntroSequenceProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleContinue = useCallback(() => {
    if (isTransitioning) return;

    if (currentSlide < INTRO_SLIDES.length - 1) {
      // Transition to next slide
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide(prev => prev + 1);
        setIsTransitioning(false);
      }, 400);
    } else {
      // Final slide - complete intro with default stress level
      // The stress selection is now removed for cleaner flow
      onComplete(5);
    }
  }, [currentSlide, isTransitioning, onComplete]);

  const handleSkip = useCallback(() => {
    onComplete(5);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-slate-950 text-white overflow-hidden" style={{ zIndex: 100 }}>
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Top bar with progress */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10">
        {/* Logo / Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center">
            <i className="fas fa-chart-line text-black text-sm"></i>
          </div>
          <span className="text-sm font-mono text-slate-500 uppercase tracking-widest">
            Fund Wars
          </span>
        </div>

        {/* Skip button */}
        <button
          onClick={handleSkip}
          className="text-xs text-slate-600 hover:text-slate-400 font-mono uppercase tracking-wider transition-colors"
        >
          Skip Intro
        </button>
      </div>

      {/* Progress dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {INTRO_SLIDES.map((_, index) => (
          <div
            key={index}
            className={`
              h-1.5 rounded-full transition-all duration-300
              ${index === currentSlide
                ? 'w-8 bg-amber-500'
                : index < currentSlide
                  ? 'w-1.5 bg-amber-500/50'
                  : 'w-1.5 bg-slate-700'
              }
            `}
          />
        ))}
      </div>

      {/* Slide container */}
      <div className={`
        absolute inset-0
        transition-opacity duration-400
        ${isTransitioning ? 'opacity-0' : 'opacity-100'}
      `}>
        {INTRO_SLIDES.map((slide, index) => (
          <IntroSlide
            key={slide.id}
            slide={slide}
            isActive={index === currentSlide}
            onContinue={handleContinue}
          />
        ))}
      </div>

      {/* Decorative corner elements */}
      <div className="absolute top-4 left-4 w-16 h-16 border-l border-t border-slate-800/50" />
      <div className="absolute top-4 right-4 w-16 h-16 border-r border-t border-slate-800/50" />
      <div className="absolute bottom-4 left-4 w-16 h-16 border-l border-b border-slate-800/50" />
      <div className="absolute bottom-4 right-4 w-16 h-16 border-r border-b border-slate-800/50" />
    </div>
  );
};

export default IntroSequence;
