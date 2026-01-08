/**
 * NPC Dialogue System Types
 *
 * Defines the structure for interactive NPC conversations where
 * players can chat with characters and make dialogue choices.
 */

export interface DialogueNode {
  id: string;
  speaker: string;
  text: string;
  emotion?: 'neutral' | 'happy' | 'angry' | 'sad' | 'suspicious' | 'impressed' | 'dismissive';
  responses?: DialogueResponse[];
  autoAdvance?: boolean; // Auto-advance after delay
  effects?: DialogueEffects;
  nextNodeId?: string; // For auto-advance or single path
}

export interface DialogueResponse {
  id: string;
  text: string;
  tone?: 'professional' | 'aggressive' | 'friendly' | 'sarcastic' | 'humble';
  nextNodeId: string;
  requirements?: {
    minReputation?: number;
    minFinancialEngineering?: number;
    requiredFlags?: string[];
  };
  effects?: DialogueEffects;
  hidden?: boolean; // Only show if requirements met
}

export interface DialogueEffects {
  reputation?: number;
  stress?: number;
  relationship?: number; // With current NPC
  setFlags?: string[];
  clearFlags?: string[];
  unlockInfo?: string; // Information revealed
  money?: number;
}

export interface NPCDialogue {
  id: string;
  npcId: string;
  npcName: string;
  npcRole: string;
  triggerCondition: {
    eventId?: string;
    weekRange?: [number, number];
    requiredFlags?: string[];
    chance?: number; // 0-100
  };
  startNodeId: string;
  nodes: Record<string, DialogueNode>;
  outcomes: {
    success?: DialogueEffects;
    failure?: DialogueEffects;
    neutral?: DialogueEffects;
  };
}

export interface DialogueState {
  isActive: boolean;
  currentDialogue: NPCDialogue | null;
  currentNodeId: string | null;
  history: string[]; // Node IDs visited
  relationshipDelta: number;
}

export interface DialogueResult {
  dialogueId: string;
  npcId: string;
  outcome: 'success' | 'failure' | 'neutral';
  effects: DialogueEffects;
  infoGained?: string[];
}
