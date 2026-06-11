import Link from 'next/link';
import { CheckCircle, XCircle } from 'lucide-react';

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://primordi-production.up.railway.app')
    .replace(/\s+/g, '').replace(/\/+$/, '');

async function verificarToken(token: string): Promise<{ ok: boolean; message?: string }> {
    try {
        const res = await fetch(`${API_BASE}/api/auth/verificar-email?token=${token}`, {
            cache: 'no-store',
        });
        if (res.ok) return { ok: true };
        const body = await res.json().catch(() => ({}));
        return { ok: false, message: body?.message ?? 'Link inválido ou expirado.' };
    } catch {
        return { ok: false, message: 'Erro de conexão. Tente novamente.' };
    }
}

export default async function VerificarEmailPage({
    searchParams,
}: {
    searchParams: { token?: string };
}) {
    const token = searchParams?.token;

    if (!token) {
        return <Resultado ok={false} message="Link inválido." />;
    }

    const result = await verificarToken(token);
    return <Resultado ok={result.ok} message={result.message} />;
}

function Resultado({ ok, message }: { ok: boolean; message?: string }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-[400px] text-center bg-card p-8 rounded-xl" style={{ boxShadow: 'var(--shadow-md)' }}>
                <Link href="/" className="font-display text-3xl font-semibold tracking-tight block mb-8">Primor</Link>

                {ok ? (
                    <>
                        <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                        <h2 className="text-xl font-semibold mb-2">E-mail confirmado!</h2>
                        <p className="text-muted-foreground mb-6">Sua conta está ativa. Você já pode fazer login.</p>
                        <Link href="/login" className="inline-block bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                            Entrar
                        </Link>
                    </>
                ) : (
                    <>
                        <XCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
                        <h2 className="text-xl font-semibold mb-2">Link inválido ou expirado</h2>
                        <p className="text-muted-foreground mb-6">{message}</p>
                        <Link href="/registro" className="inline-block bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                            Criar nova conta
                        </Link>
                        <p className="mt-4 text-sm text-muted-foreground">
                            Já tem conta? <Link href="/login" className="text-primary hover:underline">Fazer login</Link>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
