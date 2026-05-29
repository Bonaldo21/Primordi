'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, CreditCard, Check, QrCode, FileText } from 'lucide-react';
import { initMercadoPago, CardPayment } from '@mercadopago/sdk-react';
import { useCart } from '@/contexts/cart-context';
import { useAuth } from '@/contexts/auth-context';
import { enderecosApi, pedidosApi, pagamentosApi } from '@/lib/api';
import { formatCurrency } from '@/lib/format';
import { toast } from 'sonner';
import type { Endereco, CartItem } from '@/lib/types';

type MetodoPagamento = 'PIX' | 'CARTAO_CREDITO' | 'BOLETO';

export default function CheckoutPage() {
    const router = useRouter();
    const { items, subtotal, clearCart } = useCart();
    const { user } = useAuth();

    const [step, setStep] = useState(1);
    const [enderecos, setEnderecos] = useState<Endereco[]>([]);
    const [enderecoId, setEnderecoId] = useState<number | null>(null);
    const [metodo, setMetodo] = useState<MetodoPagamento>('PIX');
    const [pedidoId, setPedidoId] = useState<number | null>(null);
    const [pagamento, setPagamento] = useState<any>(null);
    const [publicKey, setPublicKey] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [mpReady, setMpReady] = useState(false);

    useEffect(() => {
        if (!user) return;

        // ✅ CORREÇÃO: tratamento robusto da resposta da API
        enderecosApi.listar().then((res) => {
            const data = res?.data ?? res;
            const lista = Array.isArray(data) ? data : (data?.content ?? []);
            setEnderecos(lista);

            const principal = lista.find((e: any) => e?.principal);
            if (principal) {
                setEnderecoId(principal.id);
            } else if (lista.length > 0) {
                setEnderecoId(lista[0]?.id);
            }
        }).catch((err) => {
            console.error('Erro ao carregar endereços:', err);
            toast.error('Erro ao carregar endereços.');
        });

        pagamentosApi.publicKey().then((res) => {
            const key = res?.publicKey ?? '';
            setPublicKey(key);
            if (key && key !== 'TEST-00000000-0000-0000-0000-000000000000') {
                initMercadoPago(key, { locale: 'pt-BR' });
                setMpReady(true);
            }
        }).catch(() => {});
    }, [user]);

    if (!user) return (
        <div className="max-w-[600px] mx-auto px-4 py-20 text-center">
            <h1 className="font-display text-2xl font-semibold mb-4">Faça login para continuar</h1>
            <Link href="/login" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 text-sm font-medium rounded hover:opacity-90">Entrar</Link>
        </div>
    );

    if ((items ?? []).length === 0) return (
        <div className="max-w-[600px] mx-auto px-4 py-20 text-center">
            <h1 className="font-display text-2xl font-semibold mb-4">Carrinho vazio</h1>
            <Link href="/catalogo" className="text-primary hover:underline">Ir para o catálogo</Link>
        </div>
    );

    // ── STEP 1: Endereço ──
    const handleConfirmarEndereco = () => {
        if (!enderecoId) {
            toast.error('Selecione um endereço de entrega');
            return;
        }
        setStep(2);
    };

    // ── STEP 2: Criar pedido + pagamento ──
    const handlePagar = async (cardFormData?: any) => {
        if (!enderecoId) return;
        setSubmitting(true);
        try {
            // 1. Cria o pedido
            let pid = pedidoId;
            if (!pid) {
                const pedido = await pedidosApi.create({
                    enderecoEntregaId: enderecoId,
                    itens: (items ?? []).map((i: CartItem) => ({
                        produtoId: i.produto.id,
                        quantidade: i.quantidade
                    })),
                });
                pid = pedido?.id;
                setPedidoId(pid ?? null);
            }

            if (!pid) throw new Error('Erro ao criar pedido');

            // 2. Cria o pagamento
            const payload: any = {
                pedidoId: pid,
                metodo,
                pagadorEmail: (user as any)?.email ?? '',
                pagadorNome: (user as any)?.nome ?? '',
                pagadorCpf: ((user as any)?.cpf ?? '').replace(/\D/g, ''),
            };

            if (metodo === 'CARTAO_CREDITO' && cardFormData) {
                payload.cardToken = cardFormData.token;
                payload.paymentMethodId = cardFormData.payment_method_id;
                payload.parcelas = cardFormData.installments ?? 1;
            }

            const pag = await pagamentosApi.criar(payload);
            setPagamento(pag);
            setStep(3);

            if (pag?.status === 'APROVADO') {
                clearCart();
            }
        } catch (err: any) {
            toast.error(err?.message ?? 'Erro ao processar pagamento');
        } finally {
            setSubmitting(false);
        }
    };

    // ── STEP 3: Resultado ──
    if (step === 3 && pagamento) {
        const aprovado = pagamento?.status === 'APROVADO';
        const isPix = pagamento?.metodo === 'PIX';
        const isBoleto = pagamento?.metodo === 'BOLETO';

        return (
            <div className="max-w-[600px] mx-auto px-4 py-16 text-center">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-6">
                    {aprovado ? (
                        <>
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                <Check className="w-8 h-8 text-green-700" />
                            </div>
                            <h1 className="font-display text-2xl font-semibold">Pagamento Aprovado!</h1>
                            <p className="text-muted-foreground">Seu pedido foi confirmado e está sendo preparado.</p>
                        </>
                    ) : isPix ? (
                        <>
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                                <QrCode className="w-8 h-8 text-blue-700" />
                            </div>
                            <h1 className="font-display text-2xl font-semibold">Pague via PIX</h1>
                            <p className="text-muted-foreground text-sm">Escaneie o QR Code abaixo ou copie o código</p>
                            {pagamento?.qrCodeBase64 && (
                                <img src={`data:image/png;base64,${pagamento.qrCodeBase64}`} alt="QR Code PIX" className="mx-auto w-48 h-48 rounded-lg" />
                            )}
                            {pagamento?.qrCode && (
                                <div className="bg-secondary rounded-lg p-3">
                                    <p className="text-xs font-mono break-all text-muted-foreground">{pagamento.qrCode}</p>
                                    <button onClick={() => { navigator.clipboard.writeText(pagamento.qrCode); toast.success('Código copiado!'); }}
                                            className="mt-2 text-xs text-primary hover:underline">Copiar código</button>
                                </div>
                            )}
                            <p className="text-xs text-muted-foreground">Após o pagamento, seu pedido será confirmado automaticamente.</p>
                        </>
                    ) : isBoleto ? (
                        <>
                            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                                <FileText className="w-8 h-8 text-yellow-700" />
                            </div>
                            <h1 className="font-display text-2xl font-semibold">Boleto Gerado!</h1>
                            <p className="text-muted-foreground text-sm">Seu boleto vence em 3 dias úteis.</p>
                            {pagamento?.linkBoleto && (
                                <a href={pagamento.linkBoleto} target="_blank" rel="noopener noreferrer"
                                   className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 text-sm font-medium rounded hover:opacity-90">
                                    <FileText className="w-4 h-4" /> Visualizar Boleto
                                </a>
                            )}
                        </>
                    ) : (
                        <>
                            <h1 className="font-display text-2xl font-semibold">Pedido em processamento</h1>
                            <p className="text-muted-foreground">Status: {pagamento?.status}</p>
                        </>
                    )}
                    <div className="pt-4">
                        <Link href="/catalogo" className="text-sm text-muted-foreground hover:text-primary">Continuar comprando →</Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="max-w-[860px] mx-auto px-4 sm:px-6 py-10 sm:py-16">
            <Link href="/carrinho" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
                <ArrowLeft className="w-4 h-4" /> Voltar ao carrinho
            </Link>
            <h1 className="font-display text-3xl font-semibold tracking-tight mb-8">Checkout</h1>

            {/* Steps */}
            <div className="flex gap-6 mb-10">
                {[{ n: 1, label: 'Endereço' }, { n: 2, label: 'Pagamento' }].map((s) => (
                    <div key={s.n} className={`flex items-center gap-2 text-sm ${step >= s.n ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= s.n ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>{s.n}</div>
                        {s.label}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">

                    {/* STEP 1 */}
                    {step === 1 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                            <h2 className="font-medium text-lg flex items-center gap-2"><MapPin className="w-5 h-5 text-primary" /> Endereço de Entrega</h2>
                            {enderecos.length > 0 ? (
                                <div className="space-y-3">
                                    {enderecos.map((e: any) => (
                                        <label key={e?.id} className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${enderecoId === e?.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                                            <input type="radio" name="endereco" value={e?.id} checked={enderecoId === e?.id} onChange={() => setEnderecoId(e?.id)} className="mt-1" />
                                            <div className="text-sm">
                                                <p className="font-medium">{e?.logradouro}, {e?.numero} {e?.complemento}</p>
                                                <p className="text-muted-foreground">{e?.bairro} — {e?.cidade}/{e?.estado}</p>
                                                <p className="text-muted-foreground">CEP: {e?.cep}</p>
                                                {e?.principal && <span className="text-xs text-primary font-medium">Principal</span>}
                                            </div>
                                        </label>
                                    ))}
                                    <Link href="/conta/enderecos" className="text-sm text-primary hover:underline">+ Adicionar novo endereço</Link>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground mb-4">Nenhum endereço cadastrado.</p>
                                    <Link href="/conta/enderecos" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 text-sm font-medium rounded hover:opacity-90">Cadastrar Endereço</Link>
                                </div>
                            )}
                            <button onClick={handleConfirmarEndereco} disabled={!enderecoId}
                                    className="w-full bg-primary text-primary-foreground py-3 text-sm font-medium rounded hover:opacity-90 transition-opacity disabled:opacity-40 mt-2">
                                Continuar para Pagamento
                            </button>
                        </motion.div>
                    )}

                    {/* STEP 2 */}
                    {step === 2 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            <h2 className="font-medium text-lg flex items-center gap-2"><CreditCard className="w-5 h-5 text-primary" /> Forma de Pagamento</h2>

                            {/* Seletor de método */}
                            <div className="grid grid-cols-3 gap-3">
                                {([
                                    { id: 'PIX', label: 'PIX', icon: QrCode },
                                    { id: 'CARTAO_CREDITO', label: 'Cartão', icon: CreditCard },
                                    { id: 'BOLETO', label: 'Boleto', icon: FileText },
                                ] as const).map((m) => (
                                    <button key={m.id} onClick={() => setMetodo(m.id)}
                                            className={`flex flex-col items-center gap-1 p-3 rounded-lg border text-sm transition-colors ${metodo === m.id ? 'border-primary bg-primary/5 text-primary font-medium' : 'border-border hover:border-primary/50'}`}>
                                        <m.icon className="w-5 h-5" />
                                        {m.label}
                                    </button>
                                ))}
                            </div>

                            {/* PIX */}
                            {metodo === 'PIX' && (
                                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm text-blue-800 dark:text-blue-300">
                                    <p className="font-medium mb-1">Como funciona o PIX?</p>
                                    <p>Após confirmar, você receberá um QR Code para pagar. A confirmação é instantânea.</p>
                                </div>
                            )}

                            {/* CARTÃO */}
                            {metodo === 'CARTAO_CREDITO' && (
                                <div>
                                    {mpReady ? (
                                        <CardPayment
                                            initialization={{ amount: subtotal }}
                                            onSubmit={async (formData) => { await handlePagar(formData); }}
                                            onError={(err) => { toast.error('Erro no cartão: ' + err?.message); }}
                                            customization={{ paymentMethods: { minInstallments: 1, maxInstallments: 12 } }}
                                        />
                                    ) : (
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                                            ⚠️ Configure a <code>MP_PUBLIC_KEY</code> no backend para habilitar pagamento com cartão.
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* BOLETO */}
                            {metodo === 'BOLETO' && (
                                <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-sm text-yellow-800 dark:text-yellow-300">
                                    <p className="font-medium mb-1">Boleto Bancário</p>
                                    <p>O boleto vence em 3 dias úteis. Após o pagamento, a confirmação pode levar até 2 dias úteis.</p>
                                </div>
                            )}

                            {/* Botões de ação (PIX e Boleto) */}
                            {metodo !== 'CARTAO_CREDITO' && (
                                <div className="flex gap-3">
                                    <button onClick={() => setStep(1)} className="flex-1 bg-secondary text-secondary-foreground py-3 text-sm font-medium rounded hover:bg-accent transition-colors">Voltar</button>
                                    <button onClick={() => handlePagar()} disabled={submitting}
                                            className="flex-1 bg-primary text-primary-foreground py-3 text-sm font-medium rounded hover:opacity-90 transition-opacity disabled:opacity-50">
                                        {submitting ? 'Processando...' : metodo === 'PIX' ? 'Gerar QR Code PIX' : 'Gerar Boleto'}
                                    </button>
                                </div>
                            )}
                            {metodo === 'CARTAO_CREDITO' && (
                                <button onClick={() => setStep(1)} className="w-full bg-secondary text-secondary-foreground py-3 text-sm font-medium rounded hover:bg-accent transition-colors">Voltar</button>
                            )}
                        </motion.div>
                    )}
                </div>

                {/* Resumo lateral */}
                <div className="lg:col-span-1">
                    <div className="bg-card rounded-lg p-5 sticky top-24" style={{ boxShadow: 'var(--shadow-sm)' }}>
                        <h3 className="font-medium mb-4">Resumo</h3>
                        <div className="space-y-2 text-sm">
                            {(items ?? []).map((item: CartItem, i: number) => (
                                <div key={item?.produto?.id ?? i} className="flex justify-between">
                                    <span className="text-muted-foreground truncate mr-2">{item?.produto?.nome} ×{item?.quantidade}</span>
                                    <span className="shrink-0">{formatCurrency((item?.produto?.precoEfetivo ?? 0) * (item?.quantidade ?? 1))}</span>
                                </div>
                            ))}
                            <div className="border-t border-border pt-2 mt-2 flex justify-between font-semibold">
                                <span>Total</span>
                                <span>{formatCurrency(subtotal)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}