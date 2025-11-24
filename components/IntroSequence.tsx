
import React, { useState, useEffect } from 'react';

interface IntroSequenceProps {
  onComplete: (stressLevel: number) => void;
}

const IntroSequence: React.FC<IntroSequenceProps> = ({ onComplete }) => {
  const [stage, setStage] = useState(0);
  const [textVisible, setTextVisible] = useState(false);

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

  const handleChoice = (stress: number) => {
    onComplete(stress);
  };

  // Stage 1: The Glory
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

  // Stage 2: The Crash
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

  // Stage 3: The Encounter
  if (stage === 2) {
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
