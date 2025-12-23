import { useState, useCallback } from 'react';
import type { ChatMessage, PlayerStats, Scenario, NPC, StatChanges } from '../types';
import { getAdvisorResponse, getNPCResponse } from '../services/geminiService';

const DEFAULT_CHAT: ChatMessage[] = [
  { sender: 'advisor', text: 'SYSTEM READY. Awaiting inputs.' },
];

interface ChatHandlersDependencies {
  playerStats: PlayerStats | null;
  activeScenario: Scenario | null;
  npcs: NPC[];
  tutorialStep: number;
  playSfx: (sfx: string) => void;
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
  sendNpcMessage: (npcId: string, message: string, sender?: 'player' | 'npc', senderName?: string) => void;
  setTutorialStep: (step: number) => void;
  updatePlayerStats: (changes: StatChanges) => void;
}

interface UseChatHandlersReturn {
  selectedNpcId: string;
  chatHistory: ChatMessage[];
  isAdvisorLoading: boolean;
  setSelectedNpcId: (id: string) => void;
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  handleSendMessageToAdvisor: (msg: string) => Promise<void>;
  handleSendMessageToNPC: (npcId: string, msg: string) => Promise<void>;
  handleNpcSelect: (npcId: string) => void;
  appendChatMessage: (message: ChatMessage) => void;
  resetChatHistory: () => void;
}

export const useChatHandlers = (deps: ChatHandlersDependencies): UseChatHandlersReturn => {
  const {
    playerStats,
    activeScenario,
    npcs,
    tutorialStep,
    playSfx,
    addToast,
    sendNpcMessage,
    setTutorialStep,
    updatePlayerStats,
  } = deps;

  const [selectedNpcId, setSelectedNpcId] = useState<string>('advisor');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(DEFAULT_CHAT);
  const [isAdvisorLoading, setIsAdvisorLoading] = useState(false);

  const appendChatMessage = useCallback((message: ChatMessage) => {
    setChatHistory(prev => [...prev, message]);
  }, []);

  const resetChatHistory = useCallback(() => {
    setChatHistory(DEFAULT_CHAT);
    setSelectedNpcId('advisor');
  }, []);

  const handleSendMessageToAdvisor = useCallback(async (msg: string) => {
    const newMsg: ChatMessage = { sender: 'player', text: msg };
    setChatHistory(prev => [...prev, newMsg]);
    playSfx('KEYPRESS');
    setIsAdvisorLoading(true);

    try {
      const response = await getAdvisorResponse(msg, chatHistory, playerStats, activeScenario);
      setChatHistory(prev => [...prev, { sender: 'advisor', text: response }]);
      playSfx('NOTIFICATION');
    } catch (error) {
      console.error('Advisor response error:', error);
      setChatHistory(prev => [
        ...prev,
        { sender: 'advisor', text: 'Connection error. The advisor is temporarily unavailable.' },
      ]);
      addToast('Advisor connection failed', 'error');
    } finally {
      setIsAdvisorLoading(false);
    }
  }, [chatHistory, playerStats, activeScenario, playSfx, addToast]);

  const handleSendMessageToNPC = useCallback(async (npcId: string, msg: string) => {
    // 1. Add Player Message to UI Immediately
    sendNpcMessage(npcId, msg);
    playSfx('KEYPRESS');

    const targetNPC = npcs.find(n => n.id === npcId);
    if (targetNPC && targetNPC.dialogueHistory && playerStats) {
      const updatedHistory: ChatMessage[] = [
        ...targetNPC.dialogueHistory,
        { sender: 'player' as const, text: msg },
      ];

      // 2. Fetch AI Response
      try {
        const response = await getNPCResponse(msg, targetNPC, updatedHistory, playerStats, activeScenario);

        // Tutorial step progression
        if (tutorialStep === 5 && /patent/i.test(msg)) {
          setTutorialStep(6);
        }

        // Handle game state updates from AI tools
        if (response.functionCalls) {
          response.functionCalls.forEach(call => {
            if (call.name === 'updateGameState' && call.args) {
              const args = call.args;
              const changes: StatChanges = {};

              if (args.reputationChange) changes.reputation = args.reputationChange;
              if (args.stressChange) changes.stress = args.stressChange;
              if (args.aumChange) changes.aum = args.aumChange; // Founder Mode

              // If relationship changed
              if (args.relationshipChange) {
                changes.npcRelationshipUpdate = {
                  npcId: npcId,
                  change: args.relationshipChange,
                  memory: args.logMessage || 'Interaction outcome',
                };
              }

              updatePlayerStats(changes);
              if (args.logMessage) {
                addToast(args.logMessage, args.relationshipChange < 0 ? 'error' : 'success');
              }
            }
          });
        }

        const npcReply = response.text || `${targetNPC?.name || 'NPC'} stares and slowly nods.`;
        sendNpcMessage(npcId, npcReply, 'npc', targetNPC?.name || 'NPC');
        addToast(`${targetNPC.name} responded`, 'info');
      } catch (e) {
        console.error('NPC Chat Error', e);
        addToast('COMMS_ERROR: Signal Lost', 'error');
      }
    }
  }, [
    npcs,
    playerStats,
    activeScenario,
    tutorialStep,
    playSfx,
    addToast,
    sendNpcMessage,
    setTutorialStep,
    updatePlayerStats,
  ]);

  const handleNpcSelect = useCallback((npcId: string) => {
    setSelectedNpcId(npcId);
    playSfx('KEYPRESS');
  }, [playSfx]);

  return {
    selectedNpcId,
    chatHistory,
    isAdvisorLoading,
    setSelectedNpcId,
    setChatHistory,
    handleSendMessageToAdvisor,
    handleSendMessageToNPC,
    handleNpcSelect,
    appendChatMessage,
    resetChatHistory,
  };
};

export default useChatHandlers;
