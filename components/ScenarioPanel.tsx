import React, { memo } from 'react';
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

        {/* Advisor hints removed - player must figure out the best approach */}

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
              className="text-left border p-4 transition-all group rounded-lg border-slate-700 hover:bg-slate-800/50 hover:border-green-500 hover:shadow-lg hover:shadow-green-500/10"
            >
              <div className="font-bold text-green-500 mb-1 group-hover:text-green-400">
                {">"} OPTION_{i + 1}: {choice.text}
              </div>
              <div className="text-xs text-slate-500 mb-2">{choice.description}</div>
              {/* Stat preview tags removed - player discovers consequences through gameplay */}
            </button>
          ))}
        </div>

        {/* Player hint removed - discover through gameplay */}
      </div>
    </TerminalPanel>
  );
});

ScenarioPanel.displayName = 'ScenarioPanel';

export default ScenarioPanel;
