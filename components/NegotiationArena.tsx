/**
 * Negotiation Arena
 *
 * Free-form conversation with AI counterparties who have hidden motivations.
 * Players must discover constraints, build rapport, and close deals.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { TerminalButton, TerminalPanel } from './TerminalUI';
import { useHaptic } from '../hooks/useHaptic';
import { getNegotiationResponse } from '../services/geminiService';
import { SAMPLE_COUNTERPARTIES } from '../constants/investmentCommittee';
import type { NegotiationCounterparty, NegotiationState } from '../types/investmentCommittee';
import type { PortfolioCompany } from '../types';

interface NegotiationArenaProps {
  company: PortfolioCompany;
  counterpartyId: string;
  onComplete: (outcome: 'DEAL_CLOSED' | 'WALKED_AWAY' | 'TERMS_REJECTED', agreedTerms?: Record<string, string | number>) => void;
  onClose: () => void;
}

// Suggested opening moves based on counterparty type
const OPENING_MOVES: Record<string, string[]> = {
  FOUNDER_CEO: [
    "I've been following your company for years. Tell me about your vision.",
    "Let's talk about what happens after the deal. What's important to you?",
    "Walk me through how you built this business.",
  ],
  BANKER: [
    "What's the timeline looking like for this process?",
    "Can you walk me through the bid requirements?",
    "Who else is in the process?",
  ],
  LENDER: [
    "What leverage levels are you comfortable with for this deal?",
    "Walk me through your typical covenant package.",
    "What's your appetite for this sector?",
  ],
  RIVAL_PE: [
    "Have you looked at this asset? What do you think?",
    "Is there a world where we work together on this?",
    "What's your read on the seller's motivations?",
  ],
  LP: [
    "Thank you for taking the meeting. I'd like to tell you about our fund.",
    "What's most important to you when evaluating managers?",
    "What's your current allocation to private equity?",
  ],
};

// Quick response templates
const RESPONSE_TEMPLATES = {
  probe: [
    "Tell me more about that.",
    "What do you mean by that specifically?",
    "Help me understand your thinking there.",
    "Can you elaborate on that point?",
  ],
  counter: [
    "I hear you, but have you considered...",
    "That's one way to look at it. Here's another perspective...",
    "I understand your position. What if we...",
  ],
  rapport: [
    "I appreciate you sharing that.",
    "That makes a lot of sense.",
    "I can see why that's important to you.",
  ],
  pressure: [
    "We're running out of time here.",
    "I have other opportunities to consider.",
    "Let's cut to the chase.",
  ],
};

const NegotiationArena: React.FC<NegotiationArenaProps> = ({
  company,
  counterpartyId,
  onComplete,
  onClose,
}) => {
  const { triggerImpact } = useHaptic();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Find counterparty
  const counterparty = SAMPLE_COUNTERPARTIES.find(c => c.id === counterpartyId) || SAMPLE_COUNTERPARTIES[0];

  // State
  const [phase, setPhase] = useState<NegotiationState['phase']>('OPENING');
  const [messages, setMessages] = useState<Array<{ role: 'player' | 'counterparty' | 'system'; text: string }>>([
    { role: 'system', text: `You are meeting with ${counterparty.name} from ${counterparty.company}.` },
    { role: 'counterparty', text: counterparty.visiblePosition },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Tracking
  const [rapportScore, setRapportScore] = useState(50);
  const [tensionLevel, setTensionLevel] = useState(20);
  const [discoveredConstraints, setDiscoveredConstraints] = useState<string[]>([]);
  const [hintsReceived, setHintsReceived] = useState<string[]>([]);
  const [turnsRemaining, setTurnsRemaining] = useState(10);

  // Final terms
  const [proposedTerms, setProposedTerms] = useState<Record<string, string | number>>({
    price: company.currentValuation,
    earnout: 0,
    managementRetention: 'negotiable',
  });

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message
  const handleSendMessage = useCallback(async (message: string) => {
    if (!message.trim() || isLoading) return;

    setIsLoading(true);
    setInputValue('');

    // Add player message
    setMessages(prev => [...prev, { role: 'player', text: message }]);

    try {
      // Get AI response
      const response = await getNegotiationResponse(
        {
          name: counterparty.name,
          type: counterparty.type,
          visiblePosition: counterparty.visiblePosition,
          hiddenConstraints: counterparty.hiddenConstraints,
          personality: counterparty.personality,
        },
        message,
        messages.map(m => `${m.role}: ${m.text}`),
        rapportScore,
        tensionLevel
      );

      // Update state
      setRapportScore(prev => Math.max(0, Math.min(100, prev + response.rapportChange)));
      setTensionLevel(prev => Math.max(0, Math.min(100, prev + response.tensionChange)));

      if (response.hintsDropped.length > 0) {
        setHintsReceived(prev => [...prev, ...response.hintsDropped]);
        setDiscoveredConstraints(prev => [...new Set([...prev, ...response.hintsDropped])]);
        triggerImpact('LIGHT');
      }

      // Add counterparty response
      setMessages(prev => [...prev, { role: 'counterparty', text: response.text }]);

      // Update turns
      setTurnsRemaining(prev => prev - 1);

      // Check for phase transitions
      if (turnsRemaining <= 3) {
        setPhase('CLOSING');
      } else if (turnsRemaining <= 6) {
        setPhase('TERMS');
      } else if (discoveredConstraints.length >= 2) {
        setPhase('DISCOVERY');
      }

      triggerImpact(response.rapportChange > 0 ? 'LIGHT' : 'MEDIUM');
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'counterparty',
        text: "Let me think about that for a moment...",
      }]);
    }

    setIsLoading(false);
  }, [counterparty, messages, rapportScore, tensionLevel, isLoading, turnsRemaining, discoveredConstraints]);

  // Quick action handlers
  const handleQuickProbe = () => {
    const probe = RESPONSE_TEMPLATES.probe[Math.floor(Math.random() * RESPONSE_TEMPLATES.probe.length)];
    handleSendMessage(probe);
  };

  const handleQuickRapport = () => {
    const rapport = RESPONSE_TEMPLATES.rapport[Math.floor(Math.random() * RESPONSE_TEMPLATES.rapport.length)];
    handleSendMessage(rapport);
  };

  const handleQuickPressure = () => {
    const pressure = RESPONSE_TEMPLATES.pressure[Math.floor(Math.random() * RESPONSE_TEMPLATES.pressure.length)];
    handleSendMessage(pressure);
  };

  // Make offer
  const handleMakeOffer = () => {
    const offerMessage = `Let me make you an offer: ${formatTerms(proposedTerms)}`;
    handleSendMessage(offerMessage);
  };

  // Format terms for display
  const formatTerms = (terms: Record<string, string | number>) => {
    return Object.entries(terms)
      .map(([key, value]) => {
        if (key === 'price') return `$${((value as number) / 1000000).toFixed(1)}M purchase price`;
        if (key === 'earnout') return value ? `${value}% earnout` : 'no earnout';
        return `${key}: ${value}`;
      })
      .join(', ');
  };

  // Walk away
  const handleWalkAway = () => {
    triggerImpact('HEAVY');
    setMessages(prev => [...prev, {
      role: 'system',
      text: 'You stand up and end the negotiation.',
    }]);
    setTimeout(() => onComplete('WALKED_AWAY'), 1500);
  };

  // Close deal
  const handleCloseDeal = () => {
    if (rapportScore < 40) {
      setMessages(prev => [...prev, {
        role: 'counterparty',
        text: "I don't think we're quite there yet. We need to build more trust.",
      }]);
      return;
    }

    triggerImpact('MEDIUM');
    setMessages(prev => [...prev, {
      role: 'system',
      text: 'You shake hands on the deal.',
    }]);
    setTimeout(() => onComplete('DEAL_CLOSED', proposedTerms), 1500);
  };

  // Render rapport/tension meters
  const renderMeters = () => (
    <div className="flex gap-6 mb-4">
      <div className="flex-1">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-400">Rapport</span>
          <span className={rapportScore > 60 ? 'text-green-400' : rapportScore > 40 ? 'text-yellow-400' : 'text-red-400'}>
            {rapportScore}%
          </span>
        </div>
        <div className="h-2 bg-slate-800 rounded overflow-hidden">
          <div
            className={`h-full transition-all ${
              rapportScore > 60 ? 'bg-green-500' : rapportScore > 40 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${rapportScore}%` }}
          />
        </div>
      </div>
      <div className="flex-1">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-400">Tension</span>
          <span className={tensionLevel < 40 ? 'text-green-400' : tensionLevel < 70 ? 'text-yellow-400' : 'text-red-400'}>
            {tensionLevel}%
          </span>
        </div>
        <div className="h-2 bg-slate-800 rounded overflow-hidden">
          <div
            className={`h-full transition-all ${
              tensionLevel < 40 ? 'bg-green-500' : tensionLevel < 70 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${tensionLevel}%` }}
          />
        </div>
      </div>
    </div>
  );

  // Render discovered intel
  const renderIntel = () => (
    <div className="bg-slate-800/50 p-3 rounded mb-4">
      <div className="text-xs text-slate-400 mb-2">
        <i className="fas fa-eye mr-1"></i>
        Intel Gathered ({discoveredConstraints.length})
      </div>
      {discoveredConstraints.length === 0 ? (
        <div className="text-xs text-slate-500 italic">No intel yet. Keep probing...</div>
      ) : (
        <div className="space-y-1">
          {discoveredConstraints.map((constraint, i) => (
            <div key={i} className="text-xs text-cyan-400">
              <i className="fas fa-check mr-1"></i>
              {constraint}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col border-2 border-purple-500 bg-slate-900 shadow-[0_0_50px_rgba(168,85,247,0.2)]">
        {/* Header */}
        <div className="bg-purple-900 text-purple-100 px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <i className={`fas ${counterparty.avatar} text-lg`}></i>
            <div>
              <span className="font-bold">{counterparty.name}</span>
              <span className="text-purple-300 text-sm ml-2">({counterparty.company})</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm px-2 py-1 bg-purple-800 rounded">{phase}</span>
            <span className="text-sm">Turns: {turnsRemaining}</span>
            <button onClick={onClose} className="text-purple-300 hover:text-white">
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col overflow-hidden">
          {/* Meters */}
          {renderMeters()}

          {/* Intel panel */}
          {renderIntel()}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-3 mb-4 min-h-[200px]">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'player' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-lg ${
                    msg.role === 'player'
                      ? 'bg-purple-600 text-white'
                      : msg.role === 'counterparty'
                        ? 'bg-slate-700 text-slate-200'
                        : 'bg-slate-800 text-slate-400 italic text-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-700 text-slate-400 px-4 py-2 rounded-lg">
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  {counterparty.name} is thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick actions */}
          <div className="flex gap-2 mb-3 flex-wrap">
            <button
              onClick={handleQuickProbe}
              className="px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 rounded text-slate-300"
              disabled={isLoading}
            >
              <i className="fas fa-search mr-1"></i> Probe
            </button>
            <button
              onClick={handleQuickRapport}
              className="px-3 py-1 text-xs bg-green-900 hover:bg-green-800 rounded text-green-300"
              disabled={isLoading}
            >
              <i className="fas fa-heart mr-1"></i> Build Rapport
            </button>
            <button
              onClick={handleQuickPressure}
              className="px-3 py-1 text-xs bg-red-900 hover:bg-red-800 rounded text-red-300"
              disabled={isLoading}
            >
              <i className="fas fa-bolt mr-1"></i> Pressure
            </button>
            <button
              onClick={handleMakeOffer}
              className="px-3 py-1 text-xs bg-purple-900 hover:bg-purple-800 rounded text-purple-300"
              disabled={isLoading}
            >
              <i className="fas fa-handshake mr-1"></i> Make Offer
            </button>
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
              placeholder="Type your response..."
              className="flex-1 bg-black border border-slate-700 px-3 py-2 text-slate-200 rounded focus:border-purple-500 focus:outline-none"
              disabled={isLoading}
            />
            <TerminalButton
              variant="primary"
              label="Send"
              onClick={() => handleSendMessage(inputValue)}
              disabled={isLoading || !inputValue.trim()}
            />
          </div>

          {/* End negotiation buttons */}
          <div className="flex gap-2 mt-4">
            <TerminalButton
              variant="danger"
              label="Walk Away"
              onClick={handleWalkAway}
              className="flex-1"
            />
            <TerminalButton
              variant="primary"
              label="Close Deal"
              onClick={handleCloseDeal}
              className="flex-1"
              disabled={rapportScore < 40 || phase !== 'CLOSING'}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NegotiationArena;
