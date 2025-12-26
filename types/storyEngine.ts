/**
 * Story Engine Types
 *
 * A clean, narrative-focused game engine for Fund Wars.
 * Prioritizes story and choices over complex simulation mechanics.
 */

// ============================================================================
// CORE NARRATIVE TYPES
// ============================================================================

/**
 * A single scene in the story - the atomic unit of gameplay
 */
export interface Scene {
  id: string;
  /** The chapter this scene belongs to */
  chapterId: string;
  /** Scene title (shown briefly) */
  title: string;
  /** The narrative text - supports markdown for emphasis */
  narrative: string;
  /** Optional character speaking (for dialogue scenes) */
  speaker?: {
    id: string;
    name: string;
    avatar?: string; // FontAwesome icon or image
    mood?: 'neutral' | 'happy' | 'angry' | 'worried' | 'smug' | 'disappointed';
  };
  /** Background mood/atmosphere */
  atmosphere?: 'office' | 'meeting' | 'party' | 'crisis' | 'celebration' | 'quiet';
  /** Available choices for the player */
  choices: Choice[];
  /** If no choices, this is the next scene (auto-advance) */
  nextSceneId?: string;
  /** Scene type for rendering variations */
  type: 'narrative' | 'dialogue' | 'decision' | 'outcome' | 'chapter_end';
  /** Requirements to see this scene (for branching) */
  requirements?: SceneRequirements;
  /** Tags for filtering/searching */
  tags?: string[];
  /** If true, scene requires user to click Continue (no auto-advance) */
  requiresAcknowledgment?: boolean;
}

/**
 * A choice the player can make
 */
export interface Choice {
  id: string;
  /** What the player says/does */
  text: string;
  /** Optional subtext explaining the choice */
  subtext?: string;
  /** Sarcastic commentary from the narrator */
  narratorComment?: string;
  /** Where this choice leads */
  nextSceneId: string;
  /** Stat changes from this choice */
  effects?: ChoiceEffects;
  /** Requirements to see/select this choice */
  requirements?: ChoiceRequirements;
  /** If locked, why? */
  lockedReason?: string;
  /** Visual style hint */
  style?: 'normal' | 'risky' | 'safe' | 'ethical' | 'unethical' | 'hidden';
}

/**
 * Effects of making a choice
 */
export interface ChoiceEffects {
  /** Stat changes */
  stats?: Partial<PlayerStats>;
  /** Flags to set (for branching) */
  setFlags?: string[];
  /** Flags to clear */
  clearFlags?: string[];
  /** Relationship changes with NPCs */
  relationships?: Array<{
    npcId: string;
    change: number;
    memory?: string;
  }>;
  /** One-time toast/notification */
  notification?: {
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
  };
  /** Unlock an achievement */
  achievement?: string;
  /** Add money (can be negative) */
  money?: number;
}

/**
 * Requirements to access a scene
 */
export interface SceneRequirements {
  /** Required flags to be set */
  requiredFlags?: string[];
  /** Flags that block this scene */
  blockedByFlags?: string[];
  /** Minimum stats required */
  minStats?: Partial<PlayerStats>;
  /** Maximum stats allowed */
  maxStats?: Partial<PlayerStats>;
  /** Required NPC relationships */
  relationships?: Array<{
    npcId: string;
    minValue?: number;
    maxValue?: number;
  }>;
}

/**
 * Requirements to select a choice
 */
export interface ChoiceRequirements {
  /** Required flags */
  requiredFlags?: string[];
  /** Blocking flags */
  blockedByFlags?: string[];
  /** Minimum stats */
  minStats?: Partial<PlayerStats>;
  /** Required NPC relationships */
  relationships?: Array<{
    npcId: string;
    minValue?: number;
  }>;
  /** Cost in money (choice is hidden if can't afford) */
  moneyCost?: number;
}

// ============================================================================
// CHAPTER & ARC TYPES
// ============================================================================

/**
 * A chapter - a collection of related scenes
 */
