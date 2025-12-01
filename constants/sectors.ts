import type { IndustrySector, SectorExpertise } from '../types';

export interface SectorDefinition {
  id: IndustrySector;
  name: string;
  description: string;
  icon: string;
  color: string;
  dealCharacteristics: {
    typicalMultiple: [number, number]; // Range of EV/EBITDA
    typicalGrowth: [number, number]; // Range of revenue growth
    typicalMargin: [number, number]; // Range of EBITDA margin
    leverageCapacity: 'LOW' | 'MEDIUM' | 'HIGH';
  };
  dueDiligenceFocus: string[];
  riskFactors: string[];
  valueCreationLevers: string[];
}

export const SECTOR_DEFINITIONS: Record<IndustrySector, SectorDefinition> = {
  TECH: {
    id: 'TECH',
    name: 'Technology',
    description: 'Software, SaaS, hardware, and digital services companies.',
    icon: 'fa-microchip',
    color: 'blue',
    dealCharacteristics: {
      typicalMultiple: [8, 20],
      typicalGrowth: [0.15, 0.50],
      typicalMargin: [0.15, 0.40],
      leverageCapacity: 'LOW',
    },
    dueDiligenceFocus: [
      'Customer retention and churn metrics',
      'Technology stack and technical debt',
      'Recurring revenue quality',
      'Sales efficiency and CAC payback',
      'Product roadmap and R&D pipeline',
    ],
    riskFactors: [
      'Rapid technological obsolescence',
      'High customer concentration',
      'Key person dependency on engineers',
      'Cybersecurity vulnerabilities',
      'Regulatory changes (data privacy)',
    ],
    valueCreationLevers: [
      'Pricing optimization',
      'Cross-sell and upsell',
      'International expansion',
      'Product-led growth',
      'Strategic M&A for capabilities',
    ],
  },
  HEALTHCARE: {
    id: 'HEALTHCARE',
    name: 'Healthcare',
    description: 'Healthcare services, pharma services, medical devices, and life sciences.',
    icon: 'fa-heart-pulse',
    color: 'red',
    dealCharacteristics: {
      typicalMultiple: [10, 16],
      typicalGrowth: [0.05, 0.20],
      typicalMargin: [0.12, 0.30],
      leverageCapacity: 'MEDIUM',
    },
    dueDiligenceFocus: [
      'Regulatory compliance history',
      'Reimbursement risk analysis',
      'Physician/referral relationships',
      'Quality metrics and outcomes',
      'Payor mix and concentration',
    ],
    riskFactors: [
      'Reimbursement rate cuts',
      'Regulatory investigations',
      'Malpractice liability',
      'Staff shortages',
      'Policy changes (Medicare/Medicaid)',
    ],
    valueCreationLevers: [
      'De novo expansion',
      'Revenue cycle optimization',
      'Ancillary service additions',
      'Managed care contracting',
      'Platform acquisitions',
    ],
  },
  INDUSTRIALS: {
    id: 'INDUSTRIALS',
    name: 'Industrials',
    description: 'Manufacturing, aerospace, building products, and industrial services.',
    icon: 'fa-industry',
    color: 'gray',
    dealCharacteristics: {
      typicalMultiple: [6, 10],
      typicalGrowth: [0.02, 0.10],
      typicalMargin: [0.08, 0.18],
      leverageCapacity: 'HIGH',
    },
    dueDiligenceFocus: [
      'Capacity utilization and CapEx needs',
      'Supply chain resilience',
      'Customer contract terms',
      'Environmental liabilities',
      'Labor relations and union status',
    ],
    riskFactors: [
      'Commodity price volatility',
      'Economic cyclicality',
      'Environmental regulations',
      'Supply chain disruptions',
      'Automation displacement',
    ],
    valueCreationLevers: [
      'Operational excellence / lean',
      'Procurement optimization',
      'Footprint rationalization',
      'Aftermarket services',
      'Bolt-on acquisitions',
    ],
  },
  CONSUMER: {
    id: 'CONSUMER',
    name: 'Consumer',
    description: 'Retail, restaurants, consumer products, and e-commerce.',
    icon: 'fa-shopping-cart',
    color: 'orange',
    dealCharacteristics: {
      typicalMultiple: [7, 12],
      typicalGrowth: [0.03, 0.15],
      typicalMargin: [0.10, 0.25],
      leverageCapacity: 'MEDIUM',
    },
    dueDiligenceFocus: [
      'Brand strength and awareness',
      'Channel mix and dependency',
      'Same-store sales trends',
      'Customer acquisition costs',
      'Private label/competition risk',
    ],
    riskFactors: [
      'Consumer preference shifts',
      'Amazon/e-commerce disruption',
      'Commodity input costs',
      'Franchise relationship issues',
      'Social media reputation risk',
    ],
    valueCreationLevers: [
      'E-commerce acceleration',
      'Store optimization',
      'Supply chain efficiency',
      'Brand extensions',
      'International licensing',
    ],
  },
  ENERGY: {
    id: 'ENERGY',
    name: 'Energy',
    description: 'Oil & gas, renewable energy, utilities, and energy services.',
    icon: 'fa-bolt',
    color: 'yellow',
    dealCharacteristics: {
      typicalMultiple: [5, 9],
      typicalGrowth: [-0.05, 0.15],
      typicalMargin: [0.15, 0.40],
      leverageCapacity: 'MEDIUM',
    },
    dueDiligenceFocus: [
      'Reserve analysis and production curves',
      'Hedging position and strategy',
      'Regulatory and permitting status',
      'ESG compliance and transition risk',
      'Contract tenor and pricing',
    ],
    riskFactors: [
      'Commodity price volatility',
      'Energy transition / stranded assets',
      'Environmental liabilities',
      'Political and regulatory risk',
      'Capital intensity',
    ],
    valueCreationLevers: [
      'Operational efficiency',
      'Hedging optimization',
      'Asset portfolio rationalization',
      'Renewable integration',
      'Cost structure improvement',
    ],
  },
  FINANCIAL_SERVICES: {
    id: 'FINANCIAL_SERVICES',
    name: 'Financial Services',
    description: 'Asset management, insurance, fintech, and specialty finance.',
    icon: 'fa-building-columns',
    color: 'green',
    dealCharacteristics: {
      typicalMultiple: [8, 14],
      typicalGrowth: [0.05, 0.25],
      typicalMargin: [0.20, 0.50],
      leverageCapacity: 'LOW',
    },
    dueDiligenceFocus: [
      'AUM/AUA trends and flows',
      'Regulatory capital requirements',
      'Credit quality and reserves',
      'Fee structure sustainability',
      'Technology and operations',
    ],
    riskFactors: [
      'Interest rate sensitivity',
      'Regulatory changes',
      'Credit cycle exposure',
      'Key person / team departure',
      'Fintech disruption',
    ],
    valueCreationLevers: [
      'Distribution expansion',
      'Product innovation',
      'Operational efficiency',
      'M&A consolidation',
      'Technology modernization',
    ],
  },
};

