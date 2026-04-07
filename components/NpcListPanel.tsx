import React, { memo, useMemo } from 'react';
import type { NPC } from '../types';
import { TerminalPanel } from './TerminalUI';

interface NpcListPanelProps {
  npcs: NPC[];
  selectedNpcId: string;
  onSelectNpc: (npcId: string) => void;
}

/** One-liner flavor based on mood + trust (deterministic by NPC id) */
const getMicroFlavor = (npc: NPC): string => {
  const mood = npc.mood ?? 50;
  const trust = npc.trust ?? 50;

  if (mood > 70 && trust > 70) return 'On your side. For now.';
  if (mood > 70 && trust <= 50) return 'Friendly face. Guarded cards.';
  if (mood <= 30 && trust > 50) return 'Trusts you. Hates everything else.';
  if (mood <= 30 && trust <= 30) return 'Avoid unless necessary.';
  if (trust > 60) return 'Will take your call.';
  if (mood > 50) return 'In a decent mood.';
  if (mood <= 40) return 'Having a day.';
  return 'Status: professional distance.';
};

const NpcListPanel: React.FC<NpcListPanelProps> = memo(({
  npcs,
  selectedNpcId,
  onSelectNpc,
}) => {
  const handleNpcClick = (npc: NPC) => {
    onSelectNpc(npc.id);
  };

  return (
    <TerminalPanel
      title="COMMS"
      className="h-full flex flex-col"
    >
      <div className="flex-1 bg-black overflow-y-auto">
        {npcs.map(npc => {
          const flavor = getMicroFlavor(npc);
          return (
            <button
              key={npc.id}
              onClick={() => handleNpcClick(npc)}
              title={flavor}
              className={`w-full text-left p-3 border-b border-slate-800 hover:bg-slate-800 transition-colors flex items-center space-x-3 ${selectedNpcId === npc.id ? 'bg-slate-800 text-amber-500' : 'text-slate-400'}`}
            >
              <div className={`w-2 h-2 rounded-full shrink-0 ${(npc.mood ?? 50) > 60 && (npc.trust ?? 50) > 50 ? 'bg-green-500' : ((npc.mood ?? 50) < 30 || (npc.trust ?? 50) < 30) ? 'bg-red-500' : 'bg-amber-500'}`}></div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-xs">{npc.name}</div>
                <div className="text-[10px] opacity-70">{npc.role}</div>
                <div className="text-[9px] italic opacity-50 truncate">{flavor}</div>
              </div>
            </button>
          );
        })}
        <button
          onClick={() => onSelectNpc('advisor')}
          className={`w-full text-left p-3 border-b border-slate-800 hover:bg-purple-900/30 transition-colors flex items-center space-x-3 ${selectedNpcId === 'advisor' ? 'bg-purple-900/40 text-purple-300' : 'bg-purple-950/20 text-purple-400 border-l-2 border-l-purple-500'}`}
        >
          <div className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse shadow-[0_0_6px_rgba(168,85,247,0.5)] shrink-0"></div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-xs">MACHIAVELLI (AI)</div>
            <div className="text-[10px] text-purple-400/70">Strategic Advisor</div>
            <div className="text-[9px] italic text-purple-300/40">Always watching. Always calculating.</div>
          </div>
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
