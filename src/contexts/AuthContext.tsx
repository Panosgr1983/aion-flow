/*
  ═══════════════════════════════════════════════════════════════
  AION Flow — Authentication Context
  
  Διαχειρίζεται:
    - Κατάσταση σύνδεσης (user/session)
    - Demo mode (χωρίς Supabase Auth)
    - Sign in / Sign up / Sign out
    - Telemetry: καταγραφή cms.login event
  
  Παρέχει σε όλη την εφαρμογή:
    - user: Το τρέχον user object (ή null)
    - isDemoMode: Αν είμαστε σε demo mode
    - signIn / signUp / signOut: Μέθοδοι αυθεντικοποίησης
  ═══════════════════════════════════════════════════════════════
*/

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseAvailable } from '../lib/supabase';
import { trackEvent, createSessionId } from '../lib/analytics';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isDemoMode: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null; needsEmailConfirm?: boolean }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isDemoMode: false,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
});

const DEMO_USER = {
  id: 'demo-user-id',
  email: 'demo@aionflow.gr',
  user_metadata: { full_name: 'Demo Admin' },
} as unknown as User;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const isDemoMode = !isSupabaseAvailable();

  useEffect(() => {
    if (isDemoMode) {
      const stored = localStorage.getItem('aion_demo_auth');
      if (stored === 'true') {
        setUser(DEMO_USER);
      }
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const jwtTenantId = (session.user as any).tenant_id as string | undefined;
        sessionStorage.setItem('aion_login_time', String(Date.now()));
        trackEvent('cms.login', { session_source: 'dashboard' }, {
          userId: session.user.id,
          tenantId: jwtTenantId,
          sessionId: createSessionId(),
        });
      }
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [isDemoMode]);

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    if (isDemoMode) {
      await new Promise(r => setTimeout(r, 800));
      if (email === 'demo@aionflow.gr' && password === 'demo123') {
        localStorage.setItem('aion_demo_auth', 'true');
        setUser(DEMO_USER);
        return { error: null };
      }
      return { error: 'Demo mode: Χρησιμοποιήστε demo@aionflow.gr / demo123' };
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUp = async (email: string, password: string): Promise<{ error: string | null; needsEmailConfirm?: boolean }> => {
    if (isDemoMode) {
      return { error: 'Δεν διαθέσιμο σε demo mode' };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: 'http://localhost:5173/login' },
    });

    if (error) return { error: error.message };

    const needsEmailConfirm = !data.session && !!data.user;
    return { error: null, needsEmailConfirm };
  };

  const signOut = async () => {
    const loginTime = sessionStorage.getItem('aion_login_time');
    const duration = loginTime ? Math.floor((Date.now() - parseInt(loginTime)) / 1000) : 0;
    trackEvent('cms.logout', { session_duration_seconds: duration }, {
      userId: user?.id,
      tenantId: (user as any)?.tenant_id,
    }).catch(() => {});
    if (isDemoMode) {
      localStorage.removeItem('aion_demo_auth');
      setUser(null);
      return;
    }
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isDemoMode, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
