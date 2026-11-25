import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase.js';

const AuthContext = createContext();

export const DEMO_USER = {
  id: '00000000-0000-0000-0000-000000000000',
  email: 'demo@execwealth.local',
  user_metadata: {
    full_name: 'Demo Investor (Preview)',
    handle: 'demo_user',
    role: 'owner'
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('ew_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch (_) {
      return null;
    }
  });

  const [session, setSession] = useState(() => {
    try {
      const saved = localStorage.getItem('ew_auth_session');
      return saved ? JSON.parse(saved) : null;
    } catch (_) {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const isCloudAuthAvailable = isSupabaseConfigured();

  const isDemoUser = Boolean(
    user && (
      user.id === '00000000-0000-0000-0000-000000000000' ||
      user.email === 'demo@executivewealth.app' ||
      user.email === 'demo@execwealth.local'
    )
  );

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 3000);

    if (isCloudAuthAvailable && supabase) {
      supabase.auth.getSession()
        .then(({ data: { session } }) => {
          clearTimeout(timeout);
          if (session?.user) {
            setSession(session);
            setUser(session.user);
            localStorage.setItem('ew_auth_session', JSON.stringify(session));
            localStorage.setItem('ew_auth_user', JSON.stringify(session.user));
          }
          setLoading(false);
        })
        .catch(() => {
          clearTimeout(timeout);
          setLoading(false);
        });

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

      return () => {
        clearTimeout(timeout);
        subscription.unsubscribe();
      };
    } else {
      clearTimeout(timeout);
      setLoading(false);
    }
  }, [isCloudAuthAvailable]);

  // Sign up a user
  const signUp = async ({ email, password, fullName, handle, role = 'owner', inviteCode }) => {
    if (isCloudAuthAvailable && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            handle: handle || email.split('@')[0],
            role,
            invite_code: inviteCode
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

    // Local fallback account
    const newUser = {
      id: `usr_${Date.now()}`,
      email,
      user_metadata: {
        full_name: fullName || email.split('@')[0],
        handle: handle || email.split('@')[0],
        role,
        invite_code: inviteCode
      }
    };
    setUser(newUser);
    localStorage.setItem('ew_auth_user', JSON.stringify(newUser));
    return { user: newUser, session: { access_token: 'local_token' } };
  };

  // Sign in a user
  const signIn = async ({ email, password }) => {
    if (
      (email.toLowerCase() === 'demo@execwealth.local' || email.toLowerCase() === 'demo@executivewealth.app') &&
      password === 'demo123'
    ) {
      loginAsDemo();
      return { user: DEMO_USER, session: null };
    }

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

    // Local account signin fallback
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
    return { user: loggedUser, session: { access_token: 'local_token' } };
  };

  // Launch Demo session (only triggered from login view)
  const loginAsDemo = () => {
    setUser(DEMO_USER);
    setSession(null);
    localStorage.setItem('ew_auth_user', JSON.stringify(DEMO_USER));
  };

  // Sign out — clears session and brings user back to LoginView
  const signOut = async () => {
    if (isCloudAuthAvailable && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (_) {}
    }
    setUser(null);
    setSession(null);
    localStorage.removeItem('ew_auth_session');
    localStorage.removeItem('ew_auth_user');
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    const lastSlash = pathname.lastIndexOf('/');
    const dir = lastSlash !== -1 ? pathname.substring(0, lastSlash + 1) : '/';
    window.location.href = origin + dir + '#/login';
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
