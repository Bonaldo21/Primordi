'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { toast } from 'sonner';
import { authApi } from '@/lib/api';

function RedefinirSenhaForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token') ?? '';
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (novaSenha !== confirmar) {
      toast.error('As senhas não coincidem');
      return;
    }
    if (novaSenha.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres');
      return;
    }
    setLoading(true);
    try {
      await authApi.redefinirSenha(token, novaSenha);
      toast.success('Senha redefinida com sucesso!');
      router.replace('/login');
    } catch (err: any) {
      toast.error(err?.message ?? 'Link inválido ou expirado. Solicite um novo.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) return (
    <div className="text-center space-y-3">
      <p className="text-sm text-muted-foreground">Link inválido. Solicite um novo e-mail de redefinição.</p>
      <Link href="/esqueci-senha" className="text-sm text-primary hover:underline block">Solicitar novo link</Link>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-muted-foreground">Digite sua nova senha abaixo.</p>
      <div>
        <label className="text-sm font-medium mb-1.5 block">Nova senha</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="password" required value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} placeholder="••••••••" className="w-full pl-10 pr-4 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium mb-1.5 block">Confirmar senha</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="password" required value={confirmar} onChange={(e) => setConfirmar(e.target.value)} placeholder="••••••••" className="w-full pl-10 pr-4 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>
      </div>
      <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground py-2.5 text-sm font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
        {loading ? 'Salvando...' : 'Redefinir senha'}
      </button>
    </form>
  );
}

export default function RedefinirSenhaPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[400px]">
        <div className="text-center mb-8">
          <Link href="/" className="font-display text-3xl font-semibold tracking-tight">Primor</Link>
          <p className="text-muted-foreground mt-2">Criar nova senha</p>
        </div>
        <div className="bg-card p-6 sm:p-8 rounded-xl" style={{ boxShadow: 'var(--shadow-md)' }}>
          <Suspense>
            <RedefinirSenhaForm />
          </Suspense>
        </div>
      </motion.div>
    </div>
  );
}
