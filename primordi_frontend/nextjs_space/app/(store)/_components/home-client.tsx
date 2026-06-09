'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Gem, Shield, Truck } from 'lucide-react';
import { ProductCard } from '@/components/store/product-card';
import { produtosApi, categoriasApi } from '@/lib/api';
import type { Produto, Categoria } from '@/lib/types';

export function HomeClient() {
  const [destaques, setDestaques] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [prods, cats] = await Promise.allSettled([
          produtosApi.destaques(),
          categoriasApi.ativas(),
        ]);
        const prodResult = prods.status === 'fulfilled' ? prods.value : null;
        const catResult = cats.status === 'fulfilled' ? cats.value : null;
        // destaques pode ser array direto ou paginado { content: [] }
        const destaquesArr = Array.isArray(prodResult)
          ? prodResult
          : (prodResult as any)?.content ?? [];
        setDestaques(destaquesArr);
        setCategorias(Array.isArray(catResult) ? catResult : []);
      } catch {
        setDestaques([]);
        setCategorias([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div>
      <section className="relative h-[70vh] sm:h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image src="https://cdn.abacus.ai/images/7ea29d31-59dc-4105-95cc-b2fac5a0f2eb.png" alt="Produtos artesanais em couro Primor

          " fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
        </div>
        <div className="relative z-10 text-center px-4 max-w-[800px] mx-auto">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-white/80 text-sm uppercase tracking-[0.3em] mb-4">Couro Artesanal</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="font-display text-4xl sm:text-5xl md:text-6xl font-semibold text-white tracking-tight mb-6">Feito à mão,<br />feito para durar</motion.h1>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <Link href="/catalogo" className="inline-flex items-center gap-2 bg-white text-foreground px-6 py-3 text-sm font-medium tracking-wide hover:bg-white/90 transition-colors rounded">Explorar Coleção <ArrowRight className="w-4 h-4" /></Link>
          </motion.div>
        </div>
      </section>

      <section className="bg-secondary/50 py-8">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {[{ icon: Gem, title: 'Artesanal', desc: 'Cada peça feita à mão' }, { icon: Shield, title: 'Qualidade', desc: 'Couro legítimo premium' }, { icon: Truck, title: 'Entrega Segura', desc: 'Para todo o Brasil' }].map((item: any, i: number) => (
              <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex flex-col items-center gap-2">
                <item.icon className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-medium">{item?.title}</h3>
                <p className="text-xs text-muted-foreground">{item?.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">Categorias</h2>
            <p className="text-muted-foreground mt-2">Explore nossa coleção por categoria</p>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {(categorias ?? []).map((cat: Categoria, i: number) => (
              <motion.div key={cat?.id ?? i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <Link href={`/catalogo?categoria=${cat?.slug ?? ''}`} className="group block text-center">
                  <div className="relative aspect-square bg-secondary/30 rounded-lg overflow-hidden mb-3">
                    <Image src={cat?.imagemUrl ?? '/favicon.svg'} alt={cat?.nome ?? 'Categoria'} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 640px) 50vw, 20vw" />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                  </div>
                  <h3 className="text-sm font-medium group-hover:text-primary transition-colors">{cat?.nome ?? ''}</h3>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-secondary/20">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">Destaques</h2>
              <p className="text-muted-foreground mt-2">Nossos produtos mais populares</p>
            </div>
            <Link href="/catalogo" className="hidden sm:inline-flex items-center gap-1 text-sm text-primary hover:underline">Ver todos <ArrowRight className="w-4 h-4" /></Link>
          </motion.div>
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: 4 }).map((_: any, i: number) => (<div key={i} className="animate-pulse"><div className="aspect-square bg-secondary/50 rounded-lg mb-3" /><div className="h-3 bg-secondary/50 rounded w-1/3 mb-2" /><div className="h-4 bg-secondary/50 rounded w-2/3" /></div>))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {(destaques ?? []).slice(0, 8).map((prod: Produto, i: number) => (<ProductCard key={prod?.id ?? i} produto={prod} index={i} />))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative aspect-[3/2] rounded-lg overflow-hidden">
              <Image src="https://cdn.abacus.ai/images/7609f3a9-f315-45c1-83de-80de24a2b89e.png" alt="Artesão trabalhando com couro" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-4">
              <p className="text-xs text-primary uppercase tracking-[0.3em]">Nossa história</p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">Desde 1954 em Serra Negra — SP</h2>
              <p className="text-muted-foreground leading-relaxed">Somos a fábrica de couro legítimo mais antiga de Serra Negra. Nossa trajetória é longínqua, prezando sempre em qualidade e durabilidade.</p>
              <p className="text-muted-foreground leading-relaxed">As peças são feitas artesanalmente, alinhadas na excelência do material a designs modernos e estilosos. Referência regional, com três lojas no interior de SP e crescendo cada vez mais no online. Sejam bem-vindos!</p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-foreground text-primary-foreground">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight mb-4">Encontre sua peça ideal</h2>
            <p className="text-primary-foreground/70 max-w-md mx-auto mb-8">Explore nossa coleção completa de produtos artesanais em couro</p>
            <Link href="/catalogo" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 text-sm font-medium tracking-wide hover:opacity-90 transition-opacity rounded">Ver Catálogo Completo <ArrowRight className="w-4 h-4" /></Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
