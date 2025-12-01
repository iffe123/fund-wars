import React, { useState } from 'react';
import type { SectorExpertise, IndustrySector } from '../types';
import { SECTOR_DEFINITIONS, SECTOR_LIST, getSectorBonus, SECTOR_FLAVOR_TEXT } from '../constants/sectors';

interface SectorExpertisePanelProps {
  sectorExpertise: SectorExpertise[];
  primarySector?: IndustrySector;
  onSetPrimarySector?: (sector: IndustrySector) => void;
  onClose?: () => void;
}

const SectorExpertisePanel: React.FC<SectorExpertisePanelProps> = ({
  sectorExpertise,
  primarySector,
  onSetPrimarySector,
  onClose,
}) => {
  const [selectedSector, setSelectedSector] = useState<IndustrySector | null>(null);
  const [showFlavorText, setShowFlavorText] = useState<string | null>(null);

  const getExpertise = (sector: IndustrySector): SectorExpertise => {
    return sectorExpertise.find(e => e.sector === sector) || {
      sector,
      level: 0,
      dealsCompleted: 0,
    };
  };

  const selectedDefinition = selectedSector ? SECTOR_DEFINITIONS[selectedSector] : null;
  const selectedExpertise = selectedSector ? getExpertise(selectedSector) : null;
  const selectedBonus = selectedExpertise ? getSectorBonus(selectedExpertise) : null;

  const totalDeals = sectorExpertise.reduce((sum, e) => sum + e.dealsCompleted, 0);
  const averageLevel = sectorExpertise.length > 0
    ? Math.round(sectorExpertise.reduce((sum, e) => sum + e.level, 0) / sectorExpertise.length)
    : 0;

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-slate-800">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <i className="fas fa-graduation-cap text-purple-400"></i>
              Industry Expertise
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              {totalDeals} deals completed | Average Level: {averageLevel}
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          )}
        </div>

        {/* Primary Sector Badge */}
        {primarySector && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs uppercase text-slate-500">Specialization:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold bg-${SECTOR_DEFINITIONS[primarySector].color}-500/20 text-${SECTOR_DEFINITIONS[primarySector].color}-400`}>
              <i className={`fas ${SECTOR_DEFINITIONS[primarySector].icon} mr-1`}></i>
              {SECTOR_DEFINITIONS[primarySector].name}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row">
        {/* Sector List */}
        <div className="md:w-1/2 p-4 border-b md:border-b-0 md:border-r border-slate-800">
          <div className="space-y-2">
            {SECTOR_LIST.map(sector => {
              const def = SECTOR_DEFINITIONS[sector];
              const expertise = getExpertise(sector);
              const isPrimary = primarySector === sector;
              const isSelected = selectedSector === sector;

              return (
                <button
                  key={sector}
                  onClick={() => setSelectedSector(sector)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-slate-700 border-slate-500'
                      : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${def.color}-500/20 text-${def.color}-400`}>
                      <i className={`fas ${def.icon}`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{def.name}</span>
                        {isPrimary && (
                          <span className="text-xs bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded">
                            Specialist
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-${def.color}-500 transition-all duration-300`}
                            style={{ width: `${expertise.level}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-slate-400 w-8">Lv.{expertise.level}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-slate-400">{expertise.dealsCompleted}</span>
                      <p className="text-xs text-slate-500">deals</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sector Details */}
        <div className="md:w-1/2 p-4">
          {selectedDefinition && selectedExpertise && selectedBonus ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">{selectedDefinition.name}</h3>
                {onSetPrimarySector && primarySector !== selectedSector && selectedExpertise.level >= 25 && (
                  <button
                    onClick={() => onSetPrimarySector(selectedSector!)}
                    className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded transition-colors"
                  >
                    Set as Primary
                  </button>
                )}
              </div>

              <p className="text-sm text-slate-400 mb-4">{selectedDefinition.description}</p>

              {/* Flavor Text */}
              <div
                className="bg-slate-800/50 rounded-lg p-3 mb-4 cursor-pointer"
                onClick={() => setShowFlavorText(prev => prev === selectedSector ? null : selectedSector!)}
              >
                <p className="text-xs text-slate-500 italic">
                  "{SECTOR_FLAVOR_TEXT[selectedSector!][Math.floor(Math.random() * SECTOR_FLAVOR_TEXT[selectedSector!].length)]}"
                </p>
              </div>

              {/* Bonuses */}
              <div className="bg-slate-800 rounded-lg p-4 mb-4">
                <h4 className="text-xs uppercase text-slate-500 mb-3">Current Bonuses</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Due Diligence Bonus</span>
                    <span className="text-green-400">+{selectedBonus.dueDiligenceBonus}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Valuation Accuracy</span>
                    <span className="text-green-400">+{selectedBonus.valuationAccuracy}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Deal Sourcing</span>
                    <span className="text-green-400">+{selectedBonus.dealSourceBonus} deals/quarter</span>
                  </div>
                </div>
              </div>

              {/* Deal Characteristics */}
              <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
                <h4 className="text-xs uppercase text-slate-500 mb-3">Typical Deal Characteristics</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-slate-500">EV/EBITDA</p>
                    <p className="text-white">
                      {selectedDefinition.dealCharacteristics.typicalMultiple[0]}x - {selectedDefinition.dealCharacteristics.typicalMultiple[1]}x
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Growth</p>
                    <p className="text-white">
                      {(selectedDefinition.dealCharacteristics.typicalGrowth[0] * 100).toFixed(0)}% - {(selectedDefinition.dealCharacteristics.typicalGrowth[1] * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Margins</p>
                    <p className="text-white">
                      {(selectedDefinition.dealCharacteristics.typicalMargin[0] * 100).toFixed(0)}% - {(selectedDefinition.dealCharacteristics.typicalMargin[1] * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Leverage</p>
                    <p className="text-white">{selectedDefinition.dealCharacteristics.leverageCapacity}</p>
                  </div>
                </div>
              </div>

              {/* Due Diligence Focus */}
              <div className="mb-4">
                <h4 className="text-xs uppercase text-slate-500 mb-2">Due Diligence Focus Areas</h4>
                <ul className="space-y-1">
                  {selectedDefinition.dueDiligenceFocus.slice(0, 3).map((focus, i) => (
                    <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                      <i className="fas fa-check text-green-400 mt-0.5"></i>
                      {focus}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Risk Factors */}
              <div>
                <h4 className="text-xs uppercase text-slate-500 mb-2">Key Risks</h4>
                <ul className="space-y-1">
                  {selectedDefinition.riskFactors.slice(0, 3).map((risk, i) => (
                    <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                      <i className="fas fa-exclamation-triangle text-amber-400 mt-0.5"></i>
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500">
              <div className="text-center">
                <i className="fas fa-arrow-left text-4xl mb-3"></i>
                <p>Select a sector to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SectorExpertisePanel;
