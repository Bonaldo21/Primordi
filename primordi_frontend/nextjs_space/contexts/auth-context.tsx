'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Usuario, AuthResponse } from '@/lib/types';
import { authApi, setTokens, clearTokens } from '@/lib/api';

interface AuthContextType {
  user: Usuario | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  register: (data: { nome: string; email: string; senha: string; cpf?: string; telefone?: string }) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('primordi_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed ?? null);
      }
    } catch {}
    setLoading(false);
  }, []);

  const handleAuthResponse = useCallback((res: AuthResponse) => {
    setTokens(res?.accessToken ?? '', res?.refreshToken ?? '');
    const u = res?.usuario ?? null;
    setUser(u);
    if (u) localStorage.setItem('primordi_user', JSON.stringify(u));
  }, []);

  const login = useCallback(async (email: string, senha: string) => {
    const res = await authApi.login(email, senha);
    handleAuthResponse(res);
  }, [handleAuthResponse]);

  const register = useCallback(async (data: { nome: string; email: string; senha: string; cpf?: string; telefone?: string }) => {
    const res = await authApi.register(data);
    handleAuthResponse(res);
  }, [handleAuthResponse]);

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
  }, []);

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
