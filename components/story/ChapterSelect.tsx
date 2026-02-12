/**
 * ChapterSelect Component
 *
 * Allows the player to select which chapter to play.
 * Shows story path information when a path is selected.
 */

import React from 'react';
import { useStoryEngine } from '../../contexts/StoryEngineContext';
import type { Chapter } from '../../types/storyEngine';

interface ChapterSelectProps {
  onChapterSelect: (chapterId: string) => void;
  onBack: () => void;
}

const PATH_COLORS: Record<string, { border: string; bg: string; text: string; badge: string }> = {
  dealmaker: { border: 'border-red-500', bg: 'bg-red-900/20', text: 'text-red-400', badge: 'bg-red-900/50 text-red-400' },
  operator: { border: 'border-green-500', bg: 'bg-green-900/20', text: 'text-green-400', badge: 'bg-green-900/50 text-green-400' },
  power_broker: { border: 'border-purple-500', bg: 'bg-purple-900/20', text: 'text-purple-400', badge: 'bg-purple-900/50 text-purple-400' },
};

const ChapterSelect: React.FC<ChapterSelectProps> = ({ onChapterSelect, onBack }) => {
  const { getAvailableChapters, game, currentPath } = useStoryEngine();

  const availableChapters = getAvailableChapters();

  // Check if a chapter is unlocked
  const isChapterUnlocked = (chapter: Chapter): boolean => {
    if (!chapter.requirements) return true;
    if (!game) return chapter.number === 1;

    const { completedChapters, requiredFlags, requiredPath } = chapter.requirements;

    if (completedChapters) {
      for (const req of completedChapters) {
        if (!game.completedChapters.includes(req)) return false;
      }
    }

    if (requiredFlags) {
      for (const flag of requiredFlags) {
        if (!game.flags.has(flag)) return false;
      }
    }

    if (requiredPath && game.currentPath !== requiredPath) return false;

    return true;
  };

  // Check if chapter is completed
  const isChapterCompleted = (chapterId: string): boolean => {
    return game?.completedChapters.includes(chapterId) || false;
  };

  // Get path-based color scheme for a chapter
  const getChapterColors = (chapter: Chapter) => {
    if (chapter.pathId && PATH_COLORS[chapter.pathId]) {
      return PATH_COLORS[chapter.pathId];
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 p-8">
      {/* Header */}
      <div className="max-w-3xl mx-auto">
        <button
          onClick={onBack}
          className="text-gray-500 hover:text-green-400 font-mono text-sm mb-8 transition-colors"
        >
          ← BACK TO MENU
        </button>

        <h1 className="text-4xl font-bold mb-2">
          <span className="text-green-400">SELECT</span> CHAPTER
        </h1>
        <p className="text-gray-500 mb-4">Choose your path through Sterling Partners.</p>

        {/* Current Path Badge */}
        {currentPath && (
          <div className={`mb-8 p-4 border rounded-sm ${PATH_COLORS[currentPath.id]?.border || 'border-gray-700'} ${PATH_COLORS[currentPath.id]?.bg || 'bg-gray-900'}`}>
            <div className="flex items-center gap-3">
              <i className={`fas ${currentPath.icon} ${PATH_COLORS[currentPath.id]?.text || 'text-green-400'} text-xl`} />
              <div>
                <div className={`font-mono text-sm ${PATH_COLORS[currentPath.id]?.text || 'text-green-400'}`}>
                  YOUR PATH
                </div>
                <div className="text-gray-100 font-bold text-lg">{currentPath.title}</div>
                <div className="text-gray-400 text-sm">{currentPath.description}</div>
              </div>
            </div>
          </div>
        )}

        {/* Chapter Grid */}
        <div className="space-y-4">
          {availableChapters.map(chapter => {
            const unlocked = isChapterUnlocked(chapter);
            const completed = isChapterCompleted(chapter.id);
            const pathColors = getChapterColors(chapter);

            return (
              <button
                key={chapter.id}
                onClick={() => unlocked && onChapterSelect(chapter.id)}
                disabled={!unlocked}
                className={`
                  w-full text-left p-6
                  border rounded-sm
                  transition-all duration-200
                  ${
                    unlocked
                      ? `${pathColors ? `${pathColors.border} hover:${pathColors.border}` : 'border-gray-700 hover:border-green-500'} bg-gray-900 hover:bg-gray-800 cursor-pointer`
                      : 'border-gray-800 bg-gray-900/50 cursor-not-allowed'
                  }
                `}
              >
                <div className="flex items-start justify-between">
                  <div>
                    {/* Chapter Number */}
                    <div className="text-gray-500 text-sm font-mono mb-1">
                      CHAPTER {chapter.number}
                      {chapter.pathId && (
                        <span className={`ml-2 ${pathColors?.text || 'text-green-400'}`}>
                          <i className={`fas ${currentPath?.icon || 'fa-route'} mr-1`} />
                          {currentPath?.title || chapter.pathId.toUpperCase()}
                        </span>
                      )}
                      {completed && <span className="text-green-500 ml-2">✓ COMPLETED</span>}
                      {!unlocked && <span className="text-red-500 ml-2">🔒 LOCKED</span>}
                    </div>

                    {/* Title */}
                    <h2
                      className={`text-xl font-bold mb-2 ${unlocked ? 'text-gray-100' : 'text-gray-600'}`}
                    >
                      {chapter.title}
                    </h2>

                    {/* Teaser */}
                    <p className={`text-sm ${unlocked ? 'text-gray-400' : 'text-gray-600'}`}>
                      {unlocked ? chapter.teaser : 'Complete previous chapters to unlock.'}
                    </p>
                  </div>

                  {/* Play time estimate */}
                  {chapter.estimatedMinutes && unlocked && (
                    <div className="text-gray-600 text-xs font-mono">
                      ~{chapter.estimatedMinutes} MIN
                    </div>
                  )}
                </div>

                {/* Theme indicator */}
                {unlocked && chapter.theme && (
                  <div className="mt-4 flex gap-2">
                    <span
                      className={`
                        text-xs font-mono px-2 py-1 rounded-sm
                        ${chapter.theme === 'introduction' ? 'bg-blue-900/50 text-blue-400' : ''}
                        ${chapter.theme === 'rising_action' ? 'bg-yellow-900/50 text-yellow-400' : ''}
                        ${chapter.theme === 'crisis' ? 'bg-red-900/50 text-red-400' : ''}
                        ${chapter.theme === 'resolution' ? 'bg-green-900/50 text-green-400' : ''}
                        ${chapter.theme === 'epilogue' ? 'bg-purple-900/50 text-purple-400' : ''}
                      `}
                    >
                      {chapter.theme.toUpperCase().replace('_', ' ')}
                    </span>

                    {chapter.pathId && (
                      <span className={`text-xs font-mono px-2 py-1 rounded-sm ${pathColors?.badge || ''}`}>
                        <i className={`fas ${currentPath?.icon || 'fa-route'} mr-1`} />
                        PATH EXCLUSIVE
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* No chapters available message */}
        {availableChapters.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-4">No chapters available yet.</p>
            <p className="text-sm">Start a new game to begin your journey.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChapterSelect;
