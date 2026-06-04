'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Tags, ShoppingCart, DollarSign } from 'lucide-react';
import { produtosApi, categoriasApi, pedidosApi } from '@/lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ produtos: 0, categorias: 0, pedidos: 0, receita: 0 });

  useEffect(() => {
    async function load() {
      const [prods, cats, pedidos] = await Promise.allSettled([
        produtosApi.listar({ size: '1' }),
        categoriasApi.todas(),
        pedidosApi.admin.listar({ size: '100' }),
      ]);
      const totalProds = prods.status === 'fulfilled' ? (prods.value?.totalElements ?? 0) : 0;
      const totalCats = cats.status === 'fulfilled' ? ((cats.value as any)?.length ?? 0) : 0;
      const totalPedidos = pedidos.status === 'fulfilled' ? (pedidos.value?.totalElements ?? 0) : 0;
      const receita = pedidos.status === 'fulfilled'
        ? (pedidos.value?.content ?? []).reduce((sum: number, p: any) => sum + (p?.total ?? 0), 0)
        : 0;
      setStats({ produtos: totalProds, categorias: totalCats, pedidos: totalPedidos, receita });
    }
    load();
  }, []);

  const cards = [
    { label: 'Produtos', value: stats.produtos, icon: Package, color: 'text-blue-600 bg-blue-50' },
    { label: 'Categorias', value: stats.categorias, icon: Tags, color: 'text-green-600 bg-green-50' },
    { label: 'Pedidos', value: stats.pedidos, icon: ShoppingCart, color: 'text-orange-600 bg-orange-50' },
    { label: 'Receita', value: `R$ ${stats.receita.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`, icon: DollarSign, color: 'text-primary bg-primary/10' },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c: any, i: number) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card rounded-lg p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{c?.label}</span>
              <div className={`p-2 rounded-lg ${c?.color}`}><c.icon className="w-4 h-4" /></div>
            </div>
            <p className="text-2xl font-semibold">{c?.value}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
