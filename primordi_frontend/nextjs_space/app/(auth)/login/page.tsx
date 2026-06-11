'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e?.preventDefault?.();
    setLoading(true);
    try {
      await login(email, senha);
      toast.success('Login realizado com sucesso!');
      router.replace('/');
    } catch (err: any) {
      toast.error(err?.message ?? 'Erro ao fazer login');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[400px]">
        <div className="text-center mb-8">
          <Link href="/" className="font-display text-3xl font-semibold tracking-tight">Primor</Link>
          <p className="text-muted-foreground mt-2">Entre na sua conta</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-card p-6 sm:p-8 rounded-xl space-y-4" style={{ boxShadow: 'var(--shadow-md)' }}>
          <div>
            <label className="text-sm font-medium mb-1.5 block">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="email" required value={email} onChange={(e: any) => setEmail(e?.target?.value ?? '')} placeholder="seu@email.com" className="w-full pl-10 pr-4 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="password" required value={senha} onChange={(e: any) => setSenha(e?.target?.value ?? '')} placeholder="••••••••" className="w-full pl-10 pr-4 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
          </div>
          <div className="flex justify-end">
            <Link href="/esqueci-senha" className="text-xs text-muted-foreground hover:text-primary">Esqueci minha senha</Link>
          </div>
          <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 text-sm font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
            <LogIn className="w-4 h-4" /> {loading ? 'Entrando...' : 'Entrar'}
          </button>
          <p className="text-center text-sm text-muted-foreground">Não tem conta? <Link href="/registro" className="text-primary hover:underline">Criar conta</Link></p>
        </form>
      </motion.div>
    </div>
  );
}
