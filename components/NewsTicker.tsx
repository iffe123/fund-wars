import React from 'react';
import type { NewsEvent } from '../types';

interface NewsTickerProps {
  events: NewsEvent[];
  systemLogs?: string[];
}

const NewsTicker: React.FC<NewsTickerProps> = ({ events, systemLogs = [] }) => {
  return (
    <div className="bg-black border-l border-slate-700 h-full flex flex-col font-mono">
        <div className="bg-slate-800 px-2 py-1 text-[10px] uppercase text-slate-400 font-bold border-b border-slate-700">
            Market_Feed
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-4">
             
             {/* System Logs */}
             {systemLogs.length > 0 && (
                 <div className="border-b border-slate-800 pb-4">
                    <div className="text-[10px] text-green-600 mb-2 uppercase tracking-widest font-bold">Latest_Activity</div>
                    <div className="space-y-2">
                        {systemLogs.slice(0, 8).map((log, i) => (
                            <div key={i} className="text-[10px] text-green-500/80 leading-tight font-mono">
                                <span className="mr-2 opacity-50">{">"}</span>
                                {log}
                            </div>
                        ))}
                    </div>
                 </div>
             )}

             {/* News Events */}
             <div>
                 <div className="text-[10px] text-slate-600 mb-2 uppercase tracking-widest font-bold">Wire_Service</div>
                 <div className="space-y-4">
                    {events.slice(0, 5).map((e, i) => (
                        <div key={i} className="border-b border-slate-800 pb-2">
                            <div className="text-[9px] text-slate-500 mb-1 flex justify-between">
                                <span>SECTOR_UPDATE</span>
                                <span>{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                            <div className="text-xs text-slate-300 leading-snug hover:text-white cursor-default">
                                {e.headline}
                            </div>
                        </div>
                    ))}
                 </div>
             </div>

             <div className="border-b border-slate-800 pb-2">
                 <div className="text-[10px] text-slate-500 mb-1">ANALYST_NOTE</div>
                 <div className="text-xs text-slate-300 leading-snug italic">
                     "Tech sector looking frothy. Pizza party approved for Q3."
                 </div>
             </div>
        </div>
    </div>
  );
};

export default NewsTicker;