'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, CreditCard, Check, QrCode, FileText, Truck, Store } from 'lucide-react';
import { initMercadoPago, CardPayment } from '@mercadopago/sdk-react';
import { useCart } from '@/contexts/cart-context';
import { useAuth } from '@/contexts/auth-context';
import { enderecosApi, pedidosApi, pagamentosApi, fretesApi } from '@/lib/api';
import { formatCurrency } from '@/lib/format';
import { toast } from 'sonner';
import type { Endereco, CartItem, FreteOpcao } from '@/lib/types';

type MetodoPagamento = 'PIX' | 'CARTAO_CREDITO' | 'BOLETO';

const formatarCpf = (valor: string) => {
    const nums = valor.replace(/\D/g, '').slice(0, 11);
    return nums
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

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
    const [cpfInput, setCpfInput] = useState('');

    const [opcoesFretes, setOpcoesFretes] = useState<FreteOpcao[]>([]);
    const [freteSelecionado, setFreteSelecionado] = useState<FreteOpcao | null>(null);
    const [calculandoFrete, setCalculandoFrete] = useState(false);
    const [modoEntrega, setModoEntrega] = useState<'entrega' | 'retirada'>('entrega');
    const [lojaRetirada, setLojaRetirada] = useState<string>('');

    const LOJAS = [
        { id: 'serra-negra', nome: 'Serra Negra', endereco: 'Rua Cel. Pedro Penteado, 61' },
        { id: 'aguas-de-lindoia', nome: 'Águas de Lindóia', endereco: 'Rua São Paulo, 336 — Loja 1' },
        { id: 'pedreira', nome: 'Pedreira', endereco: 'Rua Cel. João Pedro, 16 A' },
    ];

    const criandoPedido = useRef(false);

    const cpfResolvido = (user?.cpf ?? '').replace(/\D/g, '') || cpfInput.replace(/\D/g, '');
    const precisaDigitarCpf = !(user?.cpf ?? '').replace(/\D/g, '');

    const totalComFrete = Number(subtotal ?? 0) + (modoEntrega === 'entrega' ? Number(freteSelecionado?.valor ?? 0) : 0);

    useEffect(() => {
        if (!user) return;

        enderecosApi.listar().then((lista: Endereco[]) => {
            const itens = Array.isArray(lista) ? lista : [];
            setEnderecos(itens);
            const principal = itens.find((e) => e?.principal);
            if (principal) {
                setEnderecoId(principal.id);
            } else if (itens.length > 0) {
                setEnderecoId(itens[0].id);
            }
        }).catch((err) => {
            console.error('Erro ao carregar endereços:', err);
            toast.error('Erro ao carregar endereços.');
        });

        pagamentosApi.publicKey().then((res: any) => {
            const key = res?.publicKey ?? '';
            setPublicKey(key);
            if (key && key !== 'TEST-00000000-0000-0000-0000-000000000000') {
                initMercadoPago(key, { locale: 'pt-BR' });
                setMpReady(true);
            }
        }).catch((err) => {
            console.warn('Erro ao obter public key do Mercado Pago:', err);
        });
    }, [user]);

    if (!user) return (
        <div className="max-w-[600px] mx-auto px-4 py-20 text-center">
            <h1 className="font-display text-2xl font-semibold mb-4">Faça login para continuar</h1>
            <Link href="/login" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 text-sm font-medium rounded hover:opacity-90">Entrar</Link>
        </div>
    );

    if (step < 3 && (items ?? []).length === 0) return (
        <div className="max-w-[600px] mx-auto px-4 py-20 text-center">
            <h1 className="font-display text-2xl font-semibold mb-4">Carrinho vazio</h1>
            <Link href="/catalogo" className="text-primary hover:underline">Ir para o catálogo</Link>
        </div>
    );

    const handleConfirmarEndereco = async () => {
        if (modoEntrega === 'retirada') {
            if (!lojaRetirada) {
                toast.error('Selecione a loja para retirada');
                return;
            }
            setStep(2);
            return;
        }

        if (!enderecoId) {
            toast.error('Selecione um endereço de entrega');
            return;
        }

        const endereco = enderecos.find((e) => e.id === enderecoId);
        if (!endereco?.cep) {
            setStep(2);
            return;
        }

        setCalculandoFrete(true);
        try {
            const pesoTotal = (items ?? []).reduce((acc: number, i: CartItem) => acc + (i?.quantidade ?? 1) * 0.5, 0);
            const valorTotal = subtotal ?? 0;
            const res = await fretesApi.simular({
                cepDestino: endereco.cep.replace(/\D/g, ''),
                pesoKg: parseFloat(Math.max(pesoTotal, 0.1).toFixed(2)),
                valorDeclarado: parseFloat(valorTotal.toFixed(2)),
            });
            const opcoes = res?.opcoes ?? [];
            setOpcoesFretes(opcoes);
            setFreteSelecionado(opcoes[0] ?? null);
        } catch (err: any) {
            console.error('Erro ao calcular frete:', err);
            toast.error('Não foi possível calcular o frete. Você pode continuar assim mesmo.');
            setOpcoesFretes([]);
            setFreteSelecionado(null);
        } finally {
            setCalculandoFrete(false);
        }

        setStep(2);
    };

    const handleMetodoChange = (m: MetodoPagamento) => {
        setMetodo(m);
        setPedidoId(null);
    };

    const handlePagar = async (cardFormData?: any) => {
        if (modoEntrega === 'entrega' && !enderecoId) return;

        if (precisaDigitarCpf && cpfResolvido.length !== 11) {
            toast.error('Digite um CPF válido com 11 dígitos');
            return;
        }

        if (criandoPedido.current) return;
        criandoPedido.current = true;
        setSubmitting(true);
        try {
            let pid = pedidoId;
            if (!pid) {
                const pedido = await pedidosApi.create({
                    enderecoEntregaId: modoEntrega === 'entrega' ? enderecoId : undefined,
                    retiradaNaLoja: modoEntrega === 'retirada',
                    lojaRetirada: modoEntrega === 'retirada' ? lojaRetirada : undefined,
                    itens: (items ?? []).map((i: CartItem) => ({
                        produtoId: i.produto.id,
                        quantidade: i.quantidade
                    })),
                    valorFrete: modoEntrega === 'entrega' && freteSelecionado ? freteSelecionado.valor : 0,
                });
                pid = pedido?.id;
                setPedidoId(pid ?? null);
            }

            if (!pid) throw new Error('Erro ao criar pedido');

            const payload: any = {
                pedidoId: pid,
                metodo,
                pagadorEmail: user.email ?? '',
                pagadorNome: user.nome ?? '',
                pagadorCpf: cpfResolvido,
            };

            if (metodo === 'CARTAO_CREDITO' && cardFormData) {
                payload.cardToken = cardFormData.token;
                payload.paymentMethodId = cardFormData.payment_method_id;
                payload.parcelas = cardFormData.installments ?? 1;
            }

            const pag = await pagamentosApi.criar(payload);
            setPagamento(pag);
            clearCart();
            setStep(3);
        } catch (err: any) {
            toast.error(err?.message ?? 'Erro ao processar pagamento');
        } finally {
            setSubmitting(false);
            criandoPedido.current = false;
        }
    };

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

                    {step === 1 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">

                            {/* Seleção: Entrega ou Retirada */}
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => setModoEntrega('entrega')}
                                        className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-colors ${modoEntrega === 'entrega' ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/50'}`}>
                                    <Truck className="w-4 h-4" /> Receber em casa
                                </button>
                                <button onClick={() => { setModoEntrega('retirada'); setOpcoesFretes([]); setFreteSelecionado(null); }}
                                        className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-colors ${modoEntrega === 'retirada' ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/50'}`}>
                                    <Store className="w-4 h-4" /> Retirar na loja
                                </button>
                            </div>

                            {modoEntrega === 'retirada' ? (
                                <div className="space-y-3">
                                    <p className="font-medium flex items-center gap-2 text-sm"><Store className="w-4 h-4" /> Escolha a loja para retirada — Grátis</p>
                                    {LOJAS.map((loja) => (
                                        <label key={loja.id} className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${lojaRetirada === loja.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                                            <input type="radio" name="loja" value={loja.id} checked={lojaRetirada === loja.id} onChange={() => setLojaRetirada(loja.id)} className="mt-1" />
                                            <div className="text-sm">
                                                <p className="font-medium">{loja.nome}</p>
                                                <p className="text-muted-foreground">{loja.endereco}</p>
                                            </div>
                                        </label>
                                    ))}
                                    <p className="text-xs text-muted-foreground">Entraremos em contato para combinar o horário após a confirmação do pagamento.</p>
                                </div>
                            ) : (
                                <>
                            <h2 className="font-medium text-lg flex items-center gap-2"><MapPin className="w-5 h-5 text-primary" /> Endereço de Entrega</h2>
                            {enderecos.length > 0 ? (
                                <div className="space-y-3">
                                    {enderecos.map((e) => (
                                        <label key={e.id} className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${enderecoId === e.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                                            <input type="radio" name="endereco" value={e.id} checked={enderecoId === e.id} onChange={() => setEnderecoId(e.id)} className="mt-1" />
                                            <div className="text-sm">
                                                <p className="font-medium">{e.logradouro}, {e.numero} {e.complemento}</p>
                                                <p className="text-muted-foreground">{e.bairro} — {e.cidade}/{e.estado}</p>
                                                <p className="text-muted-foreground">CEP: {e.cep}</p>
                                                {e.principal && <span className="text-xs text-primary font-medium">Principal</span>}
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
                                </>
                            )}
                            <button onClick={handleConfirmarEndereco} disabled={(modoEntrega === 'entrega' && !enderecoId) || (modoEntrega === 'retirada' && !lojaRetirada) || calculandoFrete}
                                    className="w-full bg-primary text-primary-foreground py-3 text-sm font-medium rounded hover:opacity-90 transition-opacity disabled:opacity-40 mt-2">
                                {calculandoFrete ? 'Calculando frete...' : 'Continuar para Pagamento'}
                            </button>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

                            {/* Opções de frete */}
                            {opcoesFretes.length > 0 && (
                                <div className="space-y-3">
                                    <h2 className="font-medium text-lg flex items-center gap-2"><Truck className="w-5 h-5 text-primary" /> Entrega</h2>
                                    {opcoesFretes.map((op, i) => (
                                        <label key={i} className={`flex items-center justify-between gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${freteSelecionado === op ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                                            <div className="flex items-center gap-3">
                                                <input type="radio" name="frete" checked={freteSelecionado === op} onChange={() => setFreteSelecionado(op)} />
                                                <div className="text-sm">
                                                    <p className="font-medium">{op.nomeServico}</p>
                                                    <p className="text-muted-foreground">Prazo: {op.prazoDias} {op.prazoDias === 1 ? 'dia útil' : 'dias úteis'}</p>
                                                    {op.observacao && <p className="text-xs text-muted-foreground">{op.observacao}</p>}
                                                </div>
                                            </div>
                                            <span className="text-sm font-semibold shrink-0">{formatCurrency(op.valor)}</span>
                                        </label>
                                    ))}
                                </div>
                            )}

                            <h2 className="font-medium text-lg flex items-center gap-2"><CreditCard className="w-5 h-5 text-primary" /> Forma de Pagamento</h2>

                            <div className="grid grid-cols-3 gap-3">
                                {([
                                    { id: 'PIX', label: 'PIX', icon: QrCode },
                                    { id: 'CARTAO_CREDITO', label: 'Cartão', icon: CreditCard },
                                    { id: 'BOLETO', label: 'Boleto', icon: FileText },
                                ] as const).map((m) => (
                                    <button key={m.id} onClick={() => handleMetodoChange(m.id)}
                                            className={`flex flex-col items-center gap-1 p-3 rounded-lg border text-sm transition-colors ${metodo === m.id ? 'border-primary bg-primary/5 text-primary font-medium' : 'border-border hover:border-primary/50'}`}>
                                        <m.icon className="w-5 h-5" />
                                        {m.label}
                                    </button>
                                ))}
                            </div>

                            {precisaDigitarCpf && (
                                <div>
                                    <label className="text-sm font-medium mb-1.5 block">CPF do pagador</label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="000.000.000-00"
                                        value={cpfInput}
                                        onChange={(e) => setCpfInput(formatarCpf(e.target.value))}
                                        className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">Obrigatório pelo Mercado Pago. Você pode salvá-lo no seu <Link href="/conta" className="text-primary hover:underline">perfil</Link> para não precisar digitar sempre.</p>
                                </div>
                            )}

                            {metodo === 'PIX' && (
                                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm text-blue-800 dark:text-blue-300">
                                    <p className="font-medium mb-1">Como funciona o PIX?</p>
                                    <p>Após confirmar, você receberá um QR Code para pagar. A confirmação é instantânea.</p>
                                </div>
                            )}

                            {metodo === 'CARTAO_CREDITO' && (
                                <div>
                                    {mpReady ? (
                                        <CardPayment
                                            initialization={{ amount: totalComFrete }}
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

                            {metodo === 'BOLETO' && (
                                <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-sm text-yellow-800 dark:text-yellow-300">
                                    <p className="font-medium mb-1">Boleto Bancário</p>
                                    <p>O boleto vence em 3 dias úteis. Após o pagamento, a confirmação pode levar até 2 dias úteis.</p>
                                </div>
                            )}

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
                            <div className="border-t border-border pt-2 mt-2 flex justify-between text-muted-foreground">
                                <span>Subtotal</span>
                                <span>{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>Frete</span>
                                <span>
                                    {modoEntrega === 'retirada'
                                        ? <span className="text-green-600 font-medium">Grátis</span>
                                        : calculandoFrete
                                            ? 'Calculando...'
                                            : freteSelecionado
                                                ? formatCurrency(freteSelecionado.valor)
                                                : step === 1 ? 'Selecione o endereço' : 'A calcular'}
                                </span>
                            </div>
                            <div className="border-t border-border pt-2 mt-2 flex justify-between font-semibold">
                                <span>Total</span>
                                <span>{formatCurrency(totalComFrete)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
