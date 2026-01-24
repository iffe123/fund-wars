/**
 * IC Chat Interface Component
 *
 * Displays conversation between player and IC partners.
 */

import React, { useEffect, useRef } from 'react';
import type { ICMessage, ICPartner } from '../types/icTypes';

interface ICChatInterfaceProps {
  messages: ICMessage[];
  partners: ICPartner[];
  isLoading: boolean;
}

export const ICChatInterface: React.FC<ICChatInterfaceProps> = ({
  messages,
  partners,
  isLoading,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getPartner = (partnerId?: string): ICPartner | undefined => {
    return partners.find((p) => p.id === partnerId);
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
      {messages.map((message) => {
        const partner = getPartner(message.partnerId);

        if (message.isPlayer) {
          // Player message - right aligned
          return (
            <div key={message.id} className="flex justify-end">
              <div className="max-w-[80%] bg-emerald-900/30 border border-emerald-700/50 rounded-lg px-4 py-3">
                <div className="text-[10px] text-emerald-500 uppercase tracking-wider mb-1">
                  You
                </div>
                <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </div>
              </div>
            </div>
          );
        }

        // Partner message - left aligned
        return (
          <div key={message.id} className="flex justify-start">
            <div className="max-w-[80%]">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{partner?.avatar || '👤'}</span>
                <div>
                  <div className="text-xs font-bold text-slate-300">
                    {partner?.name || 'Partner'}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {partner?.nickname || ''}
                  </div>
                </div>
              </div>
              <div className="bg-slate-800/80 border border-slate-700/50 rounded-lg px-4 py-3">
                <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Typing indicator */}
      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-slate-800/80 border border-slate-700/50 rounded-lg px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-xs text-slate-500">Partner is reviewing...</span>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default ICChatInterface;
