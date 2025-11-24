
import React from 'react';

interface TutorialOverlayProps {
  instruction: string;
  step: number;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ instruction, step }) => {
  if (step === 0) return null;

  return (
    <>
      {/* Full Screen Mask - Blocks clicks everywhere except raised elements */}
      <div className="fixed inset-0 bg-black/60 z-50 pointer-events-auto backdrop-blur-[1px]"></div>

      {/* Sys_Admin Instruction Box */}
      <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[70] w-[450px] animate-slide-in">
        <div className="bg-amber-500 text-black px-2 py-1 font-bold flex justify-between items-center text-xs font-mono border-t border-l border-r border-amber-600">
           <div className="flex items-center space-x-2">
               <i className="fas fa-terminal"></i>
               <span>SYS_ADMIN // TUTORIAL_PROTOCOL</span>
           </div>
           <span>STEP {step}/6</span>
        </div>
        <div className="bg-slate-900 border border-amber-500 p-4 shadow-[0_0_50px_rgba(245,158,11,0.3)]">
           <div className="flex items-start space-x-4">
               <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center shrink-0 border border-amber-500/30">
                   <i className="fas fa-robot text-amber-500 text-xl animate-pulse"></i>
               </div>
               <div>
                   <p className="text-amber-500 font-mono text-sm leading-relaxed typing-effect">
                       {">"} {instruction}
                   </p>
               </div>
           </div>
        </div>
        {/* Pointer Triangle */}
        <div className="w-0 h-0 border-l-[10px] border-l-transparent border-t-[10px] border-t-amber-500 border-r-[10px] border-r-transparent mx-auto"></div>
      </div>
    </>
  );
};

export default TutorialOverlay;
