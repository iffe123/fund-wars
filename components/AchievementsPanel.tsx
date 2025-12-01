import React, { useState } from 'react';
import type { Achievement, AchievementCategory } from '../types';
import { ACHIEVEMENTS, getVisibleAchievements } from '../constants/achievements';

interface AchievementsPanelProps {
  unlockedAchievements: string[];
  onClose?: () => void;
}

const CATEGORY_INFO: Record<AchievementCategory, { name: string; icon: string; color: string }> = {
  CAREER: { name: 'Career', icon: 'fa-briefcase', color: 'blue' },
  DEALS: { name: 'Deals', icon: 'fa-handshake', color: 'green' },
  RELATIONSHIPS: { name: 'Relationships', icon: 'fa-users', color: 'purple' },
  ETHICS: { name: 'Ethics', icon: 'fa-scale-balanced', color: 'amber' },
  WEALTH: { name: 'Wealth', icon: 'fa-coins', color: 'yellow' },
  SPECIAL: { name: 'Special', icon: 'fa-star', color: 'pink' },
};

const AchievementsPanel: React.FC<AchievementsPanelProps> = ({ unlockedAchievements, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'ALL'>('ALL');

  const visibleAchievements = getVisibleAchievements(unlockedAchievements);
  const filteredAchievements = selectedCategory === 'ALL'
    ? visibleAchievements
    : visibleAchievements.filter(a => a.category === selectedCategory);

  const totalAchievements = ACHIEVEMENTS.length;
  const unlockedCount = unlockedAchievements.length;
  const progressPercent = Math.round((unlockedCount / totalAchievements) * 100);

  const isUnlocked = (id: string) => unlockedAchievements.includes(id);

  const getCategoryStats = (category: AchievementCategory) => {
    const categoryAchievements = ACHIEVEMENTS.filter(a => a.category === category);
    const categoryUnlocked = categoryAchievements.filter(a => unlockedAchievements.includes(a.id));
    return { total: categoryAchievements.length, unlocked: categoryUnlocked.length };
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-slate-800">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <i className="fas fa-trophy text-amber-500"></i>
              Achievements
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              {unlockedCount} of {totalAchievements} unlocked ({progressPercent}%)
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-600 to-yellow-400 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 p-4 border-b border-slate-800 bg-slate-800/50">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            selectedCategory === 'ALL'
              ? 'bg-slate-600 text-white'
              : 'bg-slate-700 text-slate-400 hover:text-white'
          }`}
        >
          All ({unlockedCount}/{totalAchievements})
        </button>
        {(Object.keys(CATEGORY_INFO) as AchievementCategory[]).map(cat => {
          const stats = getCategoryStats(cat);
          const info = CATEGORY_INFO[cat];
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                selectedCategory === cat
                  ? `bg-${info.color}-600 text-white`
                  : 'bg-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              <i className={`fas ${info.icon} text-xs`}></i>
              {info.name} ({stats.unlocked}/{stats.total})
            </button>
          );
        })}
      </div>

      {/* Achievement Grid */}
      <div className="p-4 max-h-[500px] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredAchievements.map(achievement => {
            const unlocked = isUnlocked(achievement.id);
            const catInfo = CATEGORY_INFO[achievement.category];

            return (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg border transition-all ${
                  unlocked
                    ? 'bg-slate-800 border-slate-600'
                    : 'bg-slate-800/50 border-slate-700/50 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      unlocked
                        ? `bg-${catInfo.color}-500/20 text-${catInfo.color}-400`
                        : 'bg-slate-700 text-slate-500'
                    }`}
                  >
                    <i className={`fas ${achievement.icon} text-xl`}></i>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-semibold truncate ${unlocked ? 'text-white' : 'text-slate-400'}`}>
                        {achievement.name}
                      </h3>
                      {achievement.isSecret && !unlocked && (
                        <span className="text-xs bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded">
                          Secret
                        </span>
                      )}
                      {unlocked && (
                        <i className="fas fa-check-circle text-green-500 text-sm"></i>
                      )}
                    </div>
                    <p className={`text-sm mt-1 ${unlocked ? 'text-slate-400' : 'text-slate-500'}`}>
                      {achievement.isSecret && !unlocked ? '???' : achievement.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredAchievements.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <i className="fas fa-trophy text-4xl mb-3"></i>
            <p>No achievements in this category yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AchievementsPanel;
