
import React, { useState } from 'react';
import { TerminalButton } from './TerminalUI';

interface BoardBattleModalProps {
  companyName: string;
  ceoName: string;
  onClose: () => void;
  onResolve: (success: boolean) => void;
}

const BoardBattleModal: React.FC<BoardBattleModalProps> = ({ companyName, ceoName, onClose, onResolve }) => {
  const [messages, setMessages] = useState<{ sender: string, text: string }[]>([
      { sender: 'System', text: `BOARD MEETING INITIATED: ${companyName}` },
      { sender: ceoName, text: "I don't appreciate this ambush. My strategy takes time." },
      { sender: 'Board Member A', text: "The numbers don't look good, but firing the founder is extreme." },
      { sender: 'Board Member B', text: "I'm listening. What's the plan?" }
  ]);
  const [turn, setTurn] = useState(0);

  const addMessage = (sender: string, text: string) => {
      setMessages(prev => [...prev, { sender, text }]);
  };

  const handleChoice = (tactic: 'AGGRESSIVE' | 'DIPLOMATIC' | 'LEGAL') => {
      // Simulate outcome based on tactic
      if (tactic === 'AGGRESSIVE') {
          addMessage('You', "We are bleeding cash. You are fired effective immediately.");
          setTimeout(() => {
              addMessage(ceoName, "You can't do this! I built this company!");
              addMessage('Board Member A', "Actually... he's right. We need a change.");
              setTimeout(() => onResolve(true), 1500);
          }, 1000);
      } else if (tactic === 'DIPLOMATIC') {
          addMessage('You', "Let's align incentives. We'll increase the option pool if we hit targets.");
          setTimeout(() => {
               addMessage(ceoName, "Fine. But I want it in writing.");
               setTimeout(() => onResolve(false), 1500); // Outcome: CEO stays (Success? Maybe partial)
          }, 1000);
      } else {
          addMessage('You', "Per Clause 4.2 of the Shareholder Agreement, we are exercising our Drag-Along rights.");
          setTimeout(() => {
              addMessage('Board Member B', "Lawyers involved? I'm out.");
              addMessage('System', "VOTE FAILED.");
              setTimeout(() => onResolve(false), 1500);
          }, 1000);
      }
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60] p-4 font-mono">
        <div className="w-full max-w-2xl border border-slate-600 bg-slate-900 shadow-2xl flex flex-col h-[60vh]">
            <div className="bg-slate-800 p-3 border-b border-slate-700 flex justify-between items-center">
                <span className="font-bold text-slate-200">EMERGENCY BOARD MEETING // {companyName.toUpperCase()}</span>
                <button onClick={onClose}><i className="fas fa-times"></i></button>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-black">
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded border ${
                            m.sender === 'System' ? 'border-none w-full text-center text-slate-500 text-xs' :
                            m.sender === 'You' ? 'bg-blue-900/20 border-blue-800 text-blue-200' : 
                            'bg-slate-800 border-slate-700 text-slate-300'
                        }`}>
                            {m.sender !== 'System' && <div className="text-[10px] font-bold mb-1 opacity-70">{m.sender}</div>}
                            <div className="text-sm">{m.text}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 border-t border-slate-700 bg-slate-800 grid grid-cols-3 gap-3">
                 <TerminalButton label="THE STICK (Fired)" variant="danger" onClick={() => handleChoice('AGGRESSIVE')} />
                 <TerminalButton label="THE CARROT (Bribe)" variant="warning" onClick={() => handleChoice('DIPLOMATIC')} />
                 <TerminalButton label="THE LAW (Legal)" onClick={() => handleChoice('LEGAL')} />
            </div>
        </div>
    </div>
  );
};

export default BoardBattleModal;
