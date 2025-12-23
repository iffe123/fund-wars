import { useState, useEffect, useCallback } from 'react';
import type { NPC } from '../types';
import type { ActiveTab, MobileTab } from './useAppUIState';

interface TutorialEffectsDependencies {
  tutorialStep: number;
  activeTab: ActiveTab;
  activeMobileTab: MobileTab;
  npcs: NPC[];
  setActiveTab: (tab: ActiveTab) => void;
  setActiveMobileTab: (tab: MobileTab) => void;
  sendNpcMessage: (npcId: string, message: string, sender?: 'player' | 'npc', senderName?: string) => void;
  setTutorialStep: (step: number) => void;
}

interface UseTutorialEffectsReturn {
  sarahProactiveMessageSent: boolean;
  handleTutorialStep5: () => void;
}

export const useTutorialEffects = (deps: TutorialEffectsDependencies): UseTutorialEffectsReturn => {
  const {
    tutorialStep,
    activeTab,
    activeMobileTab,
    npcs,
    setActiveTab,
    setActiveMobileTab,
    sendNpcMessage,
    setTutorialStep,
  } = deps;

  const [sarahProactiveMessageSent, setSarahProactiveMessageSent] = useState(false);

  // Auto-switch to ASSETS view on Step 6
  useEffect(() => {
    if (tutorialStep === 6 && activeTab !== 'ASSETS') {
      setActiveTab('ASSETS');
      if (window.innerWidth < 768) {
        setActiveMobileTab('DESK');
      }
    }
  }, [tutorialStep, activeTab, setActiveTab, setActiveMobileTab]);

  // Auto-switch to COMMS on tutorial step 4 for mobile users to avoid confusion
  useEffect(() => {
    if (tutorialStep === 4 && window.innerWidth < 768 && activeMobileTab !== 'COMMS') {
      setActiveMobileTab('COMMS');
    }
  }, [tutorialStep, activeMobileTab, setActiveMobileTab]);

  // Send Sarah's proactive first message during tutorial step 5
  useEffect(() => {
    if (tutorialStep === 5 && !sarahProactiveMessageSent) {
      // Check if Sarah's chat doesn't already have many messages
      const sarah = npcs.find(n => n.id === 'sarah');
      if (sarah && sarah.dialogueHistory && sarah.dialogueHistory.length <= 2) {
        // Send Sarah's proactive message
        sendNpcMessage(
          'sarah',
          "Hey! Perfect timing. I've been in the data room all night. Found something weird on page 40 of the CIM - there's a patent reference they buried in the footnotes. PATENT #8829. Hydrophobic coating tech. If this is real, it could be a game-changer. Want me to dig deeper?",
          'npc',
          'Sarah'
        );
        setSarahProactiveMessageSent(true);
      }
    }
  }, [tutorialStep, sarahProactiveMessageSent, npcs, sendNpcMessage]);

  // Reset Sarah's message state when tutorial restarts
  useEffect(() => {
    if (tutorialStep === 0) {
      setSarahProactiveMessageSent(false);
    }
  }, [tutorialStep]);

  const handleTutorialStep5 = useCallback(() => {
    setTutorialStep(5);
  }, [setTutorialStep]);

  return {
    sarahProactiveMessageSent,
    handleTutorialStep5,
  };
};

export default useTutorialEffects;