export interface Chapter {
  id: string;
  /** Chapter number for display */
  number: number;
  /** Chapter title */
  title: string;
  /** Brief teaser shown before starting */
  teaser: string;
  /** The opening scene of this chapter */
  openingSceneId: string;
  /** Possible ending scenes for this chapter */
  endingSceneIds: string[];
  /** Requirements to unlock this chapter */
  requirements?: ChapterRequirements;
  /** Estimated play time */
  estimatedMinutes?: number;
  /** Theme/mood of the chapter */
  theme?: 'introduction' | 'rising_action' | 'crisis' | 'resolution' | 'epilogue';
}

/**
 * Requirements to unlock a chapter
 */
export interface ChapterRequirements {
  /** Previous chapters that must be completed */
  completedChapters?: string[];
  /** Required flags from previous choices */
  requiredFlags?: string[];
  /** Minimum stats */
  minStats?: Partial<PlayerStats>;
}

/**
 * A story arc - a major storyline spanning multiple chapters
 */
export interface StoryArc {
  id: string;
  title: string;
  description: string;
  /** Chapters in this arc (in order) */
  chapterIds: string[];
  /** Current completion state */
  state: 'locked' | 'available' | 'in_progress' | 'completed';
  /** Requirements to start this arc */
  requirements?: ChapterRequirements;
}

// ============================================================================
// PLAYER STATE
// ============================================================================

/**
 * Simplified player stats focused on narrative impact
 */
export interface PlayerStats {
  /** Career reputation (0-100) */
  reputation: number;
  /** Stress level (0-100) - high stress = bad endings */
  stress: number;
  /** Ethics score (0-100) - affects available choices */
  ethics: number;
  /** Personal wealth */
  money: number;
  /** Deal-making skill */
  dealcraft: number;
  /** Political savvy */
  politics: number;
}

/**
 * NPC relationship state
 */
export interface NPCRelationship {
  npcId: string;
  name: string;
  /** -100 (enemy) to 100 (ally) */
  relationship: number;
  /** Key memories/events with this NPC */
  memories: string[];
  /** Current state */
  state: 'stranger' | 'acquaintance' | 'ally' | 'rival' | 'enemy' | 'mentor' | 'protege';
}

/**
 * Complete player game state
 */
export interface GameState {
  /** Player's name */
  playerName: string;
  /** Current stats */
  stats: PlayerStats;
  /** NPC relationships */
  relationships: NPCRelationship[];
  /** Flags set by choices (for branching) */
  flags: Set<string>;
  /** Current chapter ID */
  currentChapterId: string | null;
  /** Current scene ID */
  currentSceneId: string | null;
  /** Completed chapter IDs */
  completedChapters: string[];
  /** History of scene visits (for skip/review) */
  sceneHistory: string[];
  /** Achievements unlocked */
  achievements: string[];
  /** Total play time in minutes */
  playTimeMinutes: number;
  /** When the game started */
  startedAt: Date;
}

// ============================================================================
// ENGINE STATE
// ============================================================================

/**
 * The overall engine state
 */
export interface StoryEngineState {
  /** Current game state */
  game: GameState | null;
  /** Current scene being displayed */
  currentScene: Scene | null;
  /** Is the engine ready? */
  isInitialized: boolean;
  /** Is transitioning between scenes? */
  isTransitioning: boolean;
  /** Current game phase */
  phase: GamePhase;
  /** Error state */
  error: string | null;
}

/**
 * Game phases
 */
export type GamePhase =
  | 'TITLE_SCREEN'
  | 'CHARACTER_CREATE'
  | 'PLAYING'
  | 'PAUSED'
  | 'CHAPTER_COMPLETE'
  | 'GAME_OVER'
  | 'VICTORY';

// ============================================================================
// ACTIONS
// ============================================================================

/**
 * Actions that can be dispatched to the engine
 */
