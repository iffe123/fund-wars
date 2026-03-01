/**
 * Weekly Newspaper Modal
 *
 * "THE DEAL SHEET" — AI-Generated Financial Times, But Petty
 *
 * A full AI-generated newspaper front page that appears weekly,
 * referencing the player's deals, rivals, and ethical choices.
 */

import React, { useState } from 'react';
import type { WeeklyNewspaper, NewspaperArticle } from '../types/aiBlueprint';

interface WeeklyNewspaperModalProps {
  newspaper: WeeklyNewspaper;
  onClose: () => void;
  onMarkRead: () => void;
}

const WeeklyNewspaperModal: React.FC<WeeklyNewspaperModalProps> = ({
  newspaper,
  onClose,
  onMarkRead,
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>('lead');

  const handleClose = () => {
    onMarkRead();
    onClose();
  };

  const getSentimentBadge = (sentiment: NewspaperArticle['sentiment']) => {
    switch (sentiment) {
      case 'positive': return <span className="text-[8px] bg-emerald-900/50 text-emerald-400 px-1.5 py-0.5 rounded">BULLISH</span>;
      case 'negative': return <span className="text-[8px] bg-red-900/50 text-red-400 px-1.5 py-0.5 rounded">BEARISH</span>;
      case 'satirical': return <span className="text-[8px] bg-purple-900/50 text-purple-400 px-1.5 py-0.5 rounded">OPINION</span>;
      default: return <span className="text-[8px] bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded">ANALYSIS</span>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#fdf6e3] text-[#2c2c2c] shadow-2xl">
        {/* Masthead */}
        <div className="border-b-4 border-double border-[#2c2c2c] px-6 py-4">
          <div className="flex justify-between items-start">
            <div className="text-[9px] tracking-wider text-[#666]">Est. Fund Wars Year 1</div>
            <button
              onClick={handleClose}
              className="text-[#999] hover:text-[#333] text-sm"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          <h1 className="text-center font-serif text-3xl md:text-4xl font-bold tracking-tight mt-1"
            style={{ fontFamily: '"Georgia", "Times New Roman", serif' }}>
            THE DEAL SHEET
          </h1>
          <div className="text-center text-[10px] tracking-[0.3em] text-[#666] mt-1">
            {newspaper.masthead}
          </div>
          <div className="flex justify-between text-[9px] text-[#999] mt-2 border-t border-[#ddd] pt-1">
            <span>Week {newspaper.week}</span>
            <span>"All the deals that are fit to print"</span>
            <span>Price: Your Sanity</span>
          </div>
        </div>

        <div className="p-6">
          {/* Lead Story */}
          <article className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              {getSentimentBadge(newspaper.leadStory.sentiment)}
              {newspaper.leadStory.referencesPlayer && (
                <span className="text-[8px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded border border-amber-300">
                  ABOUT YOU
                </span>
              )}
            </div>
            <h2
              className="font-serif text-xl md:text-2xl font-bold leading-tight cursor-pointer hover:text-[#444] transition-colors"
              style={{ fontFamily: '"Georgia", "Times New Roman", serif' }}
              onClick={() => setExpandedSection(expandedSection === 'lead' ? null : 'lead')}
            >
              {newspaper.leadStory.headline}
            </h2>
            <div className="text-[10px] text-[#888] mt-1 italic">{newspaper.leadStory.byline}</div>
            {expandedSection === 'lead' && (
              <p className="mt-2 text-sm leading-relaxed text-[#444]" style={{ fontFamily: '"Georgia", serif' }}>
                {newspaper.leadStory.body}
              </p>
            )}
          </article>

          <div className="border-t border-[#ddd] my-4"></div>

          {/* Two-column layout for market + gossip */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Market Column */}
            <article>
              <div className="flex items-center gap-2 mb-1">
                <i className="fas fa-chart-line text-[10px] text-[#888]"></i>
                <span className="text-[9px] uppercase tracking-widest font-bold text-[#888]">Markets</span>
                {getSentimentBadge(newspaper.marketColumn.sentiment)}
              </div>
              <h3
                className="font-serif text-base font-bold cursor-pointer hover:text-[#444]"
                style={{ fontFamily: '"Georgia", serif' }}
                onClick={() => setExpandedSection(expandedSection === 'market' ? null : 'market')}
              >
                {newspaper.marketColumn.headline}
              </h3>
              <div className="text-[9px] text-[#999] italic">{newspaper.marketColumn.byline}</div>
              {expandedSection === 'market' && (
                <p className="mt-2 text-xs leading-relaxed text-[#555]" style={{ fontFamily: '"Georgia", serif' }}>
                  {newspaper.marketColumn.body}
                </p>
              )}
            </article>

            {/* Gossip Section */}
            <article className="border-l-0 md:border-l border-[#ddd] md:pl-6">
              <div className="flex items-center gap-2 mb-1">
                <i className="fas fa-comment-dots text-[10px] text-[#b8860b]"></i>
                <span className="text-[9px] uppercase tracking-widest font-bold text-[#b8860b]">Gossip</span>
              </div>
              <h3
                className="font-serif text-base font-bold cursor-pointer hover:text-[#444]"
                style={{ fontFamily: '"Georgia", serif' }}
                onClick={() => setExpandedSection(expandedSection === 'gossip' ? null : 'gossip')}
              >
                {newspaper.gossipSection.headline}
              </h3>
              {expandedSection === 'gossip' && (
                <p className="mt-2 text-xs leading-relaxed text-[#555] italic" style={{ fontFamily: '"Georgia", serif' }}>
                  {newspaper.gossipSection.body}
                </p>
              )}
            </article>
          </div>

          <div className="border-t border-[#ddd] my-4"></div>

          {/* Editorial Cartoon */}
          <div className="bg-[#f0ead6] border border-[#ddd] rounded p-3 mb-4">
            <div className="text-[9px] uppercase tracking-widest font-bold text-[#888] mb-1">Editorial Cartoon</div>
            <p className="text-xs text-[#555] italic text-center">{newspaper.editorialCartoon}</p>
          </div>

          {/* Letter to the Editor */}
          <div className="mb-4">
            <div className="text-[9px] uppercase tracking-widest font-bold text-[#888] mb-1">Letter to the Editor</div>
            <p className="text-xs text-[#555] italic leading-relaxed pl-3 border-l-2 border-[#ccc]" style={{ fontFamily: '"Georgia", serif' }}>
              {newspaper.letterToEditor}
            </p>
          </div>

          {/* Corrections */}
          {newspaper.corrections.length > 0 && (
            <div className="bg-[#f5f0e0] border border-[#e0d8c0] rounded p-2 mt-4">
              <div className="text-[8px] uppercase tracking-widest font-bold text-[#999] mb-1">Corrections</div>
              {newspaper.corrections.map((correction, i) => (
                <p key={i} className="text-[10px] text-[#888] italic">{correction}</p>
              ))}
            </div>
          )}
        </div>

        {/* Close button */}
        <div className="border-t border-[#ddd] p-4 text-center">
          <button
            onClick={handleClose}
            className="bg-[#2c2c2c] text-[#fdf6e3] px-6 py-2 text-sm rounded hover:bg-[#444] transition-colors"
          >
            Continue to Week {newspaper.week + 1}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WeeklyNewspaperModal;
