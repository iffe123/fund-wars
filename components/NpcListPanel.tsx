import React, { memo } from 'react';
import type { NPC } from '../types';
import { TerminalPanel } from './TerminalUI';

interface NpcListPanelProps {
  npcs: NPC[];
  selectedNpcId: string;
  onSelectNpc: (npcId: string) => void;
  tutorialStep: number;
  onTutorialAdvance?: () => void;
}

const NpcListPanel: React.FC<NpcListPanelProps> = memo(({
  npcs,
  selectedNpcId,
  onSelectNpc,
  tutorialStep,
  onTutorialAdvance
}) => {
  const handleNpcClick = (npc: NPC) => {
    onSelectNpc(npc.id);
    // Tutorial Logic: If we click Sarah in Step 4, advance
    if (tutorialStep === 4 && npc.id === 'sarah' && onTutorialAdvance) {
      onTutorialAdvance();
    }
  };

  return (
    <TerminalPanel
      title="COMMS"
      data-tutorial={tutorialStep === 4 ? 'comms-tab' : undefined}
      className="h-full flex flex-col"
    >
      <div className="flex-1 bg-black">
        {npcs.map(npc => (
          <button
            key={npc.id}
            onClick={() => handleNpcClick(npc)}
            className={`w-full text-left p-3 border-b border-slate-800 hover:bg-slate-800 transition-colors flex items-center space-x-3 ${selectedNpcId === npc.id ? 'bg-slate-800 text-amber-500' : 'text-slate-400'}`}
          >
            <div className={`w-2 h-2 rounded-full ${(npc.mood ?? 50) > 60 && (npc.trust ?? 50) > 50 ? 'bg-green-500' : ((npc.mood ?? 50) < 30 || (npc.trust ?? 50) < 30) ? 'bg-red-500' : 'bg-amber-500'}`}></div>
            <div className="flex-1">
              <div className="font-bold text-xs">{npc.name}</div>
              <div className="text-[10px] opacity-70">{npc.role}</div>
            </div>
          </button>
        ))}
        <button
          onClick={() => onSelectNpc('advisor')}
          className={`w-full text-left p-3 border-b border-slate-800 hover:bg-slate-800 transition-colors flex items-center space-x-3 ${selectedNpcId === 'advisor' ? 'bg-slate-800 text-blue-400' : 'text-slate-400'}`}
        >
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
          <div className="font-bold text-xs">MACHIAVELLI (AI)</div>
        </button>
      </div>
      <div className="p-2 border-t border-slate-700 bg-slate-900 text-[10px] text-center text-slate-500">
        SECURE_CHANNEL_ESTABLISHED
      </div>
    </TerminalPanel>
  );
});

NpcListPanel.displayName = 'NpcListPanel';

export default NpcListPanel;
