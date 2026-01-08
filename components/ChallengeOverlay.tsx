/**
 * Challenge Overlay Component
 *
 * Renders puzzle and dialogue modals on top of the game when active.
 * Integrates with the main game state to apply results.
 */

import React, { useEffect, useCallback } from 'react';
import { useActiveChallenge, usePendingChallengeResults, useChallenges } from '../contexts/ChallengeContext';
import PuzzleModal from './PuzzleModal';
import NPCDialogueModal from './NPCDialogueModal';
import type { PuzzleResult } from '../types/puzzles';
import type { DialogueResult } from '../types/npcDialogue';

interface ChallengeOverlayProps {
  playerStats: {
    reputation: number;
    financialEngineering: number;
    stress: number;
  };
  flags: string[];
  currentWeek: number;
  onApplyPuzzleResult: (result: PuzzleResult) => void;
  onApplyDialogueResult: (result: DialogueResult) => void;
}

const ChallengeOverlay: React.FC<ChallengeOverlayProps> = ({
  playerStats,
  flags,
  currentWeek,
  onApplyPuzzleResult,
  onApplyDialogueResult,
}) => {
  const { activePuzzle, activeDialogue } = useActiveChallenge();
  const { pendingPuzzleResult, pendingDialogueResult, clearPending } = usePendingChallengeResults();
  const { completePuzzle, skipPuzzle, completeDialogue, checkTriggers } = useChallenges();

  // Check for triggers when week changes
  useEffect(() => {
    checkTriggers(currentWeek, flags);
  }, [currentWeek, flags, checkTriggers]);

  // Apply pending results to main game
  useEffect(() => {
    if (pendingPuzzleResult) {
      onApplyPuzzleResult(pendingPuzzleResult);
      clearPending();
    }
  }, [pendingPuzzleResult, onApplyPuzzleResult, clearPending]);

  useEffect(() => {
    if (pendingDialogueResult) {
      onApplyDialogueResult(pendingDialogueResult);
      clearPending();
    }
  }, [pendingDialogueResult, onApplyDialogueResult, clearPending]);

  const handlePuzzleComplete = useCallback((result: PuzzleResult) => {
    completePuzzle(result);
  }, [completePuzzle]);

  const handlePuzzleSkip = useCallback(() => {
    skipPuzzle();
  }, [skipPuzzle]);

  const handleDialogueComplete = useCallback((result: DialogueResult) => {
    completeDialogue(result);
  }, [completeDialogue]);

  return (
    <>
      {/* Puzzle Modal */}
      {activePuzzle && (
        <PuzzleModal
          puzzle={activePuzzle}
          onComplete={handlePuzzleComplete}
          onSkip={handlePuzzleSkip}
        />
      )}

      {/* NPC Dialogue Modal */}
      {activeDialogue && (
        <NPCDialogueModal
          dialogue={activeDialogue}
          playerStats={playerStats}
          flags={flags}
          onComplete={handleDialogueComplete}
        />
      )}
    </>
  );
};

export default ChallengeOverlay;
