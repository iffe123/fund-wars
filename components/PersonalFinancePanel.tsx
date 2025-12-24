import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { LIFESTYLE_TIERS, SKILL_INVESTMENTS, COMPENSATION_BY_LEVEL } from '../constants';
import type { LifestyleLevel, SkillInvestment } from '../types';
import { PlayerLevel } from '../types';

interface PersonalFinancePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const PersonalFinancePanel: React.FC<PersonalFinancePanelProps> = ({ isOpen, onClose }) => {
  const { playerStats, updatePlayerStats, addLogEntry } = useGame();
  const [activeTab, setActiveTab] = useState<'overview' | 'lifestyle' | 'skills'>('overview');

  if (!isOpen || !playerStats) return null;

  const personalFinances = playerStats.personalFinances;
  const currentLifestyle = LIFESTYLE_TIERS[personalFinances.lifestyleLevel];
  const compensation = COMPENSATION_BY_LEVEL[playerStats.level];

  // Calculate weekly cash flow
  const weeklySalary = compensation?.weeklySalary || 0;
  const weeklyBurn = Math.round(currentLifestyle.monthlyBurn / 4);
  const weeklyInterest = personalFinances.outstandingLoans > 0
    ? Math.round((personalFinances.outstandingLoans * personalFinances.loanInterestRate) / 52)
    : 0;
  const weeklyNetCashFlow = weeklySalary - weeklyBurn - weeklyInterest;

  // Calculate net worth
  const portfolioValue = playerStats.portfolio.reduce((acc, co) => acc + (co.currentValuation || 0), 0);
  const netWorth = personalFinances.bankBalance + portfolioValue + playerStats.totalRealizedGains - personalFinances.outstandingLoans;

  // Check if player can afford lifestyle upgrade
  const canAffordLifestyle = (level: LifestyleLevel): boolean => {
    const tier = LIFESTYLE_TIERS[level];
    const minLevel = tier.minLevelRequired;
    const levelRanks: Record<PlayerLevel, number> = {
      [PlayerLevel.ASSOCIATE]: 0,
      [PlayerLevel.SENIOR_ASSOCIATE]: 1,
      [PlayerLevel.VICE_PRESIDENT]: 2,
      [PlayerLevel.PRINCIPAL]: 3,
      [PlayerLevel.PARTNER]: 4,
      [PlayerLevel.FOUNDER]: 5,
    };
    return levelRanks[playerStats.level] >= levelRanks[minLevel];
  };

  // Check if player can afford skill
  const canAffordSkill = (skill: typeof SKILL_INVESTMENTS[0]): boolean => {
    // Check prerequisites
    if (skill.prerequisites) {
      for (const prereq of skill.prerequisites) {
        if (prereq === 'min_level_senior_associate' &&
            playerStats.level === PlayerLevel.ASSOCIATE) {
          return false;
        }
        // Check for completed skill prerequisites
        const hasSkill = playerStats.activeSkillInvestments?.some(
          s => s.id === prereq && s.completed
        );
        const hasFlag = playerStats.playerFlags[prereq];
        if (!hasSkill && !hasFlag) return false;
      }
    }
    return personalFinances.bankBalance >= skill.cost;
  };

  // Check if skill is already started or completed
  const getSkillStatus = (skillId: string): 'available' | 'in_progress' | 'completed' => {
    const existing = playerStats.activeSkillInvestments?.find(s => s.id === skillId);
    if (!existing) return 'available';
    if (existing.completed) return 'completed';
    return 'in_progress';
  };

  // Calculate skill progress
  const getSkillProgress = (skill: SkillInvestment): number => {
    if (!skill.startedWeek) return 0;
    const weeksElapsed = (playerStats.timeCursor || 0) - skill.startedWeek;
    return Math.min(100, Math.round((weeksElapsed / skill.timeWeeks) * 100));
  };

  const handleLifestyleChange = (level: LifestyleLevel) => {
    if (!canAffordLifestyle(level)) {
      addLogEntry(`Can't upgrade to ${LIFESTYLE_TIERS[level].name} - requires ${LIFESTYLE_TIERS[level].minLevelRequired} level.`);
      return;
    }
    updatePlayerStats({ lifestyleLevel: level });
    addLogEntry(`Lifestyle upgraded to ${LIFESTYLE_TIERS[level].name}. Monthly burn: $${LIFESTYLE_TIERS[level].monthlyBurn.toLocaleString()}`);
  };

