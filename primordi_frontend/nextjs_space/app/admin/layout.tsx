'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { LayoutDashboard, Package, Tags, ShoppingCart, Users, ArrowLeft, LogOut, Radio } from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/produtos', label: 'Produtos', icon: Package },
  { href: '/admin/categorias', label: 'Categorias', icon: Tags },
  { href: '/admin/pedidos', label: 'Pedidos', icon: ShoppingCart },
  { href: '/admin/clientes', label: 'Clientes', icon: Users },
  { href: '/admin/live', label: 'Live', icon: Radio },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, logout, loading } = useAuth();
  const pathname = usePathname() ?? '';
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAdmin) router.replace('/login');
  }, [loading, isAdmin, router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Carregando...</p></div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen flex">
      <aside className="hidden md:flex flex-col w-60 bg-card border-r border-border p-4">
        <Link href="/" className="font-display text-xl font-semibold tracking-tight mb-1">Primordi</Link>
        <p className="text-xs text-muted-foreground mb-6">Painel Administrativo</p>
        <nav className="flex-1 space-y-1">
          {navItems.map((item: any) => {
            const active = pathname === item?.href;
            return (
              <Link key={item?.href} href={item?.href ?? '/admin'} className={`flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors ${active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}>
                <item.icon className="w-4 h-4" /> {item?.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border pt-3 space-y-1">
          <Link href="/" className="flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="w-4 h-4" /> Voltar à loja</Link>
          <button onClick={logout} className="flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground w-full"><LogOut className="w-4 h-4" /> Sair</button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card">
          <Link href="/admin" className="font-display text-lg font-semibold">Admin</Link>
          <div className="flex gap-2">
            {navItems.map((item: any) => {
              const active = pathname === item?.href;
              return <Link key={item?.href} href={item?.href ?? '/admin'} className={`p-2 rounded ${active ? 'text-primary' : 'text-muted-foreground'}`}><item.icon className="w-4 h-4" /></Link>;
            })}
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 overflow-auto bg-background">{children}</main>
      </div>
    </div>
  );
}
