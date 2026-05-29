'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/contexts/cart-context';
import { formatCurrency, getProdutoImagem } from '@/lib/format';
import type { CartItem } from '@/lib/types';

export default function CarrinhoPage() {
  const { items, removeItem, updateQuantity, subtotal, totalItems } = useCart();

  if ((items ?? []).length === 0) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-20 text-center">
        <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h1 className="font-display text-2xl font-semibold mb-2">Carrinho Vazio</h1>
        <p className="text-muted-foreground mb-6">Adicione produtos ao seu carrinho para continuar</p>
        <Link href="/catalogo" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 text-sm font-medium rounded hover:opacity-90 transition-opacity">Explorar Catálogo <ArrowRight className="w-4 h-4" /></Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <motion.h1 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="font-display text-3xl font-semibold tracking-tight mb-8">Carrinho ({totalItems})</motion.h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {(items ?? []).map((item: CartItem, i: number) => {
            const img = getProdutoImagem(item?.produto);
            const price = item?.produto?.precoEfetivo ?? item?.produto?.preco ?? 0;
            return (
              <motion.div key={item?.produto?.id ?? i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="flex gap-4 bg-card p-4 rounded-lg" style={{ boxShadow: 'var(--shadow-sm)' }}>
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-secondary/30 rounded overflow-hidden flex-shrink-0">
                  <Image src={img} alt={item?.produto?.nome ?? 'Produto'} fill className="object-cover" sizes="96px" />
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/produto/${item?.produto?.slug ?? ''}`} className="text-sm font-medium hover:text-primary transition-colors line-clamp-1">{item?.produto?.nome ?? ''}</Link>
                  <p className="text-xs text-muted-foreground mt-0.5">{item?.produto?.categoria?.nome ?? ''}</p>
                  <p className="text-sm font-semibold mt-1">{formatCurrency(price)}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center border border-border rounded">
                      <button onClick={() => updateQuantity(item?.produto?.id, (item?.quantidade ?? 1) - 1)} className="p-1 hover:bg-secondary"><Minus className="w-3 h-3" /></button>
                      <span className="px-2 text-xs font-medium">{item?.quantidade ?? 1}</span>
                      <button onClick={() => updateQuantity(item?.produto?.id, (item?.quantidade ?? 1) + 1)} className="p-1 hover:bg-secondary"><Plus className="w-3 h-3" /></button>
                    </div>
                    <button onClick={() => removeItem(item?.produto?.id)} className="p-1 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatCurrency(price * (item?.quantidade ?? 1))}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
        <div className="lg:col-span-1">
          <div className="bg-card p-6 rounded-lg sticky top-24" style={{ boxShadow: 'var(--shadow-md)' }}>
            <h2 className="font-medium text-lg mb-4">Resumo</h2>
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span className="font-medium">{formatCurrency(subtotal)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Frete</span><span className="text-xs text-muted-foreground">Calculado no checkout</span></div>
              <div className="border-t border-border pt-2 flex justify-between"><span className="font-medium">Total</span><span className="font-semibold text-lg">{formatCurrency(subtotal)}</span></div>
            </div>
            <Link href="/checkout" className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground py-3 text-sm font-medium rounded hover:opacity-90 transition-opacity">Finalizar Compra <ArrowRight className="w-4 h-4" /></Link>
          </div>
        </div>
      </div>
    </div>
  );
}
