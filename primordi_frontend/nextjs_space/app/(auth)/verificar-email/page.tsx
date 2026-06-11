'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://primordi-production.up.railway.app')
    .replace(/\s+/g, '').replace(/\/+$/, '');

type Status = 'loading' | 'success' | 'error';

function VerificarEmailContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const [status, setStatus] = useState<Status>('loading');
    const [mensagem, setMensagem] = useState('');
    const [email, setEmail] = useState('');
    const [reenviando, setReeenviando] = useState(false);
    const [reenviado, setReenviado] = useState(false);

    useEffect(() => {
        if (!token) { setStatus('error'); setMensagem('Link inválido.'); return; }

        fetch(`${API_BASE}/api/auth/verificar-email?token=${encodeURIComponent(token)}`)
            .then(async (res) => {
                if (res.ok) { setStatus('success'); return; }
                const body = await res.json().catch(() => ({}));
                setStatus('error');
                setMensagem(body?.message ?? 'Link inválido ou expirado.');
            })
            .catch(() => { setStatus('error'); setMensagem('Erro de conexão. Tente novamente.'); });
    }, [token]);

    const reenviar = async (e: React.FormEvent) => {
        e.preventDefault();
        setReeenviando(true);
        try {
            await fetch(`${API_BASE}/api/auth/reenviar-verificacao`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            setReenviado(true);
        } catch {
            toast.error('Erro ao reenviar. Tente novamente.');
        } finally {
            setReeenviando(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[400px] text-center bg-card p-8 rounded-xl"
                style={{ boxShadow: 'var(--shadow-md)' }}
            >
                <Link href="/" className="font-display text-3xl font-semibold tracking-tight block mb-8">Primor</Link>

                {status === 'loading' && (
                    <>
                        <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
                        <p className="text-muted-foreground">Verificando seu e-mail…</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                        <h2 className="text-xl font-semibold mb-2">E-mail confirmado!</h2>
                        <p className="text-muted-foreground mb-6">Sua conta está ativa. Você já pode fazer login.</p>
                        <Link href="/login" className="inline-block bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">Entrar</Link>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <XCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
                        <h2 className="text-xl font-semibold mb-2">Link inválido ou expirado</h2>
                        <p className="text-muted-foreground mb-6">{mensagem}</p>

                        {reenviado ? (
                            <p className="text-sm text-muted-foreground">Novo link enviado! Verifique sua caixa de entrada.</p>
                        ) : (
                            <form onSubmit={reenviar} className="space-y-3 text-left">
                                <p className="text-sm text-muted-foreground text-center">Informe seu e-mail para receber um novo link:</p>
                                <input
                                    type="email" required value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="seu@email.com"
                                    className="w-full px-4 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring"
                                />
                                <button type="submit" disabled={reenviando} className="w-full bg-primary text-primary-foreground py-2.5 text-sm font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
                                    {reenviando ? 'Enviando...' : 'Reenviar e-mail'}
                                </button>
                            </form>
                        )}
                    </>
                )}
            </motion.div>
        </div>
    );
}

export default function VerificarEmailPage() {
    return <Suspense><VerificarEmailContent /></Suspense>;
}
