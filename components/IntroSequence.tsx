
import React, { useState, useEffect } from 'react';
import type { Difficulty } from '../types';

interface IntroSequenceProps {
  onComplete: (stressLevel: number, difficulty: Difficulty) => void;
}

const IntroSequence: React.FC<IntroSequenceProps> = ({ onComplete }) => {
  const [stage, setStage] = useState(0);
  const [textVisible, setTextVisible] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);

  useEffect(() => {
    // Fade in text for current stage
    const timer = setTimeout(() => setTextVisible(true), 500);
    return () => clearTimeout(timer);
  }, [stage]);

  const handleNext = () => {
    setTextVisible(false);
    setTimeout(() => {
      setStage(prev => prev + 1);
    }, 500);
  };

  const handleDifficultySelect = (diff: Difficulty) => {
    setSelectedDifficulty(diff);
    setTextVisible(false);
    setTimeout(() => {
      setStage(3); // Go to Chad encounter
    }, 500);
  };

  const handleChoice = (stress: number) => {
    onComplete(stress, selectedDifficulty || 'Normal');
  };

  // Stage 0: The Glory
  if (stage === 0) {
    return (
      <div className="fixed inset-0 bg-black text-white flex flex-col items-center justify-center p-8 z-50">
        <div className={`transition-opacity duration-1000 ${textVisible ? 'opacity-100' : 'opacity-0'} text-center max-w-2xl`}>
          <h1 className="text-4xl md:text-6xl font-bower mb-8 tracking-wider">Wharton, Class of '24</h1>
          <p className="text-xl md:text-2xl font-light text-slate-300 mb-4">Valedictorian.</p>
          <p className="text-xl md:text-2xl font-light text-slate-300 mb-8">You survived 12 superdays. You beat 4,000 applicants.</p>
          <p className="text-lg text-slate-500 italic mb-12">They told you you were special. They told you you were a 'Master of the Universe'.</p>

          <button
            onClick={handleNext}
            className="border border-white/20 hover:bg-white/10 text-white font-light py-2 px-8 rounded-full transition-all tracking-widest uppercase text-sm"
          >
            Enter Reality
          </button>
        </div>
      </div>
    );
  }

  // Stage 1: The Crash
  if (stage === 1) {
    return (
      <div className="fixed inset-0 bg-slate-900 text-slate-200 flex flex-col items-center justify-center p-8 z-50">
        <div className={`transition-opacity duration-1000 ${textVisible ? 'opacity-100' : 'opacity-0'} text-center max-w-2xl`}>
          <div className="mb-8">
            <span className="font-mono text-green-500 text-sm">SYSTEM_TIME: 06:45:00</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">Monday. 6:45 AM.</h2>
          <p className="text-xl font-light mb-4">The fluorescent lights hum like a dying insect.</p>
          <p className="text-xl font-light mb-12">You haven't slept in 20 hours.</p>
          <p className="text-lg text-red-400 italic mb-12 border-l-2 border-red-500 pl-4">
            "You are not a Master. You are an Analyst. And you are late."
          </p>

          <button
            onClick={handleNext}
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-8 rounded shadow-lg transition-all"
          >
            Get to Desk
          </button>
        </div>
      </div>
    );
  }

  // Stage 2: Difficulty Selection
  if (stage === 2) {
    return (
      <div className="fixed inset-0 bg-black text-white flex flex-col items-center justify-center p-8 z-50">
        <div className={`transition-opacity duration-1000 ${textVisible ? 'opacity-100' : 'opacity-0'} text-center max-w-4xl w-full`}>
          <div className="mb-8">
            <span className="font-mono text-amber-500 text-sm uppercase tracking-widest">SELECT YOUR ORIGIN</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Who are you?</h2>
          <p className="text-lg text-slate-400 mb-12">Your background determines your starting resources and how forgiving Wall Street will be.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Easy */}
            <button
              onClick={() => handleDifficultySelect('Easy')}
              className="group text-left p-6 bg-slate-900/50 border-2 border-emerald-800/50 hover:border-emerald-500 hover:bg-emerald-950/30 rounded-xl transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-emerald-900/50 flex items-center justify-center border border-emerald-700/50">
                  <i className="fas fa-crown text-emerald-400 text-xl"></i>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-emerald-400 group-hover:text-emerald-300">Trust Fund Baby</h3>
                  <span className="text-xs text-emerald-600 uppercase tracking-wider">Easy Mode</span>
                </div>
              </div>
              <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                Your father is the Chairman of the Board. You start with a massive safety net, connections, and an innate sense of entitlement.
              </p>
              <div className="text-xs text-slate-500 space-y-1 border-t border-slate-800 pt-3">
                <div className="flex justify-between"><span>Starting Cash:</span><span className="text-emerald-400">$100,000</span></div>
                <div className="flex justify-between"><span>Starting Rep:</span><span className="text-emerald-400">20</span></div>
                <div className="flex justify-between"><span>Financial Engineering:</span><span className="text-emerald-400">20</span></div>
              </div>
            </button>

            {/* Normal */}
            <button
              onClick={() => handleDifficultySelect('Normal')}
              className="group text-left p-6 bg-slate-900/50 border-2 border-blue-800/50 hover:border-blue-500 hover:bg-blue-950/30 rounded-xl transition-all duration-300 ring-2 ring-blue-500/20"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-900/50 flex items-center justify-center border border-blue-700/50">
                  <i className="fas fa-graduation-cap text-blue-400 text-xl"></i>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-blue-400 group-hover:text-blue-300">MBA Grad</h3>
                  <span className="text-xs text-blue-600 uppercase tracking-wider">Normal Mode</span>
                </div>
              </div>
              <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                You did everything right: top school, top grades, top internship. Now you're just another shark in a tank full of them.
              </p>
              <div className="text-xs text-slate-500 space-y-1 border-t border-slate-800 pt-3">
                <div className="flex justify-between"><span>Starting Cash:</span><span className="text-blue-400">$25,000</span></div>
                <div className="flex justify-between"><span>Starting Rep:</span><span className="text-blue-400">10</span></div>
                <div className="flex justify-between"><span>Financial Engineering:</span><span className="text-blue-400">10</span></div>
              </div>
            </button>

            {/* Hard */}
            <button
              onClick={() => handleDifficultySelect('Hard')}
              className="group text-left p-6 bg-slate-900/50 border-2 border-red-800/50 hover:border-red-500 hover:bg-red-950/30 rounded-xl transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-900/50 flex items-center justify-center border border-red-700/50">
                  <i className="fas fa-fist-raised text-red-400 text-xl"></i>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-red-400 group-hover:text-red-300">State School Striver</h3>
                  <span className="text-xs text-red-600 uppercase tracking-wider">Hard Mode</span>
                </div>
              </div>
              <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                You clawed your way here with pure grit. Everyone is waiting for you to fail. One mistake and you're out.
              </p>
              <div className="text-xs text-slate-500 space-y-1 border-t border-slate-800 pt-3">
                <div className="flex justify-between"><span>Starting Cash:</span><span className="text-red-400">$10,000</span></div>
                <div className="flex justify-between"><span>Starting Rep:</span><span className="text-red-400">5</span></div>
                <div className="flex justify-between"><span>Starting Stress:</span><span className="text-red-400">35</span></div>
              </div>
            </button>
          </div>

          <div className="mt-12 text-center">
            <p className="text-xs text-slate-600 uppercase tracking-widest">
              <i className="fas fa-trophy mr-2"></i>
              Goal: Reach Partner level with $1M+ net worth, or build a $1B fund in Founder Mode
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Stage 3: The Encounter
  if (stage === 3) {
    return (
      <div className="fixed inset-0 bg-white text-slate-900 flex flex-col items-center justify-center p-8 z-50">
        <div className={`transition-all duration-500 ${textVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'} max-w-2xl w-full bg-slate-50 border border-slate-200 p-8 rounded-xl shadow-2xl`}>
          <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-slate-200">
             <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center border-2 border-slate-300">
                <i className="fas fa-user-tie text-3xl text-slate-500"></i>
             </div>
             <div>
                <h3 className="text-2xl font-bold text-slate-800">Chad (MD)</h3>
                <p className="text-slate-500 text-sm uppercase tracking-wide">Managing Director</p>
             </div>
          </div>

          <div className="space-y-4 mb-8">
            <p className="text-lg italic text-slate-600">"Nice suit, rookie. Did your mommy buy it?"</p>
            <div className="animate-bounce text-center py-4">
                <i className="fas fa-file-contract text-4xl text-blue-800"></i>
                <span className="block text-xs font-bold mt-2">THUD</span>
            </div>
            <p className="text-lg text-slate-800 font-medium">"This is a CIM for 'PackFancy'. Artisanal cardboard boxes. Revenue is flat, margins are nonexistent."</p>
            <p className="text-lg text-red-600 font-bold">"I need an IOI by Friday. If you mess this up, don't bother coming back on Monday."</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
             <button
                onClick={() => handleChoice(5)}
                className="w-full text-left p-4 bg-white border border-slate-300 hover:border-blue-600 hover:shadow-md rounded-lg transition-all group"
             >
                <span className="font-bold text-blue-700 block mb-1 group-hover:underline">"I'll crush it, Chad."</span>
                <span className="text-xs text-slate-500">Effect: Chad sneers. "We'll see."</span>
             </button>
             <button
                onClick={() => handleChoice(25)}
                className="w-full text-left p-4 bg-white border border-slate-300 hover:border-red-600 hover:shadow-md rounded-lg transition-all group"
             >
                <span className="font-bold text-slate-700 block mb-1 group-hover:text-red-600">"Cardboard? Really?"</span>
                <span className="text-xs text-slate-500">Effect: Chad stares silently. Stress +20 immediately.</span>
             </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default IntroSequence;
