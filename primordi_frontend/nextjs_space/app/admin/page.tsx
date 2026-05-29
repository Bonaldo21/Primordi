'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Tags, ShoppingCart, Users, TrendingUp, DollarSign } from 'lucide-react';
import { sampleProducts, sampleCategories } from '@/lib/sample-data';
import { produtosApi, categoriasApi } from '@/lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ produtos: 0, categorias: 0, pedidos: 0, receita: 0 });

  useEffect(() => {
    async function load() {
      try {
        const [prods, cats] = await Promise.allSettled([produtosApi.listar({ size: '1' }), categoriasApi.todas()]);
        const totalProds = prods.status === 'fulfilled' ? (prods.value?.totalElements ?? sampleProducts.length) : sampleProducts.length;
        const totalCats = cats.status === 'fulfilled' ? ((cats.value as any)?.length ?? sampleCategories.length) : sampleCategories.length;
        setStats({ produtos: totalProds, categorias: totalCats, pedidos: 24, receita: 15890 });
      } catch {
        setStats({ produtos: sampleProducts.length, categorias: sampleCategories.length, pedidos: 24, receita: 15890 });
      }
    }
    load();
  }, []);

  const cards = [
    { label: 'Produtos', value: stats.produtos, icon: Package, color: 'text-blue-600 bg-blue-50' },
    { label: 'Categorias', value: stats.categorias, icon: Tags, color: 'text-green-600 bg-green-50' },
    { label: 'Pedidos', value: stats.pedidos, icon: ShoppingCart, color: 'text-orange-600 bg-orange-50' },
    { label: 'Receita', value: `R$ ${(stats.receita / 100).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`, icon: DollarSign, color: 'text-primary bg-primary/10' },
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
