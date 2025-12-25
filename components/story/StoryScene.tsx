/**
 * StoryScene Component
 *
 * The main presentation layer for narrative scenes.
 * Renders text, choices, and manages transitions.
 */

import React, { useState, useEffect, useCallback } from 'react';
import type { Scene, Choice } from '../../types/storyEngine';
import { useStoryEngine } from '../../contexts/StoryEngineContext';
import StoryChoice from './StoryChoice';
import CharacterPortrait from './CharacterPortrait';

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

  const [isTextRevealed, setIsTextRevealed] = useState(false);
  const [showChoices, setShowChoices] = useState(false);

  // Text reveal animation
  useEffect(() => {
    setIsTextRevealed(false);
    setShowChoices(false);

    // Reveal text after a short delay
    const textTimer = setTimeout(() => {
      setIsTextRevealed(true);
    }, 100);

    // Show choices after text is visible
    const choicesTimer = setTimeout(() => {
      setShowChoices(true);
    }, 800);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(choicesTimer);
    };
  }, [scene.id]);

  const handleChoiceClick = useCallback(
    (choice: Choice) => {
      if (!choice) return;
      onChoiceSelect?.(choice);
      makeChoice(choice);
    },
    [makeChoice, onChoiceSelect]
  );

  const handleContinue = useCallback(() => {
    if (canAutoAdvance) {
      advanceScene();
    }
  }, [canAutoAdvance, advanceScene]);

  // Parse markdown-like text
  const renderNarrative = (text: string) => {
    // Split by paragraphs
    const paragraphs = text.split('\n\n');

    return paragraphs.map((paragraph, index) => {
      // Handle dialogue (text wrapped in **)
      let formattedText = paragraph;

      // Bold text **text**
      formattedText = formattedText.replace(
        /\*\*(.+?)\*\*/g,
        '<strong class="text-green-400">$1</strong>'
      );

      // Italic text *text*
      formattedText = formattedText.replace(
        /\*([^*]+)\*/g,
        '<em class="text-gray-400 italic">$1</em>'
      );

      // Special styling for narrator comments
      if (paragraph.startsWith('*') && paragraph.endsWith('*') && !paragraph.includes('**')) {
        return (
          <p
            key={index}
            className="text-gray-500 italic text-sm mt-4 border-l-2 border-gray-700 pl-3"
            dangerouslySetInnerHTML={{ __html: formattedText }}
          />
        );
      }

      return (
        <p
          key={index}
          className="mb-4 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formattedText }}
        />
      );
    });
  };

  // Get atmosphere background class
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
        return 'border-l-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-800 p-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {scene.type === 'chapter_end' && (
              <span className="text-yellow-500 text-sm font-mono">CHAPTER COMPLETE</span>
            )}
            {scene.type !== 'chapter_end' && (
              <span className="text-gray-500 text-sm font-mono">{scene.title}</span>
            )}
          </div>
          {game && (
            <div className="flex gap-4 text-xs font-mono">
              <span className="text-green-500">REP: {game.stats.reputation}</span>
              <span className="text-yellow-500">${game.stats.money.toLocaleString()}</span>
              <span className="text-red-500">STRESS: {game.stats.stress}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-6">
          {/* Character Portrait for dialogue scenes */}
          {scene.speaker && (
            <div className="mb-6 flex items-center gap-4">
              <CharacterPortrait speaker={scene.speaker} />
              <div>
                <span className="text-green-400 font-bold">{scene.speaker.name}</span>
              </div>
            </div>
          )}

          {/* Narrative Text */}
          <div
            className={`
              prose prose-invert max-w-none
              border-l-4 pl-6 py-2
              ${getAtmosphereClass(scene.atmosphere)}
              transition-opacity duration-500
              ${isTextRevealed ? 'opacity-100' : 'opacity-0'}
            `}
          >
            {renderNarrative(scene.narrative)}
          </div>

          {/* Choices */}
          {showChoices && availableChoices.length > 0 && (
            <div className="mt-8 space-y-3">
              <div className="text-gray-500 text-sm font-mono mb-4">CHOOSE YOUR RESPONSE:</div>
              {availableChoices.map((choice, index) => (
                <StoryChoice
                  key={choice.id}
                  choice={choice}
                  index={index}
                  onClick={() => handleChoiceClick(choice)}
                  disabled={!choice.available || state.isTransitioning}
                />
              ))}
            </div>
          )}

          {/* Auto-advance button */}
          {showChoices && canAutoAdvance && (
            <div className="mt-8">
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
                "
              >
                Continue →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer with quick stats */}
      <div className="border-t border-gray-800 p-3">
        <div className="max-w-3xl mx-auto flex justify-between text-xs font-mono text-gray-600">
          <span>FUND WARS</span>
          <span>
            {scene.type === 'dialogue' && 'DIALOGUE'}
            {scene.type === 'narrative' && 'NARRATIVE'}
            {scene.type === 'decision' && 'DECISION'}
            {scene.type === 'outcome' && 'OUTCOME'}
            {scene.type === 'chapter_end' && 'CHAPTER END'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StoryScene;