export type StoryEngineAction =
  | { type: 'INITIALIZE_GAME'; payload: { playerName: string } }
  | { type: 'LOAD_GAME'; payload: GameState }
  | { type: 'START_CHAPTER'; payload: { chapterId: string } }
  | { type: 'NAVIGATE_TO_SCENE'; payload: { sceneId: string } }
  | { type: 'MAKE_CHOICE'; payload: { choice: Choice } }
  | { type: 'APPLY_EFFECTS'; payload: ChoiceEffects }
  | { type: 'SET_FLAG'; payload: string }
  | { type: 'CLEAR_FLAG'; payload: string }
  | { type: 'UPDATE_RELATIONSHIP'; payload: { npcId: string; change: number; memory?: string } }
  | { type: 'COMPLETE_CHAPTER'; payload: { chapterId: string } }
  | { type: 'SET_PHASE'; payload: GamePhase }
  | { type: 'SET_TRANSITIONING'; payload: boolean }
  | { type: 'RESET_GAME' }
  | { type: 'SET_ERROR'; payload: string | null };

// ============================================================================
// CONTENT REGISTRY
// ============================================================================

/**
 * Registry holding all game content
 */
export interface ContentRegistry {
  scenes: Map<string, Scene>;
  chapters: Map<string, Chapter>;
  arcs: Map<string, StoryArc>;
  /** Quick lookup of scene by chapter */
  scenesByChapter: Map<string, Scene[]>;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Default starting stats
 */
export const DEFAULT_STATS: PlayerStats = {
  reputation: 10,
  stress: 20,
  ethics: 50,
  money: 1500,
  dealcraft: 10,
  politics: 10,
};

/**
 * Create initial game state
 */
export function createInitialGameState(playerName: string): GameState {
  return {
    playerName,
    stats: { ...DEFAULT_STATS },
    relationships: [],
    flags: new Set<string>(),
    currentChapterId: null,
    currentSceneId: null,
    completedChapters: [],
    sceneHistory: [],
    achievements: [],
    playTimeMinutes: 0,
    startedAt: new Date(),
  };
}

/**
 * Check if a choice is available based on requirements
 */
export function isChoiceAvailable(
  choice: Choice,
  state: GameState
): { available: boolean; reason?: string } {
  if (!choice.requirements) {
    return { available: true };
  }

  const { requirements } = choice;

  // Check flags
  if (requirements.requiredFlags) {
    for (const flag of requirements.requiredFlags) {
      if (!state.flags.has(flag)) {
        return { available: false, reason: 'Missing required experience' };
      }
    }
  }

  if (requirements.blockedByFlags) {
    for (const flag of requirements.blockedByFlags) {
      if (state.flags.has(flag)) {
        return { available: false, reason: 'No longer available' };
      }
    }
  }

  // Check stats
  if (requirements.minStats) {
    for (const [stat, value] of Object.entries(requirements.minStats)) {
      if (state.stats[stat as keyof PlayerStats] < value) {
        return { available: false, reason: `Requires higher ${stat}` };
      }
    }
  }

  // Check money
  if (requirements.moneyCost && state.stats.money < requirements.moneyCost) {
    return { available: false, reason: `Costs $${requirements.moneyCost.toLocaleString()}` };
  }

  // Check relationships
  if (requirements.relationships) {
    for (const req of requirements.relationships) {
      const rel = state.relationships.find(r => r.npcId === req.npcId);
      if (!rel || (req.minValue && rel.relationship < req.minValue)) {
        return { available: false, reason: 'Relationship not strong enough' };
      }
    }
  }

  return { available: true };
}

/**
 * Check if a scene is accessible
 */
export function isSceneAccessible(
  scene: Scene,
  state: GameState
): boolean {
  if (!scene.requirements) return true;

  const { requirements } = scene;

  if (requirements.requiredFlags) {
    for (const flag of requirements.requiredFlags) {
      if (!state.flags.has(flag)) return false;
    }
  }

  if (requirements.blockedByFlags) {
    for (const flag of requirements.blockedByFlags) {
      if (state.flags.has(flag)) return false;
    }
  }

  return true;
}
