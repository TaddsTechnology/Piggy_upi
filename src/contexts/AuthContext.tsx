import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthResponse } from '@supabase/supabase-js';
import { auth } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  demoMode: boolean;
  signUp: (email: string, password: string) => Promise<AuthResponse>;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signOut: () => Promise<{ error: Error | null }>;
  enterDemoMode: () => void;
  exitDemoMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    // Get initial session
    auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    const result = await auth.signUp(email, password);
    setLoading(false);
    return result;
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const result = await auth.signIn(email, password);
    setLoading(false);
    return result;
  };

  const signOut = async () => {
    setLoading(true);
    const result = await auth.signOut();
    
    // Exit demo mode and clear all demo-related data
    if (demoMode) {
      exitDemoMode();
    }
    
    setDemoMode(false);
    setLoading(false);
    return result;
  };

  const enterDemoMode = () => {
    setDemoMode(true);
    setLoading(false);
  };

  const exitDemoMode = () => {
    setDemoMode(false);
    
    // Clear any demo-related data from localStorage and sessionStorage
    const demoKeys = [
      'demo_user_id',
      'demo_mode',
      'mock_data_initialized',
      'piggy_state',
      'user_preferences'
    ];
    
    demoKeys.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    
    // Clear IndexedDB demo data if exists
    if (window.indexedDB) {
      try {
        indexedDB.deleteDatabase('piggy-upi-demo-cache');
      } catch (error) {
        console.warn('Failed to clear demo IndexedDB:', error);
      }
    }
    
    // Dispatch a custom event to notify components to clear their demo state
    window.dispatchEvent(new CustomEvent('demo-mode-exit', { detail: { timestamp: Date.now() } }));
  };

  const value = {
    user,
    session,
    loading,
    demoMode,
    signUp,
    signIn,
    signOut,
    enterDemoMode,
    exitDemoMode
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
