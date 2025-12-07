import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';

interface TutorialOverlayProps {
  instruction: string;
  step: number;
}

const TOTAL_TUTORIAL_STEPS = 6;

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ instruction, step }) => {
  const { setTutorialStep } = useGame();
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const [showStuckHint, setShowStuckHint] = useState(false);

  // Show hint after 10 seconds on same step
  useEffect(() => {
    setShowStuckHint(false);
    const timer = setTimeout(() => setShowStuckHint(true), 10000);
    return () => clearTimeout(timer);
  }, [step]);

  if (step === 0) return null;

  // Clamp step to valid range for display
  const displayStep = Math.min(step, TOTAL_TUTORIAL_STEPS);
  const isLastStep = step >= TOTAL_TUTORIAL_STEPS;
  const progressPercent = (displayStep / TOTAL_TUTORIAL_STEPS) * 100;

  const handleSkipClick = () => {
    setShowSkipConfirm(true);
  };

  const handleConfirmSkip = () => {
    setTutorialStep(0);
    setShowSkipConfirm(false);
  };

  const handleCancelSkip = () => {
    setShowSkipConfirm(false);
  };

  // Dynamic Positioning Logic to avoid covering buttons
  // Step 1 (Manage Assets) -> Button is Top-Right -> Box Bottom-Center
  // Step 2 (Select Deal)   -> List is Top-Left   -> Box Bottom-Center
  // Step 3 (Analyze)       -> Button is Bottom   -> Box Top-Center
  // Step 4 (Comms)         -> Sidebar Left       -> Box Right-Center (Desktop) or Bottom (Mobile)
  // Step 5 (Chat)          -> Chat Bottom        -> Box Top-Center
  // Step 6 (IOI)           -> Button Bottom      -> Box Top-Center

  const isBottomHeavyStep = step === 3 || step === 5 || step === 6;
  const positionClass = isBottomHeavyStep ? "top-24" : "bottom-24";
  // Order: Box first then pointer (if bottom), Pointer then box (if top)
  // Actually simpler: Always keep pointer "visually" connected to the highlighted element direction
  // For simplicity in this iteration, we just flip the box location.

  return (
    <>
      {/* Full Screen Mask - Visual only, does not block underlying interactions */}
      {/* Z-index hierarchy: Tutorial elements must be above ALL modals (max modal z-index is ~200) */}
      <div
        className="fixed inset-0 bg-black/40 z-[900] pointer-events-none backdrop-blur-[1px] transition-opacity duration-500"
      ></div>

      {/* Sys_Admin Instruction Box */}
      <div className={`fixed left-1/2 transform -translate-x-1/2 z-[950] w-[90vw] md:w-[450px] animate-slide-in pointer-events-none ${positionClass}`}>

        {/* Pointer (Conditional Placement) */}
        {isBottomHeavyStep ? null : (
             <div className={`w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent mx-auto mb-[-1px] border-b-[10px] border-b-amber-500`}></div>
        )}

        <div className="bg-slate-900 border border-amber-500 shadow-[0_0_50px_rgba(245,158,11,0.3)] overflow-hidden rounded-sm pointer-events-auto">
            {/* Header */}
            <div className="bg-amber-500 text-black px-3 py-1 font-bold flex justify-between items-center text-xs font-mono">
                <div className="flex items-center space-x-2">
                    <i className="fas fa-terminal"></i>
                    <span>SYS_ADMIN // TUTORIAL_PROTOCOL</span>
                </div>
                <div className="flex items-center space-x-3">
                    <span>STEP {displayStep}/{TOTAL_TUTORIAL_STEPS}</span>
                    <button
                        onClick={handleSkipClick}
                        className="hover:text-white underline cursor-pointer pointer-events-auto text-[10px]"
                    >
                        [SKIP]
                    </button>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-slate-800/50">
                <div
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-500 ease-out"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>

            {/* Body */}
            <div className="p-4 flex items-start space-x-4 bg-slate-900/95">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border mt-1 ${
                    step === 4 || step === 5
                        ? 'bg-blue-500/10 border-blue-500/30'
                        : 'bg-amber-500/10 border-amber-500/30'
                }`}>
                    <i className={`fas text-lg animate-pulse ${
                        step === 4 || step === 5
                            ? 'fa-glasses text-blue-400'
                            : 'fa-robot text-amber-500'
                    }`}></i>
                </div>
                <div className="flex-1">
                    {/* Character name indicator for Sarah steps */}
                    {(step === 4 || step === 5) && (
                        <div className="text-blue-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                            <i className="fas fa-user mr-1"></i> Introducing: Sarah (Senior Analyst)
                        </div>
                    )}
                    <p className="text-amber-100 font-mono text-sm leading-relaxed typing-effect">
                        <span className="mr-2 text-amber-300">{'>'}</span>
                        {instruction}
                    </p>

                    {/* Stuck hint - shows after 10 seconds */}
                    {showStuckHint && (
                      <div className="mt-3 p-2 bg-red-900/30 border border-red-500/50 rounded text-xs text-red-300">
                        <i className="fas fa-exclamation-triangle mr-2"></i>
                        Stuck? Look for the <span className="text-amber-400 font-bold">glowing button</span> or
                        <button
                          onClick={() => setTutorialStep(Math.min(step + 1, TOTAL_TUTORIAL_STEPS + 1))}
                          className="ml-2 underline text-amber-400 hover:text-amber-300 pointer-events-auto cursor-pointer"
                        >
                          click here to skip this step
                        </button>
                      </div>
                    )}
                </div>
            </div>

            {/* Action Button Footer */}
            <div className="p-3 bg-slate-800/50 border-t border-slate-700/50">
                <button
                    onClick={() => {
                        if (isLastStep) {
                            setTutorialStep(0); // Complete tutorial
                        } else {
                            setTutorialStep(step + 1);
                        }
                    }}
                    className={`
                        w-full py-3 px-4 rounded-lg font-bold text-sm uppercase tracking-wider
                        transition-all duration-200 pointer-events-auto cursor-pointer
                        flex items-center justify-center gap-2
                        ${isLastStep
                            ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-lg shadow-emerald-500/30'
                            : 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black shadow-lg shadow-amber-500/30'
                        }
                    `}
                >
                    {isLastStep ? (
                        <>
                            <i className="fas fa-rocket"></i>
                            START PLAYING
                        </>
                    ) : (
                        <>
                            CONTINUE
                            <i className="fas fa-arrow-right"></i>
                        </>
                    )}
                </button>
            </div>
        </div>

        {/* Pointer (Conditional Placement) */}
        {isBottomHeavyStep ? (
             <div className={`w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent mx-auto mt-[-1px] border-t-[10px] border-t-amber-500`}></div>
        ) : null}

      </div>

      {/* Skip Confirmation Dialog */}
      {showSkipConfirm && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 pointer-events-auto">
          <div className="bg-slate-900 border-2 border-amber-500 rounded-lg shadow-2xl max-w-md w-full p-6 animate-slide-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                <i className="fas fa-exclamation-triangle text-amber-500 text-xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Skip Tutorial?</h3>
                <p className="text-slate-400 text-sm">Machiavelli has something to say...</p>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4 mb-6 border border-slate-700">
              <p className="text-amber-100 text-sm italic">
                "Are you sure, rookie? New players who skip the tutorial are 73% more likely to make disastrous first deals. That's not a real stat - I made it up - but the sentiment holds. Your funeral."
              </p>
              <p className="text-amber-500 text-xs mt-2 font-bold">— Machiavelli, Your Advisor</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancelSkip}
                className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors text-sm"
              >
                <i className="fas fa-book-open mr-2"></i>
                Keep Learning
              </button>
              <button
                onClick={handleConfirmSkip}
                className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold rounded-lg transition-colors text-sm"
              >
                <i className="fas fa-forward mr-2"></i>
                Skip Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TutorialOverlay;
