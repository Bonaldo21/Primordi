'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://primordi-production.up.railway.app')
    .replace(/\s+/g, '').replace(/\/+$/, '');

type Status = 'loading' | 'success' | 'error';

export default function VerificarEmailPage() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const [status, setStatus] = useState<Status>('loading');
    const [mensagem, setMensagem] = useState('');

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

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[400px] text-center bg-card p-8 rounded-xl"
                style={{ boxShadow: 'var(--shadow-md)' }}
            >
                <Link href="/" className="font-display text-3xl font-semibold tracking-tight block mb-8">
                    Primor
                </Link>

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
                        <Link
                            href="/login"
                            className="inline-block bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                        >
                            Entrar
                        </Link>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <XCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
                        <h2 className="text-xl font-semibold mb-2">Link inválido</h2>
                        <p className="text-muted-foreground mb-6">{mensagem}</p>
                        <Link
                            href="/registro"
                            className="inline-block bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                        >
                            Criar nova conta
                        </Link>
                    </>
                )}
            </motion.div>
        </div>
    );
}
