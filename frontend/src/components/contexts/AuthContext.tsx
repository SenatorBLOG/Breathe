// src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

// User-scoped keys that must NOT outlive a sign-out / account switch.
// Anything mentioning a user's mood, goal, ML inputs, onboarding state, or nudge timers
// would leak between users on a shared device. Theme + language stay (UI preferences).
const USER_SCOPED_LS_KEYS = [
  'token',
  'user',
  'userId',
  'breathe_ml_text',
  'breathe_ml_stress',
  'breathe_ml_time',
  'breathe_goal',
  'breathe_tour_done',
  'breathe_nudge_at',
  'breathe_pwa_dismissed',
];

function clearUserScopedStorage() {
  if (typeof window === 'undefined') return;
  for (const key of USER_SCOPED_LS_KEYS) localStorage.removeItem(key);
}

function safeJSONParse<T = any>(raw: string | null): T | null {
  if (!raw || raw === 'undefined' || raw === 'null') return null;
  try { return JSON.parse(raw) as T; }
  catch { return null; }
}

type AuthCtx = {
  isAuthenticated: boolean;
  token: string | null;
  user: any | null;
  login: (token: string, user?: any) => void;
  logout: () => void;
  updateUser: (updates: any) => void;
};

export const AuthContext = createContext<AuthCtx>({
  isAuthenticated: false,
  token: null,
  user: null,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const t = localStorage.getItem('token');
    const parsedUser = safeJSONParse(localStorage.getItem('user'));
    if (t) setToken(t);
    if (parsedUser) setUser(parsedUser);
    // If user was stored as the literal string "undefined" or other garbage, scrub it
    // so nothing else in the app tries to JSON.parse it and crash.
    if (localStorage.getItem('user') && !parsedUser) localStorage.removeItem('user');
  }, []);

  const login = (newToken: string, userPayload?: any) => {
    localStorage.setItem('token', newToken);
    if (userPayload) localStorage.setItem('user', JSON.stringify(userPayload));
    setToken(newToken);
    setUser(userPayload ?? null);
  };

  const updateUser = (updates: any) => {
    setUser((prev: any) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  const logout = () => {
    clearUserScopedStorage();
    setToken(null);
    setUser(null);
    // Land on home so the post-logout state is clearly anonymous, not mid-flow on /breathing.
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated: !!token,
      token,
      user,
      login,
      logout,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
