/**
 * IC Meeting Screen Component
 *
 * Main container for the Investment Committee meeting experience.
 * Orchestrates the flow from prep through verdict.
 */

import React, { useState, useCallback, useEffect } from 'react';
import type { PortfolioCompany, PlayerLevel } from '../../../types';
import type { ICPhase } from '../types/icTypes';
import { IC_CONSTANTS } from '../types/icTypes';
import { useICConversation } from '../hooks/useICConversation';
import { useICTimer } from '../hooks/useICTimer';

import { ICPrepScreen } from './ICPrepScreen';
import { ICPartnerPanel } from './ICPartnerPanel';
import { ICChatInterface } from './ICChatInterface';
import { ICPitchInput } from './ICPitchInput';
import { ICTimer } from './ICTimer';
import { ICVerdictScreen } from './ICVerdictScreen';

interface ICMeetingScreenProps {
  deal: PortfolioCompany;
  playerLevel: PlayerLevel;
  onComplete: (outcome: 'APPROVED' | 'CONDITIONALLY_APPROVED' | 'TABLED' | 'REJECTED' | 'CANCELLED') => void;
  onClose: () => void;
}

export const ICMeetingScreen: React.FC<ICMeetingScreenProps> = ({
  deal,
  playerLevel,
  onComplete,
  onClose,
}) => {
  const [hasEntered, setHasEntered] = useState(false);
  const [showOpeningInput, setShowOpeningInput] = useState(true);

  const {
    session,
    uiState,
    startSession,
    submitOpeningPitch,
    submitResponse,
    endSession,
    acceptVerdict,
    pushBackOnVerdict,
  } = useICConversation();

  const timer = useICTimer(() => {
    // Timer expired - force submit or move on
    if (session?.phase === 'OPENING') {
      submitOpeningPitch('I apologize, I need more time to prepare.');
    }
  });

  // Start session when entering the room
  const handleEnter = useCallback(() => {
    startSession(deal, playerLevel);
    setHasEntered(true);
    timer.startTimer(IC_CONSTANTS.OPENING_PITCH_TIME_SECONDS);
  }, [deal, playerLevel, startSession, timer]);

  // Handle opening pitch submission
  const handleOpeningPitch = useCallback(async (pitch: string) => {
    timer.pauseTimer();
    await submitOpeningPitch(pitch);
    setShowOpeningInput(false);
    timer.startTimer(IC_CONSTANTS.RESPONSE_TIME_SECONDS);
  }, [submitOpeningPitch, timer]);

  // Handle response submission
  const handleResponse = useCallback(async (response: string) => {
    timer.pauseTimer();
    await submitResponse(response);
    timer.startTimer(IC_CONSTANTS.RESPONSE_TIME_SECONDS);
  }, [submitResponse, timer]);

  // Handle verdict acceptance
  const handleAcceptVerdict = useCallback(() => {
    const verdict = acceptVerdict();
    if (verdict) {
      onComplete(verdict.outcome);
    }
  }, [acceptVerdict, onComplete]);

  // Handle cancellation
  const handleCancel = useCallback(() => {
    endSession();
    onComplete('CANCELLED');
    onClose();
  }, [endSession, onComplete, onClose]);

  // Effect to pause timer during loading
  useEffect(() => {
    if (uiState.isLoading) {
      timer.pauseTimer();
    } else if (session?.phase === 'INTERROGATION' && !uiState.showVerdict) {
      timer.startTimer(timer.timeRemaining || IC_CONSTANTS.RESPONSE_TIME_SECONDS);
    }
  }, [uiState.isLoading, session?.phase, uiState.showVerdict]);

  // Show prep screen if not entered
  if (!hasEntered || !session) {
    return (
      <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-2xl">
          <ICPrepScreen
            deal={deal}
            partners={session?.partners || []}
            onEnter={handleEnter}
            onCancel={handleCancel}
          />
        </div>
      </div>
    );
  }

  // Show verdict screen
  if (uiState.showVerdict && session.verdict) {
    return (
      <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-2xl">
          <ICVerdictScreen
            verdict={session.verdict}
            partners={session.partners}
            onAccept={handleAcceptVerdict}
            onPushBack={pushBackOnVerdict}
          />
        </div>
      </div>
    );
  }

  // Main meeting screen
  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-[90vh] bg-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/80 to-slate-900/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="text-lg font-bold text-slate-200">IC Meeting: {deal.name}</div>
            <div className="text-xs text-slate-500">
              {session.phase === 'OPENING' && 'Opening Pitch'}
              {session.phase === 'INTERROGATION' && `Question ${session.currentQuestionIndex} of ${IC_CONSTANTS.MAX_QUESTIONS}`}
              {session.phase === 'DELIBERATION' && 'Committee Deliberating...'}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ICTimer
              timeRemaining={timer.timeRemaining}
              formattedTime={timer.formattedTime}
              isActive={session.phase !== 'DELIBERATION' && !uiState.isLoading}
            />
            <button
              onClick={handleCancel}
              className="p-2 text-slate-500 hover:text-slate-300 transition-colors"
              title="Exit Meeting"
            >
              <i className="fas fa-times" />
            </button>
          </div>
        </div>

        {/* Partner Panel */}
        <div className="p-4 border-b border-slate-700/50 bg-slate-800/30 shrink-0">
          <ICPartnerPanel
            partners={session.partners}
            partnerMoods={uiState.partnerMoods}
            currentPartnerId={uiState.currentPartner?.id}
          />
        </div>

        {/* Chat Area */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {/* Opening prompt (only before first pitch) */}
          {session.phase === 'OPENING' && showOpeningInput && session.messages.length === 0 && (
            <div className="p-4 bg-slate-800/50 border-b border-slate-700/50">
              <div className="flex items-center gap-3">
                <span className="text-xl">{session.partners[session.partners.length - 1]?.avatar}</span>
                <div>
                  <div className="text-sm font-bold text-slate-300">
                    {session.partners[session.partners.length - 1]?.name}
                  </div>
                  <div className="text-xs text-slate-400 italic">
                    "The floor is yours. Tell us why we should write a ${((deal.currentValuation - deal.debt) / 1000000).toFixed(0)} million check for {deal.name}."
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          <ICChatInterface
            messages={session.messages}
            partners={session.partners}
            isLoading={uiState.isLoading}
          />

          {/* Input Area */}
          {session.phase !== 'DELIBERATION' && (
            <ICPitchInput
              maxCharacters={
                showOpeningInput
                  ? IC_CONSTANTS.MAX_OPENING_PITCH_CHARS
                  : IC_CONSTANTS.MAX_RESPONSE_CHARS
              }
              placeholder={
                showOpeningInput
                  ? 'Present your investment thesis. Be specific about the opportunity, value creation plan, and key risks...'
                  : 'Respond to the question. Be specific and reference the deal details...'
              }
              onSubmit={showOpeningInput ? handleOpeningPitch : handleResponse}
              disabled={uiState.isLoading}
              isLoading={uiState.isLoading}
              buttonLabel={showOpeningInput ? 'Deliver Pitch' : 'Respond'}
            />
          )}

          {/* Deliberation message */}
          {session.phase === 'DELIBERATION' && (
            <div className="p-8 text-center">
              <div className="inline-flex items-center gap-3 px-6 py-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <div className="w-4 h-4 border-2 border-slate-500 border-t-amber-500 rounded-full animate-spin" />
                <span className="text-slate-400">The committee is deliberating...</span>
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {uiState.error && (
          <div className="p-3 bg-red-950/50 border-t border-red-500/30">
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <i className="fas fa-exclamation-triangle" />
              {uiState.error}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ICMeetingScreen;
