/**
 * Deal Autopsy
 *
 * Post-deal analysis showing optimal vs actual outcomes.
 * Helps players learn from their investments.
 */

import React, { useState, useEffect } from 'react';
import { TerminalButton, TerminalPanel } from './TerminalUI';
import { useHaptic } from '../hooks/useHaptic';
import { generateDealAutopsy } from '../services/geminiService';
import { DEAL_PARALLELS } from '../constants/investmentCommittee';
import type { DealAutopsy as DealAutopsyType } from '../types/investmentCommittee';
import type { PortfolioCompany, ExitResult } from '../types';

interface DealAutopsyProps {
  company: PortfolioCompany;
  exitResult: ExitResult;
  redFlagsFound: number;
  redFlagsMissed: number;
  keyDecisions: string[];
  marketConditions: string;
  onClose: () => void;
}

const DealAutopsy: React.FC<DealAutopsyProps> = ({
  company,
  exitResult,
  redFlagsFound,
  redFlagsMissed,
  keyDecisions,
  marketConditions,
  onClose,
}) => {
  const { triggerImpact } = useHaptic();

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [autopsy, setAutopsy] = useState<DealAutopsyType | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'analysis' | 'learning'>('summary');

  // Calculate metrics (using exitResult fields)
  const holdPeriodMonths = exitResult.holdingPeriodMonths;
  const holdPeriodWeeks = holdPeriodMonths * 4;
  const exitValuation = exitResult.exitValue;
  const proceedsToFund = exitResult.profit + exitResult.investmentCost;
  const moic = exitResult.multiple;
  const annualizedReturn = holdPeriodMonths > 0 ? Math.pow(moic, 12 / holdPeriodMonths) - 1 : 0;

  // Determine outcome tier
  const getOutcomeTier = (moic: number): { label: string; color: string; description: string } => {
    if (moic >= 3.0) return { label: 'HOME RUN', color: 'text-green-400', description: 'Exceptional returns' };
    if (moic >= 2.0) return { label: 'SOLID WIN', color: 'text-cyan-400', description: 'Above target returns' };
    if (moic >= 1.5) return { label: 'BASE HIT', color: 'text-yellow-400', description: 'Acceptable returns' };
    if (moic >= 1.0) return { label: 'BREAK EVEN', color: 'text-orange-400', description: 'Preserved capital' };
    return { label: 'WRITE-OFF', color: 'text-red-400', description: 'Lost capital' };
  };

  const outcomeTier = getOutcomeTier(moic);

  // Generate autopsy on mount
  useEffect(() => {
    const fetchAutopsy = async () => {
      try {
        const result = await generateDealAutopsy({
          companyName: company.name,
          entryValuation: company.investmentCost,
          exitValuation,
          holdPeriodWeeks,
          moic,
          irr: annualizedReturn,
          exitType: exitResult.exitType,
          redFlagsFound,
          redFlagsMissed,
          keyDecisions,
          marketConditions,
        });

        setAutopsy({
          companyId: company.id,
          companyName: company.name,
          holdPeriodWeeks,
          actualOutcome: {
            entryValuation: company.investmentCost,
            exitValuation,
            moic,
            irr: annualizedReturn,
            exitType: exitResult.exitType,
          },
          optimalOutcome: {
            moic: moic * 1.3, // Estimated optimal
            irr: annualizedReturn * 1.25,
            missedOpportunities: result.whatWentWrong?.map(w => w.description) || [],
          },
          whatWentRight: result.whatWentRight || [],
          whatWentWrong: result.whatWentWrong || [],
          historicalParallel: result.historicalParallel,
          skillsDemonstrated: result.skillsDemonstrated || [],
          skillsToDevelop: result.skillsToDevelop || [],
          redFlagsFound,
          redFlagsMissed,
          redFlagConsequences: redFlagsMissed > 0 ? ['Missed red flags may have impacted returns'] : [],
        });

        triggerImpact(moic >= 2.0 ? 'LIGHT' : 'MEDIUM');
      } catch (error) {
        console.error('Failed to generate autopsy:', error);
        // Set fallback autopsy
        setAutopsy({
          companyId: company.id,
          companyName: company.name,
          holdPeriodWeeks,
          actualOutcome: {
            entryValuation: company.investmentCost,
            exitValuation,
            moic,
            irr: annualizedReturn,
            exitType: exitResult.exitType,
          },
          optimalOutcome: {
            moic: moic * 1.2,
            irr: annualizedReturn * 1.15,
            missedOpportunities: [],
          },
          whatWentRight: moic >= 1.5 ? [{ category: 'Execution', description: 'Deal completed successfully', impact: 'Positive returns' }] : [],
          whatWentWrong: moic < 1.5 ? [{ category: 'Valuation', description: 'Entry price may have been too high', impact: 'Compressed returns', wasPreventable: true }] : [],
          skillsDemonstrated: moic >= 1.5 ? ['Deal Execution'] : [],
          skillsToDevelop: moic < 2.0 ? ['Entry Multiple Discipline', 'Value Creation'] : [],
          redFlagsFound,
          redFlagsMissed,
          redFlagConsequences: [],
        });
      }
      setIsLoading(false);
    };

    fetchAutopsy();
  }, [company, exitResult, moic, annualizedReturn, redFlagsFound, redFlagsMissed, keyDecisions, marketConditions]);

  // Find historical parallel
  const historicalParallel = autopsy?.historicalParallel || DEAL_PARALLELS.find(p => {
    if (moic < 1.0) return p.id === 'txu_energy' || p.id === 'toys_r_us';
    if (moic >= 3.0) return p.id === 'hilton_blackstone';
    return p.id === 'rjr_nabisco';
  });

  // Render loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
        <div className="text-center">
          <i className="fas fa-chart-line fa-3x text-cyan-500 animate-pulse mb-4"></i>
          <div className="text-lg text-slate-300">Analyzing deal performance...</div>
          <div className="text-sm text-slate-500 mt-2">Generating insights and recommendations</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto border-2 border-cyan-500 bg-slate-900 shadow-[0_0_50px_rgba(0,255,255,0.2)]">
        {/* Header */}
        <div className="bg-cyan-900 text-cyan-100 px-4 py-3 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <i className="fas fa-clipboard-check text-lg"></i>
            <span className="font-bold">DEAL AUTOPSY</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">{company.name}</span>
            <button onClick={onClose} className="text-cyan-300 hover:text-white">
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Outcome banner */}
          <div className={`text-center py-6 border-2 ${outcomeTier.color.replace('text-', 'border-')} bg-slate-800/50 mb-6`}>
            <div className="text-sm uppercase tracking-widest text-slate-400 mb-1">Deal Outcome</div>
            <div className={`text-4xl font-bold ${outcomeTier.color}`}>{outcomeTier.label}</div>
            <div className="text-sm text-slate-400 mt-2">{outcomeTier.description}</div>
          </div>

          {/* Key metrics */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-800 p-4 rounded text-center">
              <div className="text-2xl font-bold text-cyan-400">{moic.toFixed(2)}x</div>
              <div className="text-xs text-slate-400">MOIC</div>
            </div>
            <div className="bg-slate-800 p-4 rounded text-center">
              <div className="text-2xl font-bold text-cyan-400">{(annualizedReturn * 100).toFixed(1)}%</div>
              <div className="text-xs text-slate-400">IRR</div>
            </div>
            <div className="bg-slate-800 p-4 rounded text-center">
              <div className="text-2xl font-bold text-slate-300">{holdPeriodMonths}mo</div>
              <div className="text-xs text-slate-400">Hold Period</div>
            </div>
            <div className="bg-slate-800 p-4 rounded text-center">
              <div className="text-2xl font-bold text-slate-300">{exitResult.exitType}</div>
              <div className="text-xs text-slate-400">Exit Type</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            {(['summary', 'analysis', 'learning'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm rounded ${
                  activeTab === tab
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === 'summary' && (
            <div className="space-y-6">
              {/* Actual vs Optimal */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800 p-4 rounded">
                  <div className="text-sm font-bold text-slate-300 mb-3">Your Outcome</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Entry:</span>
                      <span>${(company.investmentCost / 1000000).toFixed(1)}M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Exit:</span>
                      <span>${(exitValuation / 1000000).toFixed(1)}M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Proceeds:</span>
                      <span className="text-green-400">${(proceedsToFund / 1000000).toFixed(1)}M</span>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-800/50 border border-dashed border-slate-600 p-4 rounded">
                  <div className="text-sm font-bold text-slate-400 mb-3">Optimal Outcome</div>
                  <div className="space-y-2 text-sm text-slate-500">
                    <div className="flex justify-between">
                      <span>Potential MOIC:</span>
                      <span>{autopsy?.optimalOutcome.moic.toFixed(2)}x</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Potential IRR:</span>
                      <span>{((autopsy?.optimalOutcome.irr || 0) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="text-xs mt-2 italic">
                      {moic >= (autopsy?.optimalOutcome.moic || 0) * 0.9
                        ? 'You achieved near-optimal returns!'
                        : 'Room for improvement identified'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Red flags analysis */}
              <div className="bg-slate-800 p-4 rounded">
                <div className="text-sm font-bold text-slate-300 mb-3">Due Diligence Review</div>
                <div className="flex gap-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{redFlagsFound}</div>
                    <div className="text-xs text-slate-400">Red Flags Found</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-400">{redFlagsMissed}</div>
                    <div className="text-xs text-slate-400">Red Flags Missed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyan-400">
                      {redFlagsFound + redFlagsMissed > 0
                        ? Math.round((redFlagsFound / (redFlagsFound + redFlagsMissed)) * 100)
                        : 100}%
                    </div>
                    <div className="text-xs text-slate-400">DD Score</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="space-y-6">
              {/* What went right */}
              {autopsy?.whatWentRight && autopsy.whatWentRight.length > 0 && (
                <div className="bg-green-900/20 border border-green-700 p-4 rounded">
                  <div className="text-sm font-bold mb-3 text-green-400">
                    <i className="fas fa-check-circle mr-2"></i>
                    What Went Right
                  </div>
                  <div className="space-y-2">
                    {autopsy.whatWentRight.map((item, i) => (
                      <div key={i} className="flex gap-2 text-sm">
                        <span className="text-green-400">+</span>
                        <div>
                          <span className="text-slate-200">{item.description}</span>
                          <span className="text-slate-500 ml-2">({item.impact})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* What went wrong */}
              {autopsy?.whatWentWrong && autopsy.whatWentWrong.length > 0 && (
                <div className="bg-red-900/20 border border-red-700 p-4 rounded">
                  <div className="text-sm font-bold mb-3 text-red-400">
                    <i className="fas fa-exclamation-triangle mr-2"></i>
                    What Went Wrong
                  </div>
                  <div className="space-y-2">
                    {autopsy.whatWentWrong.map((item, i) => (
                      <div key={i} className="flex gap-2 text-sm">
                        <span className="text-red-400">-</span>
                        <div>
                          <span className="text-slate-200">{item.description}</span>
                          <span className="text-slate-500 ml-2">({item.impact})</span>
                          {item.wasPreventable && (
                            <span className="text-amber-400 ml-2 text-xs">[Preventable]</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Historical parallel */}
              {historicalParallel && (
                <div className="bg-slate-800 p-4 rounded border-l-4 border-cyan-500">
                  <div className="text-sm font-bold mb-2 text-cyan-400">
                    <i className="fas fa-history mr-2"></i>
                    Historical Parallel
                  </div>
                  <div className="text-lg font-bold text-slate-200 mb-1">
                    {historicalParallel.dealName}
                  </div>
                  <div className="text-sm text-slate-400 mb-2">
                    {historicalParallel.description}
                  </div>
                  <div className="text-sm text-cyan-300 italic">
                    <i className="fas fa-lightbulb mr-1"></i>
                    Lesson: {historicalParallel.lesson || (historicalParallel as typeof DEAL_PARALLELS[0]).keyLessons?.[0]}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'learning' && (
            <div className="space-y-6">
              {/* Skills demonstrated */}
              <div className="bg-slate-800 p-4 rounded">
                <div className="text-sm font-bold mb-3 text-green-400">
                  <i className="fas fa-trophy mr-2"></i>
                  Skills Demonstrated
                </div>
                {autopsy?.skillsDemonstrated && autopsy.skillsDemonstrated.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {autopsy.skillsDemonstrated.map((skill, i) => (
                      <span key={i} className="px-3 py-1 bg-green-900/30 border border-green-700 rounded text-sm text-green-300">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-slate-500 italic">More practice needed to demonstrate skills</div>
                )}
              </div>

              {/* Skills to develop */}
              <div className="bg-slate-800 p-4 rounded">
                <div className="text-sm font-bold mb-3 text-amber-400">
                  <i className="fas fa-graduation-cap mr-2"></i>
                  Skills to Develop
                </div>
                {autopsy?.skillsToDevelop && autopsy.skillsToDevelop.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {autopsy.skillsToDevelop.map((skill, i) => (
                      <span key={i} className="px-3 py-1 bg-amber-900/30 border border-amber-700 rounded text-sm text-amber-300">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-slate-500 italic">Excellent performance across all areas!</div>
                )}
              </div>

              {/* Key takeaways */}
              <div className="bg-cyan-900/20 border border-cyan-700 p-4 rounded">
                <div className="text-sm font-bold mb-2 text-cyan-400">
                  <i className="fas fa-key mr-2"></i>
                  Key Takeaways
                </div>
                <div className="text-sm text-slate-300 space-y-2">
                  {moic >= 2.0 ? (
                    <>
                      <p>Strong execution on this deal. The fundamentals of value creation were applied well.</p>
                      <p>Consider: Could you have exited earlier or later for better returns?</p>
                    </>
                  ) : moic >= 1.0 ? (
                    <>
                      <p>Capital preserved, but returns below target. Review entry multiple discipline.</p>
                      <p>Focus on: Value creation plan execution and exit timing optimization.</p>
                    </>
                  ) : (
                    <>
                      <p>This deal didn't work out. Understanding why is critical for future success.</p>
                      <p>Review: Due diligence thoroughness, thesis validation, and risk assessment.</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-4 mt-6">
            <TerminalButton
              variant="default"
              label="Review Another Deal"
              onClick={onClose}
              className="flex-1"
            />
            <TerminalButton
              variant="primary"
              label="Continue"
              onClick={onClose}
              className="flex-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealAutopsy;
