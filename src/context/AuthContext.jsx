import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('ew_auth_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [session, setSession] = useState(() => {
    const saved = localStorage.getItem('ew_auth_session');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);
  const isCloudAuthAvailable = isSupabaseConfigured();

  useEffect(() => {
    if (isCloudAuthAvailable && supabase) {
      // 1. Get initial session
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });

      // 2. Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session) {
          localStorage.setItem('ew_auth_session', JSON.stringify(session));
          localStorage.setItem('ew_auth_user', JSON.stringify(session.user));
        } else {
          localStorage.removeItem('ew_auth_session');
          localStorage.removeItem('ew_auth_user');
        }
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    } else {
      // Fallback demo user if not logged in
      if (!user) {
        const defaultUser = {
          id: 'demo_user_001',
          email: 'chetan@executivewealth.app',
          user_metadata: {
            full_name: 'Chetan Thakur',
            handle: 'chetan',
            role: 'owner'
          }
        };
        setUser(defaultUser);
        localStorage.setItem('ew_auth_user', JSON.stringify(defaultUser));
      }
      setLoading(false);
    }
  }, [isCloudAuthAvailable]);

  // Sign up
  const signUp = async ({ email, password, fullName, handle, role = 'owner' }) => {
    if (isCloudAuthAvailable && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            handle: handle || email.split('@')[0],
            role
          }
        }
      });
      if (error) throw error;
      return data;
    }

    // Local demo signup
    const newUser = {
      id: `usr_${Date.now()}`,
      email,
      user_metadata: {
        full_name: fullName || email.split('@')[0],
        handle: handle || email.split('@')[0],
        role
      }
    };
    setUser(newUser);
    localStorage.setItem('ew_auth_user', JSON.stringify(newUser));
    return { user: newUser, session: { access_token: 'demo_token' } };
  };

  // Sign in
  const signIn = async ({ email, password }) => {
    if (isCloudAuthAvailable && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      return data;
    }

    // Local demo signin
    const loggedUser = {
      id: `usr_${Date.now()}`,
      email,
      user_metadata: {
        full_name: email.split('@')[0],
        handle: email.split('@')[0],
        role: 'owner'
      }
    };
    setUser(loggedUser);
    localStorage.setItem('ew_auth_user', JSON.stringify(loggedUser));
    return { user: loggedUser, session: { access_token: 'demo_token' } };
  };

  // Sign out
  const signOut = async () => {
    if (isCloudAuthAvailable && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    localStorage.removeItem('ew_auth_session');
    localStorage.removeItem('ew_auth_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isCloudAuthAvailable,
        signUp,
        signIn,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
