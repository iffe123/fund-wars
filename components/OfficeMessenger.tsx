
import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, NPC } from '../types';

interface OfficeMessengerProps {
  npcList: NPC[];
  advisorMessages: ChatMessage[];
  onSendMessageToAdvisor: (msg: string) => void;
  onSendMessageToNPC: (npcId: string, msg: string) => void;
  isLoadingAdvisor: boolean;
  predefinedQuestions: string[];
}

const OfficeMessenger: React.FC<OfficeMessengerProps> = ({ 
    npcList, 
    advisorMessages, 
    onSendMessageToAdvisor, 
    onSendMessageToNPC,
    isLoadingAdvisor,
    predefinedQuestions
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'ADVISOR' | string>('ADVISOR'); // 'ADVISOR' or npcId
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [activeTab, advisorMessages, npcList]);

  const handleSend = () => {
      if (!input.trim()) return;

      if (activeTab === 'ADVISOR') {
          onSendMessageToAdvisor(input);
      } else {
          onSendMessageToNPC(activeTab, input);
      }
      setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend();
  };

  if (!isOpen) {
    return (
        <button 
         onClick={() => setIsOpen(true)}
         className="fixed bottom-4 right-4 bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-full shadow-lg z-20 flex items-center space-x-2 transition-transform duration-200 hover:scale-105"
        >
          <div className="relative">
            <i className="fas fa-comments"></i>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white"></div>
          </div>
          <span>Comm Center</span>
        </button>
    )
  }

  const activeMessages = activeTab === 'ADVISOR' 
    ? advisorMessages 
    : npcList.find(n => n.id === activeTab)?.dialogueHistory || [];

  return (
    <div className="fixed bottom-4 right-4 w-full max-w-md h-[60vh] flex flex-col bg-white rounded-lg shadow-2xl z-20 border border-slate-300 overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-3 bg-slate-800 text-white rounded-t-lg">
            <h3 className="font-bower font-bold text-sm tracking-wider"><i className="fas fa-satellite-dish mr-2"></i>Office Comm</h3>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
                <i className="fas fa-times"></i>
            </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
            {/* Sidebar (Contact List) */}
            <div className="w-16 bg-slate-50 border-r border-slate-200 flex flex-col items-center py-2 space-y-2 overflow-y-auto">
                <button 
                    onClick={() => setActiveTab('ADVISOR')}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${activeTab === 'ADVISOR' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-400 hover:bg-slate-200'}`}
                    title="Machiavelli (AI)"
                >
                    <i className="fas fa-user-tie"></i>
                </button>
                <div className="w-8 border-b border-slate-200"></div>
                {npcList.map(npc => (
                    <button 
                        key={npc.id}
                        onClick={() => setActiveTab(npc.id)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center relative transition-all ${activeTab === npc.id ? 'bg-white border-2 border-blue-500 shadow-md' : 'bg-white border border-slate-200 hover:bg-slate-50'}`}
                        title={`${npc.name} (${npc.role})`}
                    >
                         <i className={`fas ${npc.avatar} ${npc.isRival ? 'text-red-500' : 'text-slate-400'}`}></i>
                         {/* Status Indicator */}
                         <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-white ${npc.relationship < 30 ? 'bg-red-500' : npc.relationship > 70 ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                    </button>
                ))}
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-white">
                <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <span className="font-bold text-slate-500 text-sm">
                        {activeTab === 'ADVISOR' ? 'Machiavelli (Advisor)' : npcList.find(n => n.id === activeTab)?.name}
                    </span>
                    {activeTab !== 'ADVISOR' && (
                        <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded-full text-slate-400">
                             Rel: {npcList.find(n => n.id === activeTab)?.relationship}%
                        </span>
                    )}
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50">
                    {activeMessages.map((msg, index) => {
                        const isPlayer = msg.sender === 'player';
                        return (
                            <div key={index} className={`flex items-end gap-2 w-full ${isPlayer ? 'justify-end' : 'justify-start'}`}>
                                {(msg.sender === 'advisor' || msg.sender === 'npc') && (
                                    <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm text-xs text-slate-500">
                                        <i className={`fas ${msg.sender === 'advisor' ? 'fa-user-tie' : npcList.find(n => n.id === activeTab)?.avatar}`}></i>
                                    </div>
                                )}
                                <div className={`
                                    rounded-lg px-4 py-2 max-w-[85%] shadow-sm text-sm border
                                    ${isPlayer 
                                        ? 'bg-blue-600 border-blue-500 text-white rounded-br-none ml-12' // Player: Blue, Left Indent
                                        : 'bg-white border-slate-200 text-slate-800 rounded-bl-none mr-12' // NPC: White, Right Indent
                                    }
                                `}>
                                    <p>{msg.text}</p>
                                </div>
                            </div>
                        );
                    })}
                    {activeTab === 'ADVISOR' && isLoadingAdvisor && (
                        <div className="flex items-end gap-2 justify-start">
                             <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm text-xs text-slate-500">
                                <i className="fas fa-user-tie"></i>
                            </div>
                            <div className="bg-white text-slate-800 border border-slate-200 rounded-lg px-3 py-2 mr-12">
                                <div className="flex items-center space-x-1">
                                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-3 border-t border-slate-200 bg-white">
                    {activeTab === 'ADVISOR' && !isLoadingAdvisor && input.length === 0 && (
                        <div className="flex overflow-x-auto gap-2 mb-2 pb-1 no-scrollbar">
                            {predefinedQuestions.map((q) => (
                            <button
                                key={q}
                                onClick={() => { onSendMessageToAdvisor(q); }}
                                className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] px-2 py-1 rounded-full transition-colors whitespace-nowrap border border-blue-100"
                            >
                                {q}
                            </button>
                            ))}
                        </div>
                    )}
                    <div className="flex space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={activeTab === 'ADVISOR' ? "Ask for advice..." : "Send message..."}
                        className="flex-1 bg-slate-100 border-transparent focus:bg-white focus:border-blue-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                        disabled={isLoadingAdvisor && activeTab === 'ADVISOR'}
                    />
                    <button 
                        onClick={handleSend} 
                        disabled={(isLoadingAdvisor && activeTab === 'ADVISOR') || input.trim().length === 0} 
                        className="bg-blue-600 hover:bg-blue-700 text-white w-9 h-9 flex items-center justify-center rounded-full shadow-sm disabled:bg-slate-300 transition-all"
                    >
                        <i className="fas fa-paper-plane text-xs"></i>
                    </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default OfficeMessenger;
