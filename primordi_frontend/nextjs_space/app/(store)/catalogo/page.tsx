'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { ProductCard } from '@/components/store/product-card';
import { sampleProducts, sampleCategories } from '@/lib/sample-data';
import { produtosApi, categoriasApi } from '@/lib/api';
import type { Produto, Categoria } from '@/lib/types';
import { motion } from 'framer-motion';

function CatalogoContent() {
  const searchParams = useSearchParams();
  const categoriaParam = searchParams?.get('categoria') ?? '';

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [categoriaAtiva, setCategoriaAtiva] = useState(categoriaParam);
  const [ordenacao, setOrdenacao] = useState('nome');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [prodsRes, catsRes] = await Promise.allSettled([
        produtosApi.listar({ apenasAtivos: 'true', size: '50' }),
        categoriasApi.ativas(),
      ]);
      const prods = prodsRes.status === 'fulfilled' ? (prodsRes.value?.content ?? []) : [];
      const cats = catsRes.status === 'fulfilled' ? (catsRes.value ?? []) : [];
      setProdutos(prods?.length > 0 ? prods : sampleProducts);
      setCategorias(cats?.length > 0 ? cats : sampleCategories);
    } catch {
      setProdutos(sampleProducts);
      setCategorias(sampleCategories);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { setCategoriaAtiva(categoriaParam); }, [categoriaParam]);

  const filtered = (produtos ?? []).filter((p: Produto) => {
    if (categoriaAtiva && p?.categoria?.slug !== categoriaAtiva) return false;
    if (busca && !(p?.nome ?? '').toLowerCase().includes(busca.toLowerCase())) return false;
    return true;
  }).sort((a: Produto, b: Produto) => {
    if (ordenacao === 'preco_asc') return (a?.precoEfetivo ?? 0) - (b?.precoEfetivo ?? 0);
    if (ordenacao === 'preco_desc') return (b?.precoEfetivo ?? 0) - (a?.precoEfetivo ?? 0);
    return (a?.nome ?? '').localeCompare(b?.nome ?? '');
  });

  return (
    <div className="py-10 sm:py-16">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">Catálogo</h1>
          <p className="text-muted-foreground mt-1">Explore todos os nossos produtos artesanais</p>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Buscar produtos..." value={busca} onChange={(e: any) => setBusca(e?.target?.value ?? '')} className="w-full pl-10 pr-4 py-2.5 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring" />
          </div>
          <select value={ordenacao} onChange={(e: any) => setOrdenacao(e?.target?.value ?? 'nome')} className="px-3 py-2.5 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring">
            <option value="nome">Nome A-Z</option>
            <option value="preco_asc">Menor preço</option>
            <option value="preco_desc">Maior preço</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          <button onClick={() => setCategoriaAtiva('')} className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${!categoriaAtiva ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-accent'}`}>Todos</button>
          {(categorias ?? []).map((cat: Categoria) => (
            <button key={cat?.id} onClick={() => setCategoriaAtiva(categoriaAtiva === cat?.slug ? '' : cat?.slug ?? '')} className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${categoriaAtiva === cat?.slug ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-accent'}`}>{cat?.nome ?? ''}</button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_: any, i: number) => (<div key={i} className="animate-pulse"><div className="aspect-square bg-secondary/50 rounded-lg mb-3" /><div className="h-3 bg-secondary/50 rounded w-1/3 mb-2" /><div className="h-4 bg-secondary/50 rounded w-2/3" /></div>))}
          </div>
        ) : filtered?.length === 0 ? (
          <div className="text-center py-20"><p className="text-muted-foreground">Nenhum produto encontrado.</p></div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {(filtered ?? []).map((prod: Produto, i: number) => (<ProductCard key={prod?.id ?? i} produto={prod} index={i} />))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CatalogoPage() {
  return <Suspense fallback={<div className="py-20 text-center text-muted-foreground">Carregando...</div>}><CatalogoContent /></Suspense>;
}
