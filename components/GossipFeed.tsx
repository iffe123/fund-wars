/**
 * Gossip Feed Component
 *
 * THE REPUTATION WEB — "Everyone Talks, Everyone Remembers"
 *
 * Displays active gossip events and their mutation chains.
 * The player can see effects (NPC mood changes) but never
 * sees the chain directly — they have to figure out what happened.
 */

import React, { useState } from 'react';
import type { GossipEvent, ReputationWebState } from '../types/aiBlueprint';
import type { NPC } from '../types';

interface GossipFeedProps {
  reputationWeb: ReputationWebState;
  npcs: NPC[];
  currentTick: number;
}

const GossipFeed: React.FC<GossipFeedProps> = ({
  reputationWeb,
  npcs,
  currentTick,
}) => {
  const [expandedGossip, setExpandedGossip] = useState<string | null>(null);

  const activeGossip = reputationWeb.activeGossip.filter(g => g.isActive);
  const recentHistory = reputationWeb.gossipHistory
    .filter(g => currentTick - g.originTick < 10) // Show last 10 ticks
    .slice(-3);

  const getNpcName = (id: string) => npcs.find(n => n.id === id)?.name || 'Unknown';

  if (activeGossip.length === 0 && recentHistory.length === 0) return null;

  return (
    <div className="bg-slate-900/80 border border-slate-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-purple-900/20 px-3 py-2 border-b border-slate-700/60 flex items-center gap-2">
        <i className="fas fa-comments text-purple-400 text-xs"></i>
        <span className="text-[10px] uppercase tracking-widest text-purple-400 font-bold">Office Whispers</span>
        {activeGossip.length > 0 && (
          <span className="text-[9px] bg-purple-900/50 text-purple-300 px-1.5 py-0.5 rounded-full ml-auto">
            {activeGossip.length} active
          </span>
        )}
      </div>

      <div className="p-3 space-y-3 max-h-48 overflow-y-auto">
        {/* Active gossip events */}
        {activeGossip.map(gossip => {
          const isExpanded = expandedGossip === gossip.id;
          const relaysComplete = gossip.chain.filter(r => r.relayedAtTick).length;
          const totalRelays = gossip.chain.length;

          return (
            <div
              key={gossip.id}
              className="bg-slate-800/40 border border-slate-700/50 rounded p-2 cursor-pointer hover:border-purple-700/50 transition-colors"
              onClick={() => setExpandedGossip(isExpanded ? null : gossip.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-[9px] text-purple-400/70">
                    <i className="fas fa-user-secret mr-1"></i>
                    Started by {getNpcName(gossip.source)} — {currentTick - gossip.originTick}w ago
                  </div>
                  <p className="text-xs text-slate-300 mt-1 italic">
                    "{gossip.currentVersion.length > 100
                      ? gossip.currentVersion.slice(0, 100) + '...'
                      : gossip.currentVersion}"
                  </p>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  {/* Spread indicator */}
                  <div className="flex gap-0.5">
                    {gossip.chain.map((relay, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full ${
                          relay.relayedAtTick ? 'bg-purple-400' : 'bg-slate-700'
                        }`}
                        title={relay.relayedAtTick ? `Reached ${getNpcName(relay.to)}` : `Pending: ${getNpcName(relay.to)}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Expanded view - shows who knows */}
              {isExpanded && (
                <div className="mt-2 pt-2 border-t border-slate-700/50">
                  <div className="text-[9px] text-slate-500 mb-1">People who know:</div>
                  <div className="flex flex-wrap gap-1">
                    {gossip.reachedNpcs.map(npcId => (
                      <span
                        key={npcId}
                        className="text-[9px] bg-purple-900/30 text-purple-300 px-1.5 py-0.5 rounded"
                      >
                        {getNpcName(npcId)}
                      </span>
                    ))}
                    {gossip.chain
                      .filter(r => !r.relayedAtTick)
                      .map(relay => (
                        <span
                          key={relay.to}
                          className="text-[9px] bg-slate-800/50 text-slate-600 px-1.5 py-0.5 rounded"
                        >
                          {getNpcName(relay.to)} (pending)
                        </span>
                      ))}
                  </div>

                  {/* Mutation warning */}
                  {gossip.currentVersion !== gossip.originalStatement && (
                    <div className="mt-2 text-[9px] text-amber-400/60">
                      <i className="fas fa-exclamation-triangle mr-1"></i>
                      The story has been... embellished.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Recent resolved gossip */}
        {recentHistory.map(gossip => (
          <div
            key={gossip.id}
            className="bg-slate-800/20 border border-slate-800 rounded p-2 opacity-50"
          >
            <div className="text-[9px] text-slate-600">
              <i className="fas fa-check mr-1"></i>
              Resolved — {getNpcName(gossip.source)}'s rumor reached {gossip.reachedNpcs.length} people
            </div>
          </div>
        ))}

        {activeGossip.length === 0 && recentHistory.length === 0 && (
          <div className="text-xs text-slate-600 text-center py-2 italic">
            The office is quiet. Suspiciously quiet.
          </div>
        )}
      </div>
    </div>
  );
};

export default GossipFeed;
