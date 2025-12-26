/**
 * StoryScene Component
 *
 * The main presentation layer for narrative scenes.
 * Features:
 * - Typewriter text animation
 * - Auto-advance with countdown
 * - Consequence animations
 * - Smooth transitions
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Scene, Choice, ChoiceEffects } from '../../types/storyEngine';
import { useStoryEngine } from '../../contexts/StoryEngineContext';
import StoryChoice from './StoryChoice';
import CharacterPortrait from './CharacterPortrait';
import TypewriterText from './TypewriterText';
import ConsequenceAnimator from './ConsequenceAnimator';
import StatusBar from './StatusBar';
import ContextDrawer from './ContextDrawer';
import { useGameLoop } from '../../hooks/useGameLoop';

interface StorySceneProps {
  scene: Scene;
  onChoiceSelect?: (choice: Choice) => void;
}

const StoryScene: React.FC<StorySceneProps> = ({ scene, onChoiceSelect }) => {
  const {
    availableChoices,
    canAutoAdvance,
    makeChoice,
    advanceScene,
    game,
    state,
  } = useStoryEngine();

  const {
    isWaitingToAdvance,
    autoAdvanceCountdown,
    skipAutoAdvance,
  } = useGameLoop({ autoAdvanceDelay: 3000 });

  const [showChoices, setShowChoices] = useState(false);
  const [textComplete, setTextComplete] = useState(false);
  const [pendingEffects, setPendingEffects] = useState<ChoiceEffects | null>(null);
  const [showEffects, setShowEffects] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const sceneRef = useRef<HTMLDivElement>(null);

  // Reset state when scene changes
  useEffect(() => {
    setShowChoices(false);
    setTextComplete(false);
    setPendingEffects(null);
    setShowEffects(false);

    // Scroll to top on scene change
    sceneRef.current?.scrollTo(0, 0);
  }, [scene.id]);

  // Show choices after text is complete
  useEffect(() => {
    if (textComplete) {
      const timer = setTimeout(() => {
        setShowChoices(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [textComplete]);

  const handleTextComplete = useCallback(() => {
    setTextComplete(true);
  }, []);

  const handleChoiceClick = useCallback(
    (choice: Choice) => {
      if (!choice || state.isTransitioning) return;

      // Show effects animation
      if (choice.effects) {
        setPendingEffects(choice.effects);
        setShowEffects(true);

        // Make the choice after effects are shown
        setTimeout(() => {
          onChoiceSelect?.(choice);
          makeChoice(choice);
          setShowEffects(false);
          setPendingEffects(null);
        }, choice.effects.relationships?.length || choice.effects.stats ? 1500 : 500);
      } else {
        onChoiceSelect?.(choice);
        makeChoice(choice);
      }
    },
    [makeChoice, onChoiceSelect, state.isTransitioning]
  );

  const handleContinue = useCallback(() => {
    if (canAutoAdvance && !state.isTransitioning) {
      advanceScene();
    }
  }, [canAutoAdvance, advanceScene, state.isTransitioning]);

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      // Number keys for choices
      if (e.key >= '1' && e.key <= '9' && showChoices) {
        const index = parseInt(e.key) - 1;
        if (availableChoices[index]?.available && !state.isTransitioning) {
          handleChoiceClick(availableChoices[index]);
        }
      }

      // Space or Enter to continue or skip
      if ((e.key === ' ' || e.key === 'Enter') && !showChoices) {
        if (!textComplete) {
          setTextComplete(true);
        } else if (canAutoAdvance) {
          skipAutoAdvance();
        }
      }
    },
    [showChoices, availableChoices, textComplete, canAutoAdvance, handleChoiceClick, skipAutoAdvance, state.isTransitioning]
  );

  // Keyboard controls
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // Get atmosphere styling
  const getAtmosphereClass = (atmosphere?: Scene['atmosphere']) => {
    switch (atmosphere) {
      case 'crisis':
        return 'border-l-red-500';
      case 'celebration':
        return 'border-l-yellow-500';
      case 'meeting':
        return 'border-l-blue-500';
      case 'party':
        return 'border-l-purple-500';
      default:
        return 'border-l-green-500/50';
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 flex flex-col">
      {/* Status Bar */}
      <StatusBar
        onMenuClick={() => setIsDrawerOpen(true)}
        onStatsClick={() => setShowStats(!showStats)}
        expanded={showStats}
      />

      {/* Main Content */}
      <div
        ref={sceneRef}
        className="flex-1 overflow-y-auto pb-4"
        style={{
          WebkitOverflowScrolling: 'touch',
          paddingTop: 'calc(4rem + env(safe-area-inset-top, 0px))'
        }}
      >
        <div className="max-w-3xl mx-auto p-6">
          {/* Scene type indicator */}
          {scene.type === 'chapter_end' && (
            <div className="text-center mb-8">
              <div className="text-yellow-500 text-sm font-mono tracking-widest mb-2">
                CHAPTER COMPLETE
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent" />
            </div>
          )}

          {/* Character Portrait for dialogue scenes */}
          {scene.speaker && (
            <div className="mb-6 flex items-center gap-4">
              <CharacterPortrait speaker={scene.speaker} />
              <div>
                <span className="text-green-400 font-bold text-lg">{scene.speaker.name}</span>
                {scene.speaker.mood && scene.speaker.mood !== 'neutral' && (
                  <span className="text-gray-500 text-sm ml-2">
                    ({scene.speaker.mood})
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Narrative Text with Typewriter Effect */}
          <div
            className={`
              prose prose-invert max-w-none
              border-l-4 pl-6 py-4
              ${getAtmosphereClass(scene.atmosphere)}
              transition-all duration-300
            `}
          >
            <TypewriterText
              text={scene.narrative}
              speed={60}
              onComplete={handleTextComplete}
              isComplete={textComplete}
            />
          </div>

          {/* Consequence Animation */}
          {showEffects && pendingEffects && (
            <div className="mt-6 border-l-4 border-amber-500/50 pl-6">
              <ConsequenceAnimator
                effects={pendingEffects}
                delay={600}
              />
            </div>
          )}

          {/* Choices */}
          {showChoices && availableChoices.length > 0 && !showEffects && (
            <div className="mt-8 mb-8 space-y-3 animate-fade-in">
              <div className="text-gray-500 text-sm font-mono mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                CHOOSE YOUR RESPONSE:
              </div>
              {availableChoices.map((choice, index) => (
                <StoryChoice
                  key={choice.id}
                  choice={choice}
                  index={index}
                  onClick={() => handleChoiceClick(choice)}
                  disabled={!choice.available || state.isTransitioning || showEffects}
                />
              ))}
            </div>
          )}

          {/* Auto-advance button with countdown */}
          {showChoices && canAutoAdvance && !showEffects && (
            <div className="mt-8 mb-8">
              <button
                onClick={handleContinue}
                disabled={state.isTransitioning}
                className="
                  w-full py-4 px-6
                  bg-gray-900 hover:bg-gray-800
                  border border-gray-700 hover:border-green-500
                  text-green-400 font-mono
                  transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed
                  relative overflow-hidden group
                "
              >
                {/* Progress bar for auto-advance */}
                {isWaitingToAdvance && (
                  <div
                    className="absolute bottom-0 left-0 h-1 bg-green-500/50 transition-all duration-1000"
                    style={{
                      width: `${((3 - autoAdvanceCountdown) / 3) * 100}%`,
                    }}
                  />
                )}

                <span className="flex items-center justify-center gap-3">
                  Continue
                  <span className="text-gray-500 text-sm">
                    {isWaitingToAdvance && autoAdvanceCountdown > 0 && (
                      <span>({autoAdvanceCountdown}s)</span>
                    )}
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                      [SPACE]
                    </span>
                  </span>
                </span>
              </button>
            </div>
          )}

          {/* Skip text hint */}
          {!textComplete && (
            <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 pointer-events-none">
              <button
                onClick={() => setTextComplete(true)}
                className="text-gray-600 hover:text-gray-400 text-xs font-mono transition-colors pointer-events-auto"
              >
                Click or press SPACE to skip
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-800 p-3 bg-black">
        <div className="max-w-3xl mx-auto flex justify-between items-center text-xs font-mono text-gray-600">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-2 hover:text-gray-400 transition-colors"
          >
            <i className="fas fa-chevron-up" />
            <span>Details</span>
          </button>

          <span className="uppercase tracking-wider">
            {scene.type.replace('_', ' ')}
          </span>

          <span>FUND WARS</span>
        </div>
      </div>

      {/* Context Drawer */}
      <ContextDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
};

export default StoryScene;

// Add CSS animation
const styles = `
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.4s ease-out forwards;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const existing = document.getElementById('story-scene-styles');
  if (!existing) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'story-scene-styles';
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }
}
