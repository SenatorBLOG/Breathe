// src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

type AuthCtx = {
  isAuthenticated: boolean;
  token: string | null;
  user: any | null;
  login: (token: string, user?: any) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthCtx>({
  isAuthenticated: false,
  token: null,
  user: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const t = localStorage.getItem('token');
    const u = localStorage.getItem('user');
    if (t) setToken(t);
    if (u) setUser(JSON.parse(u));
  }, []);

  const login = (newToken: string, userPayload?: any) => {
    localStorage.setItem('token', newToken);
    if (userPayload) localStorage.setItem('user', JSON.stringify(userPayload));
    setToken(newToken);
    setUser(userPayload ?? null);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    navigate('/home-page');
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated: !!token,
      token,
      user,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};
