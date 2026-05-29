'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, User, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';

export default function RegistroPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState({ nome: '', email: '', senha: '', confirmarSenha: '' });
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) => setForm((prev: any) => ({ ...(prev ?? {}), [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e?.preventDefault?.();
    if (form.senha !== form.confirmarSenha) { toast.error('As senhas não coincidem'); return; }
    if ((form?.senha?.length ?? 0) < 6) { toast.error('A senha deve ter pelo menos 6 caracteres'); return; }
    setLoading(true);
    try {
      await register({ nome: form.nome, email: form.email, senha: form.senha });
      toast.success('Conta criada com sucesso!');
      router.replace('/');
    } catch (err: any) {
      toast.error(err?.message ?? 'Erro ao criar conta');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[400px]">
        <div className="text-center mb-8">
          <Link href="/" className="font-display text-3xl font-semibold tracking-tight">Primordi</Link>
          <p className="text-muted-foreground mt-2">Crie sua conta</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-card p-6 sm:p-8 rounded-xl space-y-4" style={{ boxShadow: 'var(--shadow-md)' }}>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Nome</label>
            <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><input type="text" required value={form.nome} onChange={(e: any) => update('nome', e?.target?.value ?? '')} placeholder="Seu nome" className="w-full pl-10 pr-4 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring" /></div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">E-mail</label>
            <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><input type="email" required value={form.email} onChange={(e: any) => update('email', e?.target?.value ?? '')} placeholder="seu@email.com" className="w-full pl-10 pr-4 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring" /></div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Senha</label>
            <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><input type="password" required value={form.senha} onChange={(e: any) => update('senha', e?.target?.value ?? '')} placeholder="••••••••" className="w-full pl-10 pr-4 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring" /></div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Confirmar Senha</label>
            <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><input type="password" required value={form.confirmarSenha} onChange={(e: any) => update('confirmarSenha', e?.target?.value ?? '')} placeholder="••••••••" className="w-full pl-10 pr-4 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring" /></div>
          </div>
          <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 text-sm font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
            <UserPlus className="w-4 h-4" /> {loading ? 'Criando...' : 'Criar Conta'}
          </button>
          <p className="text-center text-sm text-muted-foreground">Já tem conta? <Link href="/login" className="text-primary hover:underline">Entrar</Link></p>
        </form>
      </motion.div>
    </div>
  );
}
