'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, User, UserPlus, CreditCard } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';

export default function RegistroPage() {
    const router = useRouter();
    const { register } = useAuth();
    // ✅ cpf adicionado ao state
    const [form, setForm] = useState({ nome: '', email: '', senha: '', confirmarSenha: '', cpf: '' });
    const [loading, setLoading] = useState(false);

    const update = (field: string, value: string) =>
        setForm((prev: any) => ({ ...(prev ?? {}), [field]: value }));

    // ✅ Máscara simples de CPF
    const handleCpf = (value: string) => {
        const digits = value.replace(/\D/g, '').slice(0, 11);
        const masked = digits
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        update('cpf', masked);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e?.preventDefault?.();
        if (form.senha !== form.confirmarSenha) { toast.error('As senhas não coincidem'); return; }
        if ((form?.senha?.length ?? 0) < 6) { toast.error('A senha deve ter pelo menos 6 caracteres'); return; }
        setLoading(true);
        try {
            // ✅ cpf enviado para o backend
            await register({
                nome: form.nome,
                email: form.email,
                senha: form.senha,
                cpf: form.cpf || undefined,
            });
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
                    <Link href="/" className="font-display text-3xl font-semibold tracking-tight">Primor</Link>
                    <p className="text-muted-foreground mt-2">Crie sua conta</p>
                </div>
                <form onSubmit={handleSubmit} className="bg-card p-6 sm:p-8 rounded-xl space-y-4" style={{ boxShadow: 'var(--shadow-md)' }}>
                    <div>
                        <label className="text-sm font-medium mb-1.5 block">Nome</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input type="text" required value={form.nome} onChange={(e) => update('nome', e.target.value)} placeholder="Seu nome" className="w-full pl-10 pr-4 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring" />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1.5 block">E-mail</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input type="email" required value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="seu@email.com" className="w-full pl-10 pr-4 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring" />
                        </div>
                    </div>

                    {/* ✅ Campo CPF novo */}
                    <div>
                        <label className="text-sm font-medium mb-1.5 block">CPF <span className="text-muted-foreground font-normal">(opcional)</span></label>
                        <div className="relative">
                            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input type="text" value={form.cpf} onChange={(e) => handleCpf(e.target.value)} placeholder="000.000.000-00" maxLength={14} className="w-full pl-10 pr-4 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring" />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-1.5 block">Senha</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input type="password" required value={form.senha} onChange={(e) => update('senha', e.target.value)} placeholder="••••••••" className="w-full pl-10 pr-4 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring" />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1.5 block">Confirmar Senha</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input type="password" required value={form.confirmarSenha} onChange={(e) => update('confirmarSenha', e.target.value)} placeholder="••••••••" className="w-full pl-10 pr-4 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring" />
                        </div>
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
