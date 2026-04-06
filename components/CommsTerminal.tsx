
import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { ChatMessage, NPC } from '../types';
import { useGame } from '../contexts/GameContext';
import { isGeminiApiConfigured } from '../services/geminiService';
import { renderMarkdown } from '../utils/renderMarkdown';

interface CommsTerminalProps {
  npcList: NPC[];
  advisorMessages: ChatMessage[];
  onSendMessageToAdvisor: (msg: string) => void;
  onSendMessageToNPC: (npcId: string, msg: string) => Promise<void>;
  onReviewModel?: () => void; // New prop
  isLoadingAdvisor: boolean;
  predefinedQuestions: string[];
  isOpen?: boolean; // Prop to control visibility from parent (mobile tab)
  onClose?: () => void;
  onOpen?: () => void;
  mode?: 'DESKTOP_OVERLAY' | 'MOBILE_EMBED';
  selectedNpcId?: string;
  onBackToPortfolio?: () => void;
}

const CommsTerminal: React.FC<CommsTerminalProps> = ({
    npcList,
    advisorMessages,
    onSendMessageToAdvisor, 
    onSendMessageToNPC,
    onReviewModel,
    isLoadingAdvisor,
    predefinedQuestions,
    isOpen: propIsOpen,
    onClose: propOnClose,
    onOpen: propOnOpen,
    mode = 'DESKTOP_OVERLAY',
    selectedNpcId,
    onBackToPortfolio
}) => {
  const { tutorialStep, setTutorialStep, playerStats, activeScenario } = useGame();
  const [internalIsOpen, setInternalIsOpen] = useState(propIsOpen ?? false);
  const [activeTab, setActiveTab] = useState<'ADVISOR' | string>('ADVISOR');
  const [input, setInput] = useState('');
  const [loadingNpcs, setLoadingNpcs] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const [dragPosition, setDragPosition] = useState({ x: 24, y: 24 });

  // Sync internal state with prop if provided, otherwise manage internally
  const isControlled = propIsOpen !== undefined;
  const isOpen = isControlled ? propIsOpen! : internalIsOpen;

  useEffect(() => {
      if (propIsOpen !== undefined) {
          setInternalIsOpen(propIsOpen);
      }
  }, [propIsOpen]);

  const openTerminal = () => {
      propOnOpen?.();
      if (!isControlled) {
          setInternalIsOpen(true);
      }
  };

  const closeTerminal = () => {
      propOnClose?.();
      if (!isControlled) {
          setInternalIsOpen(false);
      }
  };

  // Auto-open terminal on tutorial step 4
  useEffect(() => {
      if (tutorialStep === 4 && !isOpen) {
          openTerminal();
      }
  }, [tutorialStep, isOpen]);

  // Sync activeTab with selectedNpcId prop and auto-open if closed
  useEffect(() => {
    if (selectedNpcId) {
        if (selectedNpcId === 'advisor') {
            setActiveTab('ADVISOR');
        } else {
            setActiveTab(selectedNpcId);
        }
        // Auto-open the terminal when an NPC is selected (e.g. from COMMS sidebar)
        if (!isOpen) {
            openTerminal();
        }
    }
  }, [selectedNpcId]);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior,
      });
      return;
    }
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  const describeMood = (value: number) => {
      if (value >= 75) return 'Warm';
      if (value >= 55) return 'Open';
      if (value >= 35) return 'Guarded';
      if (value >= 15) return 'Icy';
      return 'Hostile';
  };

  const describeTrust = (value: number) => {
      if (value >= 80) return 'Steady';
      if (value >= 60) return 'Optimistic';
      if (value >= 40) return 'Uneasy';
      if (value >= 20) return 'Skeptical';
      return 'Doubtful';
  };

  const currentDayType = playerStats?.currentDayType || 'WEEKDAY';
  const currentTimeSlot = playerStats?.currentTimeSlot || 'MORNING';
  const npcAvailable = (npc?: NPC) => {
      if (!npc || !npc.schedule) return true;
      const slots = currentDayType === 'WEEKDAY' ? npc.schedule.weekday : npc.schedule.weekend;
      return slots.includes(currentTimeSlot);
  };

  const [sendError, setSendError] = useState<string | null>(null);

  const handleSend = async () => {
      if (!input.trim()) return;
      setSendError(null);

      if (activeTab === 'ADVISOR') {
          onSendMessageToAdvisor(input);
      } else {
          setLoadingNpcs(prev => ({ ...prev, [activeTab]: true }));
          try {
              await onSendMessageToNPC(activeTab, input);
          } catch (err: unknown) {
              const message = err instanceof Error ? err.message : 'Failed to send message';
              setSendError(message);
          } finally {
              setLoadingNpcs(prev => ({ ...prev, [activeTab]: false }));
          }
      }
      setInput('');
  };

  const handleQuickResponse = async (response: string) => {
      if (activeTab === 'ADVISOR') {
          onSendMessageToAdvisor(response);
      } else {
          setLoadingNpcs(prev => ({ ...prev, [activeTab]: true }));
          try {
              await onSendMessageToNPC(activeTab, response);
          } catch (err: unknown) {
              const message = err instanceof Error ? err.message : 'Failed to send message';
              setSendError(message);
          } finally {
              setLoadingNpcs(prev => ({ ...prev, [activeTab]: false }));
          }
          // TUTORIAL RAIL: Step 5 Complete
          if (tutorialStep === 5 && response.toLowerCase().includes("patent")) {
               setTutorialStep(6);
          }
      }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend();
  };

  useEffect(() => {
      if (mode !== 'DESKTOP_OVERLAY') return;
      const defaultX = Math.max(16, window.innerWidth - 640);
      const defaultY = Math.max(16, window.innerHeight - 520);
      setDragPosition({ x: defaultX, y: defaultY });
  }, [mode]);

  const handleDragMove = (clientX: number, clientY: number) => {
      const nextX = Math.min(window.innerWidth - 280, Math.max(8, clientX - dragOffset.current.x));
      const nextY = Math.min(window.innerHeight - 200, Math.max(8, clientY - dragOffset.current.y));
      setDragPosition({ x: nextX, y: nextY });
  };

  const mouseMoveHandler = (e: MouseEvent) => {
      if (!isDragging.current) return;
      handleDragMove(e.clientX, e.clientY);
  };

  const touchMoveHandler = (e: TouchEvent) => {
      if (!isDragging.current) return;
      const touch = e.touches[0];
      handleDragMove(touch.clientX, touch.clientY);
  };

  const mouseUpHandler = () => stopDragging();

  const stopDragging = () => {
      isDragging.current = false;
      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpHandler);
      document.removeEventListener('touchmove', touchMoveHandler);
      document.removeEventListener('touchend', mouseUpHandler);
  };

  const handleDragStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
      if (mode !== 'DESKTOP_OVERLAY') return;
      isDragging.current = true;
      const point = 'touches' in e ? e.touches[0] : e;
      dragOffset.current = {
          x: point.clientX - dragPosition.x,
          y: point.clientY - dragPosition.y,
      };
      document.addEventListener('mousemove', mouseMoveHandler);
      document.addEventListener('mouseup', mouseUpHandler);
      document.addEventListener('touchmove', touchMoveHandler);
      document.addEventListener('touchend', mouseUpHandler);
  };

  useEffect(() => {
      return () => stopDragging();
  }, []);

  // TUTORIAL: Force Sarah Chat
  useEffect(() => {
      if (tutorialStep === 5 && activeTab !== 'sarah') {
          setActiveTab('sarah');
      }
  }, [tutorialStep, activeTab]);

  // Compute activeNPC before useMemo so it can be in the dependency array
  const activeNPC = npcList.find(n => n.id === activeTab);

  // IMPORTANT: useMemo must be called before any early returns to avoid React hooks violation
  const npcQuickResponses = useMemo(() => {
      if (!playerStats) return ["Any updates on the deal?", "Just checking in."];
      const base: string[] = [];

      const targetCompany = playerStats.portfolio.find(p => !p.isAnalyzed) || playerStats.portfolio?.[0];
      if (targetCompany) {
          base.push(`Pressure test ${targetCompany.name}`);
      }

      if (activeScenario && activeScenario.title) {
          base.push(`React to: ${activeScenario.title}`);
      }

      if (playerStats.loanBalance > 0) {
          base.push('Help me refinance debt');
      }

      if (activeNPC?.role.includes('Analyst') && targetCompany) {
          base.push(`Check the patent on ${targetCompany.name}`);
      }

      if (base.length < 4) {
          base.push('Run gossip scan', 'Where are we weak right now?');
      }

      return Array.from(new Set(base)).slice(0, 5);
  }, [playerStats, activeScenario, activeNPC]);

  const advisorQuickPrompts = useMemo(() => {
      if (!playerStats) return predefinedQuestions;

      const prompts = [...predefinedQuestions];
      const focalCompany = playerStats.portfolio?.[0];

      if (activeScenario?.title) {
          prompts.push(`Interrogate me on this scenario: ${activeScenario.title}`);
      }

      if (focalCompany) {
          prompts.push(`Give me a sarcastic 90-second memo on ${focalCompany.name}`);
      }

      if (playerStats.loanBalance > 0) {
          prompts.push('Roast my debt stack and give me a refinance plan');
      }

      prompts.push('Run a hostile IC interview: ask me 3 rapid-fire questions');
      prompts.push('Teach me one PE concept with a joke I will never forget');

      return Array.from(new Set(prompts)).slice(0, 8);
  }, [playerStats, activeScenario, predefinedQuestions]);

  // If in desktop mode and closed, show the launcher button
  if (!isOpen && mode === 'DESKTOP_OVERLAY') {
    return (
        <button
         onClick={openTerminal}
         className={`fixed bottom-6 right-6 bg-amber-500 text-black font-mono text-sm py-3 px-4 shadow-[0_0_15px_rgba(245,158,11,0.5)] z-40 flex items-center space-x-2 transition-transform duration-200 hover:scale-105 hover:bg-amber-400 rounded-md ${tutorialStep === 4 ? 'z-[100] animate-bounce ring-2 ring-white' : ''}`}
        >
          <div className="relative">
             <i className="fas fa-terminal animate-pulse"></i>
          </div>
          <span className="font-bold tracking-widest">IB_CHAT // CONNECT</span>
        </button>
    )
  }

  // If in desktop mode and closed, but not using launcher logic (e.g. controlled externally), return null
  if (!isOpen && mode !== 'DESKTOP_OVERLAY') return null;

  const activeMessages = activeTab === 'ADVISOR'
    ? advisorMessages
    : npcList.find(n => n.id === activeTab)?.dialogueHistory || [];

  // activeNPC is now defined above (before early returns) to satisfy hooks rules
  const isNpcLoading = activeTab !== 'ADVISOR' && loadingNpcs[activeTab];

  useEffect(() => {
      scrollToBottom('auto');
  }, [activeTab]);

  useEffect(() => {
      scrollToBottom();
  }, [activeMessages.length, isNpcLoading]);

  // Styling logic based on mode
  // CommsTerminal should always float above content panels (z-[150] > z-[100] for tutorial panels)
  const containerClasses = mode === 'MOBILE_EMBED'
      ? "w-full h-full min-h-0 flex flex-col bg-slate-900"
      : `fixed w-[90vw] md:w-[600px] md:max-w-[calc(100vw-520px)] h-[70vh] max-h-[calc(100vh-120px)] min-h-0 flex flex-col bg-slate-900 rounded-sm shadow-[0_0_40px_rgba(0,0,0,0.8)] z-[150] border border-slate-700 overflow-hidden font-mono text-sm ${tutorialStep === 5 ? 'ring-2 ring-amber-500' : ''}`;

  const containerStyle = mode === 'DESKTOP_OVERLAY'
      ? { top: dragPosition.y, left: dragPosition.x }
      : undefined;

  return (
    <div
        className={containerClasses}
        style={containerStyle}
        data-testid="comms-root"
    >
        {/* Terminal Header - Only show in Overlay mode */}
        {mode === 'DESKTOP_OVERLAY' && (
            <div
              className="bg-slate-800 p-2 flex justify-between items-center border-b border-amber-500/30 handle cursor-move"
              onMouseDown={handleDragStart}
              onTouchStart={handleDragStart}
            >
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-amber-500 font-bold ml-2 tracking-widest">BLOOMBERG_IB :: {activeTab === 'ADVISOR' ? 'SECURE_CHANNEL' : activeTab.toUpperCase()}</span>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => {
                            setActiveTab('ADVISOR');
                            onSendMessageToAdvisor("I'm stuck. Tell me my next move in this scenario.");
                        }}
                        className="hidden md:inline-flex items-center px-3 py-1 text-[11px] uppercase tracking-widest bg-amber-500 text-black font-bold rounded-sm shadow hover:bg-amber-400"
                    >
                        <i className="fas fa-life-ring mr-2"></i>
                        Help (Machiavelli)
                    </button>
                    <button
                        onClick={() => { onBackToPortfolio?.(); closeTerminal(); }}
                        className="text-slate-800 bg-amber-300 hover:bg-amber-200 font-bold px-3 py-1 rounded-sm uppercase text-[10px] tracking-widest"
                    >
                        Back to Portfolio
                    </button>
                    <button onClick={closeTerminal} className="text-slate-500 hover:text-amber-500" title="Minimize chat">
                        <i className="fas fa-minus"></i>
                    </button>
                </div>
            </div>
        )}

        <div className="flex flex-1 min-h-0 overflow-hidden" data-testid="comms-layout">
            {/* Sidebar (Contacts) */}
            <div
                className={`${mode === 'MOBILE_EMBED' ? 'w-16 md:w-48' : 'w-48'} bg-slate-950 border-r border-slate-800 flex min-h-0 flex-col ${tutorialStep === 4 ? 'relative z-[80]' : ''}`}
                data-testid="comms-sidebar"
            >
                <div className="p-2 text-xs text-slate-500 uppercase tracking-wider font-bold border-b border-slate-800 bg-slate-900 hidden md:block">
                    Contacts
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto">
                    <button 
                        onClick={() => setActiveTab('ADVISOR')}
                        title="Machiavelli - Advisor (AI)"
                        className={`w-full text-left p-3 flex items-center space-x-3 transition-colors border-l-4 ${activeTab === 'ADVISOR' ? 'bg-amber-900/30 border-amber-400 text-amber-300 shadow-inner' : 'border-transparent text-slate-200 hover:bg-slate-900 hover:text-white'}`}
                    >
                        <i className="fas fa-user-tie text-lg"></i>
                        <div className="flex-1 min-w-0 hidden md:block">
                            <span className="font-bold block leading-tight">Machiavelli</span>
                            <span className="text-[10px] opacity-70 leading-tight">Advisor (AI)</span>
                        </div>
                    </button>
                    
                    {npcList.map(npc => {
                        // TUTORIAL RAIL: Step 4 highlights Sarah
                        const isTutorialTarget = tutorialStep === 4 && npc.id === 'sarah';
                        const isCold = (npc.mood ?? 50) < 30 || (npc.trust ?? 50) < 30;
                        const isAvailable = npcAvailable(npc);
                        return (
                        <button
                            key={npc.id}
                            title={`${npc.name} - ${npc.role}`}
                            onClick={() => {
                                setActiveTab(npc.id);
                                if (tutorialStep === 4) setTutorialStep(5);
                            }}
                            className={`
                                w-full text-left p-3 flex items-center space-x-3 transition-colors border-l-4 relative
                                ${activeTab === npc.id ? 'bg-blue-900/30 border-blue-400 text-blue-200 shadow-inner' : 'border-transparent text-slate-200 hover:bg-slate-900 hover:text-white'}
                                ${isTutorialTarget ? 'z-[100] bg-amber-900/40 border-amber-400 ring-2 ring-amber-400 animate-pulse shadow-[0_0_20px_rgba(251,191,36,0.5)]' : ''}
                            `}
                        >
                            <div className="relative">
                              <i className={`fas ${npc.avatar} ${npc.isRival ? 'text-red-500' : isTutorialTarget ? 'text-amber-400' : 'text-slate-500'} text-lg`}></i>
                              <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-slate-950 ${isAvailable ? 'bg-emerald-400' : 'bg-slate-600'}`} title={isAvailable ? 'Available' : 'Off-hours'}></span>
                            </div>
                            <div className="flex-1 min-w-0 hidden md:block">
                                <span className={`font-bold block leading-tight ${isTutorialTarget ? 'text-amber-200' : ''}`} title={npc.name}>{npc.name}</span>
                                <span className="text-[10px] opacity-70 block leading-tight whitespace-normal break-words" title={npc.role}>{npc.role}</span>
                                <span className="text-[10px] text-slate-500 block leading-tight whitespace-normal break-words" title={`Mood: ${describeMood(npc.mood ?? 50)} • Trust: ${describeTrust(npc.trust ?? 50)}`}>Mood: {describeMood(npc.mood ?? 50)} • Trust: {describeTrust(npc.trust ?? 50)}</span>
                                <span className={`text-[9px] uppercase block ${isAvailable ? 'text-emerald-400' : 'text-slate-400'}`} title={!isAvailable && npc.schedule?.unavailableReason ? npc.schedule.unavailableReason : undefined}>
                                    {isAvailable ? 'Available' : 'Off-hours'}
                                </span>
                            </div>
                            {isCold && !isTutorialTarget && <i className="fas fa-circle-exclamation text-red-500 text-[10px] absolute top-1 right-1"></i>}
                            {isTutorialTarget && (
                              <div className="absolute -right-2 top-1/2 -translate-y-1/2 bg-amber-500 text-black text-[10px] font-bold px-2 py-1 rounded-l animate-bounce z-[101]">
                                <i className="fas fa-arrow-left mr-1"></i>
                                CLICK
                              </div>
                            )}
                        </button>
                    )})}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 min-h-0 flex flex-col bg-slate-900" data-testid="comms-chat-area">
                {/* Chat Header Info */}
                <div
                    className="shrink-0 p-3 border-b border-slate-800 bg-slate-900/95 flex justify-between items-center backdrop-blur-sm min-h-[4.5rem]"
                    data-testid="comms-header"
                >
                    <div>
                        <span className="font-bold text-slate-200 block truncate" title={activeTab === 'ADVISOR' ? 'Machiavelli (Advisor)' : activeNPC?.name}>
                            {activeTab === 'ADVISOR' ? 'Machiavelli (Advisor)' : activeNPC?.name}
                        </span>
                        {activeTab !== 'ADVISOR' && activeNPC && (
                            <div className="flex flex-wrap gap-1.5 mt-1 text-[10px] text-slate-400">
                                <span className="px-1.5 py-0.5 border border-slate-700 bg-slate-950/70 rounded-sm uppercase tracking-wider">
                                    {describeMood(activeNPC.mood ?? 50)}
                                </span>
                                <span className="px-1.5 py-0.5 border border-slate-700 bg-slate-950/70 rounded-sm uppercase tracking-wider">
                                    Trust: {describeTrust(activeNPC.trust ?? 50)}
                                </span>
                                <span className="px-1.5 py-0.5 border border-slate-700 bg-slate-950/70 rounded-sm uppercase tracking-wider">
                                    Rel: {activeNPC.relationship}/100
                                </span>
                                <span className={`px-1.5 py-0.5 border rounded-sm uppercase tracking-wider ${npcAvailable(activeNPC) ? 'border-emerald-700 text-emerald-400' : 'border-slate-700'}`}>
                                    {npcAvailable(activeNPC) ? 'Available' : 'Off-hours'}
                                </span>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => { onBackToPortfolio?.(); closeTerminal(); }}
                        className="md:hidden text-[11px] uppercase tracking-wider bg-amber-500 text-black font-bold px-3 py-1 rounded-sm shadow hover:bg-amber-400"
                    >
                        Back to Portfolio
                    </button>
                </div>

                {/* Messages */}
                <div
                    ref={messagesContainerRef}
                    className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 custom-scrollbar scroll-smooth"
                    style={{ WebkitOverflowScrolling: 'touch' }}
                    data-testid="comms-messages"
                >
                    {activeMessages.map((msg, index) => {
                        const isPlayer = msg.sender === 'player';
                        const isSystem = msg.sender === 'system';
                        
                        if (isSystem) {
                            return (
                                <div key={index} className="w-full flex justify-center my-2">
                                    <div className="text-[10px] text-slate-500 border border-slate-800 bg-black/20 px-3 py-1 rounded font-mono italic text-center max-w-[80%]">
                                        <i className="fas fa-terminal mr-2 text-xs"></i>
                                        {msg.text}
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div key={index} className={`flex w-full mb-4 ${isPlayer ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex max-w-[85%] ${isPlayer ? 'flex-row-reverse' : 'flex-row'} items-end gap-3`}>
                                    
                                    {/* Avatar Bubble */}
                                    <div className={`
                                        w-8 h-8 rounded-full flex items-center justify-center shrink-0 border shadow-sm
                                        ${isPlayer 
                                            ? 'bg-blue-700 border-blue-500 text-white' 
                                            : activeTab === 'ADVISOR' 
                                                ? 'bg-amber-950 border-amber-600 text-amber-500'
                                                : 'bg-slate-800 border-slate-600 text-slate-400'
                                        }
                                    `}>
                                        <i className={`fas ${
                                            isPlayer 
                                                ? 'fa-user' 
                                                : activeTab === 'ADVISOR' 
                                                    ? 'fa-user-tie' 
                                                    : activeNPC?.avatar || 'fa-user'
                                        } text-xs`}></i>
                                    </div>

                                    {/* Message Bubble */}
                                    <div className={`
                                        px-4 py-3 rounded-xl text-sm shadow-md border relative group min-w-0
                                        ${isPlayer
                                            ? 'bg-blue-700 border-blue-500 text-white rounded-br-none'
                                            : activeTab === 'ADVISOR'
                                                ? 'bg-amber-950/80 border-amber-800/60 text-amber-100 rounded-bl-none'
                                                : 'bg-slate-800 border-slate-700 text-slate-200 rounded-bl-none'
                                        }
                                    `}>
                                        {/* Optional Name Header for NPCs */}
                                        {!isPlayer && (
                                            <div className={`text-[9px] font-bold uppercase tracking-wider mb-1 ${
                                                activeTab === 'ADVISOR' ? 'text-amber-600' : 'text-slate-500'
                                            }`}>
                                                {msg.senderName || (activeTab === 'ADVISOR' ? 'Machiavelli' : activeNPC?.name)}
                                            </div>
                                        )}
                                        
                                        <div
                                            className="leading-relaxed whitespace-pre-wrap break-words max-w-full"
                                            style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}
                                        >
                                            {renderMarkdown(msg.text)}
                                        </div>

                                        {/* Timestamp */}
                                        <div className={`text-[9px] mt-1.5 ${isPlayer ? 'text-blue-300/60' : 'text-slate-500'}`}>
                                            {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {(isNpcLoading) && (
                         <div className="flex items-center space-x-2 text-slate-500 text-xs animate-pulse ml-12">
                            <i className="fas fa-pen"></i>
                            <span>{activeNPC?.name} is typing...</span>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area (Sticky Bottom) */}
                <div
                    className="shrink-0 p-2 md:p-3 border-t border-slate-800 bg-slate-900/95 backdrop-blur-sm pb-[max(0.5rem,env(safe-area-inset-bottom))]"
                    data-testid="comms-composer"
                >
                    {/* Quick Responses */}
                    <div className="flex overflow-x-auto gap-3 mb-3 pb-1 no-scrollbar">
                         {activeTab === 'ADVISOR' ? (
                            advisorQuickPrompts.map((q) => (
                                <button
                                    key={q}
                                    onClick={() => handleQuickResponse(q)}
                                    className="bg-amber-900/40 hover:bg-amber-800 text-amber-200 border border-amber-700 text-[11px] px-4 py-3 rounded-md transition-all whitespace-nowrap uppercase tracking-wider font-extrabold shadow"
                                >
                                    {q}
                                </button>
                            ))
                         ) : (
                             (tutorialStep === 5 && activeTab === 'sarah') ? (
                                <button
                                    onClick={() => handleQuickResponse("Check the patent")}
                                    className="bg-amber-500 text-black border border-amber-600 text-[11px] px-4 py-3 rounded transition-all whitespace-nowrap font-bold animate-pulse shadow-lg"
                                >
                                    Check the patent
                                </button>
                             ) : (
                                 npcQuickResponses.map((q) => (
                                    <button
                                        key={q}
                                        onClick={() => handleQuickResponse(q)}
                                        className="bg-blue-900/40 hover:bg-blue-800 text-blue-100 border border-blue-700 text-[11px] px-4 py-3 rounded-md transition-all whitespace-nowrap font-bold shadow"
                                    >
                                        {q}
                                    </button>
                                 ))
                             )
                         )}
                    </div>
                    {activeTab !== 'ADVISOR' && (
                        <div className="text-[10px] text-slate-500 mb-2 uppercase tracking-wide">
                            {isGeminiApiConfigured()
                                ? "AI-driven replies adapt to your stats, debt, and the current case file. Toss sharper prompts for spicier intel."
                                : "NPCs use scripted responses. Type a message to interact."
                            }
                        </div>
                    )}

                    {sendError && (
                        <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded px-3 py-1.5 mb-2 flex items-center gap-2">
                            <i className="fas fa-exclamation-circle"></i>
                            <span>{sendError}</span>
                            <button onClick={() => setSendError(null)} className="ml-auto text-red-400 hover:text-red-300"><i className="fas fa-times"></i></button>
                        </div>
                    )}
                    <div className="flex space-x-2">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type message..."
                                className="w-full bg-slate-950 border-2 border-slate-700 text-slate-200 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400 transition-all font-mono"
                                disabled={isLoadingAdvisor && activeTab === 'ADVISOR'}
                            />
                        </div>
                        <button
                            onClick={handleSend}
                            disabled={(isLoadingAdvisor && activeTab === 'ADVISOR') || input.trim().length === 0}
                            className="bg-amber-500 hover:bg-amber-400 text-black w-16 flex items-center justify-center rounded-sm shadow-sm disabled:bg-slate-800 disabled:text-slate-400 transition-all font-bold"
                        >
                            <i className="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <style>{`
            .custom-scrollbar::-webkit-scrollbar {
                width: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
                background: #0f172a; 
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
                background: #334155; 
                border-radius: 0;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: #475569; 
            }
        `}</style>
    </div>
  );
};
export default CommsTerminal;
