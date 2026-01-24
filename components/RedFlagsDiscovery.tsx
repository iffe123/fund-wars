/**
 * Red Flags Discovery System
 *
 * AI-generated documents with buried problems to discover.
 * Players can flag suspicious items and discuss in management meetings.
 */

import React, { useState, useMemo } from 'react';
import { TerminalButton, TerminalPanel } from './TerminalUI';
import { useHaptic } from '../hooks/useHaptic';
import { SAMPLE_RED_FLAGS } from '../constants/investmentCommittee';
import type { RedFlag, RedFlagSeverity, DueDiligenceDocument } from '../types/investmentCommittee';
import type { PortfolioCompany } from '../types';

interface RedFlagsDiscoveryProps {
  company: PortfolioCompany;
  onComplete: (discoveredFlags: string[], missedFlags: string[]) => void;
  onClose: () => void;
}

// Generate document sections with embedded red flags
const generateCIMSections = (company: PortfolioCompany, flags: RedFlag[]) => {
  return [
    {
      id: 'exec_summary',
      title: 'Executive Summary',
      content: `${company.name} is a leading provider in its category with ${(company.revenue / 1000000).toFixed(0)}M in revenue and strong growth prospects. The company has demonstrated consistent performance over the past five years under the leadership of CEO ${company.ceo}.`,
      isExpandable: false,
      hasHiddenContent: false,
    },
    {
      id: 'financial_overview',
      title: 'Financial Overview',
      content: `Revenue has grown at ${(company.revenueGrowth * 100).toFixed(1)}% annually. EBITDA margins are currently at ${((company.ebitda / company.revenue) * 100).toFixed(1)}%. The company maintains a healthy balance sheet with manageable debt levels.`,
      isExpandable: true,
      hasHiddenContent: true,
      footnotes: [
        'Note 7: Revenue recognition follows standard GAAP guidelines.',
        'Note 12: Certain one-time adjustments have been made to normalize EBITDA.',
        'Note 17: Top customer concentration data available in Appendix B.',
      ],
    },
    {
      id: 'ebitda_reconciliation',
      title: 'Adjusted EBITDA Reconciliation',
      content: `The following adjustments have been made to arrive at Adjusted EBITDA:`,
      isExpandable: true,
      hasHiddenContent: true,
      tables: [
        {
          id: 'ebitda_table',
          title: 'EBITDA Bridge',
          headers: ['Item', 'Amount ($M)', 'Notes'],
          rows: [
            { id: 'reported', cells: ['Reported EBITDA', (company.ebitda / 1000000 * 0.8).toFixed(1), 'Per audited financials'], isFlaggable: false, isRedFlag: false },
            { id: 'legal', cells: ['Non-recurring legal fees', '+2.1', 'Litigation settlement'], isFlaggable: true, isRedFlag: false },
            { id: 'ceo_trans', cells: ['CEO transition costs', '+1.8', 'Search and severance'], isFlaggable: true, isRedFlag: false },
            { id: 'facility', cells: ['Facility consolidation', '+3.4', 'One-time restructuring'], isFlaggable: true, isRedFlag: true, redFlagId: 'rf_ebitda_addback_1' },
            { id: 'strategic', cells: ['"Strategic initiative" spend', '+4.7', 'Growth investments'], isFlaggable: true, isRedFlag: true, redFlagId: 'rf_ebitda_addback_1' },
            { id: 'adjusted', cells: ['Adjusted EBITDA', (company.ebitda / 1000000).toFixed(1), 'Management basis'], isFlaggable: false, isRedFlag: false },
          ],
          flaggableItems: ['facility', 'strategic'],
        },
      ],
    },
    {
      id: 'customer_analysis',
      title: 'Customer Analysis',
      content: `The company serves a diversified customer base across multiple industries. Customer relationships are strong with high retention rates. Detailed breakdown by customer segment is available upon request.`,
      isExpandable: true,
      hasHiddenContent: true,
      footnotes: [
        'Appendix B: Full customer list and concentration analysis.',
        'Note: Contract renewal schedules included in data room.',
      ],
    },
    {
      id: 'management',
      title: 'Management Team',
      content: `CEO ${company.ceo} has led the company since 2018. The leadership team has deep industry experience and a track record of execution. Key executives have expressed commitment to the transition.`,
      isExpandable: true,
      hasHiddenContent: true,
      footnotes: [
        'Executive employment agreements in data room.',
        'Earnout structures to be discussed with buyer.',
      ],
    },
    {
      id: 'operations',
      title: 'Operations & Supply Chain',
      content: `Manufacturing operations are efficient with state-of-the-art facilities. Supply chain is well-managed with multiple sourcing options for key components.`,
      isExpandable: true,
      hasHiddenContent: true,
      footnotes: [
        'Supplier agreements available in data room.',
        'Note: Primary component supplier agreement renewal in progress.',
      ],
    },
    {
      id: 'appendix_b',
      title: 'Appendix B: Customer Details',
      content: `Customer concentration breakdown (see footnote 17 for methodology):`,
      isExpandable: true,
      hasHiddenContent: true,
      tables: [
        {
          id: 'customer_table',
          title: 'Top Customers by Revenue',
          headers: ['Customer', 'Revenue %', 'Contract Status'],
          rows: [
            { id: 'cust1', cells: ['Customer A', '45%', 'Renewal Q2 next year'], isFlaggable: true, isRedFlag: true, redFlagId: 'rf_customer_concentration' },
            { id: 'cust2', cells: ['Customer B', '18%', 'Long-term agreement'], isFlaggable: true, isRedFlag: false },
            { id: 'cust3', cells: ['Customer C', '12%', 'Annual renewal'], isFlaggable: false, isRedFlag: false },
            { id: 'other', cells: ['Other', '25%', 'Various'], isFlaggable: false, isRedFlag: false },
          ],
          flaggableItems: ['cust1', 'cust2'],
        },
      ],
    },
  ];
};

