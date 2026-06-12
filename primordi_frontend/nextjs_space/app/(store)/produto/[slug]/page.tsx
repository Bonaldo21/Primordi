'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBag, Minus, Plus, ArrowLeft, Check } from 'lucide-react';
import { useCart } from '@/contexts/cart-context';
import { produtosApi } from '@/lib/api';

import { formatCurrency, getProdutoImagem } from '@/lib/format';
import type { Produto } from '@/lib/types';
import { toast } from 'sonner';

export default function ProdutoPage() {
  const params = useParams();
  const slug = (params?.slug as string) ?? '';
  const { addItem } = useCart();
  const [produto, setProduto] = useState<Produto | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantidade, setQuantidade] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const p = await produtosApi.getBySlug(slug);
        setProduto(p ?? null);
      } catch {
        setProduto(null);
      } finally { setLoading(false); }
    }
    if (slug) load();
  }, [slug]);

  if (loading) return <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10"><div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-pulse"><div className="aspect-square bg-secondary/50 rounded-lg" /><div className="space-y-4"><div className="h-6 bg-secondary/50 rounded w-1/4" /><div className="h-8 bg-secondary/50 rounded w-3/4" /></div></div></div>;
  if (!produto) return <div className="max-w-[1200px] mx-auto px-4 py-20 text-center"><p className="text-muted-foreground mb-4">Produto não encontrado.</p><Link href="/catalogo" className="text-primary hover:underline">Voltar ao catálogo</Link></div>;

  const imgs = produto?.imagens ?? [];
  const currentImg = imgs?.[selectedImage]?.url ?? getProdutoImagem(produto);
  const hasPromo = (produto?.precoPromocional ?? 0) > 0 && (produto?.precoPromocional ?? 0) < (produto?.preco ?? 0);

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <Link href="/catalogo" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"><ArrowLeft className="w-4 h-4" /> Voltar</Link>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="relative aspect-square bg-secondary/30 rounded-lg overflow-hidden mb-3"><Image src={currentImg} alt={produto?.nome ?? ''} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" /></div>
          {imgs?.length > 1 && <div className="flex gap-2">{imgs.map((img: any, i: number) => (<button key={img?.id ?? i} onClick={() => setSelectedImage(i)} className={`relative w-16 h-16 rounded overflow-hidden border-2 ${i === selectedImage ? 'border-primary' : 'border-transparent'}`}><Image src={img?.url ?? ''} alt={img?.altText ?? ''} fill className="object-cover" sizes="64px" /></button>))}</div>}
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <div><p className="text-xs text-primary uppercase tracking-[0.2em] mb-1">{produto?.categoria?.nome ?? ''}</p><h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">{produto?.nome ?? ''}</h1></div>
          <div className="space-y-1">
            {hasPromo && (
              <div className="flex items-center gap-2">
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">PROMOÇÃO</span>
                <span className="text-base text-muted-foreground line-through">{formatCurrency(produto?.preco)}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <span className="text-2xl font-semibold text-green-600">{formatCurrency(produto?.precoPixBoleto ?? produto?.precoEfetivo * 0.9)}</span>
              <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded">10% OFF</span>
            </div>
            <p className="text-sm text-muted-foreground">à vista no PIX ou Boleto</p>
            <p className="text-sm text-muted-foreground">No cartão: <span className="font-medium text-foreground">{formatCurrency(produto?.precoEfetivo)}</span> em até 3×</p>
          </div>
          <p className="text-muted-foreground leading-relaxed">{produto?.descricao ?? ''}</p>
          <div className="flex flex-wrap gap-4 text-sm">{produto?.tipoCouro && <div><span className="text-muted-foreground">Couro:</span> <span className="font-medium">{produto.tipoCouro}</span></div>}{produto?.cor && <div><span className="text-muted-foreground">Cor:</span> <span className="font-medium">{produto.cor}</span></div>}</div>
          <div className="flex items-center gap-4">
            <div className="flex items-center border border-border rounded"><button onClick={() => setQuantidade(Math.max(1, quantidade - 1))} className="p-2 hover:bg-secondary"><Minus className="w-4 h-4" /></button><span className="px-4 text-sm font-medium">{quantidade}</span><button onClick={() => setQuantidade(quantidade + 1)} className="p-2 hover:bg-secondary"><Plus className="w-4 h-4" /></button></div>
            <button onClick={() => { addItem(produto, quantidade); toast.success('Adicionado ao carrinho'); }} className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 px-6 text-sm font-medium rounded hover:opacity-90"><ShoppingBag className="w-4 h-4" /> Adicionar</button>
          </div>
          {(produto?.estoque ?? 0) > 0 ? <p className="flex items-center gap-1 text-sm text-green-700"><Check className="w-4 h-4" /> Em estoque</p> : <p className="text-sm text-red-600">Fora de estoque</p>}
        </motion.div>
      </div>
    </div>
  );
}
