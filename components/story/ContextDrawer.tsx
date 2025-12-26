/**
 * ContextDrawer Component
 *
 * A pull-up drawer showing detailed game state:
 * - Player stats
 * - NPC relationships
 * - Current flags/story state
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useStoryEngine } from '../../contexts/StoryEngineContext';
import type { NPCRelationship, PlayerStats } from '../../types/storyEngine';

interface ContextDrawerProps {
  /** Whether the drawer is open */
  isOpen: boolean;
  /** Callback to close the drawer */
  onClose: () => void;
}

type DrawerTab = 'stats' | 'relationships' | 'journal';

const ContextDrawer: React.FC<ContextDrawerProps> = ({ isOpen, onClose }) => {
  const { game, getRelationship } = useStoryEngine();
  const [activeTab, setActiveTab] = useState<DrawerTab>('stats');
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef<number | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Reset drag offset when drawer opens/closes
  useEffect(() => {
    if (!isOpen) {
      setDragOffset(0);
      setIsDragging(false);
    }
  }, [isOpen]);

  // Touch handlers for swipe-to-close
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (dragStartY.current === null) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - dragStartY.current;

    // Only allow dragging down (positive diff)
    if (diff > 0) {
      setDragOffset(diff);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);

    // If dragged more than 100px down, close the drawer
    if (dragOffset > 100) {
      onClose();
    }

    setDragOffset(0);
    dragStartY.current = null;
  }, [dragOffset, onClose]);

  // Mouse handlers for desktop drag-to-close
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    dragStartY.current = e.clientY;
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragStartY.current === null || !isDragging) return;

    const currentY = e.clientY;
    const diff = currentY - dragStartY.current;

    if (diff > 0) {
      setDragOffset(diff);
    }
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;

    setIsDragging(false);

    if (dragOffset > 100) {
      onClose();
    }

    setDragOffset(0);
    dragStartY.current = null;
  }, [dragOffset, isDragging, onClose]);

  // Global mouse up handler
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handleMouseUp();
      }
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isDragging, handleMouseUp]);

  if (!game) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`
          fixed inset-0 bg-black/50 z-40 transition-opacity duration-300
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`
          fixed bottom-0 left-0 right-0 z-50
          bg-gray-900 border-t border-gray-700
          max-h-[70vh] overflow-hidden
          ${isDragging ? '' : 'transition-transform duration-300 ease-out'}
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}
        `}
        style={{
          transform: isOpen ? `translateY(${dragOffset}px)` : 'translateY(100%)',
        }}
        onMouseMove={handleMouseMove}
      >
        {/* Drag Handle */}
        <div
          className="flex justify-center py-3 cursor-grab active:cursor-grabbing touch-none select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
        >
          <div className="w-12 h-1.5 bg-gray-500 rounded-full hover:bg-gray-400 transition-colors" />
        </div>

        {/* Swipe hint */}
        <div className="text-center text-gray-600 text-[10px] -mt-1 mb-1 select-none">
          Swipe down to close
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800 px-4">
          <TabButton
            active={activeTab === 'stats'}
            onClick={() => setActiveTab('stats')}
            icon="fa-chart-bar"
            label="Stats"
          />
          <TabButton
            active={activeTab === 'relationships'}
            onClick={() => setActiveTab('relationships')}
            icon="fa-users"
            label="Relationships"
          />
          <TabButton
            active={activeTab === 'journal'}
            onClick={() => setActiveTab('journal')}
            icon="fa-book"
            label="Journal"
          />
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-4 max-h-[calc(70vh-100px)]">
          {activeTab === 'stats' && <StatsTab stats={game.stats} />}
          {activeTab === 'relationships' && <RelationshipsTab relationships={game.relationships} />}
          {activeTab === 'journal' && <JournalTab flags={game.flags} achievements={game.achievements} />}
        </div>
      </div>
    </>
  );
};

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`
      flex items-center gap-2 px-4 py-3 font-mono text-sm
      border-b-2 transition-colors
      ${active
        ? 'border-green-500 text-green-400'
        : 'border-transparent text-gray-500 hover:text-gray-300'
      }
    `}
  >
    <i className={`fas ${icon}`} />
    {label}
  </button>
);

interface StatsTabProps {
  stats: PlayerStats;
}

const StatsTab: React.FC<StatsTabProps> = ({ stats }) => {
  const statConfigs = [
    { key: 'reputation', label: 'Reputation', desc: 'How others perceive you in the industry', color: 'green', icon: 'fa-star' },
    { key: 'stress', label: 'Stress', desc: 'Your mental load. Too high and you might crack.', color: 'red', icon: 'fa-brain', inverted: true },
    { key: 'ethics', label: 'Ethics', desc: 'Your moral compass. Some doors only open for the ethical.', color: 'blue', icon: 'fa-scale-balanced' },
    { key: 'dealcraft', label: 'Dealcraft', desc: 'Your ability to structure and close deals.', color: 'purple', icon: 'fa-handshake' },
    { key: 'politics', label: 'Politics', desc: 'Your savvy in navigating office dynamics.', color: 'yellow', icon: 'fa-chess' },
  ];

  return (
    <div className="space-y-6">
      {/* Money highlight */}
      <div className="bg-gray-800/50 rounded-lg p-4 text-center">
        <div className="text-3xl font-bold text-green-400">
          ${stats.money.toLocaleString()}
        </div>
        <div className="text-gray-500 text-sm mt-1">Personal Wealth</div>
      </div>

      {/* Stat bars */}
      <div className="space-y-4">
        {statConfigs.map(config => (
          <StatRow
            key={config.key}
            label={config.label}
            description={config.desc}
            value={stats[config.key as keyof PlayerStats] as number}
            color={config.color as 'green' | 'red' | 'blue' | 'purple' | 'yellow'}
            icon={config.icon}
            inverted={config.inverted}
          />
        ))}
      </div>
    </div>
  );
};

interface StatRowProps {
  label: string;
  description: string;
  value: number;
  color: 'green' | 'red' | 'blue' | 'purple' | 'yellow';
  icon: string;
  inverted?: boolean;
}

const StatRow: React.FC<StatRowProps> = ({ label, description, value, color, icon, inverted }) => {
  const colorClasses = {
    green: { bar: 'bg-green-500', text: 'text-green-400' },
    red: { bar: 'bg-red-500', text: 'text-red-400' },
    blue: { bar: 'bg-blue-500', text: 'text-blue-400' },
    purple: { bar: 'bg-purple-500', text: 'text-purple-400' },
    yellow: { bar: 'bg-yellow-500', text: 'text-yellow-400' },
  };

  const { bar, text } = colorClasses[color];
  const percentage = Math.min(100, Math.max(0, value));

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <i className={`fas ${icon} ${text} w-5`} />
          <span className="font-mono text-gray-300">{label}</span>
        </div>
        <span className={`font-bold ${text}`}>{value}</span>
      </div>
      <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden mb-1">
        <div
          className={`h-full ${bar} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-gray-600">{description}</p>
    </div>
  );
};

