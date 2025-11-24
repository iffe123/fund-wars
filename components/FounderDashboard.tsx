
import React, { useState } from 'react';
import type { PlayerStats, NPC } from '../types';

interface FounderDashboardProps {
  playerStats: PlayerStats;
  npcs: NPC[];
  onRecruit: (npcId: string) => void;
  onOpenChat: (npcId: string) => void;
}

const FounderDashboard: React.FC<FounderDashboardProps> = ({ playerStats, npcs, onRecruit, onOpenChat }) => {
  const [showRecruitModal, setShowRecruitModal] = useState(false);

  const formatCurrency = (val: number) => {
    if (val >= 1000000000) return `$${(val / 1000000000).toFixed(1)}B`;
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    return `$${val.toLocaleString()}`;
  };

  const aumProgress = Math.min((playerStats.aum / 1000000000) * 100, 100);

  // Filter hires: Exclude LPs, rivals, and already hired people
  const availableHires = npcs.filter(n => !n.role.includes("Limited Partner") && !playerStats.employees.includes(n.id) && !n.isRival);
  
  // Identify Institutional Investors
  const potentialLPs = npcs.filter(n => n.role.includes("Limited Partner"));

  // Calculated Metrics
  const baseBurn = 50000;
  const costPerHead = 15000;
  const monthlyBurn = baseBurn + (playerStats.employees.length * costPerHead);
  const runwayMonths = monthlyBurn > 0 ? Math.floor(playerStats.cash / monthlyBurn) : 999;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
      <div className="bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-slate-800">
          <div className="flex justify-between items-start">
            <div>
               <h1 className="text-4xl font-bower mb-2 text-white">Founder Mode</h1>
               <p className="text-slate-400">Build your legacy. Reach $1B AUM to win.</p>
            </div>
            <div className="flex space-x-6">
                <div className="text-right">
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Burn Rate</div>
                    <div className="text-2xl font-mono text-red-500 font-bold">-${(monthlyBurn / 1000).toFixed(0)}k<span className="text-sm">/mo</span></div>
                </div>
                <div className="text-right">
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Runway</div>
                    <div className={`text-2xl font-mono font-bold ${runwayMonths < 3 ? 'text-red-500 animate-pulse' : 'text-slate-200'}`}>{runwayMonths} Mo</div>
                </div>
                 <div className="text-right">
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Cash</div>
                    <div className="text-2xl font-mono text-green-500 font-bold">${(playerStats.cash / 1000).toFixed(0)}k</div>
                </div>
                <div className="text-right border-l border-slate-700 pl-6">
                    <div className="text-[10px] text-amber-500 uppercase tracking-widest font-bold">AUM</div>
                    <div className="text-4xl font-mono text-white font-bold tracking-tighter">{formatCurrency(playerStats.aum)}</div>
                </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-8">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>$0</span>
                <span>$1 Billion Target</span>
            </div>
            <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700 relative">
                <div 
                    className="h-full bg-gradient-to-r from-amber-600 to-yellow-400 transition-all duration-1000"
                    style={{ width: `${aumProgress}%` }}
                ></div>
                {/* Markers */}
                <div className="absolute top-0 bottom-0 left-[10%] w-0.5 bg-slate-600/50"></div>
                <div className="absolute top-0 bottom-0 left-[50%] w-0.5 bg-slate-600/50"></div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-800">
            {/* Team Section */}
            <div className="p-6">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-300 uppercase tracking-wider text-sm"><i className="fas fa-users mr-2"></i>Talent Pool</h3>
                    <button 
                        onClick={() => setShowRecruitModal(true)}
                        className="text-xs bg-blue-700 hover:bg-blue-600 px-3 py-1 rounded text-white transition-colors"
                    >
                        + Scout
                    </button>
                 </div>
                 
                 {playerStats.employees.length === 0 ? (
                     <div className="text-center py-8 text-slate-600 text-sm border-2 border-dashed border-slate-800 rounded-lg">
                         <p>One-person shop.</p>
                         <p className="text-xs mt-2">Hiring adds $15k/mo to burn.</p>
                     </div>
                 ) : (
                     <ul className="space-y-3">
                         {playerStats.employees.map(empId => {
                             const npc = npcs.find(n => n.id === empId);
                             return (
                                 <li key={empId} className="flex items-center space-x-3 bg-slate-800 p-3 rounded-lg border border-slate-700">
                                     <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-400">
                                         <i className={`fas ${npc?.avatar}`}></i>
                                     </div>
                                     <div>
                                         <p className="font-bold text-slate-200">{npc?.name}</p>
                                         <p className="text-xs text-slate-500">{npc?.role}</p>
                                     </div>
                                 </li>
                             )
                         })}
                     </ul>
                 )}
            </div>

            {/* Fundraising / Roadshow */}
            <div className="p-6 col-span-2">
                <h3 className="font-bold text-slate-300 uppercase tracking-wider text-sm mb-4"><i className="fas fa-bullhorn mr-2"></i>Capital Raising</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {/* The Roadshow Card */}
                     <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 hover:border-amber-500/50 transition-all group">
                         <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                                <i className="fas fa-handshake fa-lg"></i>
                            </div>
                            <span className="text-xs bg-amber-900/30 text-amber-500 px-2 py-1 rounded border border-amber-900/50">High Stakes</span>
                         </div>
                         <h4 className="text-xl font-bold text-white mb-2">Pitch Institutional Investors</h4>
                         <p className="text-sm text-slate-400 mb-6">Launch a roadshow to secure capital from Pension Funds and Sovereign Wealth Funds. They will scrutinize your entire track record.</p>
                         <button 
                            onClick={() => {
                                // Select a random LP to pitch to
                                const targetLP = potentialLPs[Math.floor(Math.random() * potentialLPs.length)];
                                if (targetLP) onOpenChat(targetLP.id);
                            }}
                            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded flex items-center justify-center space-x-2"
                         >
                             <span>Start Roadshow</span>
                             <i className="fas fa-arrow-right"></i>
                         </button>
                     </div>

                     {/* Stats / Advice */}
                     <div className="space-y-4">
                         <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                            <div className="text-slate-400 text-xs mb-1">Current Reputation</div>
                            <div className={`text-xl font-bold ${playerStats.reputation > 50 ? 'text-green-500' : 'text-red-500'}`}>
                                {playerStats.reputation}/100
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                                {playerStats.reputation < 30 ? "Investors are not taking your calls." : "Doors are opening."}
                            </p>
                        </div>
                        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                             <div className="text-slate-400 text-xs mb-1">Track Record (Score)</div>
                             <div className="text-xl font-bold text-blue-400">{playerStats.score}</div>
                        </div>
                     </div>
                </div>

                <div className="mt-6 bg-slate-800/50 border border-slate-700 p-4 rounded-lg flex items-start space-x-3">
                    <i className="fas fa-lightbulb text-yellow-500 mt-1"></i>
                    <p className="text-slate-400 text-sm">
                        <span className="text-slate-300 font-bold">Pro Tip:</span> LPs have long memories. If you burned bridges or acted unethically in previous scenarios, they will bring it up during the pitch. Be prepared to defend your past.
                    </p>
                </div>
            </div>
        </div>
      </div>

      {/* Recruitment Modal */}
      {showRecruitModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
              <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl">
                  <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                      <h3 className="text-white font-bold">Scout Talent</h3>
                      <button onClick={() => setShowRecruitModal(false)} className="text-slate-400 hover:text-white"><i className="fas fa-times"></i></button>
                  </div>
                  <div className="p-4 space-y-3">
                      {availableHires.length === 0 ? (
                          <div className="text-center py-8">
                             <i className="fas fa-user-slash text-slate-600 text-3xl mb-2"></i>
                             <p className="text-slate-500">The talent pool is dry.</p>
                          </div>
                      ) : (
                          availableHires.map(npc => {
                              const isHirable = npc.relationship >= 50;
                              return (
                                <div key={npc.id} className="flex justify-between items-center bg-slate-800 p-3 rounded border border-slate-700">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isHirable ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
                                            <i className={`fas ${npc.avatar}`}></i>
                                        </div>
                                        <div>
                                            <p className="text-slate-200 font-bold text-sm">{npc.name}</p>
                                            {isHirable ? (
                                                <p className="text-green-500 text-[10px]">Willing to join</p>
                                            ) : (
                                                <p className="text-red-500 text-[10px] italic">"I remember what you did..."</p>
                                            )}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            onRecruit(npc.id);
                                            setShowRecruitModal(false);
                                        }}
                                        disabled={!isHirable}
                                        className="px-3 py-1 text-xs font-bold rounded bg-blue-700 text-white disabled:bg-slate-700 disabled:text-slate-500 hover:bg-blue-600"
                                    >
                                        {isHirable ? 'Hire ($20k)' : 'Refuses'}
                                    </button>
                                </div>
                              )
                          })
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default FounderDashboard;
