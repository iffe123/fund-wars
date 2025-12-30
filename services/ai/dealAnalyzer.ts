/**
 * AI Deal Analyzer Service
 *
 * Generates AI-powered due diligence insights for portfolio companies.
 * Falls back to offline insights when API is unavailable.
 */

import type { PortfolioCompany, SectorExpertise, MarketVolatility, IndustrySector } from '../../types';

// DDInsight type for due diligence findings
export interface DDInsight {
  type: 'RED_FLAG' | 'OPPORTUNITY' | 'WILDCARD';
  title: string;
  description: string;
  probability: number;  // 0-100
  impact: 'LOW' | 'MEDIUM' | 'HIGH';
}

// Get Gemini client (lazy load to avoid circular deps)
let _aiClientPromise: Promise<any> | null = null;

const getAiClient = async () => {
  // @ts-ignore
  const API_KEY = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env.VITE_API_KEY : undefined;
  if (!API_KEY) return null;

  if (!_aiClientPromise) {
    _aiClientPromise = import('@google/genai').then(({ GoogleGenAI }) => {
      return new GoogleGenAI({ apiKey: API_KEY });
    }).catch(() => null);
  }

  return _aiClientPromise;
};

/**
 * Generate AI-powered due diligence insights for a company
 */
export async function generateDDInsights(
  company: PortfolioCompany,
  playerExpertise: SectorExpertise[] = [],
  marketConditions: MarketVolatility = 'NORMAL'
): Promise<DDInsight[]> {
  const ai = await getAiClient();

  // Offline fallback
  if (!ai) {
    return getOfflineDDInsights(company, marketConditions);
  }

  const sectorExpertise = playerExpertise.find(e => e.sector === company.sector)?.level || 0;
  const debtToEbitda = company.ebitda > 0 ? company.debt / company.ebitda : 0;
  const ebitdaMargin = company.revenue > 0 ? (company.ebitda / company.revenue) * 100 : 0;

  const prompt = `You are a senior Private Equity analyst providing due diligence insights.

COMPANY DATA:
- Name: ${company.name}
- Sector: ${company.sector || 'General'}
- Revenue: $${(company.revenue / 1000000).toFixed(1)}M
- Revenue Growth: ${(company.revenueGrowth * 100).toFixed(1)}%
- EBITDA: $${(company.ebitda / 1000000).toFixed(1)}M
- EBITDA Margin: ${ebitdaMargin.toFixed(1)}%
- Debt: $${(company.debt / 1000000).toFixed(1)}M
- Debt/EBITDA: ${debtToEbitda.toFixed(1)}x
- CEO Performance Score: ${company.ceoPerformance || 50}/100
- Employee Count: ${company.employeeCount || 'Unknown'}

PLAYER CONTEXT:
- Expertise in this sector: ${sectorExpertise}/100
- Market conditions: ${marketConditions}

TASK:
Generate exactly 3 due diligence insights in JSON format:
1. One RED_FLAG (hidden risk the deal team should investigate)
2. One OPPORTUNITY (value creation lever not obvious from the numbers)
3. One WILDCARD (could be positive or negative depending on circumstances)

Each insight should be:
- Specific to THIS company's numbers
- Actionable (what should the player investigate/do?)
- Realistic for PE due diligence

${sectorExpertise < 30 ? 'Note: Player is inexperienced in this sector. Include one insight they might miss.' : ''}
${marketConditions === 'CREDIT_CRUNCH' ? 'Note: Credit markets are tight. Emphasize refinancing risks.' : ''}
${debtToEbitda > 4 ? 'Note: High leverage. Include covenant/default risk analysis.' : ''}

OUTPUT FORMAT (JSON array only, no markdown):
[
  {
    "type": "RED_FLAG",
    "title": "Brief title",
    "description": "2-3 sentence explanation with specific numbers",
    "probability": 65,
    "impact": "HIGH"
  },
  ...
]`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const raw = response?.text || '';

    // Try to extract JSON from the response
    let jsonStr = raw;
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    const parsed = JSON.parse(jsonStr);

    if (Array.isArray(parsed) && parsed.length >= 3) {
      return parsed.slice(0, 3).map(insight => ({
        type: insight.type || 'WILDCARD',
        title: String(insight.title || 'Insight'),
        description: String(insight.description || ''),
        probability: Math.min(100, Math.max(0, Number(insight.probability) || 50)),
        impact: ['LOW', 'MEDIUM', 'HIGH'].includes(insight.impact) ? insight.impact : 'MEDIUM',
      })) as DDInsight[];
    }

    throw new Error('Invalid response format');
  } catch (error) {
    console.warn('DD Insight generation failed, using fallback:', error);
    return getOfflineDDInsights(company, marketConditions);
  }
}

