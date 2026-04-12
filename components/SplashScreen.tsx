import React, { useState, useEffect } from 'react';

interface SplashScreenProps {
  onStart: () => void;
  onContinue?: () => void;
  hasSave: boolean;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onStart, onContinue, hasSave }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  return (
    <div
      className="fixed inset-0 bg-[#030303] flex flex-col items-center justify-center transition-opacity duration-500"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {/* Scanline overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
        }}
      />

      <div className="relative z-10 text-center space-y-8">
        <h1
          className="text-5xl md:text-7xl font-mono font-bold text-amber-500 tracking-widest"
          style={{ textShadow: '0 0 30px rgba(245,158,11,0.15)' }}
        >
          FUND WARS
        </h1>

        <p className="text-gray-400 text-sm font-mono uppercase tracking-[0.3em]">
          Survive the world of private equity
        </p>

        <div className="flex flex-col items-center gap-3 pt-4">
          {hasSave && onContinue && (
            <button
              onClick={onContinue}
              className="px-8 py-3 bg-amber-500/10 border border-amber-500/40 text-amber-400 font-mono text-sm uppercase tracking-wider rounded hover:bg-amber-500/20 transition-colors w-64"
            >
              [CONTINUE]
            </button>
          )}
          <button
            onClick={onStart}
            className="px-8 py-3 bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 font-mono text-sm uppercase tracking-wider rounded hover:bg-emerald-500/20 transition-colors w-64"
          >
            [START YOUR CAREER]
          </button>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 text-gray-600 text-xs font-mono">
        v9.2.0
      </div>
    </div>
  );
};

export default SplashScreen;
