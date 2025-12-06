
import React from 'react';
import { useAuth } from '../context/AuthContext';

const LoginScreen: React.FC = () => {
  const { signInWithGoogle, signInAsGuest, loading } = useAuth();

  if (loading) {
      return (
        <div className="h-screen w-screen bg-black text-green-500 font-mono flex flex-col items-center justify-center p-4">
            <div className="animate-pulse mb-4 text-xl tracking-widest">ESTABLISHING_UPLINK...</div>
            <div className="w-64 h-2 bg-slate-800 rounded overflow-hidden">
                <div className="h-full bg-green-500 animate-[width_2s_ease-in-out_infinite]" style={{ width: '50%' }}></div>
            </div>
        </div>
      );
  }

  return (
    <div className="h-screen w-screen bg-black flex flex-col items-center justify-center font-mono p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,50,0,0.2),transparent)] pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-green-500/20"></div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-green-500/20"></div>

      <div className="mb-12 text-center z-10">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-2 tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">FUND WARS</h1>
        <div className="text-amber-500 text-xs md:text-sm tracking-[0.5em] uppercase font-bold">Private Equity Simulator</div>
      </div>
      
      <div className="max-w-md w-full border border-slate-700 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-md relative z-10">
        <div className="absolute top-0 left-0 bg-amber-500 text-black text-[10px] px-2 py-0.5 font-bold uppercase">
            System_Access
        </div>
        
        <div className="text-slate-400 text-xs mb-8 font-mono leading-relaxed mt-4">
          <p className="mb-2 text-red-500 animate-pulse">{">"} UNAUTHORIZED USER DETECTED.</p>
          <p className="mb-2">{">"} SECURITY PROTOCOL: OMEGA-3.</p>
          <p>{">"} PLEASE AUTHENTICATE TO ACCESS TERMINAL.</p>
        </div>

        <div className="space-y-4">
            <button 
                onClick={signInWithGoogle}
                className="group w-full bg-white hover:bg-amber-400 text-black font-bold py-4 px-6 rounded-none uppercase tracking-widest transition-all flex items-center justify-center space-x-3 border-2 border-transparent hover:border-black"
            >
                <i className="fab fa-google text-xl"></i>
                <span>Authenticate</span>
                <i className="fas fa-arrow-right opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1"></i>
            </button>
            
            <button 
                onClick={signInAsGuest}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 px-6 rounded-none uppercase tracking-widest transition-all flex items-center justify-center space-x-2 border border-slate-600 hover:border-slate-400 text-xs"
            >
                <i className="fas fa-user-secret"></i>
                <span>Guest Access (Dev Mode)</span>
            </button>
        </div>
        
        <div className="mt-8 text-center text-[10px] text-slate-400 border-t border-slate-800 pt-4">
            SECURE CONNECTION // ENCRYPTION: AES-256 // SERVER: US-EAST
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
