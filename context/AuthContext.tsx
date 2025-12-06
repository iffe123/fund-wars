
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, googleProvider } from '../services/firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const signInWithGoogle = async () => {
    if (!auth || !googleProvider) {
        alert("Firebase is not configured. Please add your API keys to .env or use Guest Access.");
        return;
    }
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Error signing in with Google", error);
      if (error.code === 'auth/unauthorized-domain') {
          alert("DOMAIN ERROR: This preview domain is not whitelisted in Firebase. Please use 'Guest Mode'.");
      } else {
          alert(`Login Failed: ${error.message}`);
      }
    }
  };

  const signInAsGuest = () => {
      // Create a mock user object that satisfies the Firebase User interface requirements for the app
      const guestUser = {
          uid: `guest_${Date.now()}`,
          displayName: 'Guest Trader',
          email: 'guest@fundwars.os',
          photoURL: 'https://ui-avatars.com/api/?name=Guest+Trader&background=random',
          emailVerified: true,
          isAnonymous: true,
          metadata: {},
          providerData: [],
          refreshToken: '',
          tenantId: null,
          delete: async () => {},
          getIdToken: async () => 'mock-token',
          getIdTokenResult: async () => ({} as any),
          reload: async () => {},
          toJSON: () => ({}),
          phoneNumber: null
      } as unknown as User;

      setCurrentUser(guestUser);
  };

  const logout = async () => {
    try {
        if (auth) {
            await signOut(auth);
        }
    } catch (e) {
        // Ignore errors
    }
    // Always clear state
    setCurrentUser(null);
  };

  useEffect(() => {
    // If Auth isn't initialized (missing keys), stop loading and let user see Login Screen
    if (!auth) {
        setLoading(false);
        return;
    }

    let didSettle = false;

    // Timeout: If Firebase auth doesn't respond within 8 seconds, show login screen
    // This prevents infinite black/loading screen if Firebase is unreachable
    const authTimeout = setTimeout(() => {
        if (!didSettle) {
            console.warn('[AUTH] Firebase auth timeout - showing login screen');
            setLoading(false);
        }
    }, 8000);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      didSettle = true;
      clearTimeout(authTimeout);
      setCurrentUser(user);
      setLoading(false);
    });

    return () => {
        clearTimeout(authTimeout);
        unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, loading, signInWithGoogle, signInAsGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
