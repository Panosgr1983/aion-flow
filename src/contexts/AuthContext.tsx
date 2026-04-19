import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseAvailable } from '../lib/supabase';
import type { Database } from '../types/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, userData?: Partial<Profile>) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  loading: boolean;
  isDemoMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const isDemoMode = !isSupabaseAvailable;

  useEffect(() => {
    if (isDemoMode) {
      // Demo mode: create a mock session
      const mockUser = {
        id: 'demo-user-id',
        email: 'demo@example.com',
        user_metadata: { name: 'Demo User' }
      } as User;

      const mockSession = {
        user: mockUser,
        access_token: 'demo-token',
        refresh_token: 'demo-refresh-token'
      } as Session;

      setSession(mockSession);
      setUser(mockUser);
      setProfile({
        id: 'demo-user-id',
        email: 'demo@example.com',
        name: 'Demo User',
        role: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      setLoading(false);
      return;
    }

    // Production mode with Supabase
    supabase!.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase!.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const profile = await supabaseHelpers.profiles.getCurrent();
      setProfile(profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Create profile if it doesn't exist
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const newProfile = await supabaseHelpers.profiles.createProfile({
            id: user.id,
            username: user.email?.split('@')[0] || null,
            full_name: null,
            email: user.email || '',
            role: 'user',
            language: 'el',
            timezone: 'Europe/Athens',
            notification_preferences: {
              email: true,
              browser: true,
              system: false
            }
          });
          setProfile(newProfile);
        }
      } catch (createError) {
        console.error('Error creating profile:', createError);
      }
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    if (isDemoMode) {
      // Demo mode: always successful
      return { error: null };
    }

    const { error } = await supabase!.auth.signInWithPassword({
      email,
      password,
    });

    if (!error && user) {
      // Update last login
      await supabaseHelpers.profiles.update({
        last_login: new Date().toISOString()
      });
    }

    return { error };
  };

  const signUp = async (email: string, password: string, userData?: Partial<Profile>) => {
    if (isDemoMode) {
      // Demo mode: always successful
      return { error: null };
    }

    const { data, error } = await supabase!.auth.signUp({
      email,
      password,
    });

    if (!error && data.user) {
      // Create profile
      try {
        await supabaseHelpers.profiles.createProfile({
          id: data.user.id,
          username: email.split('@')[0],
          full_name: userData?.full_name || null,
          email: email,
          role: 'user',
          language: userData?.language || 'el',
          timezone: userData?.timezone || 'Europe/Athens',
          notification_preferences: {
            email: true,
            browser: true,
            system: false
          },
          ...userData
        });
      } catch (profileError) {
        console.error('Error creating profile:', profileError);
      }
    }

    return { error };
  };

  const signOut = async () => {
    if (isDemoMode) {
      // Demo mode: just clear session
      setSession(null);
      setUser(null);
      setProfile(null);
      return;
    }

    const { error } = await supabase!.auth.signOut();
    if (error) throw error;
  };

  const value = {
    session,
    user,
    profile,
    signIn,
    signUp,
    signOut,
    loading,
    isDemoMode,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}