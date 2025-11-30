import React from 'react';
import { useGame } from '../context/GameContext';

interface TutorialOverlayProps {
  instruction: string;
  step: number;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ instruction, step }) => {
  const { setTutorialStep } = useGame();

  if (step === 0) return null;

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
      <div
        className="fixed inset-0 bg-black/70 z-50 pointer-events-none backdrop-blur-[2px] transition-opacity duration-500"
      ></div>

      {/* Sys_Admin Instruction Box */}
      <div className={`fixed left-1/2 transform -translate-x-1/2 z-[70] w-[90vw] md:w-[450px] animate-slide-in pointer-events-none ${positionClass}`}>

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
                    <span>STEP {step}/6</span>
                    <button
                        onClick={() => setTutorialStep(0)}
                        className="hover:text-white underline cursor-pointer pointer-events-auto text-[10px]"
                    >
                        [SKIP]
                    </button>
                </div>
            </div>

            {/* Body */}
            <div className="p-4 flex items-start space-x-4 bg-slate-900/95">
                <div className="w-10 h-10 bg-amber-500/10 rounded-full flex items-center justify-center shrink-0 border border-amber-500/30 mt-1">
                    <i className="fas fa-robot text-amber-500 text-lg animate-pulse"></i>
                </div>
                <div className="flex-1">
                    <p className="text-amber-100 font-mono text-sm leading-relaxed typing-effect">
                        <span className="mr-2 text-amber-300">{'>'}</span>
                        {instruction}
                    </p>
                </div>
            </div>
        </div>

        {/* Pointer (Conditional Placement) */}
        {isBottomHeavyStep ? (
             <div className={`w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent mx-auto mt-[-1px] border-t-[10px] border-t-amber-500`}></div>
        ) : null}

      </div>
    </>
  );
};

export default TutorialOverlay;
