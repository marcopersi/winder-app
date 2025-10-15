import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, Session } from '../types';
import type { Session as SupabaseSession } from '@supabase/supabase-js';

/**
 * Custom hook for Supabase authentication in React Native
 * Basiert auf Ihrem useSupabaseAuth Hook aus der Web-App
 */
export const useSupabaseAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(transformSession(session));
      setUser(session?.user ? transformUser(session.user) : null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state changed:', event);
        setSession(transformSession(currentSession));
        setUser(currentSession?.user ? transformUser(currentSession.user) : null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const transformSession = (session: SupabaseSession | null): Session | null => {
    if (!session) return null;
    return {
      user: transformUser(session.user),
      access_token: session.access_token,
      refresh_token: session.refresh_token || '',
    };
  };

  const transformUser = (supabaseUser: any): User => {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email,
      displayName: supabaseUser.user_metadata?.display_name || supabaseUser.email,
      avatar: supabaseUser.user_metadata?.avatar_url,
    };
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password 
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return {
    session,
    user,
    loading,
    signUp,
    signIn,
    signOut
  };
};