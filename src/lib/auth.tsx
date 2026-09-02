import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';
import type { Session, User } from '@supabase/supabase-js';

export type AppProfile = {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  lifestyle_persona: string | null;
  baseline_diagnostics: Record<string, unknown> | null;
};

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: AppProfile | null;
  loading: boolean;
  dbReady: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null; needsConfirmation: boolean }>;
  signOut: () => Promise<void>;
  ensureProfile: (name?: string) => Promise<AppProfile | null>;
  saveProfile: (fields: Partial<AppProfile>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AppProfile | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (!newSession) {
        setProfile(null);
        setProfileLoaded(false);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const ensureProfile = useCallback(async (name?: string): Promise<AppProfile | null> => {
    if (!isSupabaseConfigured || !supabase || !session?.user) return null;
    const userId = session.user.id;
    const email = session.user.email ?? null;

    const { data: existing } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      setProfile(existing as AppProfile);
      setProfileLoaded(true);
      return existing as AppProfile;
    }

    const fallbackName = name?.trim() || email?.split('@')[0] || 'New Member';
    const { data: created, error } = await supabase
      .from('profiles')
      .insert({ user_id: userId, name: fallbackName, email })
      .select()
      .single();
    if (error) {
      console.warn('Profile insert failed:', error.message);
      setProfileLoaded(true);
      return null;
    }
    setProfile(created as AppProfile);
    setProfileLoaded(true);
    return created as AppProfile;
  }, [session]);

  useEffect(() => {
    if (session && !profileLoaded) {
      ensureProfile();
    }
  }, [session, profileLoaded, ensureProfile]);

  const saveProfile = useCallback(async (fields: Partial<AppProfile>) => {
    if (!isSupabaseConfigured || !supabase || !session?.user) return false;
    const { error } = await supabase
      .from('profiles')
      .update(fields)
      .eq('user_id', session.user.id);
    if (error) {
      console.warn('Profile save failed:', error.message);
      return false;
    }
    setProfile((prev) => (prev ? { ...prev, ...fields } as AppProfile : prev));
    return true;
  }, [session]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured || !supabase) return { error: 'Database is not configured in this build.' };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? error.message : null };
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    if (!isSupabaseConfigured || !supabase) return { error: 'Database is not configured in this build.', needsConfirmation: false };
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
    if (error) return { error: error.message, needsConfirmation: false };
    const needsConfirmation = !data.session;
    return { error: null, needsConfirmation };
  }, []);

  const signOut = useCallback(async () => {
    await supabase?.auth.signOut();
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    session,
    user: session?.user ?? null,
    profile,
    loading,
    dbReady: isSupabaseConfigured,
    signIn,
    signUp,
    signOut,
    ensureProfile,
    saveProfile,
  }), [session, profile, loading, signIn, signUp, signOut, ensureProfile, saveProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
