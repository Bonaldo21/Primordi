import Link from 'next/link';
import { CheckCircle, XCircle } from 'lucide-react';

export default function VerificarEmailPage({
    searchParams,
}: {
    searchParams: { status?: string; message?: string };
}) {
    const ok = searchParams?.status === 'ok';
    const message = searchParams?.message ?? 'Link inválido ou expirado.';

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
                        <p className="text-muted-foreground mb-6">{decodeURIComponent(message)}</p>
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
