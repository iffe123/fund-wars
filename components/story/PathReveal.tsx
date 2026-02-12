/**
 * PathReveal Component
 *
 * A dramatic path selection screen shown after Chapter 4.
 * Players choose between three career trajectories that determine
 * which chapters they play next.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useStoryEngine } from '../../contexts/StoryEngineContext';
import { generatePathDescription } from '../../services/dynamicAIService';
import type { StoryPath } from '../../types/storyEngine';

interface PathRevealProps {
  onPathSelected: () => void;
}

const PATH_STYLES: Record<string, {
  border: string;
  bg: string;
  bgHover: string;
  text: string;
  glow: string;
  gradient: string;
}> = {
  dealmaker: {
    border: 'border-red-500',
    bg: 'bg-red-900/10',
    bgHover: 'hover:bg-red-900/20',
    text: 'text-red-400',
    glow: 'shadow-red-500/20',
    gradient: 'from-red-500/20 to-transparent',
  },
  operator: {
    border: 'border-green-500',
    bg: 'bg-green-900/10',
    bgHover: 'hover:bg-green-900/20',
    text: 'text-green-400',
    glow: 'shadow-green-500/20',
    gradient: 'from-green-500/20 to-transparent',
  },
  power_broker: {
    border: 'border-purple-500',
    bg: 'bg-purple-900/10',
    bgHover: 'hover:bg-purple-900/20',
    text: 'text-purple-400',
    glow: 'shadow-purple-500/20',
    gradient: 'from-purple-500/20 to-transparent',
  },
};

const PathReveal: React.FC<PathRevealProps> = ({ onPathSelected }) => {
  const { getAvailablePaths, selectPath, game, hasDynamicAI } = useStoryEngine();
  const [phase, setPhase] = useState<'intro' | 'reveal' | 'selecting' | 'confirmed'>('intro');
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [dynamicDescriptions, setDynamicDescriptions] = useState<Record<string, string>>({});
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const paths = getAvailablePaths();

  // Animate through phases
  useEffect(() => {
    const timer1 = setTimeout(() => setPhase('reveal'), 2000);
    return () => clearTimeout(timer1);
  }, []);

  // Load AI descriptions when paths are revealed
  useEffect(() => {
    if (phase === 'reveal' && hasDynamicAI && game) {
      setIsLoadingAI(true);
      Promise.all(
        paths.map(async (path) => {
          const desc = await generatePathDescription(path, game);
          return [path.id, desc] as const;
        })
      ).then(results => {
        const descs: Record<string, string> = {};
        for (const [id, desc] of results) {
          if (desc) descs[id] = desc;
        }
        setDynamicDescriptions(descs);
        setIsLoadingAI(false);
      }).catch(() => setIsLoadingAI(false));
    }
  }, [phase]);

  const handlePathSelect = useCallback((pathId: string) => {
    setSelectedPath(pathId);
    setPhase('selecting');
  }, []);

  const handleConfirm = useCallback(() => {
    if (!selectedPath) return;
    selectPath(selectedPath);
    setPhase('confirmed');
    setTimeout(onPathSelected, 1500);
  }, [selectedPath, selectPath, onPathSelected]);

  const handleCancel = useCallback(() => {
    setSelectedPath(null);
    setPhase('reveal');
  }, []);

  // Get the recommended path based on highest stat
  const getRecommendedPath = (): string | null => {
    if (!game) return null;
    const { dealcraft, ethics, politics } = game.stats;
    if (dealcraft >= ethics && dealcraft >= politics) return 'dealmaker';
    if (ethics >= dealcraft && ethics >= politics) return 'operator';
    return 'power_broker';
  };

  const recommended = getRecommendedPath();

  return (
    <div className="min-h-screen bg-black text-gray-100 flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Background effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/20 to-black pointer-events-none" />

      {/* Intro Phase */}
      {phase === 'intro' && (
        <div className="text-center animate-fade-in z-10">
          <div className="text-yellow-500/60 text-sm font-mono tracking-[0.5em] mb-8">
            A CROSSROADS APPROACHES
          </div>
          <h1 className="text-5xl font-bold mb-4">
            <span className="text-gray-400">Your choices have </span>
            <span className="text-yellow-400">defined you.</span>
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Four chapters at Sterling Partners. Each decision has shaped who you are becoming.
            Now, the firm offers three paths forward...
          </p>
          <div className="mt-8">
            <div className="w-16 h-1 bg-yellow-500/30 mx-auto animate-pulse" />
          </div>
        </div>
      )}

      {/* Path Selection Phase */}
      {(phase === 'reveal' || phase === 'selecting') && (
        <div className="max-w-5xl w-full z-10">
          <div className="text-center mb-12 animate-fade-in">
            <div className="text-yellow-500/60 text-sm font-mono tracking-[0.3em] mb-4">
              CHOOSE YOUR PATH
            </div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="text-gray-400">Three paths. </span>
              <span className="text-yellow-400">One destiny.</span>
            </h1>
            <p className="text-gray-500 mt-2">
              Your career at Sterling Partners branches here. This choice cannot be undone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {paths.map((path, index) => {
              const style = PATH_STYLES[path.id] || PATH_STYLES.dealmaker;
              const isSelected = selectedPath === path.id;
              const isRecommended = recommended === path.id;
              const dynamicDesc = dynamicDescriptions[path.id];

              return (
                <button
                  key={path.id}
                  onClick={() => handlePathSelect(path.id)}
                  disabled={phase === 'selecting' && !isSelected}
                  className={`
                    relative text-left p-6
                    border-2 rounded-sm
                    transition-all duration-500
                    ${isSelected
                      ? `${style.border} ${style.bg} shadow-lg ${style.glow}`
                      : phase === 'selecting'
                        ? 'border-gray-800 bg-gray-900/30 opacity-40'
                        : `border-gray-700 hover:${style.border} ${style.bgHover} bg-gray-900`
                    }
                  `}
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  {/* Recommended badge */}
                  {isRecommended && (
                    <div className={`absolute -top-3 right-4 text-xs font-mono px-2 py-1 rounded-sm ${style.bg} ${style.text} border ${style.border}`}>
                      RECOMMENDED
                    </div>
                  )}

                  {/* Icon */}
                  <div className={`text-4xl mb-4 ${style.text}`}>
                    <i className={`fas ${path.icon}`} />
                  </div>

                  {/* Title */}
                  <h2 className={`text-2xl font-bold mb-2 ${isSelected ? style.text : 'text-gray-100'}`}>
                    {path.title}
                  </h2>

                  {/* Description */}
                  <p className="text-gray-400 text-sm mb-4">
                    {path.description}
                  </p>

                  {/* Primary stat indicator */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-gray-600 text-xs font-mono">PRIMARY STAT:</span>
                    <span className={`text-xs font-mono font-bold ${style.text}`}>
                      {path.primaryStat.toUpperCase()} ({game?.stats[path.primaryStat] || 0})
                    </span>
                  </div>

                  {/* AI-generated personalized description */}
                  {(dynamicDesc || isLoadingAI) && (
                    <div className={`mt-3 pt-3 border-t border-gray-800`}>
                      {isLoadingAI && !dynamicDesc ? (
                        <div className="flex items-center gap-2">
                          <i className="fas fa-brain text-yellow-500/50 animate-pulse text-xs" />
                          <span className="text-gray-600 text-xs italic">Analyzing your journey...</span>
                        </div>
                      ) : dynamicDesc ? (
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <i className="fas fa-brain text-yellow-500/50 text-xs" />
                            <span className="text-yellow-500/50 text-xs font-mono">AI INSIGHT</span>
                          </div>
                          <p className="text-gray-400 text-xs italic">{dynamicDesc}</p>
                        </div>
                      ) : null}
                    </div>
                  )}

                  {/* Flavor text */}
                  {isSelected && (
                    <div className="mt-4 animate-fade-in">
                      <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent mb-4" />
                      <p className={`text-sm italic ${style.text} opacity-80`}>
                        {path.flavor}
                      </p>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Confirmation */}
          {phase === 'selecting' && selectedPath && (
            <div className="mt-8 text-center animate-fade-in">
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={handleCancel}
                  className="px-6 py-3 bg-gray-900 border border-gray-700 hover:border-gray-500 text-gray-400 font-mono transition-colors"
                >
                  ← RECONSIDER
                </button>
                <button
                  onClick={handleConfirm}
                  className={`px-8 py-3 font-mono font-bold transition-all duration-200 border-2
                    ${PATH_STYLES[selectedPath]?.border || 'border-green-500'}
                    ${PATH_STYLES[selectedPath]?.bg || 'bg-green-900/20'}
                    ${PATH_STYLES[selectedPath]?.text || 'text-green-400'}
                    hover:shadow-lg
                  `}
                >
                  COMMIT TO THIS PATH →
                </button>
              </div>
              <p className="text-gray-600 text-xs mt-4">
                This choice will determine the next chapters of your story.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Confirmed Phase */}
      {phase === 'confirmed' && selectedPath && (
        <div className="text-center animate-fade-in z-10">
          <div className={`text-6xl mb-6 ${PATH_STYLES[selectedPath]?.text || 'text-green-400'}`}>
            <i className={`fas ${paths.find(p => p.id === selectedPath)?.icon || 'fa-check'}`} />
          </div>
          <h1 className={`text-4xl font-bold mb-4 ${PATH_STYLES[selectedPath]?.text || 'text-green-400'}`}>
            PATH CHOSEN
          </h1>
          <p className="text-gray-400 text-lg">
            {paths.find(p => p.id === selectedPath)?.title}
          </p>
        </div>
      )}
    </div>
  );
};

export default PathReveal;

// Inject animations
const styles = `
@keyframes fade-in {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
`;

if (typeof document !== 'undefined') {
  const existing = document.getElementById('path-reveal-styles');
  if (!existing) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'path-reveal-styles';
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }
}
