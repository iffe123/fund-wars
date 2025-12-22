import React from 'react';
import type { NewsEvent } from '../types';
import { isGeminiApiConfigured } from '../services/geminiService';

interface NewsTickerProps {
  events: NewsEvent[];
  systemLogs?: string[];
}

const NewsTicker: React.FC<NewsTickerProps> = ({ events, systemLogs = [] }) => {
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

  const getSentimentStyle = (sentiment: 'positive' | 'negative' | 'neutral') => {
    switch (sentiment) {
      case 'positive': return 'border-l-emerald-500 bg-emerald-950/20';
      case 'negative': return 'border-l-red-500 bg-red-950/20';
      default: return 'border-l-slate-600 bg-slate-800/20';
    }
  };

  const getSentimentIcon = (sentiment: 'positive' | 'negative' | 'neutral') => {
    switch (sentiment) {
      case 'positive': return 'fa-arrow-trend-up text-emerald-500';
      case 'negative': return 'fa-arrow-trend-down text-red-500';
      default: return 'fa-minus text-slate-500';
    }
  };

  return (
    <div className="bg-gradient-to-b from-black to-slate-950/50 border-l border-slate-700/50 h-full flex flex-col font-mono">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800/90 to-slate-800/70 px-4 py-2 text-[11px] uppercase text-slate-400 font-bold border-b border-slate-700/60 flex items-center gap-2 shrink-0">
        <i className="fas fa-rss text-amber-500/70 text-xs"></i>
        <span>Market Feed</span>
        <div className="flex-1"></div>
        <div className={`text-[9px] font-bold uppercase tracking-widest ${aiOn ? 'text-emerald-500' : 'text-amber-500'}`} title={aiOn ? 'AI-generated headlines enabled' : 'AI not configured; using fallback headlines'}>
          AI {aiOn ? 'ON' : 'OFF'}
        </div>
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
        <span className="text-emerald-500 text-[9px]">LIVE</span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-5">

        {/* System Logs */}
        {systemLogs.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <i className="fas fa-terminal text-emerald-500/70 text-[10px]"></i>
              <span className="text-[10px] text-emerald-600 uppercase tracking-widest font-bold">Latest Activity</span>
            </div>

            <div className="space-y-1.5">
              {systemLogs.slice(0, 8).map((log, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 text-[11px] text-emerald-400/80 leading-tight animate-fade-in"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <span className="text-emerald-600/50 select-none">{">"}</span>
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
            <i className="fas fa-newspaper text-slate-500 text-[10px]"></i>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Wire Service</span>
          </div>

          <div className="space-y-3">
            {events.slice(0, 5).map((e, i) => {
              const sentiment = getSentiment(e.headline);
              return (
                <div
                  key={i}
                  className={`
                    border-l-2 pl-3 py-2 rounded-r transition-all duration-200
                    hover:bg-slate-800/30 cursor-default
                    ${getSentimentStyle(sentiment)}
                  `}
                >
                  <div className="flex items-center justify-between text-[9px] text-slate-500 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="uppercase tracking-wider">Sector Update</span>
                      <i className={`fas ${getSentimentIcon(sentiment)} text-[8px]`}></i>
                    </div>
                    <span className="text-slate-400">{getTimeAgo(i)}</span>
                  </div>
                  <div className="text-xs text-slate-200 leading-relaxed hover:text-white transition-colors">
                    {e.headline}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Analyst Note */}
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-3">
            <i className="fas fa-user-tie text-blue-500/70 text-[10px]"></i>
            <span className="text-[10px] text-blue-500/70 uppercase tracking-widest font-bold">Analyst Note</span>
          </div>

          <div className="card-elevated rounded-lg p-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-900/30 border border-blue-800/30 flex items-center justify-center shrink-0">
                <i className="fas fa-quote-left text-blue-400/50 text-xs"></i>
              </div>
              <div>
                <div className="text-xs text-slate-300 leading-relaxed italic">
                  "Tech sector looking frothy. Pizza party approved for Q3."
                </div>
                <div className="text-[9px] text-slate-400 mt-2 uppercase tracking-wider">
                  — Senior Analyst, 2h ago
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Market Sentiment */}
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-3">
            <i className="fas fa-chart-pie text-purple-500/70 text-[10px]"></i>
            <span className="text-[10px] text-purple-500/70 uppercase tracking-widest font-bold">Sentiment</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-emerald-950/30 border border-emerald-800/30 rounded-lg p-2 text-center">
              <div className="text-emerald-400 font-bold text-sm">42%</div>
              <div className="text-[9px] text-emerald-600 uppercase">Bullish</div>
            </div>
            <div className="bg-slate-800/30 border border-slate-700/30 rounded-lg p-2 text-center">
              <div className="text-slate-300 font-bold text-sm">31%</div>
              <div className="text-[9px] text-slate-500 uppercase">Neutral</div>
            </div>
            <div className="bg-red-950/30 border border-red-800/30 rounded-lg p-2 text-center">
              <div className="text-red-400 font-bold text-sm">27%</div>
              <div className="text-[9px] text-red-600 uppercase">Bearish</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default NewsTicker;
