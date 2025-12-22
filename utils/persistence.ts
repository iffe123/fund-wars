import { GameState } from '../reducers/types';
import { 
    sanitizeKnowledgeLog, sanitizeKnowledgeFlags, hydrateNpc, 
    hydrateRivalFund, hydrateCompetitiveDeal, hydrateFactionReputation, 
    MAX_PORTFOLIO_SIZE 
} from './gameUtils';
import { 
    INITIAL_NPCS, RIVAL_FUND_NPCS, FAMILY_NPCS, RIVAL_FUNDS, SCENARIOS, 
    DEFAULT_PERSONAL_FINANCES, LIFESTYLE_TIERS 
} from '../constants';
import { PlayerStats, PersonalFinances, PortfolioCompany } from '../types';

export const hydrateGameState = (data: any, defaultState: GameState): GameState => {
    try {
        const safeKnowledgeLog = sanitizeKnowledgeLog(data.playerStats?.knowledgeLog);
        const safeKnowledgeFlags = sanitizeKnowledgeFlags(data.playerStats?.knowledgeFlags);
        const safeNpcs = Array.isArray(data.npcs) ? data.npcs.map(hydrateNpc) : [...INITIAL_NPCS, ...RIVAL_FUND_NPCS, ...FAMILY_NPCS].map(hydrateNpc);
        const safeRivalFunds = Array.isArray(data.rivalFunds) ? data.rivalFunds.map(hydrateRivalFund) : RIVAL_FUNDS.map(hydrateRivalFund);
        const safeActiveDeals = Array.isArray(data.activeDeals)
            ? data.activeDeals
                .map(hydrateCompetitiveDeal)
                .filter((deal: any) => Boolean(deal))
            : [];

        let hydratedPlayerStats: PlayerStats | null = null;

        if (data.playerStats) {
            const savedPersonalFinances = data.playerStats.personalFinances;
            const hydratedPersonalFinances: PersonalFinances = savedPersonalFinances ? {
                bankBalance: savedPersonalFinances.bankBalance ?? data.playerStats.cash ?? 1500,
                totalEarnings: savedPersonalFinances.totalEarnings ?? 0,
                salaryYTD: savedPersonalFinances.salaryYTD ?? 0,
                bonusYTD: savedPersonalFinances.bonusYTD ?? 0,
                carryReceived: savedPersonalFinances.carryReceived ?? 0,
                outstandingLoans: savedPersonalFinances.outstandingLoans ?? data.playerStats.loanBalance ?? 0,
                loanInterestRate: savedPersonalFinances.loanInterestRate ?? data.playerStats.loanRate ?? 0,
                monthlyBurn: savedPersonalFinances.monthlyBurn ?? 2000,
                lifestyleLevel: savedPersonalFinances.lifestyleLevel ?? 'BROKE_ASSOCIATE',
            } : {
                bankBalance: data.playerStats.cash ?? 1500,
                totalEarnings: 0,
                salaryYTD: 0,
                bonusYTD: 0,
                carryReceived: 0,
                outstandingLoans: data.playerStats.loanBalance ?? 0,
                loanInterestRate: data.playerStats.loanRate ?? 0,
                monthlyBurn: 2000,
                lifestyleLevel: 'BROKE_ASSOCIATE',
            };

            hydratedPlayerStats = {
                ...data.playerStats,
                loanBalance: data.playerStats.loanBalance ?? 0,
                loanRate: data.playerStats.loanRate ?? 0,
                factionReputation: hydrateFactionReputation(data.playerStats.factionReputation),
                currentDayType: data.playerStats.currentDayType || 'WEEKDAY',
                currentTimeSlot: data.playerStats.currentTimeSlot || 'MORNING',
                timeCursor: typeof data.playerStats.timeCursor === 'number' ? data.playerStats.timeCursor : 0,
                knowledgeLog: safeKnowledgeLog,
                knowledgeFlags: safeKnowledgeFlags,
                unlockedAchievements: data.playerStats.unlockedAchievements || [],
                sectorExpertise: data.playerStats.sectorExpertise || [],
                completedExits: data.playerStats.completedExits || [],
                totalRealizedGains: data.playerStats.totalRealizedGains ?? 0,
                portfolio: Array.isArray(data.playerStats.portfolio) ? data.playerStats.portfolio : [],
                playedScenarioIds: Array.isArray(data.playerStats.playedScenarioIds) ? data.playerStats.playedScenarioIds : [],
                playerFlags: data.playerStats.playerFlags || {},
                employees: data.playerStats.employees || [],
                personalFinances: hydratedPersonalFinances,
                fundFinances: data.playerStats.fundFinances ?? null,
                dealAllocations: data.playerStats.dealAllocations || [],
                carryEligibleDeals: data.playerStats.carryEligibleDeals || [],
                activeSkillInvestments: data.playerStats.activeSkillInvestments || [],
                gameTime: data.playerStats.gameTime || {
                    week: 1,
                    year: 1,
                    quarter: 1,
                    actionsRemaining: 2,
                    maxActions: 2,
                    isNightGrinder: false,
                    actionsUsedThisWeek: [],
                    actionsPerformedThisWeek: [],
                },
            };
        }

        const activeScenario = data.activeScenarioId 
            ? SCENARIOS.find(s => s.id === data.activeScenarioId) ?? null 
            : null;

        return {
            ...defaultState,
            playerStats: hydratedPlayerStats,
            gamePhase: data.gamePhase || 'INTRO',
            activeScenario,
            marketVolatility: data.marketVolatility || 'NORMAL',
            npcs: safeNpcs,
            tutorialStep: data.tutorialStep || 0,
            actionLog: data.actionLog || [],
            rivalFunds: safeRivalFunds,
            activeDeals: safeActiveDeals,
        };
    } catch (error) {
        console.error("Error hydrating game state:", error);
        return defaultState;
    }
};
