import React, { memo, useState } from 'react';
import type { Scenario, Choice } from '../types';
import { TerminalPanel } from './TerminalUI';

interface ScenarioPanelProps {
  scenario: Scenario;
  choices: Choice[];
  onChoice: (choice: Choice) => void;
  onFallback: () => void;
}

const ScenarioPanel: React.FC<ScenarioPanelProps> = memo(({
  scenario,
  choices,
  onChoice,
  onFallback
}) => {
  const [hoveredChoice, setHoveredChoice] = useState<number | null>(null);
  const hoveredChoiceData = hoveredChoice !== null ? choices[hoveredChoice] : null;

  // Get deal structure info for educational context
  const getDealTypeExplainer = (choiceText: string): string | null => {
    if (choiceText.includes('LBO')) {
      return "LBO (Leveraged Buyout): Use debt to acquire majority control. High risk, high reward. You're betting you can improve operations and pay down debt before interest eats you alive.";
    }
    if (choiceText.includes('Growth')) {
      return "Growth Equity: Minority stake in a 'high-growth' company. Less control but less debt too. You're betting on the founder's ability to scale.";
    }
    if (choiceText.includes('Venture') || choiceText.includes('VC')) {
      return "Venture Capital: Basically gambling with PowerPoint. Fund visionaries (or delusional founders) and pray for a 100x return. 90% failure rate.";
    }
    return null;
  };

  return (
    <TerminalPanel
      title={`CIM_READER :: ${scenario.title.toUpperCase()}`}
      className="h-full flex flex-col"
    >
      <div className="p-6 overflow-y-auto flex-1 bg-black text-slate-300 font-mono">
        {/* Scenario Description */}
        <div className="border-l-2 border-amber-500 pl-4 mb-6 text-lg italic text-amber-100">
          {scenario.description}
        </div>

        {/* Machiavelli's Advice Box - Shows on hover */}
        {hoveredChoiceData?.sarcasticGuidance && (
          <div className="mb-4 p-4 bg-purple-950/40 border border-purple-500/50 rounded-lg animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                <i className="fas fa-user-secret text-purple-400"></i>
              </div>
              <span className="text-purple-400 text-xs font-bold uppercase tracking-wider">
                Machiavelli's Take
              </span>
            </div>
            <p className="text-purple-200 text-sm italic">
              "{hoveredChoiceData.sarcasticGuidance}"
            </p>
          </div>
        )}

        {/* Deal Type Explainer - Educational context */}
        {hoveredChoiceData && getDealTypeExplainer(hoveredChoiceData.text) && (
          <div className="mb-4 p-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-xs">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <i className="fas fa-graduation-cap"></i>
              <span className="uppercase tracking-wider font-bold">Deal Structure 101</span>
            </div>
            <p className="text-slate-300">{getDealTypeExplainer(hoveredChoiceData.text)}</p>
          </div>
        )}

        {/* Skill Check Preview */}
        {hoveredChoiceData?.skillCheck && (
          <div className="mb-4 p-3 bg-cyan-950/30 border border-cyan-600/50 rounded-lg text-xs">
            <div className="flex items-center gap-2 text-cyan-400 mb-1">
              <i className="fas fa-dice"></i>
              <span className="uppercase tracking-wider font-bold">Skill Check Available</span>
            </div>
            <p className="text-cyan-300">
              <span className="text-slate-400">Requires:</span> {hoveredChoiceData.skillCheck.skill} ≥ {hoveredChoiceData.skillCheck.threshold}
            </p>
            {hoveredChoiceData.skillCheck.bonus && (
              <p className="text-emerald-400 mt-1 italic">
                <i className="fas fa-star mr-1"></i>
                Bonus: {hoveredChoiceData.skillCheck.bonus.description}
              </p>
            )}
          </div>
        )}

        <div className="grid gap-3">
          {choices.length === 0 && (
            <div className="text-xs text-slate-500 border border-dashed border-slate-700 p-4 text-center space-y-3">
              <div>No decision points available yet. Gather more intel.</div>
              <button
                onClick={onFallback}
                className="px-4 py-2 border border-slate-600 text-slate-300 hover:border-amber-500 hover:text-amber-400 transition-colors"
              >
                Return to Desk
              </button>
            </div>
          )}

          {choices.map((choice, i) => (
            <button
              key={i}
              onClick={() => onChoice(choice)}
              onMouseEnter={() => setHoveredChoice(i)}
              onMouseLeave={() => setHoveredChoice(null)}
              onFocus={() => setHoveredChoice(i)}
              onBlur={() => setHoveredChoice(null)}
              className={`text-left border p-4 transition-all group rounded-lg ${
                hoveredChoice === i
                  ? 'bg-slate-800 border-green-500 shadow-lg shadow-green-500/10'
                  : 'border-slate-700 hover:bg-slate-800/50'
              }`}
            >
              <div className="font-bold text-green-500 mb-1 group-hover:text-green-400">
                {">"} OPTION_{i + 1}: {choice.text}
              </div>
              <div className="text-xs text-slate-500 mb-2">{choice.description}</div>

              {/* Stat Preview Tags */}
              {choice.outcome?.statChanges && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {choice.outcome.statChanges.reputation && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${choice.outcome.statChanges.reputation > 0 ? 'bg-emerald-900/50 text-emerald-400' : 'bg-red-900/50 text-red-400'}`}>
                      REP {choice.outcome.statChanges.reputation > 0 ? '+' : ''}{choice.outcome.statChanges.reputation}
                    </span>
                  )}
                  {choice.outcome.statChanges.stress && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${choice.outcome.statChanges.stress < 0 ? 'bg-emerald-900/50 text-emerald-400' : 'bg-amber-900/50 text-amber-400'}`}>
                      STRESS {choice.outcome.statChanges.stress > 0 ? '+' : ''}{choice.outcome.statChanges.stress}
                    </span>
                  )}
                  {choice.outcome.statChanges.cash && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${choice.outcome.statChanges.cash > 0 ? 'bg-emerald-900/50 text-emerald-400' : 'bg-red-900/50 text-red-400'}`}>
                      $ {choice.outcome.statChanges.cash > 0 ? '+' : ''}{(choice.outcome.statChanges.cash / 1000).toFixed(0)}K
                    </span>
                  )}
                  {choice.outcome.statChanges.ethics && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${choice.outcome.statChanges.ethics > 0 ? 'bg-blue-900/50 text-blue-400' : 'bg-red-900/50 text-red-400'}`}>
                      ETHICS {choice.outcome.statChanges.ethics > 0 ? '+' : ''}{choice.outcome.statChanges.ethics}
                    </span>
                  )}
                  {choice.outcome.statChanges.addPortfolioCompany && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-900/50 text-purple-400">
                      <i className="fas fa-building mr-1"></i>ACQUIRES COMPANY
                    </span>
                  )}
                  {choice.skillCheck && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-900/50 text-cyan-400">
                      <i className="fas fa-dice mr-1"></i>SKILL CHECK
                    </span>
                  )}
                </div>
              )}
            </button>
          ))}
        </div>

        {/* First-time player hint */}
        {choices.length > 0 && choices.some(c => c.sarcasticGuidance) && (
          <div className="mt-6 p-3 bg-slate-800/30 border border-slate-700/50 rounded-lg text-center">
            <p className="text-slate-500 text-xs">
              <i className="fas fa-lightbulb text-amber-500/50 mr-2"></i>
              Hover over choices to see Machiavelli's advice and stat previews
            </p>
          </div>
        )}
      </div>
    </TerminalPanel>
  );
});

ScenarioPanel.displayName = 'ScenarioPanel';

export default ScenarioPanel;
