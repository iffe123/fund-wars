/**
 * DevChapterSelector Component
 *
 * Development-only component for quickly jumping to different chapters.
 * This allows developers to test specific chapters without playing through
 * the entire game. Remove or hide this component for production builds.
 */

import React, { useState } from 'react';
import { useStoryEngine } from '../contexts/StoryEngineContext';
import { STORY_CHAPTERS } from '../content/storyContent';
import { Z_INDEX } from '../constants';

interface DevChapterSelectorProps {
  onChapterStart?: () => void;
}

const DevChapterSelector: React.FC<DevChapterSelectorProps> = ({ onChapterStart }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { startNewGame, startChapter, game } = useStoryEngine();

  const handleChapterSelect = (chapterId: string) => {
    // If no game exists, start a new one first
    if (!game) {
      startNewGame('Developer');
    }

    // Small delay to ensure game state is initialized
    setTimeout(() => {
      startChapter(chapterId);
      setIsOpen(false);
      onChapterStart?.();
    }, 100);
  };

  return (
    <div
      className="fixed top-16 left-4"
      style={{ zIndex: Z_INDEX.max }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-purple-800 text-white text-[10px] px-3 py-2 border-2 border-yellow-400 rounded shadow-lg hover:bg-purple-700 flex items-center gap-1 animate-pulse"
      >
        <span className="text-yellow-300 font-bold">DEV</span>
        <span>Chapters</span>
        <span className="ml-1">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-slate-900 border-2 border-purple-500 rounded shadow-lg min-w-[220px]">
          <div className="p-2 border-b border-purple-500/50 bg-purple-900/30">
            <div className="text-[10px] text-purple-300 uppercase tracking-wider font-bold">
              Jump to Chapter (Dev Only)
            </div>
          </div>
          <div className="p-1">
            {STORY_CHAPTERS.map((chapter) => (
              <button
                key={chapter.id}
                onClick={() => handleChapterSelect(chapter.id)}
                className="w-full text-left px-3 py-2 hover:bg-purple-800/30 rounded transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-300 font-bold">
                      Chapter {chapter.number}: {chapter.title}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {chapter.teaser?.substring(0, 50)}...
                    </div>
                  </div>
                  <div className="text-[9px] text-slate-600">
                    ~{chapter.estimatedMinutes}min
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="p-2 border-t border-purple-500/30 bg-slate-800/50">
            <div className="text-[9px] text-slate-500 text-center">
              This selector bypasses normal progression
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevChapterSelector;
