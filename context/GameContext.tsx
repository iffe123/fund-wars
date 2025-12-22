// Compatibility layer for the new Context structure
import { useGame, GameProvider } from '../contexts/GameContext';

// Re-export utilities for backward compatibility
export { 
    sanitizeKnowledgeLog, 
    sanitizeKnowledgeFlags, 
    hydrateNpc, 
    hydrateRivalFund, 
    hydrateFund, 
    hydrateCompetitiveDeal, 
    MAX_PORTFOLIO_SIZE 
} from '../utils/gameUtils';

export { useGame, GameProvider };
