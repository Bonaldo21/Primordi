'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plus, Pencil, Trash2, Star, X, Check, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { enderecosApi } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import type { Endereco } from '@/lib/types';

const ESTADOS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

const VAZIO: Partial<Endereco> = {
  apelido: '', cep: '', logradouro: '', numero: '',
  complemento: '', bairro: '', cidade: '', estado: 'SP', pais: 'Brasil', principal: false,
};

export default function EnderecosPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [enderecos, setEnderecos] = useState<Endereco[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<Endereco | null>(null);
  const [form, setForm] = useState<Partial<Endereco>>(VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    carregar();
  }, [user]);

  const carregar = async () => {
    setLoading(true);
    try {
      const data = await enderecosApi.listar();
      setEnderecos(Array.isArray(data) ? data : []);
    } catch { toast.error('Erro ao carregar endereços'); }
    finally { setLoading(false); }
  };

  const abrirNovo = () => { setEditando(null); setForm(VAZIO); setModal(true); };
  const abrirEditar = (e: Endereco) => { setEditando(e); setForm({ ...e }); setModal(true); };
  const fechar = () => { setModal(false); setEditando(null); setForm(VAZIO); };

  const buscarCep = async (cep: string) => {
    const c = cep.replace(/\D/g, '');
    if (c.length !== 8) return;
    setBuscandoCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${c}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setForm(f => ({ ...f, logradouro: data.logradouro, bairro: data.bairro, cidade: data.localidade, estado: data.uf, cep: c }));
      }
    } catch {} finally { setBuscandoCep(false); }
  };

  const salvar = async () => {
    if (!form.cep || !form.logradouro || !form.numero || !form.cidade || !form.estado) {
      toast.error('Preencha todos os campos obrigatórios'); return;
    }
    setSalvando(true);
    try {
      if (editando) {
        await enderecosApi.update(editando.id, form);
        toast.success('Endereço atualizado!');
      } else {
        await enderecosApi.create(form);
        toast.success('Endereço adicionado!');
      }
      fechar();
      carregar();
    } catch { toast.error('Erro ao salvar endereço'); }
    finally { setSalvando(false); }
  };

  const excluir = async (id: number) => {
    if (!confirm('Remover este endereço?')) return;
    try {
      await enderecosApi.delete(id);
      toast.success('Endereço removido');
      carregar();
    } catch { toast.error('Erro ao remover endereço'); }
  };

  const definirPrincipal = async (id: number) => {
    try {
      await enderecosApi.setPrincipal(id);
      toast.success('Endereço principal atualizado');
      carregar();
    } catch { toast.error('Erro ao atualizar endereço principal'); }
  };

  const set = (field: keyof Endereco, value: any) => setForm(f => ({ ...f, [field]: value }));

  return (
    <div className="max-w-[720px] mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <Link href="/checkout" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Meus Endereços</h1>
          <p className="text-muted-foreground text-sm mt-1">Gerencie seus endereços de entrega</p>
        </div>
        <button onClick={abrirNovo}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 text-sm font-medium rounded hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Novo
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2].map(i => <div key={i} className="h-24 bg-secondary animate-pulse rounded-lg" />)}
        </div>
      ) : enderecos.length === 0 ? (
        <div className="text-center py-16">
          <MapPin className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Nenhum endereço cadastrado ainda.</p>
          <button onClick={abrirNovo} className="mt-4 inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 text-sm font-medium rounded hover:opacity-90">
            <Plus className="w-4 h-4" /> Adicionar endereço
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {enderecos.map((e) => (
            <motion.div key={e.id} layout
              className={`relative p-4 rounded-lg border transition-colors ${e.principal ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}
              style={{ boxShadow: 'var(--shadow-sm)' }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <MapPin className={`w-4 h-4 mt-0.5 shrink-0 ${e.principal ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div>
                    {e.apelido && <p className="font-medium text-sm mb-0.5">{e.apelido}</p>}
                    <p className="text-sm">{e.logradouro}, {e.numero}{e.complemento ? `, ${e.complemento}` : ''}</p>
                    <p className="text-sm text-muted-foreground">{e.bairro} — {e.cidade}/{e.estado}</p>
                    <p className="text-xs text-muted-foreground">CEP {e.cep}</p>
                    {e.principal && (
                      <span className="inline-flex items-center gap-1 text-xs text-primary font-medium mt-1">
                        <Star className="w-3 h-3 fill-primary" /> Principal
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!e.principal && (
                    <button onClick={() => definirPrincipal(e.id)} title="Definir como principal"
                      className="p-2 rounded hover:bg-secondary transition-colors text-muted-foreground hover:text-primary">
                      <Star className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => abrirEditar(e)} title="Editar"
                    className="p-2 rounded hover:bg-secondary transition-colors text-muted-foreground">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => excluir(e.id)} title="Remover"
                    className="p-2 rounded hover:bg-red-50 transition-colors text-muted-foreground hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) fechar(); }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-background rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              style={{ boxShadow: 'var(--shadow-lg)' }}>
              <div className="flex items-center justify-between p-5 border-b border-border">
                <h2 className="font-display text-lg font-semibold">{editando ? 'Editar Endereço' : 'Novo Endereço'}</h2>
                <button onClick={fechar} className="p-1.5 rounded hover:bg-secondary transition-colors"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Apelido (opcional)</label>
                  <input value={form.apelido ?? ''} onChange={e => set('apelido', e.target.value)}
                    placeholder="Ex: Casa, Trabalho"
                    className="mt-1 w-full px-3 py-2.5 text-sm bg-secondary border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">CEP *</label>
                    <input value={form.cep ?? ''} onChange={e => { set('cep', e.target.value); buscarCep(e.target.value); }}
                      placeholder="00000-000" maxLength={9}
                      className="mt-1 w-full px-3 py-2.5 text-sm bg-secondary border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring" />
                    {buscandoCep && <p className="text-xs text-muted-foreground mt-1">Buscando...</p>}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Número *</label>
                    <input value={form.numero ?? ''} onChange={e => set('numero', e.target.value)} placeholder="123"
                      className="mt-1 w-full px-3 py-2.5 text-sm bg-secondary border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Logradouro *</label>
                  <input value={form.logradouro ?? ''} onChange={e => set('logradouro', e.target.value)} placeholder="Rua, Av..."
                    className="mt-1 w-full px-3 py-2.5 text-sm bg-secondary border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Complemento</label>
                    <input value={form.complemento ?? ''} onChange={e => set('complemento', e.target.value)} placeholder="Apto, Bloco..."
                      className="mt-1 w-full px-3 py-2.5 text-sm bg-secondary border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Bairro *</label>
                    <input value={form.bairro ?? ''} onChange={e => set('bairro', e.target.value)} placeholder="Bairro"
                      className="mt-1 w-full px-3 py-2.5 text-sm bg-secondary border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Cidade *</label>
                    <input value={form.cidade ?? ''} onChange={e => set('cidade', e.target.value)} placeholder="São Paulo"
                      className="mt-1 w-full px-3 py-2.5 text-sm bg-secondary border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Estado *</label>
                    <select value={form.estado ?? 'SP'} onChange={e => set('estado', e.target.value)}
                      className="mt-1 w-full px-3 py-2.5 text-sm bg-secondary border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring">
                      {ESTADOS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                    </select>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.principal ?? false} onChange={e => set('principal', e.target.checked)}
                    className="rounded" />
                  <span className="text-sm">Definir como endereço principal</span>
                </label>
              </div>

              <div className="flex gap-3 p-5 border-t border-border">
                <button onClick={fechar} className="flex-1 bg-secondary text-secondary-foreground py-2.5 text-sm font-medium rounded hover:bg-accent transition-colors">Cancelar</button>
                <button onClick={salvar} disabled={salvando}
                  className="flex-1 bg-primary text-primary-foreground py-2.5 text-sm font-medium rounded hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
                  {salvando ? 'Salvando...' : <><Check className="w-4 h-4" /> Salvar</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
