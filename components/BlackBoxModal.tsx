
import React from 'react';
import { BLACK_BOX_FILE } from '../constants';
import { TerminalButton } from './TerminalUI';

interface BlackBoxModalProps {
  onClose: () => void;
  onResolve: (choice: 'IGNORE' | 'LEVERAGE' | 'WHISTLEBLOW') => void;
}

const BlackBoxModal: React.FC<BlackBoxModalProps> = ({ onClose, onResolve }) => {
  return (
    <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center font-mono p-8">
        <div className="max-w-3xl w-full border border-green-500/30 p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-green-500 animate-pulse"></div>
            
            <h1 className="text-3xl text-green-500 font-bold mb-4 glitch-text">SYSTEM_ANOMALY_DETECTED</h1>
            
            <div className="bg-black border border-green-900 p-4 mb-8 text-green-800 text-xs">
                 <p>FILENAME: {BLACK_BOX_FILE.name}</p>
                 <p>SIZE: {BLACK_BOX_FILE.size}</p>
                 <p>ENCRYPTION: {BLACK_BOX_FILE.encryption}</p>
                 <br/>
                 <p className="typing-effect text-green-500 font-bold text-lg">{BLACK_BOX_FILE.content}</p>
            </div>

            <p className="text-slate-400 mb-8 text-sm leading-relaxed">
                You have stumbled upon the firm's true purpose. This is not a Private Equity fund. It is a washing machine for cartel money. Knowing this makes you a liability. Using this makes you powerful.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <button 
                    onClick={() => onResolve('IGNORE')}
                    className="border border-slate-700 p-4 hover:bg-slate-900 text-left group transition-all"
                 >
                     <div className="text-slate-500 font-bold group-hover:text-white mb-1">IGNORE. DELETE.</div>
                     <div className="text-[10px] text-slate-400">Loyalty +20. You saw nothing.</div>
                 </button>
                 <button 
                    onClick={() => onResolve('LEVERAGE')}
                    className="border border-amber-900/50 p-4 hover:bg-amber-900/20 text-left group transition-all"
                 >
                     <div className="text-amber-800 font-bold group-hover:text-amber-500 mb-1">DOWNLOAD & LEVERAGE</div>
                     <div className="text-[10px] text-amber-900/70">High Risk. Use for Blackmail.</div>
                 </button>
                 <button 
                    onClick={() => onResolve('WHISTLEBLOW')}
                    className="border border-red-900/50 p-4 hover:bg-red-900/20 text-left group transition-all"
                 >
                     <div className="text-red-800 font-bold group-hover:text-red-500 mb-1">CONTACT AUTHORITIES</div>
                     <div className="text-[10px] text-red-900/70">Trigger Witness Protection Ending.</div>
                 </button>
            </div>
        </div>
        <style>{`
            .glitch-text {
                animation: glitch 1s linear infinite;
            }
            @keyframes glitch {
                2%, 64% { transform: translate(2px,0) skew(0deg); }
                4%, 60% { transform: translate(-2px,0) skew(0deg); }
                62% { transform: translate(0,0) skew(5deg); }
            }
        `}</style>
    </div>
  );
};

export default BlackBoxModal;