interface RelationshipsTabProps {
  relationships: NPCRelationship[];
}

const RelationshipsTab: React.FC<RelationshipsTabProps> = ({ relationships }) => {
  if (relationships.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <i className="fas fa-user-slash text-3xl mb-3" />
        <p>No relationships yet.</p>
        <p className="text-sm mt-1">Your choices will shape how others see you.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {relationships.map(rel => (
        <RelationshipCard key={rel.npcId} relationship={rel} />
      ))}
    </div>
  );
};

interface RelationshipCardProps {
  relationship: NPCRelationship;
}

const RelationshipCard: React.FC<RelationshipCardProps> = ({ relationship }) => {
  const { name, relationship: value, state, memories } = relationship;

  const stateColors: Record<string, string> = {
    enemy: 'text-red-500',
    rival: 'text-orange-500',
    acquaintance: 'text-gray-400',
    ally: 'text-green-400',
    mentor: 'text-blue-400',
  };

  const stateLabels: Record<string, string> = {
    enemy: 'Enemy',
    rival: 'Rival',
    acquaintance: 'Acquaintance',
    ally: 'Ally',
    mentor: 'Mentor',
  };

  // Normalize value from -100..100 to 0..100 for bar display
  const normalizedValue = ((value + 100) / 200) * 100;
  const isPositive = value > 0;

  return (
    <div className="bg-gray-800/50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
            <i className="fas fa-user text-gray-400" />
          </div>
          <div>
            <div className="font-semibold text-gray-200">{name}</div>
            <div className={`text-xs ${stateColors[state] || 'text-gray-500'}`}>
              {stateLabels[state] || state}
            </div>
          </div>
        </div>
        <div className={`text-lg font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? '+' : ''}{value}
        </div>
      </div>

      {/* Relationship bar */}
      <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-3">
        <div
          className={`h-full transition-all duration-500 ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}
          style={{ width: `${normalizedValue}%` }}
        />
      </div>

      {/* Memories */}
      {memories.length > 0 && (
        <div className="border-t border-gray-700 pt-2 mt-2">
          <div className="text-xs text-gray-500 mb-1">Memories:</div>
          <ul className="text-xs text-gray-400 space-y-1">
            {memories.slice(-3).map((memory, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-gray-600">•</span>
                <span>{memory}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

interface JournalTabProps {
  flags: Set<string>;
  achievements: string[];
}

const JournalTab: React.FC<JournalTabProps> = ({ flags, achievements }) => {
  // Filter narrative flags (not system flags)
  const narrativeFlags = Array.from(flags).filter(f =>
    !f.startsWith('CHAPTER_') && !f.endsWith('_COMPLETE')
  );

  return (
    <div className="space-y-6">
      {/* Achievements */}
      {achievements.length > 0 && (
        <div>
          <h3 className="text-sm font-mono text-yellow-400 mb-3 flex items-center gap-2">
            <i className="fas fa-trophy" />
            Achievements
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {achievements.map(achievement => (
              <div
                key={achievement}
                className="bg-yellow-900/20 border border-yellow-800 rounded px-3 py-2 text-sm"
              >
                <div className="text-yellow-400">{formatAchievementName(achievement)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Story moments */}
      {narrativeFlags.length > 0 && (
        <div>
          <h3 className="text-sm font-mono text-gray-400 mb-3 flex items-center gap-2">
            <i className="fas fa-bookmark" />
            Key Moments
          </h3>
          <div className="space-y-2">
            {narrativeFlags.map(flag => (
              <div
                key={flag}
                className="bg-gray-800/50 rounded px-3 py-2 text-sm text-gray-400"
              >
                {formatFlagAsNarrative(flag)}
              </div>
            ))}
          </div>
        </div>
      )}

      {narrativeFlags.length === 0 && achievements.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <i className="fas fa-feather text-3xl mb-3" />
          <p>Your journal is empty.</p>
          <p className="text-sm mt-1">Your choices will be recorded here.</p>
        </div>
      )}
    </div>
  );
};

// Helper functions
function formatAchievementName(id: string): string {
  return id
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function formatFlagAsNarrative(flag: string): string {
  // Convert flag names to readable narratives
  const narratives: Record<string, string> = {
    'CONFIDENT_ENTRANCE': 'You made a confident entrance on your first day.',
    'HUMBLE_START': 'You started with humility and self-awareness.',
    'OBSERVANT': 'You took time to observe your surroundings.',
    'SARAH_INTRO': 'You met Sarah Chen, a potential ally.',
    'SARAH_ALLY': 'Sarah Chen became your ally.',
    'MET_HUNTER': 'You met Hunter Sterling.',
    'HUNTER_RIVALRY': 'You made an enemy of Hunter Sterling.',
    'PACKFANCY_ASSIGNED': 'You were assigned the PackFancy deal.',
    'FOUND_REAL_ESTATE': 'You discovered the hidden real estate value.',
    'WARNED_ABOUT_CHAD': 'Sarah warned you about Chad.',
    'CALLED_MILES': 'You called the investment banker.',
    'ASKED_THESIS': 'You asked Chad about the investment thesis.',
    'PUSHED_BACK_DAY_ONE': 'You pushed back on your first assignment.',
    'TOLD_CHAD_FIRST': 'You took your discovery directly to Chad.',
    'TOLD_SARAH': 'You shared your discovery with Sarah.',
    'VERIFIED_NUMBERS': 'You verified the numbers before presenting.',
    'THANKED_SARAH': 'You thanked Sarah for her help.',
    'TOOK_CREDIT': 'You took full credit for your discovery.',
    'STAYED_HUMBLE': 'You stayed humble about your success.',
    'SOLO_PLAYER': 'You chose to work alone.',
  };

  return narratives[flag] || flag.split('_').join(' ').toLowerCase();
}

export default ContextDrawer;
