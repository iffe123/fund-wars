/**
 * IC Conversation Hook
 *
 * Main hook for managing IC meeting state and interactions.
 * Coordinates between partners, evaluation, and AI responses.
 */

import { useState, useCallback, useRef } from 'react';
import type { PortfolioCompany, PlayerLevel } from '../../../types';
import type {
  ICSession,
  ICUIState,
  ICMessage,
  ICPhase,
  ICPartner,
  PitchEvaluation,
  ICVerdict,
  ICPartnerVote,
  PlayerICHistory,
  PartnerMood,
} from '../types/icTypes';
import { IC_CONSTANTS } from '../types/icTypes';
import { ALL_IC_PARTNERS, selectPartnersForMeeting } from '../constants/icPartners';
import {
  generateICSystemPrompt,
  generateInitialQuestionPrompt,
  generateFollowUpPrompt,
  generateVerdictPrompt,
  generateOfflineQuestion,
  generateOfflineVerdict as generateOfflinePartnerVerdict,
} from '../services/icPromptEngine';
import {
  generateEvaluationPrompt,
  parseEvaluationResponse,
  generateOfflineEvaluation,
  parsePartnerVote,
  generateVerdict,
  generateOfflineVerdict,
} from '../services/icEvaluationEngine';
import { getICPartnerResponse, getICEvaluation, isGeminiApiConfigured } from '../services/icGeminiService';

// ==================== TYPES ====================

interface UseICConversationReturn {
  session: ICSession | null;
  uiState: ICUIState;
  startSession: (deal: PortfolioCompany, playerLevel: PlayerLevel) => void;
  submitOpeningPitch: (pitch: string) => Promise<void>;
  submitResponse: (response: string) => Promise<void>;
  endSession: () => void;
  acceptVerdict: () => ICVerdict | null;
  pushBackOnVerdict: () => Promise<void>;
}

// ==================== INITIAL STATE ====================

const initialUIState: ICUIState = {
  isOpen: false,
  isLoading: false,
  error: undefined,
  currentPartner: undefined,
  showVerdict: false,
  timerActive: false,
  partnerMoods: {},
};

// ==================== HOOK IMPLEMENTATION ====================

