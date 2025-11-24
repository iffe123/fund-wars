
import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';

interface AdvisorChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  predefinedQuestions: string[];
}

const AdvisorChat: React.FC<AdvisorChatProps> = ({ messages, onSendMessage, isLoading, predefinedQuestions }) => {
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = (message: string) => {
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setInput('');
    }
  };

  const handleManualSend = () => {
    handleSend(input);
  };

  const handlePredefinedSend = (question: string) => {
    handleSend(question);
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleManualSend();
    }
  };
  
  if (!isOpen) {
    return (
        <button 
         onClick={() => setIsOpen(true)}
         className="fixed bottom-4 right-4 bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-full shadow-lg z-20 flex items-center space-x-2 transition-transform duration-200 hover:scale-105"
        >
          <i className="fas fa-user-tie"></i>
          <span>Consult Advisor</span>
        </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 w-full max-w-md h-[60vh] flex flex-col bg-white rounded-lg shadow-2xl z-20 border border-slate-300">
        <div className="flex justify-between items-center p-3 bg-slate-50 border-b border-slate-200 rounded-t-lg">
            <h3 className="font-bower font-bold text-slate-900">Machiavelli AI</h3>
            <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-slate-800">
                <i className="fas fa-times"></i>
            </button>
        </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-white">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-end gap-2 ${msg.sender === 'player' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'advisor' && <i className="fas fa-user-tie text-slate-400 text-xl"></i>}
            <div className={`rounded-lg px-3 py-2 max-w-xs lg:max-w-sm shadow-sm ${msg.sender === 'player' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-800'}`}>
              <p className="text-sm">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex items-end gap-2 justify-start">
                 <i className="fas fa-user-tie text-slate-400 text-xl"></i>
                 <div className="rounded-lg px-3 py-2 max-w-xs lg:max-w-sm bg-slate-100 text-slate-800">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                    </div>
                 </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-3 border-t border-slate-200 bg-white rounded-b-lg">
        {!isLoading && input.length === 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {predefinedQuestions.map((q) => (
              <button
                key={q}
                onClick={() => handlePredefinedSend(q)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-3 py-1 rounded-full transition-colors"
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
            placeholder="Query your advisor..."
            className="flex-1 bg-white border border-slate-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            disabled={isLoading}
          />
          <button onClick={handleManualSend} disabled={isLoading || input.trim().length === 0} className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-full disabled:bg-slate-400 disabled:cursor-not-allowed">
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvisorChat;