/**
 * Investment Committee (IC) Pitch Modal
 *
 * The most important feature for learning PE. Players pitch deals
 * to a panel of partners who interrogate them with tough questions.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { TerminalButton, TerminalPanel } from './TerminalUI';
import { useHaptic } from '../hooks/useHaptic';
import { useGame } from '../contexts/GameStateContext';
import {
  IC_PARTNERS,
  IC_QUESTIONS,
  IC_EVALUATION_WEIGHTS,
  IC_VERDICT_THRESHOLDS,
} from '../constants/investmentCommittee';
import type {
  ICPartner,
  ICMeetingPhase,
  ICVerdict,
  ICPartnerReaction,
  ICPitchEvaluation,
  ICMeetingState,
} from '../types/investmentCommittee';
import type { PortfolioCompany } from '../types';

interface ICPitchModalProps {
  company: PortfolioCompany;
  onComplete: (verdict: ICVerdict, evaluation: ICPitchEvaluation) => void;
  onClose: () => void;
}

const PHASE_DESCRIPTIONS: Record<ICMeetingPhase, string> = {
  PREP: 'Review your materials and prepare your pitch',
  OPENING_PITCH: 'Deliver your opening thesis (3 minutes)',
  INTERROGATION: 'Partners will question your analysis',
  DELIBERATION: 'The committee is discussing...',
  VERDICT: 'The committee has reached a decision',
};

const ICPitchModal: React.FC<ICPitchModalProps> = ({ company, onComplete, onClose }) => {
  const { triggerImpact } = useHaptic();
  const { playerStats } = useGame();

  // Meeting state
  const [phase, setPhase] = useState<ICMeetingPhase>('PREP');
  const [currentPartnerIndex, setCurrentPartnerIndex] = useState(0);
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const maxQuestions = 6;

  // Timer for opening pitch
  const [pitchTimeRemaining, setPitchTimeRemaining] = useState(180); // 3 minutes
  const [isPitchTimerRunning, setIsPitchTimerRunning] = useState(false);

  // Player inputs
  const [openingPitch, setOpeningPitch] = useState('');
  const [currentResponse, setCurrentResponse] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [currentQuestionCategory, setCurrentQuestionCategory] = useState<string>('');

  // Partner states
  const [partnerSatisfaction, setPartnerSatisfaction] = useState<Record<string, number>>({
    margaret: 50,
    david: 50,
    victoria: 50,
    richard: 50,
  });
  const [partnerReactions, setPartnerReactions] = useState<ICPartnerReaction[]>([]);

  // Response history
  const [responses, setResponses] = useState<Array<{
    question: string;
    response: string;
    partnerId: string;
    reaction: ICPartnerReaction;
  }>>([]);

  // Log for display
  const [log, setLog] = useState<string[]>([
    `> IC MEETING INITIATED: ${company.name}`,
    `> ATTENDEES: ${IC_PARTNERS.map(p => p.name).join(', ')}`,
    `> STATUS: Awaiting player preparation`,
  ]);

  // Final results
  const [evaluation, setEvaluation] = useState<ICPitchEvaluation | null>(null);
  const [verdict, setVerdict] = useState<ICVerdict | null>(null);
  const [partnerVotes, setPartnerVotes] = useState<Array<{ partnerId: string; vote: ICVerdict; reasoning: string }>>([]);

  // Current partner
  const currentPartner = useMemo(() => IC_PARTNERS[currentPartnerIndex], [currentPartnerIndex]);

  // Timer effect for opening pitch
  useEffect(() => {
    if (!isPitchTimerRunning || phase !== 'OPENING_PITCH') return;

    const interval = setInterval(() => {
      setPitchTimeRemaining(prev => {
        if (prev <= 1) {
          setIsPitchTimerRunning(false);
          handlePitchSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPitchTimerRunning, phase]);

  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Start the meeting
  const handleStartMeeting = () => {
    setPhase('OPENING_PITCH');
    setIsPitchTimerRunning(true);
    setLog(prev => [
      ...prev,
      `> MEETING STARTED`,
      `> ${IC_PARTNERS[3].name}: "Let's hear your thesis."`,
    ]);
    triggerImpact('MEDIUM');
  };

  // Submit opening pitch
  const handlePitchSubmit = useCallback(() => {
    if (openingPitch.length < 50) {
      setLog(prev => [...prev, `> ERROR: Pitch too brief. Partners are unimpressed.`]);
      return;
    }

    setIsPitchTimerRunning(false);
    setPhase('INTERROGATION');

    // Evaluate pitch clarity
    const pitchScore = evaluatePitchClarity(openingPitch);
    const satisfactionChange = Math.floor((pitchScore - 50) / 10);

    setPartnerSatisfaction(prev => ({
      margaret: Math.min(100, Math.max(0, prev.margaret + satisfactionChange)),
      david: Math.min(100, Math.max(0, prev.david + satisfactionChange + 5)),
      victoria: Math.min(100, Math.max(0, prev.victoria + satisfactionChange - 5)),
      richard: Math.min(100, Math.max(0, prev.richard + satisfactionChange)),
    }));

    setLog(prev => [
      ...prev,
      `> PITCH DELIVERED (${openingPitch.length} characters)`,
      pitchScore >= 70 ? `> Partners nod thoughtfully.` : `> Some skeptical looks around the table.`,
      `> ${currentPartner.name} leans forward...`,
    ]);

    // Generate first question
    generateQuestion();
    triggerImpact('LIGHT');
  }, [openingPitch, currentPartner]);

  // Simple pitch evaluation (would be AI-powered in production)
  const evaluatePitchClarity = (pitch: string): number => {
    let score = 50;

    // Check for key elements
    const keyTerms = ['thesis', 'ebitda', 'irr', 'multiple', 'risk', 'value creation', 'exit', 'management'];
    keyTerms.forEach(term => {
      if (pitch.toLowerCase().includes(term)) score += 5;
    });

    // Length bonus (but not too long)
    if (pitch.length > 200 && pitch.length < 800) score += 10;
    if (pitch.length > 800) score -= 5;

    // Specificity (numbers are good)
    const numberMatches = pitch.match(/\d+/g);
    if (numberMatches && numberMatches.length >= 3) score += 10;

    return Math.min(100, Math.max(0, score));
  };

  // Generate a question from current partner
  const generateQuestion = useCallback(() => {
    const partnerQuestions = IC_QUESTIONS[currentPartner.id] || [];
    const usedQuestions = responses.map(r => r.question);
    const availableQuestions = partnerQuestions.filter(q => !usedQuestions.includes(q.question));

    if (availableQuestions.length === 0) {
      // Move to next partner or end
      if (currentPartnerIndex < IC_PARTNERS.length - 1) {
        setCurrentPartnerIndex(prev => prev + 1);
        return;
      } else {
        handleDeliberation();
        return;
      }
    }

    // Select question based on partner satisfaction
    const satisfaction = partnerSatisfaction[currentPartner.id];
    let difficulty: 'easy' | 'medium' | 'hard' | 'gotcha';
    if (satisfaction > 70) difficulty = 'easy';
    else if (satisfaction > 40) difficulty = 'medium';
    else difficulty = 'hard';

    const matchingQuestions = availableQuestions.filter(q => q.difficulty === difficulty);
    const selectedQuestion = matchingQuestions.length > 0
      ? matchingQuestions[Math.floor(Math.random() * matchingQuestions.length)]
      : availableQuestions[Math.floor(Math.random() * availableQuestions.length)];

    setCurrentQuestion(selectedQuestion.question);
    setCurrentQuestionCategory(selectedQuestion.category);
    setLog(prev => [
      ...prev,
      ``,
      `> ${currentPartner.name.toUpperCase()} (${currentPartner.title}):`,
      `  "${selectedQuestion.question}"`,
    ]);
    triggerImpact('LIGHT');
  }, [currentPartner, responses, partnerSatisfaction, currentPartnerIndex]);

  // Submit response to question
  const handleResponseSubmit = () => {
    if (!currentQuestion || currentResponse.length < 20) {
      setLog(prev => [...prev, `> WARNING: Response too brief.`]);
      return;
    }

    // Evaluate response
    const reaction = evaluateResponse(currentResponse, currentQuestion, currentQuestionCategory);

    // Update satisfaction
    setPartnerSatisfaction(prev => ({
      ...prev,
      [currentPartner.id]: Math.min(100, Math.max(0, prev[currentPartner.id] + reaction.satisfaction)),
    }));

    // Store response
    setResponses(prev => [...prev, {
      question: currentQuestion,
      response: currentResponse,
      partnerId: currentPartner.id,
      reaction,
    }]);

    // Log reaction
    setLog(prev => [
      ...prev,
      `> YOUR RESPONSE: "${currentResponse.substring(0, 50)}..."`,
      `> ${currentPartner.name}: ${reaction.feedback}`,
    ]);

    setPartnerReactions(prev => [...prev, reaction]);
    setCurrentResponse('');
    setCurrentQuestion(null);
    setQuestionsAsked(prev => prev + 1);

    // Check if we continue or move on
    if (questionsAsked + 1 >= maxQuestions) {
      handleDeliberation();
    } else if (reaction.followUpQuestion && Math.random() > 0.5) {
      // Follow-up from same partner
      setCurrentQuestion(reaction.followUpQuestion);
      setLog(prev => [
        ...prev,
        `> ${currentPartner.name}: "${reaction.followUpQuestion}"`,
      ]);
    } else {
      // Move to next partner
      const nextIndex = (currentPartnerIndex + 1) % IC_PARTNERS.length;
      setCurrentPartnerIndex(nextIndex);
      setTimeout(() => generateQuestion(), 500);
    }

    triggerImpact(reaction.satisfaction > 0 ? 'LIGHT' : 'MEDIUM');
  };

  // Simple response evaluation
  const evaluateResponse = (response: string, question: string, category: string): ICPartnerReaction => {
    let satisfaction = 0;
    let reaction: ICPartnerReaction['reaction'] = 'skeptical';
    let feedback = '';
    let followUpQuestion: string | undefined;

    // Check response quality
    const hasNumbers = /\d+/.test(response);
    const isLong = response.length > 100;
    const hasSpecifics = response.toLowerCase().includes('specifically') ||
                         response.toLowerCase().includes('for example') ||
                         response.toLowerCase().includes('in this case');

    // Category-specific evaluation
    if (category === 'financials' && hasNumbers) {
      satisfaction += 15;
    } else if (category === 'financials' && !hasNumbers) {
      satisfaction -= 10;
      feedback = '"I asked for numbers, not platitudes."';
    }

    if (category === 'operations' && hasSpecifics) {
      satisfaction += 10;
    }

    if (category === 'risk' && response.toLowerCase().includes('downside')) {
      satisfaction += 10;
    }

    // Length and effort
    if (isLong && hasSpecifics) {
      satisfaction += 10;
      reaction = 'satisfied';
      feedback = feedback || '"That\'s more like it."';
    } else if (response.length < 50) {
      satisfaction -= 15;
      reaction = 'dismissive';
      feedback = '"That\'s all you\'ve got?"';
      followUpQuestion = 'Let me try again. What specifically is your plan?';
    }

    // Partner-specific modifiers
    if (currentPartner.id === 'victoria' && response.toLowerCase().includes('irr')) {
      satisfaction += 5;
    }
    if (currentPartner.id === 'david' && response.toLowerCase().includes('management')) {
      satisfaction += 5;
    }
    if (currentPartner.id === 'margaret' && response.toLowerCase().includes('covenant')) {
      satisfaction += 5;
    }
    if (currentPartner.id === 'richard' && response.toLowerCase().includes('reputation')) {
      satisfaction += 5;
    }

    // Set default feedback if not set
    if (!feedback) {
      if (satisfaction > 10) {
        feedback = '"Good. Continue."';
        reaction = 'satisfied';
      } else if (satisfaction > 0) {
        feedback = '"Hmm."';
        reaction = 'probing';
      } else if (satisfaction > -10) {
        feedback = '"I\'m not convinced."';
        reaction = 'skeptical';
      } else {
        feedback = '"This is concerning."';
        reaction = 'dismissive';
      }
    }

    return {
      partnerId: currentPartner.id,
      satisfaction,
      reaction,
      feedback,
      followUpQuestion,
    };
  };

  // Deliberation phase
  const handleDeliberation = () => {
    setPhase('DELIBERATION');
    setLog(prev => [
      ...prev,
      ``,
      `> INTERROGATION COMPLETE`,
      `> The partners are conferring privately...`,
    ]);
    triggerImpact('MEDIUM');

    // Simulate deliberation (would be AI-generated in production)
    setTimeout(() => {
      const finalEvaluation = calculateFinalEvaluation();
      const finalVerdict = determineVerdict(finalEvaluation.overallScore);
      const votes = generateVotes(finalEvaluation);

      setEvaluation(finalEvaluation);
      setVerdict(finalVerdict);
      setPartnerVotes(votes);
      setPhase('VERDICT');

      setLog(prev => [
        ...prev,
        `> DELIBERATION COMPLETE`,
        `> VERDICT: ${finalVerdict}`,
      ]);

      triggerImpact(finalVerdict === 'APPROVED' ? 'LIGHT' : 'HEAVY');
    }, 3000);
  };

  // Calculate final evaluation
  const calculateFinalEvaluation = (): ICPitchEvaluation => {
    const pitchScore = evaluatePitchClarity(openingPitch);
    const avgSatisfaction = Object.values(partnerSatisfaction).reduce((a, b) => a + b, 0) / 4;

    // Calculate dimensions
    const dimensions = {
      thesis_clarity: Math.min(100, pitchScore + (avgSatisfaction - 50) * 0.5),
      financial_rigor: Math.min(100, 40 + (partnerSatisfaction.victoria - 50) * 1.2 + (partnerSatisfaction.margaret - 50) * 0.8),
      risk_awareness: Math.min(100, 40 + (partnerSatisfaction.margaret - 50) * 1.5),
      value_creation: Math.min(100, 40 + (partnerSatisfaction.david - 50) * 1.5),
      conviction: Math.min(100, pitchScore * 0.5 + avgSatisfaction * 0.5),
      specificity: Math.min(100, responses.filter(r => r.reaction.satisfaction > 5).length * 15 + 30),
    };

    // Calculate overall score
    const overallScore = Math.round(
      dimensions.thesis_clarity * IC_EVALUATION_WEIGHTS.thesis_clarity +
      dimensions.financial_rigor * IC_EVALUATION_WEIGHTS.financial_rigor +
      dimensions.risk_awareness * IC_EVALUATION_WEIGHTS.risk_awareness +
      dimensions.value_creation * IC_EVALUATION_WEIGHTS.value_creation +
      dimensions.conviction * IC_EVALUATION_WEIGHTS.conviction +
      dimensions.specificity * IC_EVALUATION_WEIGHTS.specificity
    );

    // Identify concepts
    const conceptsDemonstrated: string[] = [];
    const conceptsMissing: string[] = [];

    if (dimensions.financial_rigor > 60) conceptsDemonstrated.push('LBO Mechanics');
    else conceptsMissing.push('LBO Mechanics');

    if (dimensions.risk_awareness > 60) conceptsDemonstrated.push('Risk Assessment');
    else conceptsMissing.push('Risk Assessment');

    if (dimensions.value_creation > 60) conceptsDemonstrated.push('Value Creation');
    else conceptsMissing.push('Value Creation');

    if (dimensions.thesis_clarity > 60) conceptsDemonstrated.push('Thesis Development');
    else conceptsMissing.push('Thesis Development');

    // Learning recommendation
    let learningRecommendation = '';
    if (conceptsMissing.includes('LBO Mechanics')) {
      learningRecommendation = 'Review the fundamentals of leverage and return attribution.';
    } else if (conceptsMissing.includes('Risk Assessment')) {
      learningRecommendation = 'Practice identifying and articulating downside scenarios.';
    } else if (conceptsMissing.includes('Value Creation')) {
      learningRecommendation = 'Study operational improvement playbooks and 100-day plans.';
    } else {
      learningRecommendation = 'Strong performance. Focus on nuance and conviction in future pitches.';
    }

    return {
      dimensions,
      overallScore,
      conceptsDemonstrated,
      conceptsMissing,
      learningRecommendation,
    };
  };

  // Determine verdict from score
  const determineVerdict = (score: number): ICVerdict => {
    if (score >= IC_VERDICT_THRESHOLDS.APPROVED) return 'APPROVED';
    if (score >= IC_VERDICT_THRESHOLDS.CONDITIONAL) return 'CONDITIONAL';
    if (score >= IC_VERDICT_THRESHOLDS.TABLED) return 'TABLED';
    return 'REJECTED';
  };

  // Generate partner votes
  const generateVotes = (evaluation: ICPitchEvaluation): Array<{ partnerId: string; vote: ICVerdict; reasoning: string }> => {
    return IC_PARTNERS.map(partner => {
      const satisfaction = partnerSatisfaction[partner.id];
      let vote: ICVerdict;
      let reasoning: string;

      if (satisfaction >= 70) {
        vote = 'APPROVED';
        reasoning = partner.id === 'margaret' ? 'The risk analysis was thorough.'
          : partner.id === 'david' ? 'I believe in the operational plan.'
          : partner.id === 'victoria' ? 'The returns math works.'
          : 'This fits our thesis.';
      } else if (satisfaction >= 55) {
        vote = 'CONDITIONAL';
        reasoning = 'More work needed, but the fundamentals are there.';
      } else if (satisfaction >= 40) {
        vote = 'TABLED';
        reasoning = 'I\'m not convinced. Let\'s revisit with more diligence.';
      } else {
        vote = 'REJECTED';
        reasoning = partner.id === 'margaret' ? 'Too many unanswered risk questions.'
          : partner.id === 'david' ? 'The operational plan is weak.'
          : partner.id === 'victoria' ? 'The numbers don\'t pencil.'
          : 'This isn\'t right for us.';
      }

      return { partnerId: partner.id, vote, reasoning };
    });
  };

  // Complete meeting
  const handleComplete = () => {
    if (evaluation && verdict) {
      onComplete(verdict, evaluation);
    }
    onClose();
  };

  // Render partner avatars with satisfaction indicators
  const renderPartnerPanel = () => (
    <div className="flex justify-between mb-4">
      {IC_PARTNERS.map((partner, idx) => {
        const satisfaction = partnerSatisfaction[partner.id];
        const isActive = idx === currentPartnerIndex && phase === 'INTERROGATION';
        const satisfactionColor = satisfaction >= 60 ? 'text-green-500'
          : satisfaction >= 40 ? 'text-yellow-500'
          : 'text-red-500';

        return (
          <div
            key={partner.id}
            className={`flex flex-col items-center p-2 rounded transition-all ${
              isActive ? 'bg-cyan-900/30 ring-1 ring-cyan-500' : 'opacity-60'
            }`}
          >
            <div className={`w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-1 ${
              isActive ? 'ring-2 ring-cyan-400' : ''
            }`}>
              <i className={`fas ${partner.avatar} text-xl ${satisfactionColor}`}></i>
            </div>
            <div className="text-xs text-slate-400 text-center truncate w-20">{partner.name.split(' ')[0]}</div>
            <div className={`text-xs ${satisfactionColor}`}>{satisfaction}%</div>
          </div>
        );
      })}
    </div>
  );

  // Render verdict screen
  const renderVerdict = () => {
    if (!evaluation || !verdict) return null;

    const verdictColors: Record<ICVerdict, string> = {
      APPROVED: 'text-green-500 border-green-500',
      CONDITIONAL: 'text-yellow-500 border-yellow-500',
      TABLED: 'text-orange-500 border-orange-500',
      REJECTED: 'text-red-500 border-red-500',
    };

    return (
      <div className="space-y-6">
        {/* Verdict banner */}
        <div className={`text-center py-4 border-2 ${verdictColors[verdict]} bg-slate-800/50`}>
          <div className="text-sm uppercase tracking-widest text-slate-400 mb-1">IC VERDICT</div>
          <div className={`text-3xl font-bold ${verdictColors[verdict].split(' ')[0]}`}>{verdict}</div>
        </div>

        {/* Score breakdown */}
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(evaluation.dimensions).map(([key, value]) => (
            <div key={key} className="bg-slate-800 p-3 rounded">
              <div className="text-xs text-slate-400 uppercase">{key.replace('_', ' ')}</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-slate-700 rounded overflow-hidden">
                  <div
                    className={`h-full ${value >= 60 ? 'bg-green-500' : value >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${value}%` }}
                  ></div>
                </div>
                <span className="text-sm font-mono">{Math.round(value)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Overall score */}
        <div className="text-center">
          <div className="text-4xl font-bold text-cyan-400">{evaluation.overallScore}</div>
          <div className="text-sm text-slate-400">Overall Score</div>
        </div>

        {/* Partner votes */}
        <div className="bg-slate-800 p-4 rounded">
          <div className="text-sm font-bold mb-3 text-slate-300">Partner Votes</div>
          <div className="space-y-2">
            {partnerVotes.map(vote => (
              <div key={vote.partnerId} className="flex items-center gap-2 text-sm">
                <span className={verdictColors[vote.vote].split(' ')[0]}>{vote.vote}</span>
                <span className="text-slate-400">—</span>
                <span className="text-slate-300">
                  {IC_PARTNERS.find(p => p.id === vote.partnerId)?.name}:
                </span>
                <span className="text-slate-400 italic">"{vote.reasoning}"</span>
              </div>
            ))}
          </div>
        </div>

        {/* Learning section */}
        <div className="bg-cyan-900/20 border border-cyan-700 p-4 rounded">
          <div className="text-sm font-bold mb-2 text-cyan-400">Learning Notes</div>
          <div className="text-sm text-slate-300 mb-2">{evaluation.learningRecommendation}</div>
          <div className="flex gap-4 text-xs">
            <div>
              <span className="text-green-400">Demonstrated:</span>{' '}
              <span className="text-slate-400">{evaluation.conceptsDemonstrated.join(', ') || 'None'}</span>
            </div>
            <div>
              <span className="text-red-400">Gaps:</span>{' '}
              <span className="text-slate-400">{evaluation.conceptsMissing.join(', ') || 'None'}</span>
            </div>
          </div>
        </div>

        <TerminalButton
          variant="primary"
          label={verdict === 'APPROVED' ? 'Proceed with Deal' : 'Close'}
          onClick={handleComplete}
          className="w-full"
        />
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border-2 border-cyan-500 bg-slate-900 shadow-[0_0_50px_rgba(0,255,255,0.2)]">
        {/* Header */}
        <div className="bg-cyan-900 text-cyan-100 px-4 py-3 flex justify-between items-center sticky top-0">
          <div className="flex items-center gap-2">
            <i className="fas fa-users text-lg"></i>
            <span className="font-bold">INVESTMENT COMMITTEE</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">{company.name}</span>
            {phase !== 'VERDICT' && (
              <button onClick={onClose} className="text-cyan-300 hover:text-white">
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          {/* Phase indicator */}
          <div className="mb-4 text-center">
            <div className="text-xs uppercase tracking-widest text-slate-500 mb-1">Phase</div>
            <div className="text-lg font-bold text-cyan-400">{phase.replace('_', ' ')}</div>
            <div className="text-sm text-slate-400">{PHASE_DESCRIPTIONS[phase]}</div>
          </div>

          {/* Partner panel */}
          {phase !== 'PREP' && phase !== 'VERDICT' && renderPartnerPanel()}

          {/* Phase-specific content */}
          {phase === 'PREP' && (
            <div className="space-y-4">
              <TerminalPanel title="Deal Summary">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Company:</span> {company.name}
                  </div>
                  <div>
                    <span className="text-slate-400">Deal Type:</span> {company.dealType}
                  </div>
                  <div>
                    <span className="text-slate-400">Valuation:</span> ${(company.currentValuation / 1000000).toFixed(1)}M
                  </div>
                  <div>
                    <span className="text-slate-400">EBITDA:</span> ${(company.ebitda / 1000000).toFixed(1)}M
                  </div>
                  <div>
                    <span className="text-slate-400">Debt:</span> ${(company.debt / 1000000).toFixed(1)}M
                  </div>
                  <div>
                    <span className="text-slate-400">Revenue:</span> ${(company.revenue / 1000000).toFixed(1)}M
                  </div>
                </div>
              </TerminalPanel>

              <div className="bg-slate-800/50 p-4 rounded border border-slate-700">
                <div className="text-sm font-bold mb-2 text-amber-400">
                  <i className="fas fa-exclamation-triangle mr-2"></i>
                  Preparation Tips
                </div>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>• Know your thesis cold: Why this company? Why now? Why us?</li>
                  <li>• Be ready to defend your numbers with specifics</li>
                  <li>• Anticipate risk questions - Margaret always asks about downside</li>
                  <li>• David wants to hear about the 100-day plan</li>
                  <li>• Victoria cares about IRR math and competition</li>
                  <li>• Richard thinks long-term about reputation and fit</li>
                </ul>
              </div>

              <TerminalButton
                variant="primary"
                label="Enter the Room"
                onClick={handleStartMeeting}
                className="w-full"
              />
            </div>
          )}

          {phase === 'OPENING_PITCH' && (
            <div className="space-y-4">
              {/* Timer */}
              <div className="flex justify-center">
                <div className={`text-4xl font-mono ${pitchTimeRemaining < 30 ? 'text-red-500 animate-pulse' : 'text-cyan-400'}`}>
                  {formatTime(pitchTimeRemaining)}
                </div>
              </div>

              {/* Pitch input */}
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Deliver your opening pitch. Cover thesis, value creation, key risks, and your ask.
                </label>
                <textarea
                  value={openingPitch}
                  onChange={(e) => setOpeningPitch(e.target.value)}
                  className="w-full h-40 bg-black border border-slate-700 p-3 text-slate-200 font-mono text-sm rounded focus:border-cyan-500 focus:outline-none"
                  placeholder="Good morning. I'm here to present [Company Name], a compelling opportunity in the [sector] space...

Our thesis is [thesis]. We believe we can generate [X]x returns through [value creation plan].

Key risks include [risks], which we mitigate through [mitigation].

We're asking for $[X]M to acquire a [X]% stake..."
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>{openingPitch.length} characters</span>
                  <span>{openingPitch.length < 200 ? 'Too brief' : openingPitch.length > 1000 ? 'Getting long' : 'Good length'}</span>
                </div>
              </div>

              <TerminalButton
                variant="primary"
                label="Submit Pitch"
                onClick={handlePitchSubmit}
                disabled={openingPitch.length < 50}
                className="w-full"
              />
            </div>
          )}

          {phase === 'INTERROGATION' && (
            <div className="space-y-4">
              {/* Current question */}
              {currentQuestion && (
                <div className="bg-slate-800 p-4 rounded border-l-4 border-cyan-500">
                  <div className="text-xs text-cyan-400 mb-1">
                    {currentPartner.name} ({currentPartner.archetype.replace('_', ' ')})
                  </div>
                  <div className="text-lg text-white">{currentQuestion}</div>
                  <div className="text-xs text-slate-500 mt-2">Category: {currentQuestionCategory}</div>
                </div>
              )}

              {/* Response input */}
              <div>
                <textarea
                  value={currentResponse}
                  onChange={(e) => setCurrentResponse(e.target.value)}
                  className="w-full h-32 bg-black border border-slate-700 p-3 text-slate-200 font-mono text-sm rounded focus:border-cyan-500 focus:outline-none"
                  placeholder="Type your response..."
                />
                <div className="text-xs text-slate-500 mt-1">
                  {currentResponse.length} characters | Questions: {questionsAsked}/{maxQuestions}
                </div>
              </div>

              <div className="flex gap-2">
                <TerminalButton
                  variant="primary"
                  label="Submit Response"
                  onClick={handleResponseSubmit}
                  disabled={currentResponse.length < 20}
                  className="flex-1"
                />
                <TerminalButton
                  variant="danger"
                  label="Skip (Risky)"
                  onClick={() => {
                    setPartnerSatisfaction(prev => ({
                      ...prev,
                      [currentPartner.id]: Math.max(0, prev[currentPartner.id] - 15),
                    }));
                    setQuestionsAsked(prev => prev + 1);
                    setLog(prev => [...prev, `> You hesitate. ${currentPartner.name} frowns.`]);
                    if (questionsAsked + 1 >= maxQuestions) {
                      handleDeliberation();
                    } else {
                      const nextIndex = (currentPartnerIndex + 1) % IC_PARTNERS.length;
                      setCurrentPartnerIndex(nextIndex);
                      setTimeout(() => generateQuestion(), 500);
                    }
                  }}
                  className="w-24"
                />
              </div>
            </div>
          )}

          {phase === 'DELIBERATION' && (
            <div className="text-center py-12">
              <div className="animate-pulse">
                <i className="fas fa-spinner fa-spin text-4xl text-cyan-500 mb-4"></i>
                <div className="text-lg text-slate-300">The committee is deliberating...</div>
                <div className="text-sm text-slate-500 mt-2">Your fate is being decided.</div>
              </div>
            </div>
          )}

          {phase === 'VERDICT' && renderVerdict()}

          {/* Activity log */}
          {phase !== 'VERDICT' && (
            <div className="mt-6">
              <div className="text-xs text-slate-500 mb-1">Meeting Log</div>
              <div className="bg-black border border-slate-800 h-32 overflow-y-auto font-mono text-xs p-2 text-slate-400">
                {log.map((line, i) => (
                  <div key={i} className={i === log.length - 1 ? 'text-white' : ''}>{line}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ICPitchModal;
