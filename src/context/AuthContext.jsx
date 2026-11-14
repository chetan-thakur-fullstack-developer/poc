import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase.js';

const AuthContext = createContext();

export const DEMO_USER = {
  id: '00000000-0000-0000-0000-000000000000',
  email: 'demo@executivewealth.app',
  user_metadata: {
    full_name: 'Demo Investor (Preview)',
    handle: 'demo_user',
    role: 'demo'
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('ew_auth_user');
    return saved ? JSON.parse(saved) : DEMO_USER;
  });

  const [session, setSession] = useState(() => {
    const saved = localStorage.getItem('ew_auth_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [loading, setLoading] = useState(true);
  const isCloudAuthAvailable = isSupabaseConfigured();

  const isDemoUser = Boolean(
    !user ||
    user.id === '00000000-0000-0000-0000-000000000000' ||
    user.email === 'demo@executivewealth.app'
  );

  useEffect(() => {
    if (isCloudAuthAvailable && supabase) {
      // 1. Get initial session from Supabase
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setSession(session);
          setUser(session.user);
          localStorage.setItem('ew_auth_session', JSON.stringify(session));
          localStorage.setItem('ew_auth_user', JSON.stringify(session.user));
        }
        setLoading(false);
      });

      // 2. Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setSession(session);
          setUser(session.user);
          localStorage.setItem('ew_auth_session', JSON.stringify(session));
          localStorage.setItem('ew_auth_user', JSON.stringify(session.user));
        } else if (!session && !isDemoUser) {
          setSession(null);
          setUser(null);
          localStorage.removeItem('ew_auth_session');
          localStorage.removeItem('ew_auth_user');
        }
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    } else {
      setLoading(false);
    }
  }, [isCloudAuthAvailable]);

  // Sign up a REAL user with Supabase
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
      if (data?.user) {
        setUser(data.user);
        setSession(data.session);
        localStorage.setItem('ew_auth_user', JSON.stringify(data.user));
      }
      return data;
    }

    // Local fallback for testing without Supabase
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
    return { user: newUser, session: { access_token: 'mock_token' } };
  };

  // Sign in a REAL user with Supabase
  const signIn = async ({ email, password }) => {
    if (isCloudAuthAvailable && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      if (data?.user) {
        setUser(data.user);
        setSession(data.session);
        localStorage.setItem('ew_auth_user', JSON.stringify(data.user));
      }
      return data;
    }

    // Local fallback
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
    return { user: loggedUser, session: { access_token: 'mock_token' } };
  };

  // Switch to DEMO test mode
  const loginAsDemo = () => {
    setUser(DEMO_USER);
    setSession(null);
    localStorage.setItem('ew_auth_user', JSON.stringify(DEMO_USER));
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
        isDemoUser,
        isCloudAuthAvailable,
        signUp,
        signIn,
        loginAsDemo,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