export const useICConversation = (): UseICConversationReturn => {
  const [session, setSession] = useState<ICSession | null>(null);
  const [uiState, setUIState] = useState<ICUIState>(initialUIState);

  // Track player history across sessions (would be persisted in real implementation)
  const playerHistoryRef = useRef<PlayerICHistory>({
    currentLevel: 'Associate' as PlayerLevel,
    meetingsAttended: 0,
    identifiedWeaknesses: [],
    impressedCount: 0,
    partnerRelationships: {},
  });

  // Question tracking
  const questionCountRef = useRef<number>(0);
  const currentPartnerIndexRef = useRef<number>(0);

  // ==================== SESSION MANAGEMENT ====================

  const startSession = useCallback((deal: PortfolioCompany, playerLevel: PlayerLevel) => {
    const leverage = deal.debt / deal.ebitda;
    const { partners } = selectPartnersForMeeting(deal.dealType, leverage, playerLevel);

    // Update player history
    playerHistoryRef.current.currentLevel = playerLevel;

    // Initialize partner moods
    const partnerMoods: Record<string, PartnerMood> = {};
    partners.forEach((p) => {
      partnerMoods[p.id] = 'NEUTRAL';
    });

    const newSession: ICSession = {
      id: `ic-${Date.now()}`,
      deal,
      phase: 'PREP',
      partners,
      messages: [],
      playerResponses: [],
      currentQuestionIndex: 0,
      startTime: Date.now(),
      timeRemaining: IC_CONSTANTS.OPENING_PITCH_TIME_SECONDS,
    };

    setSession(newSession);
    setUIState({
      ...initialUIState,
      isOpen: true,
      partnerMoods,
    });

    // Reset counters
    questionCountRef.current = 0;
    currentPartnerIndexRef.current = 0;
  }, []);

  const endSession = useCallback(() => {
    setSession(null);
    setUIState(initialUIState);
  }, []);

  // ==================== MESSAGE HELPERS ====================

  const addMessage = useCallback((
    content: string,
    isPlayer: boolean,
    partner?: ICPartner
  ): ICMessage => {
    const message: ICMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      partnerId: partner?.id,
      partnerName: partner?.name,
      content,
      timestamp: Date.now(),
      isPlayer,
    };

    setSession((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        messages: [...prev.messages, message],
      };
    });

    return message;
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setUIState((prev) => ({ ...prev, isLoading: loading }));
  }, []);

  const setError = useCallback((error: string | undefined) => {
    setUIState((prev) => ({ ...prev, error }));
  }, []);

  const updatePartnerMood = useCallback((partnerId: string, mood: PartnerMood) => {
    setUIState((prev) => ({
      ...prev,
      partnerMoods: { ...prev.partnerMoods, [partnerId]: mood },
    }));
  }, []);

  // ==================== OPENING PITCH ====================

  const submitOpeningPitch = useCallback(async (pitch: string) => {
    if (!session) return;

    setLoading(true);
    setError(undefined);

    try {
      // Store opening pitch
      setSession((prev) => {
        if (!prev) return prev;
        return { ...prev, openingPitch: pitch, phase: 'INTERROGATION' };
      });

      // Add player's pitch as a message
      addMessage(pitch, true);

      // Get first partner's question
      const firstPartner = session.partners[0];
      setUIState((prev) => ({ ...prev, currentPartner: firstPartner }));

      let questionResponse: string;

      if (isGeminiApiConfigured()) {
        // Use AI to generate question
        const systemPrompt = generateICSystemPrompt(
          firstPartner,
          session.deal,
          playerHistoryRef.current,
          'INTERROGATION'
        );
        const questionPrompt = generateInitialQuestionPrompt(
          firstPartner,
          session.deal,
          pitch
        );

        questionResponse = await getICPartnerResponse(
          systemPrompt,
          questionPrompt,
          []
        );
      } else {
        // Offline fallback
        questionResponse = generateOfflineQuestion(firstPartner, session.deal, 0);
      }

      // Add partner's question
      addMessage(questionResponse, false, firstPartner);
      updatePartnerMood(firstPartner.id, 'SKEPTICAL');

      // Update session state
      setSession((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          phase: 'INTERROGATION',
          currentQuestionIndex: 1,
          timeRemaining: IC_CONSTANTS.RESPONSE_TIME_SECONDS,
        };
      });

      questionCountRef.current = 1;
      currentPartnerIndexRef.current = 0;

    } catch (error) {
      console.error('Error submitting opening pitch:', error);
      setError('Failed to get partner response. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [session, addMessage, setLoading, setError, updatePartnerMood]);

  // ==================== RESPONSE SUBMISSION ====================

  const submitResponse = useCallback(async (response: string) => {
    if (!session) return;

    setLoading(true);
    setError(undefined);

    try {
      // Add player's response
      addMessage(response, true);

      // Store response
      setSession((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          playerResponses: [...prev.playerResponses, response],
        };
      });

      questionCountRef.current += 1;

      // Check if we've reached max questions
      if (questionCountRef.current >= IC_CONSTANTS.MAX_QUESTIONS) {
        // Move to verdict phase
        await generateVerdictPhase();
        return;
      }

      // Rotate to next partner or follow up
      const shouldRotate = questionCountRef.current % 2 === 0;
      let nextPartner: ICPartner;

      if (shouldRotate) {
        currentPartnerIndexRef.current =
          (currentPartnerIndexRef.current + 1) % session.partners.length;
      }
      nextPartner = session.partners[currentPartnerIndexRef.current];

      setUIState((prev) => ({ ...prev, currentPartner: nextPartner }));

      // Get previous question for context
      const previousQuestions = session.messages.filter(
        (m) => !m.isPlayer && m.partnerId === nextPartner.id
      );
      const lastQuestion = previousQuestions[previousQuestions.length - 1]?.content || '';

      let questionResponse: string;

      if (isGeminiApiConfigured()) {
        const systemPrompt = generateICSystemPrompt(
          nextPartner,
          session.deal,
          playerHistoryRef.current,
          'INTERROGATION'
        );

        const followUpPrompt = shouldRotate
          ? generateInitialQuestionPrompt(nextPartner, session.deal, session.openingPitch || '')
          : generateFollowUpPrompt(
              nextPartner,
              session.deal,
              lastQuestion,
              response,
              questionCountRef.current,
              IC_CONSTANTS.MAX_QUESTIONS
            );

        questionResponse = await getICPartnerResponse(
          systemPrompt,
          followUpPrompt,
          session.messages.map((m) => ({
            role: m.isPlayer ? 'user' : 'model',
            parts: [{ text: m.content }],
          }))
        );
      } else {
        questionResponse = generateOfflineQuestion(
          nextPartner,
          session.deal,
          questionCountRef.current
        );
      }

      // Add partner's question
      addMessage(questionResponse, false, nextPartner);

      // Update mood based on response quality (simplified)
      const responseLength = response.length;
      if (responseLength > 400) {
        updatePartnerMood(nextPartner.id, 'INTERESTED');
      } else if (responseLength < 100) {
        updatePartnerMood(nextPartner.id, 'CONCERNED');
      }

      // Update session
      setSession((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          currentQuestionIndex: questionCountRef.current,
          timeRemaining: IC_CONSTANTS.RESPONSE_TIME_SECONDS,
        };
      });

    } catch (error) {
      console.error('Error submitting response:', error);
      setError('Failed to get partner response. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [session, addMessage, setLoading, setError, updatePartnerMood]);

  // ==================== VERDICT GENERATION ====================

  const generateVerdictPhase = useCallback(async () => {
    if (!session) return;

    setLoading(true);
    setSession((prev) => {
      if (!prev) return prev;
      return { ...prev, phase: 'DELIBERATION' };
    });

    try {
      // Get evaluation
      let evaluation: PitchEvaluation;

      if (isGeminiApiConfigured()) {
        const evalPrompt = generateEvaluationPrompt(
          session.deal,
          session.openingPitch || '',
          session.playerResponses,
          session.messages
        );
        const evalResponse = await getICEvaluation(evalPrompt);
        evaluation = parseEvaluationResponse(evalResponse) ||
          generateOfflineEvaluation(session.openingPitch || '', session.playerResponses);
      } else {
        evaluation = generateOfflineEvaluation(
          session.openingPitch || '',
          session.playerResponses
        );
      }

      // Get partner votes
      const partnerVotes: ICPartnerVote[] = [];

      for (const partner of session.partners) {
        let vote: ICPartnerVote;

        if (isGeminiApiConfigured()) {
          const verdictPrompt = generateVerdictPrompt(
            partner,
            session.deal,
            session.messages,
            session.openingPitch || ''
          );
          const systemPrompt = generateICSystemPrompt(
            partner,
            session.deal,
            playerHistoryRef.current,
            'VERDICT'
          );

          const voteResponse = await getICPartnerResponse(
            systemPrompt,
            verdictPrompt,
            []
          );
          vote = parsePartnerVote(voteResponse, partner);
        } else {
          const offlineVerdict = generateOfflinePartnerVerdict(partner, evaluation.overallScore);
          vote = {
            partnerId: partner.id,
            partnerName: partner.name,
            vote: offlineVerdict.vote,
            reasoning: offlineVerdict.reasoning,
            respectChange: offlineVerdict.vote === 'YES' ? 3 : offlineVerdict.vote === 'NO' ? -3 : 0,
          };
        }

        partnerVotes.push(vote);

        // Update mood based on vote
        const mood: PartnerMood = vote.vote === 'YES'
          ? 'IMPRESSED'
          : vote.vote === 'NO'
          ? 'HOSTILE'
          : 'SKEPTICAL';
        updatePartnerMood(partner.id, mood);
      }

      // Generate final verdict
      const verdict = generateVerdict(partnerVotes, evaluation, session.deal);

      // Update session
      setSession((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          phase: 'VERDICT',
          evaluation,
          verdict,
        };
      });

      setUIState((prev) => ({ ...prev, showVerdict: true }));

      // Update player history
      playerHistoryRef.current.meetingsAttended += 1;
      if (verdict.outcome === 'APPROVED') {
        playerHistoryRef.current.impressedCount += 1;
      }
      if (evaluation.redFlags.length > 0) {
        playerHistoryRef.current.identifiedWeaknesses.push(...evaluation.redFlags);
      }

    } catch (error) {
      console.error('Error generating verdict:', error);
      // Fallback to offline verdict
      const offlineEval = generateOfflineEvaluation(
        session.openingPitch || '',
        session.playerResponses
      );
      const offlineVerdict = generateOfflineVerdict(offlineEval, session.deal);

      setSession((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          phase: 'VERDICT',
          evaluation: offlineEval,
          verdict: offlineVerdict,
        };
      });
      setUIState((prev) => ({ ...prev, showVerdict: true }));
    } finally {
      setLoading(false);
    }
  }, [session, setLoading, updatePartnerMood]);

  // ==================== VERDICT ACTIONS ====================

  const acceptVerdict = useCallback((): ICVerdict | null => {
    if (!session?.verdict) return null;

    const verdict = session.verdict;
    endSession();
    return verdict;
  }, [session, endSession]);

  const pushBackOnVerdict = useCallback(async () => {
    if (!session?.verdict) return;

    // For now, pushing back just shows some additional dialogue
    // Could be expanded to allow negotiation
    setLoading(true);

    try {
      const richard = session.partners.find((p) => p.id === 'richard');
      if (richard) {
        addMessage(
          'The committee has spoken. Our decision is final. However, we expect to see improvements addressed if you bring this back.',
          false,
          richard
        );
      }
    } finally {
      setLoading(false);
    }
  }, [session, addMessage, setLoading]);

  return {
    session,
    uiState,
    startSession,
    submitOpeningPitch,
    submitResponse,
    endSession,
    acceptVerdict,
    pushBackOnVerdict,
  };
};

export default useICConversation;
