'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import { toast } from 'sonner';
import { authApi } from '@/lib/api';

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.esqueciSenha(email);
      setEnviado(true);
    } catch {
      toast.error('Erro ao enviar e-mail. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[400px]">
        <div className="text-center mb-8">
          <Link href="/" className="font-display text-3xl font-semibold tracking-tight">Primor</Link>
          <p className="text-muted-foreground mt-2">Redefinir senha</p>
        </div>
        <div className="bg-card p-6 sm:p-8 rounded-xl space-y-4" style={{ boxShadow: 'var(--shadow-md)' }}>
          {enviado ? (
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">Se esse e-mail estiver cadastrado, você receberá as instruções em breve. Verifique também o spam.</p>
              <Link href="/login" className="text-sm text-primary hover:underline block">Voltar para o login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-muted-foreground">Informe seu e-mail e enviaremos um link para redefinir sua senha.</p>
              <div>
                <label className="text-sm font-medium mb-1.5 block">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" className="w-full pl-10 pr-4 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground py-2.5 text-sm font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
                {loading ? 'Enviando...' : 'Enviar link'}
              </button>
              <p className="text-center text-sm text-muted-foreground"><Link href="/login" className="text-primary hover:underline">Voltar para o login</Link></p>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
