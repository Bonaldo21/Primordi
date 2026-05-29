'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { useCart } from '@/contexts/cart-context';
import { ShoppingBag, User, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function StoreHeader() {
  const { user, logout, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Início' },
    { href: '/catalogo', label: 'Catálogo' },
    { href: '/sobre', label: 'Sobre' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/50">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-foreground hover:text-primary transition-colors">
            Primordi
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link: any) => (
              <Link
                key={link?.href}
                href={link?.href ?? '/'}
                className="text-sm tracking-wide text-muted-foreground hover:text-foreground transition-colors uppercase"
              >
                {link?.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAdmin && (
              <Link href="/admin" className="p-2 text-muted-foreground hover:text-foreground transition-colors" title="Painel Admin">
                <LayoutDashboard className="w-5 h-5" />
              </Link>
            )}
            {user ? (
              <button onClick={logout} className="p-2 text-muted-foreground hover:text-foreground transition-colors" title="Sair">
                <LogOut className="w-5 h-5" />
              </button>
            ) : (
              <Link href="/login" className="p-2 text-muted-foreground hover:text-foreground transition-colors" title="Entrar">
                <User className="w-5 h-5" />
              </Link>
            )}
            <Link href="/carrinho" className="relative p-2 text-muted-foreground hover:text-foreground transition-colors" title="Carrinho">
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center min-w-[18px] h-[18px]">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-2">
            <Link href="/carrinho" className="relative p-2 text-muted-foreground">
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-foreground">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t border-border/50 bg-background"
          >
            <nav className="flex flex-col px-4 py-4 gap-3">
              {navLinks.map((link: any) => (
                <Link
                  key={link?.href}
                  href={link?.href ?? '/'}
                  onClick={() => setMenuOpen(false)}
                  className="text-sm tracking-wide text-muted-foreground hover:text-foreground py-2 uppercase"
                >
                  {link?.label}
                </Link>
              ))}
              <div className="border-t border-border/50 pt-3 mt-1 flex flex-col gap-2">
                {isAdmin && (
                  <Link href="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                    <LayoutDashboard className="w-4 h-4" /> Painel Admin
                  </Link>
                )}
                {user ? (
                  <button onClick={() => { logout(); setMenuOpen(false); }} className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                    <LogOut className="w-4 h-4" /> Sair
                  </button>
                ) : (
                  <Link href="/login" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                    <User className="w-4 h-4" /> Entrar
                  </Link>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
