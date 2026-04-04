import React, { useState, useCallback } from 'react';
import IntroSlide, { SlideContent } from './IntroSlide';

interface IntroSequenceProps {
  onComplete: (stressLevel: number, playerName?: string) => void;
  quickStart?: boolean;
}

const INTRO_SLIDES: SlideContent[] = [
  {
    id: 'elevator',
    title: 'The Elevator',
    narrative: [
      'The elevator opens to mahogany and money.',
      'Welcome to Sterling Partners. $2.4 billion AUM. Top-quartile returns.',
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
    id: 'your-tools',
    title: 'Your Command Center',
    narrative: [
      'Your desk is your command center. Here\'s what you have to work with:',
      'COMMS — Your contacts are on the left. Click any name to open a conversation. Build relationships, gather intel, call in favors.',
      'BLOOMBERG IB — The chat terminal on the right connects you to your AI advisor, Machiavelli. He\'s ruthless, brilliant, and always available. Use him.',
      'DESK — Your main workspace shows events, decisions, and deal flow. This is where the action happens.',
    ],
    buttonText: 'Got It',
    buttonVariant: 'primary',
  },
  {
    id: 'mechanics',
    title: 'How to Survive',
    narrative: [
      'Every major action costs AP (Action Points). You get a limited number each week. Spend them wisely — run diligence, submit offers, network, and manage stress.',
      'STRESS builds with every hard decision and late night. Hit 100% and you burn out. Rest, socialize, or find other ways to cope.',
      'REPUTATION determines your standing at the firm and unlocks new opportunities. Make smart deals and keep the MDs happy.',
      'At the end of each week, click "End Week" to advance time and face new challenges.',
      'Quick glossary: IOI = Indicative Offer (your first bid), IC = Investment Committee (partner approval meeting).',
    ],
    buttonText: 'Understood',
    buttonVariant: 'primary',
  },
  {
    id: 'mission',
    title: 'Your Mission',
    narrative: [
      'You have ONE WEEK to analyze this deal before the IOI deadline.',
      'Miss it, and Chad will find someone who won\'t.',
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

  // Quick start: skip all animations and go straight to game
  React.useEffect(() => {
    if (quickStart) {
      onComplete(5);
    }
  }, [quickStart, onComplete]);

  if (quickStart) return null;

  const finishIntro = useCallback(() => {
    persistIntroPreference();
    onComplete(5, playerName.trim() || undefined);
  }, [onComplete, persistIntroPreference, playerName]);

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
      // Final slide - show name entry before completing
      setShowNameEntry(true);
    }
  }, [currentSlide, isTransitioning]);

  const handleSkip = useCallback(() => {
    persistIntroPreference();
    onComplete(5, undefined);
  }, [onComplete, persistIntroPreference]);

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

      {/* Name Entry Overlay */}
      {showNameEntry && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="max-w-md w-full mx-6">
            <h2 className="text-2xl font-bold text-white mb-2 font-mono">One Last Thing</h2>
            <p className="text-slate-400 mb-6 text-sm">What should we call you?</p>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') finishIntro(); }}
              placeholder="Enter your name..."
              maxLength={24}
              autoFocus
              className="w-full bg-slate-950 border-2 border-slate-600 text-white rounded px-4 py-3 text-lg font-mono focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/50 transition-all mb-4 placeholder-slate-600"
            />
            <div className="flex gap-3">
              <button
                onClick={finishIntro}
                className="flex-1 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold font-mono text-sm uppercase tracking-widest rounded-sm transition-all"
              >
                {playerName.trim() ? 'Let\'s Go' : 'Stay Anonymous'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slide container */}
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

      {/* Decorative corner elements */}
      <div className="absolute top-4 left-4 w-16 h-16 border-l border-t border-slate-800/50" />
      <div className="absolute top-4 right-4 w-16 h-16 border-r border-t border-slate-800/50" />
      <div className="absolute bottom-4 left-4 w-16 h-16 border-l border-b border-slate-800/50" />
      <div className="absolute bottom-4 right-4 w-16 h-16 border-r border-b border-slate-800/50" />
    </div>
  );
};

export default IntroSequence;
