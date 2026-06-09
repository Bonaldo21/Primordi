'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Package, MapPin, LogOut, ChevronRight, User } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';

const MENU = [
  { href: '/conta/pedidos',   icon: Package, title: 'Meus Pedidos',  desc: 'Acompanhe e consulte seus pedidos' },
  { href: '/conta/enderecos', icon: MapPin,   title: 'Endereços',     desc: 'Gerencie seus endereços de entrega' },
];

export default function ContaPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) {
    return (
      <div className="max-w-[600px] mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground mb-4">Faça login para acessar sua conta.</p>
        <Link href="/login" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 text-sm font-medium rounded hover:opacity-90">Entrar</Link>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="max-w-[600px] mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight">{user.nome}</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="space-y-3">
          {MENU.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border hover:border-primary/50 hover:bg-accent/30 transition-colors group"
              style={{ boxShadow: 'var(--shadow-sm)' }}
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </Link>
          ))}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 p-4 bg-card rounded-lg border border-border hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors group text-left"
            style={{ boxShadow: 'var(--shadow-sm)' }}
          >
            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-950/40 flex items-center justify-center shrink-0">
              <LogOut className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm text-red-600 dark:text-red-400">Sair da conta</p>
            </div>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
