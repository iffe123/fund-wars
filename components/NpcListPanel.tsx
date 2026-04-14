import React, { memo, useMemo, useState, useCallback } from 'react';
import type { NPC, NPCRelationshipType } from '../types';
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

// Status dot uses the app's color grammar: green = healthy, amber = caution, red = cooled.
const getStatusDotClass = (npc: NPC): string => {
  const mood = npc.mood ?? 50;
  const trust = npc.trust ?? 50;
  if (mood > 60 && trust > 50) return 'bg-emerald-400';
  if (mood < 30 || trust < 30)  return 'bg-red-400';
  return 'bg-amber-400';
};

// Groups: Work / Family / Partners / Wildcards / Other.
// Falls back to 'WORK' for NPCs without an explicit relationshipType so existing
// save games still render cleanly.
type GroupKey = 'WORK' | 'PARTNER' | 'FAMILY' | 'WILDCARD';
const GROUP_META: Record<GroupKey, { label: string; icon: string }> = {
  WORK:     { label: 'Work',      icon: 'fa-building' },
  PARTNER:  { label: 'Partners',  icon: 'fa-handshake' },
  FAMILY:   { label: 'Family',    icon: 'fa-house-heart' },
  WILDCARD: { label: 'Wildcards', icon: 'fa-question' },
};
const GROUP_ORDER: GroupKey[] = ['WORK', 'PARTNER', 'FAMILY', 'WILDCARD'];

const NpcListPanel: React.FC<NpcListPanelProps> = memo(({
  npcs,
  selectedNpcId,
  onSelectNpc,
}) => {
  // One NPC expanded at a time. Everyone else reads as a compact row.
  const [expandedNpcId, setExpandedNpcId] = useState<string | null>(null);
  // Collapsible groups — default everything open.
  const [collapsedGroups, setCollapsedGroups] = useState<Set<GroupKey>>(new Set());

  const toggleGroup = useCallback((group: GroupKey) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group); else next.add(group);
      return next;
    });
  }, []);

  const grouped = useMemo(() => {
    const buckets: Record<GroupKey, NPC[]> = {
      WORK: [], PARTNER: [], FAMILY: [], WILDCARD: [],
    };
    for (const npc of npcs) {
      const key: GroupKey = (npc.relationshipType as NPCRelationshipType | undefined) || 'WORK';
      buckets[key].push(npc);
    }
    return buckets;
  }, [npcs]);

  const handleNpcClick = (npc: NPC) => {
    setExpandedNpcId(prev => (prev === npc.id ? null : npc.id));
    onSelectNpc(npc.id);
  };

  return (
    <TerminalPanel
      title="COMMS"
      className="h-full flex flex-col"
    >
      <div className="flex-1 bg-black overflow-y-auto">
        {/* Pinned advisor entry — Machiavelli lives at the top of Comms since
            it's the most-used contact. Purple = Machiavelli in our color grammar. */}
        <button
          onClick={() => onSelectNpc('advisor')}
          className={`w-full text-left p-3 border-b border-slate-700 transition-colors flex items-center gap-3 terminal-focus ${
            selectedNpcId === 'advisor'
              ? 'bg-purple-900/40 text-purple-100'
              : 'bg-purple-950/25 text-purple-200 hover:bg-purple-900/35 border-l-2 border-l-purple-400'
          }`}
          aria-label="Open Machiavelli AI advisor"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse shadow-[0_0_6px_rgba(192,132,252,0.6)] shrink-0" aria-hidden="true"></div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-xs tracking-wide">MACHIAVELLI (AI)</div>
            <div className="text-[10px] text-purple-200/80">Strategic Advisor — always listening.</div>
          </div>
        </button>

        {GROUP_ORDER.map(groupKey => {
          const groupNpcs = grouped[groupKey];
          if (groupNpcs.length === 0) return null;
          const meta = GROUP_META[groupKey];
          const isCollapsed = collapsedGroups.has(groupKey);

          return (
            <div key={groupKey}>
              <button
                onClick={() => toggleGroup(groupKey)}
                className="terminal-focus w-full flex items-center gap-2 px-3 py-1.5 bg-slate-900/60 border-b border-slate-800 text-[10px] uppercase tracking-[0.22em] text-slate-300 font-bold hover:bg-slate-900"
                aria-expanded={!isCollapsed}
                aria-controls={`npc-group-${groupKey}`}
              >
                <i className={`fas ${meta.icon} text-slate-400 text-[10px]`} aria-hidden="true"></i>
                <span>{meta.label}</span>
                <span className="text-slate-500 font-normal normal-case tracking-normal">({groupNpcs.length})</span>
                <span className="flex-1" />
                <i className={`fas fa-chevron-down text-slate-500 text-[10px] transition-transform ${isCollapsed ? '-rotate-90' : ''}`} aria-hidden="true"></i>
              </button>

              {!isCollapsed && (
                <div id={`npc-group-${groupKey}`}>
                  {groupNpcs.map(npc => {
                    const isSelected = selectedNpcId === npc.id;
                    const isExpanded = expandedNpcId === npc.id;
                    const flavor = getMicroFlavor(npc);
                    return (
                      <button
                        key={npc.id}
                        onClick={() => handleNpcClick(npc)}
                        title={flavor}
                        className={`terminal-focus w-full text-left px-3 py-2 border-b border-slate-800 hover:bg-slate-800/60 transition-colors flex items-start gap-3 ${
                          isSelected ? 'bg-slate-800/80 text-amber-200' : 'text-slate-200'
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${getStatusDotClass(npc)}`} aria-hidden="true"></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[13px] truncate">{npc.name}</span>
                            <span className="text-[10px] text-slate-400 truncate">{npc.role}</span>
                          </div>
                          {/* Flavor + relationship bar only when expanded */}
                          {isExpanded && (
                            <div className="mt-1.5 space-y-1 animate-fade-in">
                              <div className="font-prose text-[12px] italic text-slate-300 leading-snug">
                                {flavor}
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                                <span>Mood {npc.mood ?? 50}</span>
                                <span className="text-slate-600">·</span>
                                <span>Trust {npc.trust ?? 50}</span>
                                <span className="text-slate-600">·</span>
                                <span>Relationship {npc.relationship ?? 50}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="p-2 border-t border-slate-700 bg-slate-900 text-[10px] text-center text-slate-300 tracking-widest">
        SECURE_CHANNEL_ESTABLISHED
      </div>
    </TerminalPanel>
  );
});

NpcListPanel.displayName = 'NpcListPanel';

export default NpcListPanel;
