'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Radio, ShoppingBag, Wifi, WifiOff } from 'lucide-react';
import { liveApi } from '@/lib/api';
import { getProdutoImagem, formatCurrency } from '@/lib/format';
import { useCart } from '@/contexts/cart-context';
import { toast } from 'sonner';

export default function LivePage() {
  const [liveStatus, setLiveStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [conectado, setConectado] = useState(false);
  const { addItem } = useCart();
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    carregarStatus();
    conectarSSE();
    return () => eventSourceRef.current?.close();
  }, []);

  async function carregarStatus() {
    try {
      const status = await liveApi.status();
      setLiveStatus(status);
    } catch {
      toast.error('Erro ao carregar live');
    } finally {
      setLoading(false);
    }
  }

  function conectarSSE() {
    const rawBase = (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://primordi-production.up.railway.app/api')
      .replace(/\s+/g, '').replace(/\/+$/, '');
    const base = rawBase.startsWith('http') ? rawBase : `https://${rawBase}`;

    const es = new EventSource(`${base}/live/eventos`);
    eventSourceRef.current = es;

    es.onopen = () => setConectado(true);
    es.onerror = () => setConectado(false);

    es.addEventListener('LIVE_INICIADA', () => {
      carregarStatus();
      toast.success('🔴 A live começou!');
    });
    es.addEventListener('LIVE_ENCERRADA', () => {
      carregarStatus();
      toast('Live encerrada');
    });
    es.addEventListener('PRODUTO_LIVE_ATUALIZADO', () => {
      carregarStatus();
    });
  }

  const ativa = liveStatus?.ativa ?? false;
  const produtos = liveStatus?.produtos ?? [];

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10 sm:py-14">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Radio className={`w-6 h-6 ${ativa ? 'text-red-500 animate-pulse' : 'text-muted-foreground'}`} />
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">
              {liveStatus?.titulo ?? 'Live Primor'}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {ativa
                ? `🔴 Ao vivo agora · ${liveStatus?.clientesConectados ?? 0} pessoas assistindo`
                : 'Nenhuma live no momento'}
            </p>
          </div>
        </div>
        <span title={conectado ? 'Conectado em tempo real' : 'Sem conexão em tempo real'}>
          {conectado
            ? <Wifi className="w-4 h-4 text-green-500" />
            : <WifiOff className="w-4 h-4 text-muted-foreground" />}
        </span>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-secondary/30 animate-pulse aspect-[3/4]" />
          ))}
        </div>
      ) : !ativa ? (
        /* Offline */
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <Radio className="w-12 h-12 text-muted-foreground/40" />
          <p className="text-lg font-medium text-muted-foreground">Nenhuma live no momento</p>
          <p className="text-sm text-muted-foreground">Fique de olho nas nossas redes sociais para saber quando a próxima começar.</p>
          <Link href="/catalogo" className="mt-2 inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            Ver Catálogo
          </Link>
        </div>
      ) : produtos.length === 0 ? (
        <p className="text-center text-muted-foreground py-20">Nenhum produto adicionado à live ainda.</p>
      ) : (
        /* Grade de produtos */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {produtos.map((p: any) => (
            <div key={p.id} className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col">
              <Link href={`/produto/${p.slug}`} className="relative aspect-square bg-secondary/20 block overflow-hidden">
                <Image
                  src={getProdutoImagem(p)}
                  alt={p.nome}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                {/* Badge ao vivo */}
                <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  LIVE
                </span>
              </Link>
              <div className="p-3 flex flex-col flex-1">
                <Link href={`/produto/${p.slug}`} className="text-sm font-medium line-clamp-2 hover:text-primary transition-colors flex-1">
                  {p.nome}
                </Link>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <div>
                    {p.precoPromocional && p.precoPromocional < p.preco ? (
                      <>
                        <p className="text-xs text-muted-foreground line-through">{formatCurrency(p.preco)}</p>
                        <p className="text-sm font-semibold text-primary">{formatCurrency(p.precoPromocional)}</p>
                      </>
                    ) : (
                      <p className="text-sm font-semibold">{formatCurrency(p.preco)}</p>
                    )}
                  </div>
                  <button
                    onClick={() => { addItem(p, 1); toast.success('Adicionado ao carrinho!'); }}
                    className="p-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex-shrink-0"
                    title="Adicionar ao carrinho"
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
