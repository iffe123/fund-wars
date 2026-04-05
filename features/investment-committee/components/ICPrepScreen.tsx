/**
 * IC Prep Screen Component
 *
 * Pre-meeting screen showing deal details and IC members.
 */

import React from 'react';
import type { PortfolioCompany } from '../../../types';
import type { ICPartner } from '../types/icTypes';
import { buildICPrepBrief } from '../utils/icPrep';

interface ICPrepScreenProps {
  deal: PortfolioCompany;
  partners: ICPartner[];
  onEnter: () => void;
  onCancel: () => void;
}

export const ICPrepScreen: React.FC<ICPrepScreenProps> = ({
  deal,
  partners,
  onEnter,
  onCancel,
}) => {
  const leverage = deal.debt / deal.ebitda;
  const entryMultiple = deal.leverageModelParams?.entryMultiple || (deal.currentValuation / deal.ebitda);
  const equityCheck = deal.leverageModelParams
    ? deal.currentValuation - deal.debt
    : deal.investmentCost;
  const prepBrief = buildICPrepBrief(deal);

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 text-center border-b border-slate-700/50 bg-gradient-to-b from-slate-800/50 to-transparent">
        <div className="text-[11px] uppercase tracking-[0.3em] text-amber-500 mb-2">
          Investment Committee Meeting
        </div>
        <h2 className="text-2xl font-bold text-slate-200">{deal.name}</h2>
        <div className="text-sm text-slate-400 mt-1">
          ${(equityCheck / 1000000).toFixed(0)}M equity check at {entryMultiple.toFixed(1)}x EBITDA
        </div>
      </div>

      <div className="p-4 border-b border-slate-700/50">
        <h3 className="text-[11px] uppercase tracking-widest text-slate-500 font-bold mb-3">
          Deal Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
            <div className="text-[10px] text-slate-500 uppercase mb-1">Revenue</div>
            <div className="text-sm font-bold text-slate-200">
              ${(deal.revenue / 1000000).toFixed(1)}M
            </div>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
            <div className="text-[10px] text-slate-500 uppercase mb-1">EBITDA</div>
            <div className="text-sm font-bold text-slate-200">
              ${(deal.ebitda / 1000000).toFixed(1)}M
            </div>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
            <div className="text-[10px] text-slate-500 uppercase mb-1">Leverage</div>
            <div className={`text-sm font-bold ${leverage > 4 ? 'text-amber-400' : 'text-slate-200'}`}>
              {leverage.toFixed(1)}x
            </div>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
            <div className="text-[10px] text-slate-500 uppercase mb-1">Target IRR</div>
            <div className="text-sm font-bold text-emerald-400">
              {deal.leverageModelParams
                ? `${(deal.leverageModelParams.projectedIRR * 100).toFixed(0)}%`
                : 'N/A'}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-slate-700/50 bg-cyan-950/20">
        <div className="flex items-start gap-3">
          <i className="fas fa-crosshairs text-cyan-400 mt-0.5" />
          <div className="space-y-2">
            <div className="text-[10px] text-cyan-400 uppercase tracking-wider font-bold">
              Your Angle
            </div>
            <div className="text-sm font-semibold text-slate-100">{prepBrief.headline}</div>
            <p className="text-xs text-slate-300 leading-relaxed">{prepBrief.thesis}</p>
            <p className="text-xs text-slate-400 leading-relaxed">{prepBrief.whyNow}</p>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-slate-700/50 bg-slate-950/40">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-emerald-800/40 bg-emerald-950/20 p-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-2">
              What Wins The Room
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              {prepBrief.proofPoints.map((point) => (
                <li key={point} className="leading-relaxed">* {point}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-amber-800/40 bg-amber-950/20 p-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-2">
              What Can Kill It
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              {prepBrief.risks.map((risk) => (
                <li key={risk} className="leading-relaxed">* {risk}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-blue-800/40 bg-blue-950/20 p-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400 mb-2">
              How To Respond
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              {prepBrief.playbook.map((item) => (
                <li key={item} className="leading-relaxed">* {item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-slate-700/50 bg-amber-950/20">
        <div className="flex items-start gap-3">
          <i className="fas fa-lightbulb text-amber-500 mt-0.5" />
          <div>
            <div className="text-[10px] text-amber-500 uppercase tracking-wider font-bold mb-1">
              Suggested Opening Shape
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{prepBrief.suggestedOpening}</p>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-slate-700/50 flex-1 overflow-y-auto">
        <h3 className="text-[11px] uppercase tracking-widest text-slate-500 font-bold mb-3">
          Committee Present
        </h3>
        <div className="space-y-3">
          {partners.map((partner) => (
            <div
              key={partner.id}
              className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/30"
            >
              <div className="text-2xl">{partner.avatar}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-200">{partner.name}</span>
                  <span className="text-[10px] text-amber-500">"{partner.nickname}"</span>
                </div>
                <div className="text-xs text-slate-500">{partner.role}</div>
                <div className="text-[10px] text-slate-600 italic mt-1">
                  Focus: {partner.dealTypeFocus.slice(0, 3).join(', ')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 flex gap-3 justify-center">
        <button
          onClick={onCancel}
          className="px-6 py-3 rounded-lg uppercase tracking-widest text-xs font-bold border border-slate-600 text-slate-400 bg-slate-800/30 hover:bg-slate-700/50 transition-colors"
        >
          <i className="fas fa-arrow-left mr-2" />
          Not Ready
        </button>
        <button
          onClick={onEnter}
          className="px-8 py-3 rounded-lg uppercase tracking-widest text-xs font-bold border border-emerald-500/70 text-emerald-400 bg-emerald-950/30 hover:bg-emerald-900/50 transition-colors animate-pulse-glow"
        >
          <i className="fas fa-door-open mr-2" />
          Enter the Room
        </button>
      </div>
    </div>
  );
};

export default ICPrepScreen;