/**
 * Offline fallback insights based on company metrics
 */
function getOfflineDDInsights(company: PortfolioCompany, marketConditions: MarketVolatility = 'NORMAL'): DDInsight[] {
  const insights: DDInsight[] = [];
  const debtToEbitda = company.ebitda > 0 ? company.debt / company.ebitda : 0;
  const ebitdaMargin = company.revenue > 0 ? company.ebitda / company.revenue : 0;

  // Red flag based on metrics
  if (debtToEbitda > 4) {
    insights.push({
      type: 'RED_FLAG',
      title: 'High Leverage Risk',
      description: `Debt/EBITDA of ${debtToEbitda.toFixed(1)}x is aggressive. A 10% EBITDA decline could breach covenants. Stress test the debt capacity before proceeding.`,
      probability: 60,
      impact: 'HIGH',
    });
  } else if (company.revenueGrowth < 0) {
    insights.push({
      type: 'RED_FLAG',
      title: 'Declining Revenue',
      description: `Revenue is shrinking at ${(company.revenueGrowth * 100).toFixed(1)}% YoY. Investigate customer churn, competitive dynamics, and pricing power erosion.`,
      probability: 70,
      impact: 'HIGH',
    });
  } else if (marketConditions === 'CREDIT_CRUNCH') {
    insights.push({
      type: 'RED_FLAG',
      title: 'Refinancing Risk',
      description: `Credit markets are tight. Existing debt facilities may be difficult to refinance at maturity. Review debt maturities and covenant headroom.`,
      probability: 65,
      impact: 'HIGH',
    });
  } else {
    insights.push({
      type: 'RED_FLAG',
      title: 'Customer Concentration Risk',
      description: `Review the top 10 customers. If any represent >20% of revenue, that's a negotiation lever and potential risk if they churn.`,
      probability: 45,
      impact: 'MEDIUM',
    });
  }

  // Opportunity based on metrics
  if (ebitdaMargin < 0.15) {
    insights.push({
      type: 'OPPORTUNITY',
      title: 'Margin Expansion Potential',
      description: `Current EBITDA margin of ${(ebitdaMargin * 100).toFixed(1)}% is below sector average. PE operational playbook could add 300-500bps through procurement and SG&A optimization.`,
      probability: 55,
      impact: 'HIGH',
    });
  } else if (company.revenueGrowth > 0.1) {
    insights.push({
      type: 'OPPORTUNITY',
      title: 'Growth Acceleration',
      description: `Strong growth of ${(company.revenueGrowth * 100).toFixed(1)}% suggests market tailwinds. Consider add-on acquisitions to accelerate and capture market share.`,
      probability: 50,
      impact: 'HIGH',
    });
  } else {
    insights.push({
      type: 'OPPORTUNITY',
      title: 'Add-on Acquisition Strategy',
      description: `This could be a platform for roll-up strategy. Identify 3-5 smaller competitors for bolt-on acquisitions to build scale and synergies.`,
      probability: 50,
      impact: 'MEDIUM',
    });
  }

  // Wildcard based on company characteristics
  const ceoPerformance = company.ceoPerformance || 50;
  if (ceoPerformance < 40) {
    insights.push({
      type: 'WILDCARD',
      title: 'Management Upgrade Opportunity',
      description: `CEO performance score is ${ceoPerformance}/100. A new CEO could accelerate value creation by 2-3x, but transition risk is real. Have a bench candidate ready.`,
      probability: 60,
      impact: 'HIGH',
    });
  } else if (ceoPerformance > 70) {
    insights.push({
      type: 'WILDCARD',
      title: 'Key Man Risk',
      description: `CEO performance is strong at ${ceoPerformance}/100, but this creates key man risk. Ensure retention package and succession planning are in place.`,
      probability: 40,
      impact: 'MEDIUM',
    });
  } else {
    insights.push({
      type: 'WILDCARD',
      title: 'Hidden IP Assets',
      description: `Check for unmonetized patents, proprietary technology, or data assets. Often overlooked in operational businesses but can unlock significant value.`,
      probability: 35,
      impact: 'HIGH',
    });
  }

  return insights;
}

/**
 * Check if DD insights are stale and should be refreshed
 */
export function shouldRefreshInsights(company: PortfolioCompany, currentWeek: number): boolean {
  if (!company.ddInsights || company.ddInsights.length === 0) {
    return true;
  }

  // Refresh if DD was completed more than 4 weeks ago
  if (company.ddCompletedWeek && currentWeek - company.ddCompletedWeek > 4) {
    return true;
  }

  return false;
}

export default { generateDDInsights, shouldRefreshInsights };
