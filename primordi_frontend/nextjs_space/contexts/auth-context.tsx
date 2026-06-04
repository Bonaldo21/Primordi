'use client';

// ── Ponte de compatibilidade ───────────────────────────────────────────────────
// Mantém os 7 arquivos que importam de @/contexts/auth-context funcionando
// sem nenhuma alteração, delegando tudo ao AuthContext canônico.
// ─────────────────────────────────────────────────────────────────────────────

import { useAuth as _useAuth, AuthProvider } from '@/context/AuthContext';

export { AuthProvider };
export type { User } from '@/context/AuthContext';

// Chaves usadas pelo novo AuthContext
const STORAGE_KEY_ACCESS  = 'primordi:accessToken';
const STORAGE_KEY_REFRESH = 'primordi:refreshToken';

const rawApiUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'https://primordi-production.up.railway.app/api')
    .replace(/\s+/g, '').replace(/\/+$/, '');
const API_URL = rawApiUrl.startsWith('http') ? rawApiUrl : `https://${rawApiUrl}`;

export function useAuth() {
  const ctx = _useAuth();

  // isAdmin: derivado de user.role (usado em admin/layout.tsx e header.tsx)
  const isAdmin = ctx.user?.role === 'ADMIN';

  // register: usado em (auth)/registro/page.tsx
  const register = async (data: {
    nome: string;
    email: string;
    senha: string;
    cpf?: string;
    telefone?: string;
  }) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.message ?? 'Erro ao criar conta');
    }

    const json = await res.json();

    // Persiste tokens no storage do novo AuthContext
    if (json?.accessToken && json?.refreshToken) {
      localStorage.setItem(STORAGE_KEY_ACCESS,  json.accessToken);
      localStorage.setItem(STORAGE_KEY_REFRESH, json.refreshToken);
      // Restaura o estado do contexto via refreshAuth
      await ctx.refreshAuth();
    }

    return json;
  };

  // login: delega ao contexto canônico (mesma assinatura login(email, senha))
  // logout: delega ao contexto canônico
  // user: direto do contexto canônico
  // loading: direto do contexto canônico

  return {
    ...ctx,
    isAdmin,
    register,
  };
}
