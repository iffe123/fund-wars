import React from 'react';
import type { NewsEvent } from '../types';
import type { WeeklyNewspaper, GossipEvent } from '../types/aiBlueprint';
import { isGeminiApiConfigured } from '../services/geminiService';

interface NewsTickerProps {
  events: NewsEvent[];
  systemLogs?: string[];
  newspaper?: WeeklyNewspaper | null;
  onMarkNewspaperRead?: () => void;
  activeGossip?: GossipEvent[];
}

const NewsTicker: React.FC<NewsTickerProps> = ({ events, systemLogs = [], newspaper, onMarkNewspaperRead, activeGossip = [] }) => {
  const aiOn = isGeminiApiConfigured();
  const getTimeAgo = (index: number) => {
    const minutes = [2, 7, 15, 28, 45][index] || 60;
    return `${minutes}m ago`;
  };

  const getSentiment = (headline: string): 'positive' | 'negative' | 'neutral' => {
    const positive = ['growth', 'profit', 'rise', 'gain', 'surge', 'rally', 'up', 'record'];
    const negative = ['fall', 'drop', 'loss', 'decline', 'crash', 'down', 'warning', 'risk'];

    const lower = headline.toLowerCase();
    if (positive.some(word => lower.includes(word))) return 'positive';
    if (negative.some(word => lower.includes(word))) return 'negative';
    return 'neutral';
  };

  // Color grammar: green = gain/positive, red = loss/threat, slate = neutral info.
  // The ticker itself reads as ambient atmosphere — reduced opacity, muted hues.
  const getSentimentStyle = (sentiment: 'positive' | 'negative' | 'neutral') => {
    switch (sentiment) {
      case 'positive': return 'border-l-emerald-500 bg-emerald-950/20';
      case 'negative': return 'border-l-red-500 bg-red-950/20';
      default: return 'border-l-slate-600 bg-slate-800/25';
    }
  };

  const getSentimentIcon = (sentiment: 'positive' | 'negative' | 'neutral') => {
    switch (sentiment) {
      case 'positive': return 'fa-arrow-trend-up text-emerald-400';
      case 'negative': return 'fa-arrow-trend-down text-red-400';
      default: return 'fa-minus text-slate-500';
    }
  };

  // Headline-type labels use color grammar:
  // Red = breaking/threat, amber = warn-worthy intel, cyan = system info,
  // slate = ambient sector update. Rumor keeps purple because rumor = "the Machiavelli
  // world" (gossip, back-channel stuff) — we still rely on it sparingly.
  const headlineTypes = ['BREAKING', 'SECTOR UPDATE', 'ANALYSIS', 'RUMOR', 'MARKET INTEL'] as const;
  const headlineTypeStyles: Record<string, string> = {
    'BREAKING': 'text-red-300 font-bold',
    'SECTOR UPDATE': 'text-slate-300',
    'ANALYSIS': 'text-cyan-300',
    'RUMOR': 'text-purple-300 italic',
    'MARKET INTEL': 'text-amber-300',
  };

  return (
    // Ambient atmosphere column — reduced overall opacity so it doesn't
    // compete with the active decision. Opacity lifts on hover so it's
    // still usable intel.
    <div className="bg-gradient-to-b from-black to-slate-950/60 border-l border-slate-700 h-full flex flex-col font-mono opacity-90 hover:opacity-100 transition-opacity duration-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800/95 to-slate-800/80 px-4 py-2 text-[11px] uppercase text-slate-200 font-bold border-b border-slate-700 flex items-center gap-2 shrink-0">
        <i className="fas fa-rss text-amber-400 text-xs" aria-hidden="true"></i>
        <span className="tracking-[0.18em]">Market Feed</span>
        <div className="flex-1"></div>
        <div className={`text-[9px] font-bold uppercase tracking-widest ${aiOn ? 'text-emerald-300' : 'text-slate-400'}`} title={aiOn ? 'AI-generated headlines enabled' : 'Using curated headlines'}>
          {aiOn ? 'AI ON' : ''}
        </div>
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true"></div>
        <span className="text-emerald-300 text-[9px] tracking-widest">LIVE</span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-5">

        {/* System Logs */}
        {systemLogs.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <i className="fas fa-terminal text-emerald-400 text-[10px]" aria-hidden="true"></i>
              <span className="text-[10px] text-emerald-300 uppercase tracking-widest font-bold">Latest Activity</span>
            </div>

            <div className="space-y-1.5">
              {systemLogs.slice(0, 8).map((log, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 text-[12px] text-emerald-200/90 leading-snug animate-fade-in"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <span className="text-emerald-500 select-none">{">"}</span>
                  <span className="flex-1">{log}</span>
                </div>
              ))}
            </div>

            <div className="divider-gradient mt-4"></div>
          </div>
        )}

        {/* News Events */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-3">
            <i className="fas fa-newspaper text-slate-300 text-[10px]" aria-hidden="true"></i>
            <span className="text-[10px] text-slate-300 uppercase tracking-widest font-bold">Wire Service</span>
          </div>

          <div className="space-y-3">
            {events.slice(0, 5).map((e, i) => {
              const sentiment = getSentiment(e.headline);
              const hType = headlineTypes[i % headlineTypes.length];
              const hStyle = headlineTypeStyles[hType] || 'text-slate-300';
              return (
                <div
                  key={i}
                  className={`
                    border-l-2 pl-3 py-2 rounded-r transition-all duration-200
                    hover:bg-slate-800/40 cursor-default
                    ${getSentimentStyle(sentiment)}
                  `}
                >
                  <div className="flex items-center justify-between text-[9px] mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`uppercase tracking-wider ${hStyle}`}>{hType}</span>
                      <i className={`fas ${getSentimentIcon(sentiment)} text-[8px]`} aria-hidden="true"></i>
                    </div>
                    <span className="text-slate-300">{getTimeAgo(i)}</span>
                  </div>
                  <div className="font-prose text-[13px] text-slate-100 leading-relaxed hover:text-white transition-colors">
                    {e.headline}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* The Deal Sheet — Weekly Newspaper */}
        {newspaper && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-3">
              <i className="fas fa-newspaper text-amber-400 text-[10px]" aria-hidden="true"></i>
              <span className="text-[10px] text-amber-300 uppercase tracking-widest font-bold">The Deal Sheet</span>
              {!newspaper.isRead && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-400 text-black font-bold uppercase tracking-wider">New</span>
              )}
            </div>

            <div
              className={`rounded-lg border p-3 space-y-3 transition-all ${newspaper.isRead ? 'border-slate-700 bg-slate-900/40' : 'border-amber-600 bg-amber-950/25'}`}
              onClick={() => { if (!newspaper.isRead && onMarkNewspaperRead) onMarkNewspaperRead(); }}
            >
              <div className="text-[9px] text-slate-300 uppercase tracking-[0.3em] text-center border-b border-slate-700 pb-1.5">
                {newspaper.masthead}
              </div>

              <div>
                <div className="font-prose text-sm font-bold text-amber-200 leading-tight">{newspaper.leadStory.headline}</div>
                <div className="text-[10px] text-slate-300 mt-0.5 font-mono">{newspaper.leadStory.byline}</div>
                <div className="font-prose text-[13px] text-slate-100 mt-1.5 leading-relaxed">{newspaper.leadStory.body}</div>
              </div>

              {newspaper.gossipSection && (
                <div className="border-t border-slate-700 pt-2">
                  <div className="text-[11px] text-purple-300 font-bold italic">{newspaper.gossipSection.headline}</div>
                  <div className="font-prose text-[13px] text-slate-200 mt-1 leading-relaxed italic">{newspaper.gossipSection.body}</div>
                </div>
              )}

              {newspaper.corrections.length > 0 && (
                <div className="text-[10px] text-slate-400 italic border-t border-slate-800 pt-1.5">
                  Corrections: {newspaper.corrections[0]}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Gossip Feed — purple reserved for Machiavelli/back-channel whispers */}
        {activeGossip.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-3">
              <i className="fas fa-ear-listen text-purple-300 text-[10px]" aria-hidden="true"></i>
              <span className="text-[10px] text-purple-300 uppercase tracking-widest font-bold">Overheard</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-900/60 text-purple-100 font-bold">{activeGossip.length}</span>
            </div>
            <div className="space-y-2">
              {activeGossip.slice(0, 3).map((gossip) => (
                <div
                  key={gossip.id}
                  className="border-l-2 border-purple-500/70 pl-3 py-1.5 rounded-r bg-purple-950/15"
                >
                  <div className="font-prose text-[13px] text-purple-100 italic leading-relaxed">
                    &ldquo;{gossip.currentVersion}&rdquo;
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 font-mono">
                    via {gossip.reachedNpcs.length} contact{gossip.reachedNpcs.length > 1 ? 's' : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analyst Note */}
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-3">
            <i className="fas fa-user-tie text-cyan-300 text-[10px]" aria-hidden="true"></i>
            <span className="text-[10px] text-cyan-300 uppercase tracking-widest font-bold">Analyst Note</span>
          </div>

          <div className="card-elevated rounded-lg p-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-cyan-900/40 border border-cyan-700 flex items-center justify-center shrink-0">
                <i className="fas fa-quote-left text-cyan-300 text-xs" aria-hidden="true"></i>
              </div>
              <div>
                <div className="font-prose text-[13px] text-slate-100 leading-relaxed italic">
                  &ldquo;Tech sector looking frothy. Pizza party approved for Q3.&rdquo;
                </div>
                <div className="text-[10px] text-slate-400 mt-2 uppercase tracking-wider font-mono">
                  — Senior Analyst, 2h ago
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Market Sentiment */}
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-3">
            <i className="fas fa-chart-pie text-slate-300 text-[10px]" aria-hidden="true"></i>
            <span className="text-[10px] text-slate-300 uppercase tracking-widest font-bold">Sentiment</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-emerald-950/40 border border-emerald-700 rounded-lg p-2 text-center">
              <div className="text-emerald-200 font-bold text-sm tabular-nums">42%</div>
              <div className="text-[10px] text-emerald-300 uppercase tracking-wider font-bold">Bullish</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-600 rounded-lg p-2 text-center">
              <div className="text-slate-100 font-bold text-sm tabular-nums">31%</div>
              <div className="text-[10px] text-slate-300 uppercase tracking-wider font-bold">Neutral</div>
            </div>
            <div className="bg-red-950/40 border border-red-700 rounded-lg p-2 text-center">
              <div className="text-red-200 font-bold text-sm tabular-nums">27%</div>
              <div className="text-[10px] text-red-300 uppercase tracking-wider font-bold">Bearish</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default NewsTicker;
