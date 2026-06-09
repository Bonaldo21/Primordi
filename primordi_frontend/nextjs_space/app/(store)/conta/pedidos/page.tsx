'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Package, QrCode, ChevronDown, ChevronUp, Copy, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { pedidosApi, pagamentosApi } from '@/lib/api';
import { formatCurrency } from '@/lib/format';
import { toast } from 'sonner';
import type { Pedido } from '@/lib/types';

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  AGUARDANDO_PAGAMENTO: { label: 'Aguardando Pagamento', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300' },
  PAGAMENTO_APROVADO:   { label: 'Pagamento Aprovado',   color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' },
  EM_SEPARACAO:         { label: 'Em Separação',         color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300' },
  ENVIADO:              { label: 'Enviado',               color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300' },
  ENTREGUE:             { label: 'Entregue',              color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' },
  CANCELADO:            { label: 'Cancelado',             color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' },
  ESTORNADO:            { label: 'Estornado',             color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
};

function PagamentoPix({ pedidoId }: { pedidoId: number }) {
  const [pag, setPag] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    pagamentosApi.consultarPorPedido(pedidoId)
      .then(setPag)
      .catch(() => setPag(null))
      .finally(() => setLoading(false));
  }, [pedidoId]);

  if (loading) return <p className="text-xs text-muted-foreground">Carregando pagamento...</p>;
  if (!pag || pag.metodo !== 'PIX' || pag.status === 'APROVADO') return null;
  if (!pag.qrCode && !pag.qrCodeBase64) return null;

  return (
    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg space-y-3">
      <p className="text-sm font-medium text-blue-800 dark:text-blue-300 flex items-center gap-2">
        <QrCode className="w-4 h-4" /> Pague via PIX
      </p>
      {pag.qrCodeBase64 && (
        <img
          src={`data:image/png;base64,${pag.qrCodeBase64}`}
          alt="QR Code PIX"
          className="w-40 h-40 rounded-lg"
        />
      )}
      {pag.qrCode && (
        <div className="bg-white dark:bg-background rounded p-2 border border-blue-200 dark:border-blue-700">
          <p className="text-xs font-mono break-all text-muted-foreground leading-relaxed">{pag.qrCode}</p>
          <button
            onClick={() => { navigator.clipboard.writeText(pag.qrCode); toast.success('Código copiado!'); }}
            className="mt-2 flex items-center gap-1 text-xs text-blue-700 dark:text-blue-400 hover:underline"
          >
            <Copy className="w-3 h-3" /> Copiar código PIX
          </button>
        </div>
      )}
      <p className="text-xs text-blue-700 dark:text-blue-400">Após o pagamento, seu pedido será confirmado automaticamente.</p>
    </div>
  );
}

const CANCELAVEIS: string[] = ['AGUARDANDO_PAGAMENTO', 'PAGAMENTO_APROVADO', 'EM_SEPARACAO'];

function PedidoCard({ pedido, onCancelado }: { pedido: Pedido; onCancelado: (id: number) => void }) {
  const [aberto, setAberto] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [confirmar, setConfirmar] = useState(false);
  const status = STATUS_LABEL[pedido.status] ?? { label: pedido.status, color: 'bg-gray-100 text-gray-700' };
  const aguardando = pedido.status === 'AGUARDANDO_PAGAMENTO';
  const podeCancelar = CANCELAVEIS.includes(pedido.status);

  const handleCancelar = async () => {
    setCancelando(true);
    try {
      await pedidosApi.cancelar(pedido.id, 'Cancelado pelo cliente');
      toast.success('Pedido cancelado com sucesso.');
      onCancelado(pedido.id);
    } catch {
      toast.error('Não foi possível cancelar o pedido.');
    } finally {
      setCancelando(false);
      setConfirmar(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-lg border border-border overflow-hidden"
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      <button
        onClick={() => setAberto(!aberto)}
        className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-accent/30 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <Package className="w-5 h-5 text-muted-foreground shrink-0" />
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">Pedido #{pedido.codigo}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(pedido.criadoEm).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.color}`}>{status.label}</span>
          <span className="text-sm font-semibold">{formatCurrency(pedido.total)}</span>
          {aberto ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      {aberto && (
        <div className="border-t border-border px-4 sm:px-5 pb-5 pt-4 space-y-4">
          <div className="space-y-2">
            {pedido.itens.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.produtoNome} ×{item.quantidade}</span>
                <span>{formatCurrency(item.subtotal)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-3 space-y-1 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span><span>{formatCurrency(pedido.subtotal)}</span>
            </div>
            {pedido.desconto > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Desconto</span><span>− {formatCurrency(pedido.desconto)}</span>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <span>Frete</span>
              <span>{pedido.valorFrete > 0 ? formatCurrency(pedido.valorFrete) : <span className="text-green-600">Grátis</span>}</span>
            </div>
            <div className="flex justify-between font-semibold pt-1 border-t border-border">
              <span>Total</span><span>{formatCurrency(pedido.total)}</span>
            </div>
          </div>

          {pedido.enderecoEntrega && (
            <div className="text-sm text-muted-foreground bg-secondary/50 rounded-lg p-3">
              <p className="font-medium text-foreground mb-0.5">Entrega em</p>
              <p>{pedido.enderecoEntrega.logradouro}, {pedido.enderecoEntrega.numero} {pedido.enderecoEntrega.complemento}</p>
              <p>{pedido.enderecoEntrega.bairro} — {pedido.enderecoEntrega.cidade}/{pedido.enderecoEntrega.estado}</p>
            </div>
          )}

          {pedido.motivoCancelamento && (
            <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 rounded p-2">
              Motivo do cancelamento: {pedido.motivoCancelamento}
            </p>
          )}

          {aguardando && <PagamentoPix pedidoId={pedido.id} />}

          {podeCancelar && !confirmar && (
            <button
              onClick={() => setConfirmar(true)}
              className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 transition-colors"
            >
              <XCircle className="w-4 h-4" /> Cancelar pedido
            </button>
          )}

          {confirmar && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4 space-y-3">
              <p className="text-sm font-medium text-red-800 dark:text-red-300">Tem certeza que deseja cancelar este pedido?</p>
              <div className="flex gap-3">
                <button
                  onClick={handleCancelar}
                  disabled={cancelando}
                  className="flex-1 bg-red-600 text-white py-2 text-sm font-medium rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {cancelando ? 'Cancelando...' : 'Sim, cancelar'}
                </button>
                <button
                  onClick={() => setConfirmar(false)}
                  className="flex-1 bg-secondary text-secondary-foreground py-2 text-sm font-medium rounded hover:bg-accent transition-colors"
                >
                  Não, voltar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default function MeusPedidosPage() {
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    pedidosApi.listar()
      .then((res: any) => setPedidos(res?.content ?? res ?? []))
      .catch(() => toast.error('Erro ao carregar pedidos'))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return (
    <div className="max-w-[600px] mx-auto px-4 py-20 text-center">
      <p className="text-muted-foreground mb-4">Faça login para ver seus pedidos.</p>
      <Link href="/login" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 text-sm font-medium rounded hover:opacity-90">Entrar</Link>
    </div>
  );

  return (
    <div className="max-w-[860px] mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <Link href="/conta" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Minha conta
      </Link>

      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Meus Pedidos</h1>
        <p className="text-muted-foreground mt-1">Acompanhe o status dos seus pedidos</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-secondary animate-pulse rounded-lg" />
          ))}
        </div>
      ) : pedidos.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-medium text-lg mb-2">Nenhum pedido ainda</h2>
          <p className="text-muted-foreground mb-6">Explore nosso catálogo e faça seu primeiro pedido!</p>
          <Link href="/catalogo" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 text-sm font-medium rounded hover:opacity-90">
            Ver Catálogo
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {pedidos.map((pedido) => (
            <PedidoCard
              key={pedido.id}
              pedido={pedido}
              onCancelado={(id) => setPedidos((prev) =>
                prev.map((p) => p.id === id ? { ...p, status: 'CANCELADO' as any } : p)
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
