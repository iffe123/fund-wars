
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { auth } from '../services/firebase';

type AuthMode = 'login' | 'signup';

// Check if Firebase is configured
const isFirebaseConfigured = !!auth;

const LoginScreen: React.FC = () => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, signInAsGuest, loading } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        const result = await signInWithEmail(email, password);
        if (!result.success) {
          setError(result.error || 'Login failed');
        }
      } else {
        const result = await signUpWithEmail(email, password, displayName || undefined);
        if (!result.success) {
          setError(result.error || 'Signup failed');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError(null);
  };

  return (
    <div className="h-screen w-screen bg-black flex flex-col items-center justify-center font-mono p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,50,0,0.2),transparent)] pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-green-500/20"></div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-green-500/20"></div>

      <div className="mb-8 text-center z-10">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-2 tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">FUND WARS</h1>
        <div className="text-amber-500 text-xs md:text-sm tracking-[0.5em] uppercase font-bold">Private Equity Simulator</div>
      </div>

      <div className="max-w-md w-full border border-slate-700 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-md relative z-10">
        <div className="absolute top-0 left-0 bg-amber-500 text-black text-[10px] px-2 py-0.5 font-bold uppercase">
            {mode === 'login' ? 'System_Access' : 'New_Registration'}
        </div>

        <div className="text-slate-400 text-xs mb-6 font-mono leading-relaxed mt-4">
          <p className="mb-2 text-red-500 animate-pulse">{">"} UNAUTHORIZED USER DETECTED.</p>
          <p className="mb-2">{">"} SECURITY PROTOCOL: OMEGA-3.</p>
          <p>{">"} {mode === 'login' ? 'AUTHENTICATE TO ACCESS TERMINAL.' : 'CREATE NEW ACCOUNT TO PROCEED.'}</p>
        </div>

        {/* Email/Password Form - only show if Firebase is configured */}
        {isFirebaseConfigured && (
          <>
            <form onSubmit={handleEmailSubmit} className="space-y-3 mb-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-slate-500 text-[10px] uppercase tracking-wider mb-1">Callsign</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter display name"
                    className="w-full bg-slate-800 border border-slate-600 text-slate-200 px-3 py-2 font-mono text-sm focus:border-amber-500 focus:outline-none transition-colors placeholder:text-slate-600"
                  />
                </div>
              )}
              <div>
                <label className="block text-slate-500 text-[10px] uppercase tracking-wider mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="agent@fundwars.os"
                  required
                  className="w-full bg-slate-800 border border-slate-600 text-slate-200 px-3 py-2 font-mono text-sm focus:border-amber-500 focus:outline-none transition-colors placeholder:text-slate-600"
                />
              </div>
              <div>
                <label className="block text-slate-500 text-[10px] uppercase tracking-wider mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full bg-slate-800 border border-slate-600 text-slate-200 px-3 py-2 font-mono text-sm focus:border-amber-500 focus:outline-none transition-colors placeholder:text-slate-600"
                />
              </div>

              {error && (
                <div className="bg-red-900/30 border border-red-800 text-red-400 px-3 py-2 text-xs">
                  <i className="fas fa-exclamation-triangle mr-2"></i>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="group w-full bg-green-600 hover:bg-green-500 disabled:bg-slate-700 text-white font-bold py-3 px-6 rounded-none uppercase tracking-widest transition-all flex items-center justify-center space-x-3 border-2 border-transparent hover:border-green-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="animate-pulse">PROCESSING...</span>
                ) : (
                  <>
                    <i className={`fas ${mode === 'login' ? 'fa-sign-in-alt' : 'fa-user-plus'}`}></i>
                    <span>{mode === 'login' ? 'Login' : 'Create Account'}</span>
                    <i className="fas fa-arrow-right opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1"></i>
                  </>
                )}
              </button>
            </form>

            {/* Mode Toggle */}
            <button
              onClick={toggleMode}
              className="w-full text-slate-400 hover:text-slate-200 text-xs py-2 transition-colors"
            >
              {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
              <span className="text-amber-500 underline">{mode === 'login' ? 'Sign Up' : 'Login'}</span>
            </button>
          </>
        )}

        {/* Show different UI based on Firebase configuration */}
        {!isFirebaseConfigured ? (
          <>
            {/* Firebase not configured - show prominent guest access */}
            <div className="bg-amber-900/30 border border-amber-700 text-amber-400 px-3 py-2 text-xs mb-4 rounded">
              <i className="fas fa-info-circle mr-2"></i>
              Cloud saves not configured. Your progress will be saved locally.
            </div>

            <button
                onClick={signInAsGuest}
                className="group w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-6 rounded-none uppercase tracking-widest transition-all flex items-center justify-center space-x-3 border-2 border-transparent hover:border-green-400 text-base"
            >
                <i className="fas fa-play text-lg"></i>
                <span>Start Playing</span>
                <i className="fas fa-arrow-right opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1"></i>
            </button>

            <p className="text-center text-slate-500 text-xs mt-3">
              No account needed. Jump right in!
            </p>
          </>
        ) : (
          <>
            {/* Firebase configured - show all login options */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-900 px-2 text-slate-500">or continue with</span>
              </div>
            </div>

            <div className="space-y-3">
                <button
                    onClick={signInWithGoogle}
                    className="group w-full bg-white hover:bg-amber-400 text-black font-bold py-3 px-6 rounded-none uppercase tracking-widest transition-all flex items-center justify-center space-x-3 border-2 border-transparent hover:border-black text-sm"
                >
                    <i className="fab fa-google text-lg"></i>
                    <span>Google</span>
                </button>

                <button
                    onClick={signInAsGuest}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 px-6 rounded-none uppercase tracking-widest transition-all flex items-center justify-center space-x-2 border border-slate-600 hover:border-slate-400 text-xs"
                >
                    <i className="fas fa-user-secret"></i>
                    <span>Guest Access</span>
                </button>
            </div>
          </>
        )}

        <div className="mt-6 text-center text-[10px] text-slate-400 border-t border-slate-800 pt-4">
            SECURE CONNECTION // ENCRYPTION: AES-256 // SERVER: US-EAST
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
