'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, Eye } from 'lucide-react';
import { pedidosApi } from '@/lib/api';
import { formatCurrency, formatDateTime, getStatusLabel, getStatusColor } from '@/lib/format';
import type { Pedido } from '@/lib/types';
import { toast } from 'sonner';

export default function AdminPedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('');
  const [pedidoSelecionado, setPedidoSelecionado] = useState<Pedido | null>(null);

  useEffect(() => {
    load();
  }, [filtroStatus]);

  async function load() {
    setLoading(true);
    try {
      const params: Record<string, string> = { size: '50', sort: 'criadoEm,desc' };
      if (filtroStatus) params.status = filtroStatus;
      const res = await pedidosApi.admin.listar(params);
      setPedidos((res?.content ?? []).filter((p: any) => p?.status !== 'CANCELADO' && p?.status !== 'ESTORNADO'));
    } catch { setPedidos([]); } finally { setLoading(false); }
  }

  const updateStatus = async (id: number, status: string) => {
    try {
      const updated = await pedidosApi.admin.updateStatus(id, status);
      setPedidos((prev) => prev.map((p) => p?.id === id ? { ...p, ...updated } : p));
      if (pedidoSelecionado?.id === id) setPedidoSelecionado((prev) => prev ? { ...prev, ...updated } : prev);
      toast.success('Status atualizado');
    } catch (err: any) { toast.error(err?.message ?? 'Erro ao atualizar'); }
  };

  const STATUS_LIST = ['AGUARDANDO_PAGAMENTO', 'PAGAMENTO_APROVADO', 'EM_SEPARACAO', 'ENVIADO', 'ENTREGUE', 'CANCELADO'];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-primary" /> Pedidos
        </h1>
        <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}
          className="text-sm border border-border rounded-md px-3 py-1.5 bg-background">
          <option value="">Todos os status</option>
          {STATUS_LIST.map((s) => <option key={s} value={s}>{getStatusLabel(s)}</option>)}
        </select>
      </div>

      {loading ? <p className="text-muted-foreground">Carregando...</p> : pedidos.length === 0 ? (
        <p className="text-muted-foreground">Nenhum pedido encontrado.</p>
      ) : (
        <div className="bg-card rounded-lg overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left px-4 py-3 font-medium">Código</th>
                  <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Cliente</th>
                  <th className="text-center px-4 py-3 font-medium">Status</th>
                  <th className="text-right px-4 py-3 font-medium">Total</th>
                  <th className="text-right px-4 py-3 font-medium hidden sm:table-cell">Data</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((p) => (
                  <tr key={p?.id} className="border-b border-border/50 hover:bg-secondary/20">
                    <td className="px-4 py-3 font-mono text-xs">{p?.codigo ?? '-'}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">{(p as any)?.cliente?.nome ?? '-'}</td>
                    <td className="px-4 py-3 text-center">
                      <select value={p?.status ?? ''} onChange={(e) => updateStatus(p?.id, e.target.value)}
                        className={`text-xs font-medium px-2 py-1 rounded border-0 cursor-pointer ${getStatusColor(p?.status)}`}>
                        {STATUS_LIST.map((s) => <option key={s} value={s}>{getStatusLabel(s)}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(p?.total)}</td>
                    <td className="px-4 py-3 text-right hidden sm:table-cell text-muted-foreground text-xs">{formatDateTime(p?.criadoEm)}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setPedidoSelecionado(p)} className="p-1 text-muted-foreground hover:text-primary">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal detalhe */}
      {pedidoSelecionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6" style={{ boxShadow: 'var(--shadow-lg)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold">Pedido {pedidoSelecionado?.codigo}</h2>
              <button onClick={() => setPedidoSelecionado(null)} className="text-muted-foreground hover:text-foreground text-xl">✕</button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Cliente</span><span>{(pedidoSelecionado as any)?.cliente?.nome ?? '-'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{(pedidoSelecionado as any)?.cliente?.email ?? '-'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Status</span>
                <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(pedidoSelecionado?.status)}`}>{getStatusLabel(pedidoSelecionado?.status)}</span>
              </div>
              <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span className="font-semibold">{formatCurrency(pedidoSelecionado?.total)}</span></div>
              {(pedidoSelecionado as any)?.retiradaNaLoja ? (
                <div className="flex justify-between"><span className="text-muted-foreground">Retirada na loja</span><span className="font-medium">{(pedidoSelecionado as any)?.lojaRetirada ?? '—'}</span></div>
              ) : (pedidoSelecionado as any)?.enderecoEntrega && (
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground">Endereço de entrega</span>
                  <span className="font-medium">{(pedidoSelecionado as any).enderecoEntrega.logradouro}, {(pedidoSelecionado as any).enderecoEntrega.numero}{(pedidoSelecionado as any).enderecoEntrega.complemento ? ` — ${(pedidoSelecionado as any).enderecoEntrega.complemento}` : ''}</span>
                  <span className="text-muted-foreground">{(pedidoSelecionado as any).enderecoEntrega.bairro} — {(pedidoSelecionado as any).enderecoEntrega.cidade}/{(pedidoSelecionado as any).enderecoEntrega.estado}</span>
                  <span className="text-muted-foreground">CEP: {(pedidoSelecionado as any).enderecoEntrega.cep}</span>
                </div>
              )}
              <div className="flex justify-between"><span className="text-muted-foreground">Data</span><span>{formatDateTime(pedidoSelecionado?.criadoEm)}</span></div>
              {(pedidoSelecionado as any)?.itens?.length > 0 && (
                <div className="mt-4">
                  <p className="font-medium mb-2">Itens</p>
                  {(pedidoSelecionado as any).itens.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between text-xs py-1 border-b border-border/50">
                      <span>{item?.produto?.nome ?? item?.nomeProduto ?? '-'} x{item?.quantidade}</span>
                      <span>{formatCurrency(item?.subtotal)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
