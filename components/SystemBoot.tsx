
import React, { useState, useEffect } from 'react';
import { TerminalButton } from './TerminalUI';

interface SystemBootProps {
  onComplete: () => void;
}

const SystemBoot: React.FC<SystemBootProps> = ({ onComplete }) => {
  const [bootLog, setBootLog] = useState<string[]>([]);
  const [showLogin, setShowLogin] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  const steps = [
    { delay: 500, text: "INITIALIZING FUND_WARS_OS v9.2..." },
    { delay: 1200, text: "CHECKING MEMORY... 64GB OK" },
    { delay: 1600, text: "MOUNTING DRIVES... /ROOT OK" },
    { delay: 2200, text: "LOADING ETHICS_MODULE..." },
    { delay: 3500, text: "ERROR: ETHICS_MODULE NOT FOUND (SKIPPING...)" },
    { delay: 4000, text: "ESTABLISHING SECURE CONNECTION..." },
    { delay: 4500, text: "CONNECTED." },
  ];

  useEffect(() => {
    let timeoutIds: ReturnType<typeof setTimeout>[] = [];
    
    steps.forEach((step) => {
      const id = setTimeout(() => {
        setBootLog(prev => [...prev, step.text]);
      }, step.delay);
      timeoutIds.push(id);
    });

    const loginId = setTimeout(() => setShowLogin(true), 5000);
    timeoutIds.push(loginId);

    return () => timeoutIds.forEach(clearTimeout);
  }, []);

  const handleInitialize = () => {
    setShowLogin(false);
    setTutorialStep(1);
  };

  const tutorials = [
    {
      title: "SYS_ADMIN",
      text: "Oh look, another MBA. Welcome to the terminal, kid.",
      action: "Next"
    },
    {
      title: "SYS_ADMIN",
      text: "Top Left is your Money. Try not to make it zero.",
      action: "Understood"
    },
    {
      title: "SYS_ADMIN",
      text: "Top Right is your Stress. If this hits 100, you have a stroke. I hate filling out paperwork for strokes.",
      action: "Noted"
    },
    {
      title: "SYS_ADMIN",
      text: "Center Screen is the Meat Grinder. This is where you buy companies you don't understand.",
      action: "Okay"
    },
    {
      title: "SYS_ADMIN",
      text: "Now, open the 'PackFancy' CIM. And don't break anything.",
      action: "BOOT_SYSTEM"
    }
  ];

  if (tutorialStep > 0 && tutorialStep <= tutorials.length) {
    const current = tutorials[tutorialStep - 1];
    return (
       <div className="fixed inset-0 bg-black z-50 flex items-center justify-center font-mono">
           <div className="w-[500px] border border-amber-500 bg-slate-900 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
               <div className="bg-amber-500 text-black px-2 py-1 font-bold flex justify-between">
                   <span>MESSAGE_FROM: {current.title}</span>
                   <span>[X]</span>
               </div>
               <div className="p-6 text-amber-500">
                   <p className="text-lg mb-6 leading-relaxed typing-effect">
                       {">"} {current.text}
                   </p>
                   <div className="flex justify-end">
                       <TerminalButton 
                         variant="warning" 
                         label={current.action} 
                         onClick={() => {
                             if (tutorialStep === tutorials.length) onComplete();
                             else setTutorialStep(prev => prev + 1);
                         }} 
                       />
                   </div>
               </div>
           </div>
       </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black text-green-500 font-mono p-8 z-50 flex flex-col">
      <div className="flex-1 space-y-1">
        {bootLog.map((log, i) => (
          <div key={i} className={log.includes("ERROR") ? "text-red-500" : ""}>{">"} {log}</div>
        ))}
        {showLogin && <div className="animate-pulse">{">"} AWAITING INPUT_</div>}
      </div>
      
      {showLogin && (
          <div className="flex justify-center mb-20">
              <button 
                onClick={handleInitialize}
                className="border border-green-500 text-green-500 px-8 py-3 hover:bg-green-500 hover:text-black transition-colors font-bold tracking-widest uppercase animate-pulse"
              >
                  [ INITIALIZE_SESSION ]
              </button>
          </div>
      )}
    </div>
  );
};

export default SystemBoot;
