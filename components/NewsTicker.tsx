
import React from 'react';
import type { NewsEvent } from '../types';

interface NewsTickerProps {
  events: NewsEvent[];
}

const NewsTicker: React.FC<NewsTickerProps> = ({ events }) => {
  const tickerContent = events.map(event => event.headline).join(' +++ ');

  return (
    <div className="bg-black border-l border-slate-700 h-full flex flex-col">
        <div className="bg-slate-800 px-2 py-1 text-[10px] uppercase text-slate-400 font-bold border-b border-slate-700">
            Market_Sentiment
        </div>
        <div className="flex-1 overflow-hidden relative">
             {/* Vertical Scrolling Marquee attempt, or just a static list for the sidebar */}
             {/* Let's make it a vertical feed for the sidebar layout */}
             <div className="p-2 space-y-4">
                 {events.slice(0, 5).map((e, i) => (
                     <div key={i} className="border-b border-slate-800 pb-2">
                         <div className="text-[10px] text-slate-500 mb-1">{new Date().toLocaleTimeString()} // SECTOR_UPDATE</div>
                         <div className="text-xs text-slate-300 leading-snug hover:text-white cursor-default">
                             {e.headline}
                         </div>
                     </div>
                 ))}
                 <div className="border-b border-slate-800 pb-2">
                     <div className="text-[10px] text-slate-500 mb-1">{new Date().toLocaleTimeString()} // ANALYST_NOTE</div>
                     <div className="text-xs text-slate-300 leading-snug">
                         "Tech sector looking frothy. Pizza party approved for Q3."
                     </div>
                 </div>
             </div>
        </div>
    </div>
  );
};

export default NewsTicker;
