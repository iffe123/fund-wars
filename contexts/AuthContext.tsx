
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, googleProvider } from '../services/firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { loadGoogleSignIn } from '../services/googleAuth';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  googleSdkReady: boolean;
  googleSdkError: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<{ success: boolean; error?: string }>;
  signInAsGuest: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [googleSdkReady, setGoogleSdkReady] = useState(false);
  const [googleSdkError, setGoogleSdkError] = useState<string | null>(null);

  // Lazy load Google Sign-In SDK
  useEffect(() => {
    loadGoogleSignIn()
      .then(() => {
        setGoogleSdkReady(true);
      })
      .catch((error) => {
        console.warn('[AUTH] Google Sign-In SDK failed to load:', error.message);
        setGoogleSdkError(error.message || 'Failed to load Google Sign-In');
      });
  }, []);

  const signInWithGoogle = async () => {
    if (!auth || !googleProvider) {
        alert("Firebase is not configured. Please add your API keys to .env or use Guest Access.");
        return;
    }
    if (googleSdkError) {
        alert("Google Sign-In is unavailable (offline mode). Please use Guest Access.");
        return;
    }
    if (!googleSdkReady) {
        alert("Google Sign-In is still loading. Please try again in a moment.");
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

  const signInWithEmail = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!auth) {
      return { success: false, error: "Firebase is not configured. Please use Guest Access." };
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error: any) {
      console.error("Error signing in with email", error);
      const errorMessages: Record<string, string> = {
        'auth/invalid-email': 'Invalid email address.',
        'auth/user-disabled': 'This account has been disabled.',
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password.',
        'auth/invalid-credential': 'Invalid email or password.',
        'auth/too-many-requests': 'Too many attempts. Please try again later.',
      };
      return { success: false, error: errorMessages[error.code] || error.message };
    }
  };

  const signUpWithEmail = async (email: string, password: string, displayName?: string): Promise<{ success: boolean; error?: string }> => {
    if (!auth) {
      return { success: false, error: "Firebase is not configured. Please use Guest Access." };
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }
      return { success: true };
    } catch (error: any) {
      console.error("Error signing up with email", error);
      const errorMessages: Record<string, string> = {
        'auth/email-already-in-use': 'An account with this email already exists.',
        'auth/invalid-email': 'Invalid email address.',
        'auth/operation-not-allowed': 'Email/password accounts are not enabled.',
        'auth/weak-password': 'Password should be at least 6 characters.',
      };
      return { success: false, error: errorMessages[error.code] || error.message };
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
    <AuthContext.Provider value={{ currentUser, loading, googleSdkReady, googleSdkError, signInWithGoogle, signInWithEmail, signUpWithEmail, signInAsGuest, logout }}>
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
