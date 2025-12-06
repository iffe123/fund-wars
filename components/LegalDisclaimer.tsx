
import React, { useState } from 'react';

interface LegalDisclaimerProps {
  onAccept: () => void;
}

const LegalDisclaimer: React.FC<LegalDisclaimerProps> = ({ onAccept }) => {
  const [canProceed, setCanProceed] = useState(false);

  // Force user to read for 2 seconds
  React.useEffect(() => {
      setTimeout(() => setCanProceed(true), 2000);
  }, []);

  return (
    <div className="fixed inset-0 bg-black text-white font-mono p-8 flex flex-col items-center justify-center z-[100]">
      <div className="max-w-2xl border border-white p-8">
        <h1 className="text-2xl font-bold mb-6 text-red-500 blink">WARNING: SIMULATION ONLY</h1>
        
        <div className="space-y-4 text-xs leading-relaxed text-slate-300">
            <p>
                1. THIS SOFTWARE IS A WORK OF FICTION. No financial advice is given, implied, or intended. 
                Any resemblance to actual persons, living or dead, or actual entities (e.g., Goldman Sachs, The SEC, BlackRock) 
                is purely coincidental and intended for satirical purposes only.
            </p>
            <p>
                2. GAMIFIED LOSS. This application simulates high-stakes financial trading. 
                Do not attempt these strategies in real life. Leveraged Buyouts (LBOs), Insider Trading, 
                and Corporate Espionage are illegal and/or highly risky.
            </p>
            <p>
                3. DATA COLLECTION. This application collects anonymous telemetry data regarding gameplay 
                decisions to improve the simulation model. No personally identifiable financial data is stored.
            </p>
        </div>

        <div className="mt-8 flex justify-center">
            <button
                onClick={onAccept}
                disabled={!canProceed}
                className={`
                    border-2 border-white px-6 py-3 font-bold uppercase tracking-widest transition-all
                    ${canProceed ? 'bg-white text-black hover:bg-slate-200' : 'opacity-30 cursor-not-allowed'}
                `}
            >
                {canProceed ? "[ I UNDERSTAND & AGREE ]" : "READING PROTOCOLS..."}
            </button>
        </div>
      </div>
      <div className="mt-4 text-[10px] text-slate-400">
          FUND_WARS_OS // COMPLIANCE_LAYER_V1.0
      </div>
    </div>
  );
};

export default LegalDisclaimer;