  const handleStartSkill = (skillId: string) => {
    const skill = SKILL_INVESTMENTS.find(s => s.id === skillId);
    if (!skill || !canAffordSkill(skill)) {
      addLogEntry(`Can't start ${skill?.name || 'skill'} - check requirements and funds.`);
      return;
    }
    updatePlayerStats({ skillInvestment: skillId });
    addLogEntry(`Started learning ${skill.name}. Cost: $${skill.cost.toLocaleString()}, Duration: ${skill.timeWeeks} weeks.`);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-emerald-500/30 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-emerald-500/20">
          <h2 className="text-xl font-bold text-emerald-400">
            <i className="fa-solid fa-wallet mr-2"></i>
            Personal Finance Dashboard
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <i className="fa-solid fa-times text-xl"></i>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-emerald-500/20">
          {(['overview', 'lifestyle', 'skills'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'text-emerald-400 border-b-2 border-emerald-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Net Worth Banner */}
              <div className="bg-gradient-to-r from-emerald-900/50 to-slate-800 p-6 rounded-lg border border-emerald-500/30">
                <div className="text-sm text-slate-400 mb-1">Net Worth</div>
                <div className={`text-4xl font-bold ${netWorth >= 1000000 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  ${netWorth.toLocaleString()}
                </div>
                {netWorth >= 1000000 && (
                  <div className="text-amber-400 text-sm mt-2">
                    <i className="fa-solid fa-trophy mr-1"></i>
                    Millionaire Status!
                  </div>
                )}
              </div>

              {/* Cash Flow Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-800 p-4 rounded-lg">
                  <div className="text-sm text-slate-400">Bank Balance</div>
                  <div className="text-xl font-bold text-emerald-400">
                    ${personalFinances.bankBalance.toLocaleString()}
                  </div>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg">
                  <div className="text-sm text-slate-400">Weekly Income</div>
                  <div className="text-xl font-bold text-green-400">
                    +${weeklySalary.toLocaleString()}
                  </div>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg">
                  <div className="text-sm text-slate-400">Weekly Burn</div>
                  <div className="text-xl font-bold text-red-400">
                    -${(weeklyBurn + weeklyInterest).toLocaleString()}
                  </div>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg">
                  <div className="text-sm text-slate-400">Net Cash Flow</div>
                  <div className={`text-xl font-bold ${weeklyNetCashFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {weeklyNetCashFlow >= 0 ? '+' : ''}{weeklyNetCashFlow.toLocaleString()}/wk
                  </div>
                </div>
              </div>

              {/* Earnings Breakdown */}
              <div className="bg-slate-800 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4">Earnings Breakdown</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-slate-400">Salary YTD</div>
                    <div className="text-lg text-white">${personalFinances.salaryYTD.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">Bonus YTD</div>
                    <div className="text-lg text-white">${personalFinances.bonusYTD.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">Total Carry Received</div>
                    <div className="text-lg text-amber-400">${personalFinances.carryReceived.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">Lifetime Earnings</div>
                    <div className="text-lg text-emerald-400">${personalFinances.totalEarnings.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* Debt */}
              {personalFinances.outstandingLoans > 0 && (
                <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-red-400 mb-2">
                    <i className="fa-solid fa-skull mr-2"></i>
                    Outstanding Debt
                  </h3>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-2xl font-bold text-red-400">
                        ${personalFinances.outstandingLoans.toLocaleString()}
                      </div>
                      <div className="text-sm text-slate-400">
                        @ {(personalFinances.loanInterestRate * 100).toFixed(1)}% APR
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-400">Weekly Interest</div>
                      <div className="text-lg text-red-400">-${weeklyInterest.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Current Lifestyle */}
              <div className="bg-slate-800 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-2">Current Lifestyle</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xl font-bold text-purple-400">{currentLifestyle.name}</div>
                    <div className="text-sm text-slate-400">{currentLifestyle.description}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">
                      ${currentLifestyle.monthlyBurn.toLocaleString()}/mo
                    </div>
                    <div className="text-sm text-slate-400">
                      Stress: {currentLifestyle.stressModifier > 0 ? '+' : ''}{currentLifestyle.stressModifier}/mo
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'lifestyle' && (
            <div className="space-y-4">
              <p className="text-slate-400 mb-4">
                Your lifestyle affects your monthly burn rate, stress levels, and reputation.
                Living beyond your means impresses colleagues, but at what cost?
              </p>
              {(Object.keys(LIFESTYLE_TIERS) as LifestyleLevel[]).map((level) => {
                const tier = LIFESTYLE_TIERS[level];
                const isCurrentLevel = personalFinances.lifestyleLevel === level;
                const canUpgrade = canAffordLifestyle(level);

                return (
                  <div
                    key={level}
                    className={`p-4 rounded-lg border transition-all ${
                      isCurrentLevel
                        ? 'bg-purple-900/30 border-purple-500'
                        : canUpgrade
                        ? 'bg-slate-800 border-slate-700 hover:border-purple-500/50 cursor-pointer'
                        : 'bg-slate-800/50 border-slate-700/50 opacity-60'
                    }`}
                    onClick={() => !isCurrentLevel && canUpgrade && handleLifestyleChange(level)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className={`font-semibold ${isCurrentLevel ? 'text-purple-400' : 'text-white'}`}>
                            {tier.name}
                          </h4>
                          {isCurrentLevel && (
                            <span className="px-2 py-0.5 text-xs bg-purple-500/30 text-purple-300 rounded">
                              Current
                            </span>
                          )}
                          {!canUpgrade && (
                            <span className="px-2 py-0.5 text-xs bg-red-500/30 text-red-300 rounded">
                              Requires {tier.minLevelRequired}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-400 mt-1">{tier.description}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {tier.perks.map((perk, i) => (
                            <span key={i} className="px-2 py-1 text-xs bg-slate-700 text-slate-300 rounded">
                              {perk}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-white">
                          ${tier.monthlyBurn.toLocaleString()}/mo
                        </div>
                        <div className={`text-sm ${tier.stressModifier > 0 ? 'text-red-400' : tier.stressModifier < 0 ? 'text-green-400' : 'text-slate-400'}`}>
                          Stress: {tier.stressModifier > 0 ? '+' : ''}{tier.stressModifier}/mo
                        </div>
                        {tier.reputationModifier > 0 && (
                          <div className="text-sm text-blue-400">
                            +{tier.reputationModifier} Rep (one-time)
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="space-y-4">
              <p className="text-slate-400 mb-4">
                Invest in yourself. Skills take time and money, but unlock new abilities and boost your stats.
              </p>

              {/* Active Skills */}
              {playerStats.activeSkillInvestments && playerStats.activeSkillInvestments.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">In Progress</h3>
                  <div className="space-y-3">
                    {playerStats.activeSkillInvestments
                      .filter(s => !s.completed)
                      .map((skill) => {
                        const progress = getSkillProgress(skill);
                        return (
                          <div key={skill.id} className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-semibold text-blue-400">{skill.name}</span>
                              <span className="text-sm text-slate-400">{progress}%</span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                            <div className="text-sm text-slate-400 mt-2">
                              {skill.timeWeeks - Math.floor(((playerStats.timeCursor || 0) - (skill.startedWeek || 0)))} weeks remaining
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Completed Skills */}
              {playerStats.activeSkillInvestments &&
               playerStats.activeSkillInvestments.filter(s => s.completed).length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Completed</h3>
                  <div className="flex flex-wrap gap-2">
                    {playerStats.activeSkillInvestments
                      .filter(s => s.completed)
                      .map((skill) => (
                        <span
                          key={skill.id}
                          className="px-3 py-1 bg-green-900/30 border border-green-500/30 text-green-400 rounded-full text-sm"
                        >
                          <i className="fa-solid fa-check mr-1"></i>
                          {skill.name}
                        </span>
                      ))}
                  </div>
                </div>
              )}

              {/* Available Skills */}
              <h3 className="text-lg font-semibold text-white mb-3">Available Courses</h3>
              <div className="grid gap-4">
                {SKILL_INVESTMENTS.map((skill) => {
                  const status = getSkillStatus(skill.id);
                  const canAfford = canAffordSkill(skill);

                  if (status === 'completed' || status === 'in_progress') return null;

                  return (
                    <div
                      key={skill.id}
                      className={`p-4 rounded-lg border transition-all ${
                        canAfford
                          ? 'bg-slate-800 border-slate-700 hover:border-emerald-500/50'
                          : 'bg-slate-800/50 border-slate-700/50 opacity-60'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-white">{skill.name}</h4>
                          <p className="text-sm text-slate-400 mt-1">{skill.description}</p>
                          {skill.prerequisites && skill.prerequisites.length > 0 && (
                            <div className="text-sm text-amber-400 mt-2">
                              <i className="fa-solid fa-lock mr-1"></i>
                              Requires: {skill.prerequisites.join(', ')}
                            </div>
                          )}
                          <div className="flex flex-wrap gap-2 mt-2">
                            {skill.benefits.analystRating && (
                              <span className="px-2 py-1 text-xs bg-blue-900/30 text-blue-300 rounded">
                                +{skill.benefits.analystRating} Analyst Rating
                              </span>
                            )}
                            {skill.benefits.financialEngineering && (
                              <span className="px-2 py-1 text-xs bg-purple-900/30 text-purple-300 rounded">
                                +{skill.benefits.financialEngineering} Financial Eng.
                              </span>
                            )}
                            {skill.benefits.reputation && (
                              <span className="px-2 py-1 text-xs bg-cyan-900/30 text-cyan-300 rounded">
                                +{skill.benefits.reputation} Reputation
                              </span>
                            )}
                            {skill.benefits.setsFlags?.map((flag) => (
                              <span key={flag} className="px-2 py-1 text-xs bg-amber-900/30 text-amber-300 rounded">
                                Unlocks: {flag.replace(/_/g, ' ')}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-lg font-bold text-white">
                            ${skill.cost.toLocaleString()}
                          </div>
                          <div className="text-sm text-slate-400">
                            {skill.timeWeeks} weeks
                          </div>
                          <button
                            onClick={() => handleStartSkill(skill.id)}
                            disabled={!canAfford}
                            className={`mt-2 px-4 py-2 rounded text-sm font-medium transition-colors ${
                              canAfford
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            {canAfford ? 'Enroll' : 'Can\'t Afford'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalFinancePanel;
