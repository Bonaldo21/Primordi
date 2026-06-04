'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Radio, Power, PowerOff, Plus, Minus } from 'lucide-react';
import { liveApi, produtosApi } from '@/lib/api';
import { getProdutoImagem, formatCurrency } from '@/lib/format';
import type { Produto } from '@/lib/types';
import { toast } from 'sonner';

export default function AdminLivePage() {
  const [liveStatus, setLiveStatus] = useState<any>(null);
  const [todos, setTodos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [titulo, setTitulo] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const [status, listagem] = await Promise.allSettled([
        liveApi.status(),
        produtosApi.listar({ size: '100', ativo: 'true' }),
      ]);
      if (status.status === 'fulfilled') {
        setLiveStatus(status.value);
        setTitulo(status.value?.titulo ?? '');
      }
      if (listagem.status === 'fulfilled') {
        setTodos((listagem.value as any)?.content ?? []);
      }
    } catch {
      toast.error('Erro ao carregar dados da live');
    } finally {
      setLoading(false);
    }
  }

  async function toggleLive() {
    setToggling(true);
    try {
      const novoStatus = !liveStatus?.ativa;
      const res = await liveApi.toggle(novoStatus, titulo);
      setLiveStatus(res);
      toast.success(novoStatus ? '🔴 Live iniciada!' : 'Live encerrada');
    } catch (err: any) {
      toast.error(err?.message ?? 'Erro ao alterar live');
    } finally {
      setToggling(false);
    }
  }

  async function toggleProduto(produto: Produto) {
    const daLive = !(produto as any).daLive;
    try {
      await liveApi.toggleProduto(produto.id, daLive);
      setTodos((prev) =>
        prev.map((p) => p.id === produto.id ? { ...p, daLive } as any : p)
      );
      setLiveStatus((prev: any) => {
        if (!prev) return prev;
        const jaEsta = prev.produtos?.some((p: any) => p.id === produto.id);
        const novosProdutos = daLive
          ? [...(prev.produtos ?? []), produto]
          : (prev.produtos ?? []).filter((p: any) => p.id !== produto.id);
        return { ...prev, produtos: novosProdutos };
      });
      toast.success(daLive ? `${produto.nome} adicionado à live` : `${produto.nome} removido da live`);
    } catch (err: any) {
      toast.error(err?.message ?? 'Erro');
    }
  }

  const produtosDaLive = todos.filter((p) => (p as any).daLive);
  const produtosForaDaLive = todos.filter((p) => !(p as any).daLive);
  const ativa = liveStatus?.ativa ?? false;

  if (loading) return <p className="text-muted-foreground">Carregando...</p>;

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold tracking-tight flex items-center gap-2">
          <Radio className="w-6 h-6 text-primary" /> Gerenciar Live
        </h1>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${ativa ? 'bg-red-100 text-red-700' : 'bg-secondary text-muted-foreground'}`}>
            {ativa ? '🔴 AO VIVO' : 'Offline'}
          </span>
          <span className="text-xs text-muted-foreground">{liveStatus?.clientesConectados ?? 0} conectados</span>
        </div>
      </div>

      {/* Controle da live */}
      <div className="bg-card border border-border rounded-lg p-5 space-y-4">
        <h2 className="text-sm font-medium">Controle da Live</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="flex-1 border border-border rounded px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Título da live (ex: Lançamento Coleção Inverno)"
          />
          <button
            onClick={toggleLive}
            disabled={toggling}
            className={`inline-flex items-center gap-2 px-5 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50 ${
              ativa
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {ativa ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
            {toggling ? 'Aguarde...' : ativa ? 'Encerrar Live' : 'Iniciar Live'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Produtos na live */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-medium">Na Live ({produtosDaLive.length})</h2>
            {ativa && <span className="text-xs text-red-600 font-medium">🔴 Exibindo ao vivo</span>}
          </div>
          {produtosDaLive.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">
              Nenhum produto na live.<br />Adicione produtos abaixo.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {produtosDaLive.map((p) => (
                <li key={p.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="relative w-10 h-10 bg-secondary/30 rounded overflow-hidden flex-shrink-0">
                    <Image src={getProdutoImagem(p)} alt={p.nome} fill className="object-cover" sizes="40px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{p.nome}</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(p.precoEfetivo ?? p.preco)}</p>
                  </div>
                  <button
                    onClick={() => toggleProduto(p)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                    title="Remover da live"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Todos os produtos */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-medium">Adicionar Produtos ({produtosForaDaLive.length} disponíveis)</h2>
          </div>
          {produtosForaDaLive.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">Todos os produtos já estão na live.</p>
          ) : (
            <ul className="divide-y divide-border max-h-[420px] overflow-y-auto">
              {produtosForaDaLive.map((p) => (
                <li key={p.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="relative w-10 h-10 bg-secondary/30 rounded overflow-hidden flex-shrink-0">
                    <Image src={getProdutoImagem(p)} alt={p.nome} fill className="object-cover" sizes="40px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{p.nome}</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(p.precoEfetivo ?? p.preco)} · estoque: {p.estoque}</p>
                  </div>
                  <button
                    onClick={() => toggleProduto(p)}
                    className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                    title="Adicionar à live"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
