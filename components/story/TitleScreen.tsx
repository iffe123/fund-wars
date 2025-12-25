/**
 * TitleScreen Component
 *
 * The main menu / title screen for Fund Wars.
 */

import React, { useState, useEffect } from 'react';
import { useStoryEngine } from '../../contexts/StoryEngineContext';

interface TitleScreenProps {
  onNewGame: () => void;
  onContinue?: () => void;
  hasSavedGame?: boolean;
}

const TitleScreen: React.FC<TitleScreenProps> = ({ onNewGame, onContinue, hasSavedGame }) => {
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const subtitleTimer = setTimeout(() => setShowSubtitle(true), 800);
    const menuTimer = setTimeout(() => setShowMenu(true), 1500);

    return () => {
      clearTimeout(subtitleTimer);
      clearTimeout(menuTimer);
    };
  }, []);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8">
      {/* Background effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-black to-black opacity-50" />

      {/* Scanlines effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0, 255, 0, 0.03) 1px, rgba(0, 255, 0, 0.03) 2px)',
        }}
      />

      <div className="relative z-10 text-center">
        {/* Title */}
        <h1 className="text-6xl md:text-8xl font-bold tracking-wider mb-4">
          <span className="text-green-400">FUND</span>
          <span className="text-gray-100">WARS</span>
        </h1>

        {/* Subtitle */}
        <div
          className={`
            text-gray-500 text-lg md:text-xl font-mono mb-12
            transition-opacity duration-1000
            ${showSubtitle ? 'opacity-100' : 'opacity-0'}
          `}
        >
          A PRIVATE EQUITY ADVENTURE
        </div>

        {/* Tagline */}
        <div
          className={`
            text-gray-600 text-sm italic mb-16 max-w-md mx-auto
            transition-opacity duration-1000 delay-300
            ${showSubtitle ? 'opacity-100' : 'opacity-0'}
          `}
        >
          "Where dreams are leveraged, synergies are realized, and ethics are... negotiable."
        </div>

        {/* Menu */}
        <div
          className={`
            space-y-4
            transition-all duration-500
            ${showMenu ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}
        >
          {/* Continue button (if saved game exists) */}
          {hasSavedGame && onContinue && (
            <button
              onClick={onContinue}
              className="
                w-64 py-4 px-8
                bg-green-900/30 hover:bg-green-900/50
                border border-green-700 hover:border-green-500
                text-green-400 font-mono text-lg
                transition-all duration-200
                block mx-auto
              "
            >
              CONTINUE
            </button>
          )}

          {/* New Game button */}
          <button
            onClick={onNewGame}
            className="
              w-64 py-4 px-8
              bg-gray-900 hover:bg-gray-800
              border border-gray-700 hover:border-green-500
              text-gray-100 font-mono text-lg
              transition-all duration-200
              block mx-auto
            "
          >
            NEW GAME
          </button>

          {/* Settings (placeholder) */}
          <button
            disabled
            className="
              w-64 py-3 px-8
              bg-gray-900/50
              border border-gray-800
              text-gray-600 font-mono
              cursor-not-allowed
              block mx-auto
            "
          >
            SETTINGS
          </button>
        </div>

        {/* Version info */}
        <div className="absolute bottom-8 left-0 right-0 text-center text-gray-700 text-xs font-mono">
          v2.0.0 // STORY ENGINE
        </div>
      </div>
    </div>
  );
};

export default TitleScreen;
