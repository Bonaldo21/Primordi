'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// ── Tipos ──────────────────────────────────────────────────────────────────────

export interface User {
    id: number;
    nome: string;
    email: string;
    cpf: string;
    role: string;
}

interface AuthContextValue {
    user: User | null;
    accessToken: string | null;
    loading: boolean;
    login: (email: string, senha: string) => Promise<void>;
    logout: () => void;
    refreshAuth: () => Promise<void>;
}

// ── Contexto ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';
const STORAGE_KEY_ACCESS  = 'primordi:accessToken';
const STORAGE_KEY_REFRESH = 'primordi:refreshToken';

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser]               = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [loading, setLoading]         = useState(true);

    // Popula state a partir de uma AuthResponse
    const applyAuthResponse = useCallback((data: any) => {
        const { accessToken, refreshToken, usuario } = data;

        localStorage.setItem(STORAGE_KEY_ACCESS,  accessToken);
        localStorage.setItem(STORAGE_KEY_REFRESH, refreshToken);

        setAccessToken(accessToken);
        setUser({
            id:    usuario.id,
            nome:  usuario.nome,
            email: usuario.email,
            cpf:   usuario.cpf ?? '',   // campo adicionado no backend
            role:  usuario.role,
        });
    }, []);

    // Tenta renovar a sessão usando o refresh token salvo
    const refreshAuth = useCallback(async () => {
        const storedRefresh = localStorage.getItem(STORAGE_KEY_REFRESH);
        if (!storedRefresh) { setLoading(false); return; }

        try {
            const res = await fetch(`${API_URL}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken: storedRefresh }),
            });

            if (!res.ok) throw new Error('Refresh inválido');

            const data = await res.json();
            applyAuthResponse(data);
        } catch {
            localStorage.removeItem(STORAGE_KEY_ACCESS);
            localStorage.removeItem(STORAGE_KEY_REFRESH);
            setUser(null);
            setAccessToken(null);
        } finally {
            setLoading(false);
        }
    }, [applyAuthResponse]);

    // Ao montar, tenta restaurar a sessão
    useEffect(() => {
        refreshAuth();
    }, [refreshAuth]);

    const login = useCallback(async (email: string, senha: string) => {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha }),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err?.message ?? 'E-mail ou senha inválidos');
        }

        const data = await res.json();
        applyAuthResponse(data);
    }, [applyAuthResponse]);

    const logout = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY_ACCESS);
        localStorage.removeItem(STORAGE_KEY_REFRESH);
        setUser(null);
        setAccessToken(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, accessToken, loading, login, logout, refreshAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
    return ctx;
}