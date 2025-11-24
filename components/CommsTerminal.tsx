
import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, NPC } from '../types';
import { useGame } from '../context/GameContext';

interface CommsTerminalProps {
  npcList: NPC[];
  advisorMessages: ChatMessage[];
  onSendMessageToAdvisor: (msg: string) => void;
  onSendMessageToNPC: (npcId: string, msg: string) => void;
  onReviewModel?: () => void; // New prop
  isLoadingAdvisor: boolean;
  predefinedQuestions: string[];
  isOpen?: boolean; // Prop to control visibility from parent (mobile tab)
  onClose?: () => void;
  mode?: 'DESKTOP_OVERLAY' | 'MOBILE_EMBED';
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
    mode = 'DESKTOP_OVERLAY'
}) => {
  const { tutorialStep, setTutorialStep } = useGame();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'ADVISOR' | string>('ADVISOR'); 
  const [input, setInput] = useState('');
  const [loadingNpcs, setLoadingNpcs] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync internal state with prop if provided, otherwise manage internally
  const isOpen = propIsOpen !== undefined ? propIsOpen : internalIsOpen;
  const setIsOpen = propOnClose || setInternalIsOpen;

  // Auto-open terminal on tutorial step 4
  useEffect(() => {
      if (tutorialStep === 4 && !isOpen) {
          setIsOpen(true);
      }
  }, [tutorialStep, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [activeTab, advisorMessages, npcList]);

  const handleSend = () => {
      if (!input.trim()) return;

      if (activeTab === 'ADVISOR') {
          onSendMessageToAdvisor(input);
      } else {
          setLoadingNpcs(prev => ({ ...prev, [activeTab]: true }));
          onSendMessageToNPC(activeTab, input);
          setTimeout(() => setLoadingNpcs(prev => ({ ...prev, [activeTab]: false })), 2000); 
      }
      setInput('');
  };

  const handleQuickResponse = (response: string) => {
      if (activeTab === 'ADVISOR') {
          onSendMessageToAdvisor(response);
      } else {
          setLoadingNpcs(prev => ({ ...prev, [activeTab]: true }));
          onSendMessageToNPC(activeTab, response);
          setTimeout(() => {
              setLoadingNpcs(prev => ({ ...prev, [activeTab]: false }));
              // TUTORIAL RAIL: Step 5 Complete
              if (tutorialStep === 5 && response === "Check the patent") {
                   setTutorialStep(6);
              }
          }, 2000);
      }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend();
  };

  // TUTORIAL: Force Sarah Chat
  useEffect(() => {
      if (tutorialStep === 5 && activeTab !== 'sarah') {
          setActiveTab('sarah');
      }
  }, [tutorialStep, activeTab]);

  // If in desktop mode and closed, show the launcher button
  if (!isOpen && mode === 'DESKTOP_OVERLAY') {
    return (
        <button 
         onClick={() => setIsOpen(true)}
         className={`fixed bottom-6 right-6 bg-slate-900 border-2 border-amber-500 text-amber-500 font-mono text-sm py-2 px-4 shadow-[0_0_15px_rgba(245,158,11,0.5)] z-40 flex items-center space-x-2 transition-transform duration-200 hover:scale-105 hover:bg-slate-800 ${tutorialStep === 4 ? 'z-[60] animate-bounce ring-2 ring-white' : ''}`}
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

  const activeNPC = npcList.find(n => n.id === activeTab);
  const isNpcLoading = activeTab !== 'ADVISOR' && loadingNpcs[activeTab];

  // Generic Quick Responses for NPCs
  const npcQuickResponses = [
      "Let's grab lunch.",
      "Any updates on the deal?",
      "I need a favor.",
      "Just checking in."
  ];

  // Styling logic based on mode
  const containerClasses = mode === 'MOBILE_EMBED'
      ? "w-full h-full flex flex-col bg-slate-900"
      : `fixed bottom-6 right-6 w-[90vw] md:w-[600px] h-[70vh] flex flex-col bg-slate-900 rounded-sm shadow-[0_0_40px_rgba(0,0,0,0.8)] z-50 border border-slate-700 overflow-hidden font-mono text-sm ${tutorialStep === 5 ? 'z-[60] ring-2 ring-amber-500' : ''}`;

  return (
    <div className={containerClasses}>
        {/* Terminal Header - Only show in Overlay mode */}
        {mode === 'DESKTOP_OVERLAY' && (
            <div className="bg-slate-800 p-2 flex justify-between items-center border-b border-amber-500/30 handle cursor-move">
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-amber-500 font-bold ml-2 tracking-widest">BLOOMBERG_IB :: {activeTab === 'ADVISOR' ? 'SECURE_CHANNEL' : activeTab.toUpperCase()}</span>
                </div>
                <button onClick={() => { if(propOnClose) propOnClose(); else setInternalIsOpen(false); }} className="text-slate-500 hover:text-amber-500">
                    <i className="fas fa-times"></i>
                </button>
            </div>
        )}

        <div className="flex flex-1 overflow-hidden">
            {/* Sidebar (Contacts) */}
            <div className={`${mode === 'MOBILE_EMBED' ? 'w-16 md:w-48' : 'w-48'} bg-slate-950 border-r border-slate-800 flex flex-col`}>
                <div className="p-2 text-xs text-slate-500 uppercase tracking-wider font-bold border-b border-slate-800 bg-slate-900 hidden md:block">
                    Contacts
                </div>
                <div className="flex-1 overflow-y-auto">
                    <button 
                        onClick={() => setActiveTab('ADVISOR')}
                        className={`w-full text-left p-3 flex items-center space-x-3 transition-colors border-l-2 ${activeTab === 'ADVISOR' ? 'bg-slate-800 border-amber-500 text-amber-500' : 'border-transparent text-slate-400 hover:bg-slate-900 hover:text-slate-200'}`}
                    >
                        <i className="fas fa-user-tie text-lg"></i>
                        <div className="flex-1 truncate hidden md:block">
                            <span className="font-bold block">Machiavelli</span>
                            <span className="text-[10px] opacity-70">Advisor (AI)</span>
                        </div>
                    </button>
                    
                    {npcList.map(npc => {
                        // TUTORIAL RAIL: Step 4 highlights Sarah
                        const isTutorialTarget = tutorialStep === 4 && npc.id === 'sarah';
                        return (
                        <button 
                            key={npc.id}
                            onClick={() => {
                                setActiveTab(npc.id);
                                if (tutorialStep === 4) setTutorialStep(5);
                            }}
                            className={`
                                w-full text-left p-3 flex items-center space-x-3 transition-colors border-l-2 relative
                                ${activeTab === npc.id ? 'bg-slate-800 border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:bg-slate-900 hover:text-slate-200'}
                                ${isTutorialTarget ? 'z-[70] bg-slate-800 border-amber-500 ring-2 ring-amber-500' : ''}
                            `}
                        >
                            <i className={`fas ${npc.avatar} ${npc.isRival ? 'text-red-500' : 'text-slate-500'} text-lg`}></i>
                            <div className="flex-1 truncate hidden md:block">
                                <span className="font-bold block">{npc.name}</span>
                                <span className="text-[10px] opacity-70 truncate">{npc.role}</span>
                            </div>
                            {npc.relationship < 30 && <i className="fas fa-circle-exclamation text-red-500 text-[10px] absolute top-1 right-1"></i>}
                        </button>
                    )})}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-slate-900 relative">
                {/* Chat Header Info */}
                <div className="p-3 border-b border-slate-800 bg-slate-900/90 flex justify-between items-center backdrop-blur-sm absolute top-0 w-full z-10">
                    <div>
                        <span className="font-bold text-slate-200 block truncate">
                            {activeTab === 'ADVISOR' ? 'Machiavelli (Advisor)' : activeNPC?.name}
                        </span>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 pt-16 pb-32 overflow-y-auto space-y-4 custom-scrollbar">
                    {activeMessages.map((msg, index) => (
                        <div key={index} className={`flex w-full ${msg.sender === 'player' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex max-w-[85%] ${msg.sender === 'player' ? 'flex-row-reverse' : 'flex-row'} items-end gap-3`}>
                                
                                {/* Avatar Bubble */}
                                <div className={`
                                    w-8 h-8 rounded-full flex items-center justify-center shrink-0 border shadow-sm
                                    ${msg.sender === 'player' 
                                        ? 'bg-blue-600 border-blue-400 text-white' 
                                        : activeTab === 'ADVISOR' 
                                            ? 'bg-amber-950 border-amber-600 text-amber-500'
                                            : 'bg-slate-800 border-slate-600 text-slate-400'
                                    }
                                `}>
                                     <i className={`fas ${
                                        msg.sender === 'player' 
                                            ? 'fa-user' 
                                            : activeTab === 'ADVISOR' 
                                                ? 'fa-user-tie' 
                                                : activeNPC?.avatar || 'fa-user'
                                    } text-xs`}></i>
                                </div>

                                {/* Message Bubble */}
                                <div className={`
                                    px-4 py-3 rounded-xl text-sm shadow-md border
                                    ${msg.sender === 'player' 
                                        ? 'bg-blue-700 border-blue-600 text-white rounded-br-none mr-0' 
                                        : activeTab === 'ADVISOR'
                                            ? 'bg-amber-950/40 border-amber-800/60 text-amber-100 rounded-bl-none mr-12'
                                            : 'bg-slate-800 border-slate-700 text-slate-200 rounded-bl-none mr-12'
                                    }
                                `}>
                                    {/* Optional Name Header for NPCs */}
                                    {msg.sender !== 'player' && (
                                        <div className={`text-[9px] font-bold uppercase tracking-wider mb-1 ${
                                            activeTab === 'ADVISOR' ? 'text-amber-600' : 'text-slate-500'
                                        }`}>
                                            {msg.senderName || (activeTab === 'ADVISOR' ? 'Machiavelli' : activeNPC?.name)}
                                        </div>
                                    )}
                                    
                                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {(isNpcLoading) && (
                         <div className="flex items-center space-x-2 text-slate-500 text-xs animate-pulse ml-12">
                            <i className="fas fa-pen"></i>
                            <span>{activeNPC?.name} is typing...</span>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area (Sticky Bottom) */}
                <div className="p-2 md:p-3 border-t border-slate-800 bg-slate-900 absolute bottom-0 left-0 right-0">
                    {/* Quick Responses */}
                    <div className="flex overflow-x-auto gap-2 mb-2 pb-1 no-scrollbar">
                         {activeTab === 'ADVISOR' ? (
                            predefinedQuestions.map((q) => (
                                <button
                                    key={q}
                                    onClick={() => handleQuickResponse(q)}
                                    className="bg-slate-800 hover:bg-amber-900/30 text-amber-600 border border-slate-700 hover:border-amber-700 text-[10px] px-3 py-2 rounded transition-all whitespace-nowrap uppercase tracking-wider font-bold"
                                >
                                    {q}
                                </button>
                            ))
                         ) : (
                             (tutorialStep === 5 && activeTab === 'sarah') ? (
                                <button
                                    onClick={() => handleQuickResponse("Check the patent")}
                                    className="bg-amber-500 text-black border border-amber-600 text-[10px] px-3 py-2 rounded transition-all whitespace-nowrap font-bold animate-pulse shadow-lg"
                                >
                                    Check the patent
                                </button>
                             ) : (
                                 npcQuickResponses.map((q) => (
                                    <button
                                        key={q}
                                        onClick={() => handleQuickResponse(q)}
                                        className="bg-slate-800 hover:bg-blue-900/30 text-blue-400 border border-slate-700 hover:border-blue-700 text-[10px] px-3 py-2 rounded transition-all whitespace-nowrap font-bold"
                                    >
                                        {q}
                                    </button>
                                 ))
                             )
                         )}
                    </div>

                    <div className="flex space-x-2">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type message..."
                                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono"
                                disabled={isLoadingAdvisor && activeTab === 'ADVISOR'}
                            />
                        </div>
                        <button 
                            onClick={handleSend} 
                            disabled={(isLoadingAdvisor && activeTab === 'ADVISOR') || input.trim().length === 0} 
                            className="bg-amber-600 hover:bg-amber-500 text-white w-12 flex items-center justify-center rounded-sm shadow-sm disabled:bg-slate-800 disabled:text-slate-600 transition-all"
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