export const SECTOR_LIST: IndustrySector[] = [
  'TECH',
  'HEALTHCARE',
  'INDUSTRIALS',
  'CONSUMER',
  'ENERGY',
  'FINANCIAL_SERVICES',
];

export const getDefaultSectorExpertise = (): SectorExpertise[] => {
  return SECTOR_LIST.map(sector => ({
    sector,
    level: 0,
    dealsCompleted: 0,
  }));
};

export const getSectorDefinition = (sector: IndustrySector): SectorDefinition => {
  return SECTOR_DEFINITIONS[sector];
};

export const getSectorBonus = (expertise: SectorExpertise): {
  dueDiligenceBonus: number;
  valuationAccuracy: number;
  dealSourceBonus: number;
} => {
  const level = expertise.level;

  return {
    dueDiligenceBonus: Math.floor(level / 10) * 5, // +5% per 10 levels
    valuationAccuracy: Math.floor(level / 20) * 10, // +10% per 20 levels
    dealSourceBonus: Math.floor(level / 25) * 1, // +1 deal per 25 levels
  };
};

export const calculateExperienceGain = (
  dealValue: number,
  dealSuccess: boolean,
  isSpecialist: boolean
): number => {
  let baseXP = Math.floor(dealValue / 10000000); // 1 XP per $10M
  baseXP = Math.max(1, Math.min(baseXP, 15)); // Clamp between 1-15

  if (dealSuccess) {
    baseXP *= 1.5;
  } else {
    baseXP *= 0.5;
  }

  if (isSpecialist) {
    baseXP *= 1.25; // 25% bonus for specialists
  }

  return Math.round(baseXP);
};

export const SECTOR_FLAVOR_TEXT: Record<IndustrySector, string[]> = {
  TECH: [
    'ARR, MRR, NRR... the only letters that matter.',
    'If the Rule of 40 doesn\'t add up, neither does your career.',
    'Every company is a tech company now. Except this one.',
    'The founders want to change the world. You want to change the multiple.',
  ],
  HEALTHCARE: [
    'Healthcare: Where regulations have regulations.',
    'The only thing growing faster than healthcare costs is our fees.',
    'Remember: patients are "covered lives" in the model.',
    'Reimbursement risk is just another way of saying "surprise haircut."',
  ],
  INDUSTRIALS: [
    'Old economy? More like old reliable.',
    'Lean manufacturing, fat returns.',
    'When everyone\'s chasing tech, the factories are on sale.',
    'EBITDA margins don\'t care about your feelings.',
  ],
  CONSUMER: [
    'Brand equity is real until it isn\'t.',
    'The consumer is fickle. Your model should not be.',
    'Same-store sales: the number that keeps CEOs awake at night.',
    'E-commerce is eating everything. Including your margins.',
  ],
  ENERGY: [
    'Commodity prices: because you needed more variables.',
    'The only thing more volatile than oil is an MD\'s mood.',
    'ESG is not optional anymore. Neither is profit.',
    'Depletion curves don\'t negotiate.',
  ],
  FINANCIAL_SERVICES: [
    'We\'re buying a company that does what we do.',
    'AUM: where bigger is always better.',
    'Regulatory capital: the gift that keeps on taking.',
    'In fintech, if you\'re not growing 50%, you\'re dying.',
  ],
};
