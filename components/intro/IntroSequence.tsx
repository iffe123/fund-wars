import React, { useState, useCallback } from 'react';
import type { Difficulty } from '../../types';
import IntroSlide, { SlideContent } from './IntroSlide';
import { Z_INDEX } from '../../constants/zIndex';

interface IntroSequenceProps {
  onComplete: (stressLevel: number, playerName?: string, difficulty?: Difficulty) => void;
  quickStart?: boolean;
}

const INTRO_SLIDES: SlideContent[] = [
  {
    id: 'elevator',
    title: 'Sterling Partners',
    narrative: [
      'The elevator opens to mahogany and money. $2.4 billion AUM. Top-quartile returns.',
      'You are the new analyst. Your first deal just landed on your desk.',
    ],
    buttonText: 'Step Inside',
    buttonVariant: 'primary',
  },
  {
    id: 'assignment',
    title: 'The Assignment',
    narrative: [
      '"New analyst? Good. PackFancy Inc. Packaging company. Boring as hell but the numbers might work. Run the model. Do not embarrass me."',
      'He is already walking away.',
    ],
    buttonText: 'Get Started',
    buttonVariant: 'secondary',
    showCharacterPortrait: true,
    characterName: 'Chad Worthington III',
    characterRole: 'Managing Director',
  },
  {
    id: 'mission',
    title: 'Your Mission',
    narrative: [
      'You have ONE WEEK to analyze this deal before the IOI deadline. Miss it, and Chad will find someone who will not.',
      '3 Action Points per week. Every move counts. Use COMMS to network, DESK for deals, and your AI advisor Machiavelli for strategy.',
    ],
    buttonText: 'Enter Sterling Partners',
    buttonVariant: 'accent',
  },
];

const IntroSequence: React.FC<IntroSequenceProps> = ({ onComplete, quickStart = false }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [skipFutureIntros, setSkipFutureIntros] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [showNameEntry, setShowNameEntry] = useState(false);

  const persistIntroPreference = useCallback(() => {
    if (skipFutureIntros) {
      localStorage.setItem('fundwars_skip_intro', 'true');
    }
  }, [skipFutureIntros]);

  React.useEffect(() => {
    if (quickStart) {
      onComplete(5, undefined, 'Normal');
    }
  }, [quickStart, onComplete]);

  if (quickStart) return null;

  const finishIntro = useCallback(() => {
    persistIntroPreference();
    onComplete(5, playerName.trim() || undefined, 'Normal');
  }, [onComplete, persistIntroPreference, playerName]);

  const handleContinue = useCallback(() => {
    if (isTransitioning) return;

    if (currentSlide < INTRO_SLIDES.length - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide((prev) => prev + 1);
        setIsTransitioning(false);
      }, 400);
    } else {
      setShowNameEntry(true);
    }
  }, [currentSlide, isTransitioning]);

  const handleSkip = useCallback(() => {
    setShowNameEntry(true);
  }, []);

  return (
    <div className="fixed inset-0 bg-slate-950 text-white overflow-hidden" style={{ zIndex: Z_INDEX.tutorialOverlay }}>
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />

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

      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center">
            <i className="fas fa-chart-line text-black text-sm"></i>
          </div>
          <span className="text-sm font-mono text-slate-500 uppercase tracking-widest">
            Fund Wars
          </span>
        </div>

        <button
          type="button"
          onClick={handleSkip}
          className="text-xs text-slate-600 hover:text-slate-400 font-mono uppercase tracking-wider transition-colors"
        >
          Skip Intro
        </button>
      </div>

      <div className="absolute top-14 right-4 z-10">
        <label className="flex items-center gap-2 text-[10px] text-slate-500 font-mono uppercase tracking-wide">
          <input
            type="checkbox"
            checked={skipFutureIntros}
            onChange={(e) => setSkipFutureIntros(e.target.checked)}
            className="accent-amber-500"
          />
          Skip next time
        </label>
      </div>

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

      {showNameEntry && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-slate-950/80 backdrop-blur-sm">
          <div className="max-w-lg w-full mx-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2 font-mono">Before You Start</h2>
              <p className="text-slate-400 mb-4 text-sm">What should we call you?</p>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') finishIntro(); }}
                placeholder="Enter your name..."
                maxLength={24}
                autoFocus
                className="w-full bg-slate-950 border-2 border-slate-600 text-white rounded px-4 py-3 text-lg font-mono focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/50 transition-all placeholder-slate-600"
              />
            </div>

            <button
              type="button"
              data-testid="intro-start"
              onClick={finishIntro}
              className="w-full px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold font-mono text-sm uppercase tracking-widest rounded-sm transition-all"
            >
              {playerName.trim() ? 'Let\'s Go' : 'Stay Anonymous'}
            </button>
          </div>
        </div>
      )}

      <div className={`
        absolute inset-0
        transition-opacity duration-400
        ${isTransitioning || showNameEntry ? 'opacity-0' : 'opacity-100'}
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

      <div className="absolute top-4 left-4 w-16 h-16 border-l border-t border-slate-800/50" />
      <div className="absolute top-4 right-4 w-16 h-16 border-r border-t border-slate-800/50" />
      <div className="absolute bottom-4 left-4 w-16 h-16 border-l border-b border-slate-800/50" />
      <div className="absolute bottom-4 right-4 w-16 h-16 border-r border-b border-slate-800/50" />
    </div>
  );
};

export default IntroSequence;