// Severity colors
const SEVERITY_COLORS: Record<RedFlagSeverity, string> = {
  MINOR: 'text-yellow-400 border-yellow-400',
  MODERATE: 'text-orange-400 border-orange-400',
  MAJOR: 'text-red-400 border-red-400',
  CRITICAL: 'text-red-600 border-red-600 bg-red-950/30',
};

const RedFlagsDiscovery: React.FC<RedFlagsDiscoveryProps> = ({ company, onComplete, onClose }) => {
  const { triggerImpact } = useHaptic();

  // Generate flags for this company
  const availableFlags = useMemo(() => {
    // Take 3-5 random flags and customize them
    const shuffled = [...SAMPLE_RED_FLAGS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 4);
  }, []);

  // State
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [flaggedItems, setFlaggedItems] = useState<Set<string>>(new Set());
  const [discoveredFlags, setDiscoveredFlags] = useState<Set<string>>(new Set());
  const [reviewComplete, setReviewComplete] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedFlagForDiscussion, setSelectedFlagForDiscussion] = useState<string | null>(null);

  // Generate sections
  const sections = useMemo(() => generateCIMSections(company, availableFlags), [company, availableFlags]);

  // Toggle section expansion
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  // Flag an item as suspicious
  const handleFlagItem = (itemId: string, isRedFlag: boolean, redFlagId?: string) => {
    triggerImpact('LIGHT');

    setFlaggedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
        if (redFlagId) {
          setDiscoveredFlags(df => {
            const nextDf = new Set(df);
            nextDf.delete(redFlagId);
            return nextDf;
          });
        }
      } else {
        next.add(itemId);
        if (isRedFlag && redFlagId) {
          setDiscoveredFlags(df => new Set([...df, redFlagId]));
          triggerImpact('MEDIUM');
        }
      }
      return next;
    });
  };

  // Complete the review
  const handleCompleteReview = () => {
    setReviewComplete(true);
    setShowResults(true);

    // Identify missed flags
    const allRedFlagIds = availableFlags.map(f => f.id);
    const missed = allRedFlagIds.filter(id => !discoveredFlags.has(id));

    triggerImpact(discovered.length > missed.length ? 'LIGHT' : 'HEAVY');
  };

  // Get discovered and missed counts
  const discovered = Array.from(discoveredFlags);
  const missed = availableFlags.filter(f => !discoveredFlags.has(f.id));

  // Submit final results
  const handleSubmit = () => {
    const missedIds = missed.map(f => f.id);
    onComplete(discovered, missedIds);
    onClose();
  };

  // Render a flaggable table row
  const renderTableRow = (row: { id: string; cells: string[]; isFlaggable: boolean; isRedFlag: boolean; redFlagId?: string }) => {
    const isFlagged = flaggedItems.has(row.id);

    return (
      <tr
        key={row.id}
        className={`border-b border-slate-800 ${row.isFlaggable ? 'cursor-pointer hover:bg-slate-800/50' : ''} ${isFlagged ? 'bg-amber-900/20' : ''}`}
        onClick={() => row.isFlaggable && handleFlagItem(row.id, row.isRedFlag, row.redFlagId)}
      >
        {row.cells.map((cell, idx) => (
          <td key={idx} className="px-3 py-2 text-sm">
            {cell}
          </td>
        ))}
        <td className="px-3 py-2 w-10">
          {row.isFlaggable && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleFlagItem(row.id, row.isRedFlag, row.redFlagId);
              }}
              className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                isFlagged ? 'bg-amber-500 text-black' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              }`}
            >
              <i className={`fas ${isFlagged ? 'fa-flag' : 'fa-flag'} text-xs`}></i>
            </button>
          )}
        </td>
      </tr>
    );
  };

  // Render results view
  const renderResults = () => (
    <div className="space-y-6">
      {/* Score summary */}
      <div className="text-center py-6 border-2 border-cyan-500 bg-slate-800/50">
        <div className="text-sm uppercase tracking-widest text-slate-400 mb-1">Due Diligence Score</div>
        <div className="text-5xl font-bold text-cyan-400">
          {Math.round((discovered.length / availableFlags.length) * 100)}%
        </div>
        <div className="text-sm text-slate-400 mt-2">
          {discovered.length} of {availableFlags.length} red flags identified
        </div>
      </div>

      {/* Discovered flags */}
      {discovered.length > 0 && (
        <div className="bg-green-900/20 border border-green-700 p-4 rounded">
          <div className="text-sm font-bold mb-3 text-green-400">
            <i className="fas fa-check-circle mr-2"></i>
            Red Flags You Found
          </div>
          <div className="space-y-3">
            {discovered.map(flagId => {
              const flag = availableFlags.find(f => f.id === flagId);
              if (!flag) return null;
              return (
                <div key={flagId} className="bg-slate-800 p-3 rounded">
                  <div className={`text-sm font-bold ${SEVERITY_COLORS[flag.severity].split(' ')[0]}`}>
                    {flag.title} ({flag.severity})
                  </div>
                  <div className="text-sm text-slate-300 mt-1">{flag.description}</div>
                  <div className="text-xs text-slate-500 mt-1">Location: {flag.location}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Missed flags */}
      {missed.length > 0 && (
        <div className="bg-red-900/20 border border-red-700 p-4 rounded">
          <div className="text-sm font-bold mb-3 text-red-400">
            <i className="fas fa-exclamation-triangle mr-2"></i>
            Red Flags You Missed
          </div>
          <div className="space-y-3">
            {missed.map(flag => (
              <div key={flag.id} className="bg-slate-800 p-3 rounded">
                <div className={`text-sm font-bold ${SEVERITY_COLORS[flag.severity].split(' ')[0]}`}>
                  {flag.title} ({flag.severity})
                </div>
                <div className="text-sm text-slate-300 mt-1">{flag.description}</div>
                <div className="text-xs text-amber-400 mt-2">
                  <i className="fas fa-lightbulb mr-1"></i>
                  Hint: {flag.discoveryHint}
                </div>
                <div className="text-xs text-red-400 mt-1">
                  <i className="fas fa-bomb mr-1"></i>
                  Consequence: {flag.consequence}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Learning note */}
      <div className="bg-cyan-900/20 border border-cyan-700 p-4 rounded">
        <div className="text-sm font-bold mb-2 text-cyan-400">
          <i className="fas fa-graduation-cap mr-2"></i>
          Due Diligence Lesson
        </div>
        <div className="text-sm text-slate-300">
          {discovered.length === availableFlags.length
            ? "Excellent work. You caught all the red flags. In real PE, this level of diligence separates the successful funds from the bankrupted ones."
            : discovered.length > missed.length
              ? "Good eye for detail, but some issues slipped through. Always check footnotes, appendices, and ask 'what are they NOT showing me?'"
              : "Due diligence is where deals are made or broken. The red flags are there - they're just hidden in footnotes, appendices, and things left unsaid."}
        </div>
      </div>

      <TerminalButton
        variant="primary"
        label="Continue to Deal"
        onClick={handleSubmit}
        className="w-full"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto border-2 border-amber-500 bg-slate-900 shadow-[0_0_50px_rgba(245,158,11,0.2)]">
        {/* Header */}
        <div className="bg-amber-900 text-amber-100 px-4 py-3 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <i className="fas fa-file-contract text-lg"></i>
            <span className="font-bold">CONFIDENTIAL INFORMATION MEMORANDUM</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">{company.name}</span>
            <button onClick={onClose} className="text-amber-300 hover:text-white">
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        <div className="p-6">
          {showResults ? (
            renderResults()
          ) : (
            <>
              {/* Instructions */}
              <div className="mb-6 p-4 bg-slate-800/50 border border-slate-700 rounded">
                <div className="text-sm font-bold mb-2 text-amber-400">
                  <i className="fas fa-search mr-2"></i>
                  Due Diligence Task
                </div>
                <p className="text-sm text-slate-300">
                  Review this CIM carefully. Flag any items that seem suspicious or concerning by clicking
                  the flag icon. Expand sections to see details. Not everything is what it seems.
                </p>
                <div className="flex gap-4 mt-3 text-xs text-slate-400">
                  <span><i className="fas fa-flag text-amber-500 mr-1"></i> Click to flag suspicious items</span>
                  <span><i className="fas fa-chevron-down mr-1"></i> Expand sections for details</span>
                  <span>Items flagged: {flaggedItems.size}</span>
                </div>
              </div>

              {/* Document sections */}
              <div className="space-y-4">
                {sections.map(section => (
                  <div
                    key={section.id}
                    className={`border rounded ${
                      expandedSections.has(section.id) ? 'border-cyan-700' : 'border-slate-700'
                    }`}
                  >
                    {/* Section header */}
                    <div
                      className={`px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-slate-800/50 ${
                        section.isExpandable ? '' : 'cursor-default'
                      }`}
                      onClick={() => section.isExpandable && toggleSection(section.id)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200">{section.title}</span>
                        {section.hasHiddenContent && (
                          <span className="text-xs text-amber-500">
                            <i className="fas fa-asterisk"></i>
                          </span>
                        )}
                      </div>
                      {section.isExpandable && (
                        <i className={`fas fa-chevron-${expandedSections.has(section.id) ? 'up' : 'down'} text-slate-400`}></i>
                      )}
                    </div>

                    {/* Section content */}
                    {(expandedSections.has(section.id) || !section.isExpandable) && (
                      <div className="px-4 pb-4">
                        <p className="text-sm text-slate-400 mb-3">{section.content}</p>

                        {/* Tables */}
                        {section.tables?.map(table => (
                          <div key={table.id} className="mt-4">
                            <div className="text-xs text-slate-500 mb-2">{table.title}</div>
                            <table className="w-full border border-slate-700">
                              <thead>
                                <tr className="bg-slate-800">
                                  {table.headers.map((h, i) => (
                                    <th key={i} className="px-3 py-2 text-left text-xs text-slate-400 font-medium">{h}</th>
                                  ))}
                                  <th className="w-10"></th>
                                </tr>
                              </thead>
                              <tbody>
                                {table.rows.map(row => renderTableRow(row))}
                              </tbody>
                            </table>
                          </div>
                        ))}

                        {/* Footnotes */}
                        {section.footnotes && expandedSections.has(section.id) && (
                          <div className="mt-4 pt-3 border-t border-slate-700">
                            <div className="text-xs text-slate-500 space-y-1">
                              {section.footnotes.map((note, i) => (
                                <div key={i} className="flex gap-2">
                                  <span className="text-slate-600">[{i + 1}]</span>
                                  <span>{note}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="mt-6 flex gap-4">
                <TerminalButton
                  variant="primary"
                  label={`Complete Review (${flaggedItems.size} items flagged)`}
                  onClick={handleCompleteReview}
                  className="flex-1"
                />
                <TerminalButton
                  variant="default"
                  label="Ask Management"
                  onClick={() => setSelectedFlagForDiscussion(flaggedItems.size > 0 ? Array.from(flaggedItems)[0] : null)}
                  className="flex-1"
                  disabled={flaggedItems.size === 0}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RedFlagsDiscovery;
