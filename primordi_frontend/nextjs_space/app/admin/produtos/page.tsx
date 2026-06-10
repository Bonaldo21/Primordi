'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Trash2, Package, X, Pencil, ToggleLeft, ToggleRight, ImagePlus, Star, Search } from 'lucide-react';
import { produtosApi, categoriasApi, arquivosApi } from '@/lib/api';
import { sampleProducts, sampleCategories } from '@/lib/sample-data';
import { formatCurrency, getProdutoImagem } from '@/lib/format';
import type { Produto, Categoria } from '@/lib/types';
import { toast } from 'sonner';

const emptyForm = {
  nome: '', slug: '', descricao: '', sku: '',
  preco: '', precoPromocional: '',
  estoque: '0', estoqueMinimo: '0',
  pesoKg: '', alturaCm: '', larguraCm: '', profundidadeCm: '',
  tipoCouro: '', cor: '',
  categoriaId: '', destaque: false, ativo: true,
};

function slugify(text: string) {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function buildPayload(form: typeof emptyForm) {
  return {
    nome: form.nome,
    slug: form.slug,
    descricao: form.descricao || null,
    sku: form.sku,
    tipoCouro: form.tipoCouro || null,
    cor: form.cor || null,
    preco: parseFloat(form.preco),
    precoPromocional: form.precoPromocional ? parseFloat(form.precoPromocional) : null,
    estoque: parseInt(form.estoque) || 0,
    estoqueMinimo: parseInt(form.estoqueMinimo) || 0,
    pesoKg: form.pesoKg ? parseFloat(form.pesoKg) : null,
    alturaCm: form.alturaCm ? parseFloat(form.alturaCm) : null,
    larguraCm: form.larguraCm ? parseFloat(form.larguraCm) : null,
    profundidadeCm: form.profundidadeCm ? parseFloat(form.profundidadeCm) : null,
    categoriaId: form.categoriaId ? parseInt(form.categoriaId) : null,
    destaque: form.destaque,
    ativo: form.ativo,
  };
}

export default function AdminProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  // múltiplas imagens: cada item pode ser arquivo ou URL
  const [novasImagens, setNovasImagens] = useState<{ arquivo: File | null; url: string; principal: boolean }[]>([]);
  const [uploadando, setUploadando] = useState(false);
  const [busca, setBusca] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const [p, c] = await Promise.allSettled([produtosApi.listar({ size: '50' }), categoriasApi.todas()]);
      setProdutos(p.status === 'fulfilled' ? (p.value?.content ?? sampleProducts) : sampleProducts);
      setCategorias(c.status === 'fulfilled' ? (c.value as Categoria[] ?? sampleCategories) : sampleCategories);
    } catch { setProdutos(sampleProducts); setCategorias(sampleCategories); } finally { setLoading(false); }
  }

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setNovasImagens([]);
    setShowModal(true);
  };
  const openEdit = async (p: Produto) => {
    setEditId(p.id);
    // Busca o produto completo para garantir todos os campos (evita formato resumido da listagem)
    let produto: any = p;
    try { produto = await produtosApi.getById(p.id); } catch {}
    setForm({
      nome: produto.nome ?? '',
      slug: produto.slug ?? '',
      descricao: produto.descricao ?? '',
      sku: produto.sku ?? '',
      tipoCouro: produto.tipoCouro ?? '',
      cor: produto.cor ?? '',
      preco: String(produto.preco ?? ''),
      precoPromocional: String(produto.precoPromocional ?? ''),
      estoque: String(produto.estoque ?? 0),
      estoqueMinimo: String(produto.estoqueMinimo ?? 0),
      pesoKg: String(produto.pesoKg ?? ''),
      alturaCm: String(produto.alturaCm ?? ''),
      larguraCm: String(produto.larguraCm ?? ''),
      profundidadeCm: String(produto.profundidadeCm ?? ''),
      // aceita tanto formato aninhado (categoria.id) quanto plano (categoriaId)
      categoriaId: String(produto.categoria?.id ?? produto.categoriaId ?? ''),
      destaque: produto.destaque ?? false,
      ativo: produto.ativo ?? true,
    });
    setNovasImagens([]);
    setShowModal(true);
  };

  const handleToggleAtivo = async (p: Produto) => {
    const novoAtivo = !(p as any).ativo;
    try {
      await produtosApi.update(p.id, { ativo: novoAtivo });
      setProdutos((prev) => prev.map((item) => item.id === p.id ? { ...item, ativo: novoAtivo } as any : item));
      toast.success(novoAtivo ? 'Produto ativado' : 'Produto inativado');
    } catch (err: any) { toast.error(err?.message ?? 'Erro'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Inativar produto?')) return;
    try {
      await produtosApi.delete(id);
      setProdutos((prev) => prev.filter((p) => p?.id !== id));
      toast.success('Produto inativado');
    } catch (err: any) { toast.error(err?.message ?? 'Erro'); }
  };

  const handleDeleteDefinitivo = async (id: number) => {
    if (!confirm('Excluir PERMANENTEMENTE? Esta ação não pode ser desfeita!')) return;
    try {
      await produtosApi.deletarDefinitivo(id);
      setProdutos((prev) => prev.filter((p) => p?.id !== id));
      toast.success('Produto excluído permanentemente');
    } catch (err: any) { toast.error(err?.message ?? 'Erro'); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim()) return toast.error('Nome é obrigatório');
    if (!form.sku.trim()) return toast.error('SKU é obrigatório');
    if (!form.preco) return toast.error('Preço é obrigatório');
    if (!form.categoriaId) return toast.error('Categoria é obrigatória');
    if (!form.slug.trim()) return toast.error('Slug é obrigatório');
    setSaving(true);
    try {
      const payload = buildPayload(form);

      // Faz upload dos arquivos e resolve todas as URLs
      setUploadando(true);
      const imagensResolvidas = await Promise.all(
        novasImagens.map(async (img, idx) => {
          let url = img.url.trim();
          if (img.arquivo) {
            const upload = await arquivosApi.uploadImagem(img.arquivo);
            url = upload.url;
          }
          return url ? { url, principal: img.principal || idx === 0 } : null;
        })
      );
      setUploadando(false);
      const imagensValidas = imagensResolvidas.filter(Boolean) as { url: string; principal: boolean }[];

      // Garante que só uma é principal
      let temPrincipal = false;
      const imagensFinais = imagensValidas.map((img) => {
        if (img.principal && !temPrincipal) { temPrincipal = true; return img; }
        return { ...img, principal: false };
      });

      if (editId) {
        let updated = await produtosApi.update(editId, payload);
        for (const img of imagensFinais) {
          await produtosApi.addImagem(editId, { url: img.url, principal: img.principal });
        }
        updated = await produtosApi.getById(editId);
        setProdutos((prev) => prev.map((p) => p.id === editId ? updated : p));
        toast.success('Produto atualizado!');
      } else {
        let novo = await produtosApi.create(payload);
        for (const img of imagensFinais) {
          await produtosApi.addImagem(novo.id, { url: img.url, principal: img.principal });
        }
        novo = await produtosApi.getById(novo.id);
        setProdutos((prev) => [novo, ...prev]);
        toast.success('Produto criado!');
      }
      setNovasImagens([]);
      setShowModal(false);
    } catch (err: any) { toast.error(err?.message ?? 'Erro ao salvar'); } finally { setSaving(false); setUploadando(false); }
  };

  const f = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [field]: e.target.value });

  const handleNomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nome = e.target.value;
    setForm((prev) => ({ ...prev, nome, slug: editId ? prev.slug : slugify(nome) }));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight flex items-center gap-2">
          <Package className="w-6 h-6 text-primary" /> Produtos
        </h1>
        <button onClick={openCreate} className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Novo Produto
        </button>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar produto..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {loading ? <p className="text-muted-foreground">Carregando...</p> : (
        <div className="bg-card rounded-lg overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left px-4 py-3 font-medium">Produto</th>
                  <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Categoria</th>
                  <th className="text-right px-4 py-3 font-medium">Preço</th>
                  <th className="text-right px-4 py-3 font-medium hidden sm:table-cell">Estoque</th>
                  <th className="text-center px-4 py-3 font-medium hidden md:table-cell">Status</th>
                  <th className="text-right px-4 py-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {produtos.filter((p) => {
                  if (!busca.trim()) return true;
                  const q = busca.toLowerCase();
                  return p?.nome?.toLowerCase().includes(q) || (p as any)?.sku?.toLowerCase().includes(q);
                }).map((p) => {
                  const ativo = (p as any).ativo ?? true;
                  return (
                    <tr key={p?.id} className={`border-b border-border/50 hover:bg-secondary/20 ${!ativo ? 'opacity-50' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 bg-secondary/30 rounded overflow-hidden flex-shrink-0">
                            <Image src={getProdutoImagem(p)} alt={p?.nome ?? ''} fill className="object-cover" sizes="40px" />
                          </div>
                          <div>
                            <p className="font-medium line-clamp-1">{p?.nome}</p>
                            <p className="text-xs text-muted-foreground">{p?.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">{p?.categoria?.nome ?? '-'}</td>
                      <td className="px-4 py-3 text-right font-medium">{formatCurrency(p?.precoEfetivo ?? p?.preco)}</td>
                      <td className="px-4 py-3 text-right hidden sm:table-cell">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${(p?.estoque ?? 0) <= (p?.estoqueMinimo ?? 0) ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {p?.estoque ?? 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center hidden md:table-cell">
                        <button
                          onClick={() => handleToggleAtivo(p)}
                          title={ativo ? 'Clique para inativar' : 'Clique para ativar'}
                          className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${ativo ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                        >
                          {ativo ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                          {ativo ? 'Ativo' : 'Inativo'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openEdit(p)} title="Editar" className="p-1 text-muted-foreground hover:text-primary"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteDefinitivo(p?.id)} title="Excluir definitivamente" className="p-1 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 py-8 overflow-y-auto">
          <div className="bg-card rounded-lg w-full max-w-2xl p-6" style={{ boxShadow: 'var(--shadow-lg)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold">{editId ? 'Editar Produto' : 'Novo Produto'}</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">Nome *</label>
                  <input value={form.nome} onChange={handleNomeChange} className="w-full border border-border rounded px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Nome do produto" required />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">Slug *</label>
                  <input value={form.slug} onChange={f('slug')} className="w-full border border-border rounded px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary font-mono" placeholder="nome-do-produto" required />
                  <p className="text-xs text-muted-foreground mt-1">Gerado automaticamente pelo nome. Usado na URL do produto.</p>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">Descrição</label>
                  <textarea value={form.descricao} onChange={f('descricao')} className="w-full border border-border rounded px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary" rows={3} placeholder="Descrição do produto" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">SKU *</label>
                  <input value={form.sku} onChange={f('sku')} className="w-full border border-border rounded px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary" placeholder="BOL-001" required />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Categoria *</label>
                  <select value={form.categoriaId} onChange={f('categoriaId')} className="w-full border border-border rounded px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary" required>
                    <option value="">Selecione...</option>
                    {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Preço (R$) *</label>
                  <input type="number" step="0.01" min="0.01" value={form.preco} onChange={f('preco')} className="w-full border border-border rounded px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary" placeholder="0.00" required />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Preço Promocional (R$)</label>
                  <input type="number" step="0.01" min="0" value={form.precoPromocional} onChange={f('precoPromocional')} className="w-full border border-border rounded px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary" placeholder="0.00" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Estoque *</label>
                  <input type="number" min="0" value={form.estoque} onChange={f('estoque')} className="w-full border border-border rounded px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Estoque Mínimo</label>
                  <input type="number" min="0" value={form.estoqueMinimo} onChange={f('estoqueMinimo')} className="w-full border border-border rounded px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Tipo de Couro</label>
                  <input value={form.tipoCouro} onChange={f('tipoCouro')} className="w-full border border-border rounded px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Ex: Vaqueta, Napa..." />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Cor</label>
                  <input value={form.cor} onChange={f('cor')} className="w-full border border-border rounded px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Ex: Marrom, Preto..." />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Peso (kg)</label>
                  <input type="number" step="0.001" min="0" value={form.pesoKg} onChange={f('pesoKg')} className="w-full border border-border rounded px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary" placeholder="0.500" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Altura (cm)</label>
                  <input type="number" step="0.1" min="0" value={form.alturaCm} onChange={f('alturaCm')} className="w-full border border-border rounded px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Largura (cm)</label>
                  <input type="number" step="0.1" min="0" value={form.larguraCm} onChange={f('larguraCm')} className="w-full border border-border rounded px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Profundidade (cm)</label>
                  <input type="number" step="0.1" min="0" value={form.profundidadeCm} onChange={f('profundidadeCm')} className="w-full border border-border rounded px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>

                {/* ── Imagens ── */}
                <div className="sm:col-span-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium">Fotos do Produto</label>
                    <button
                      type="button"
                      onClick={() => setNovasImagens((prev) => [...prev, { arquivo: null, url: '', principal: prev.length === 0 }])}
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <ImagePlus className="w-3.5 h-3.5" /> Adicionar foto
                    </button>
                  </div>

                  {/* Seletor múltiplo de arquivos */}
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Selecionar vários arquivos de uma vez</label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files ?? []);
                        if (!files.length) return;
                        setNovasImagens((prev) => [
                          ...prev,
                          ...files.map((arquivo, i) => ({
                            arquivo,
                            url: '',
                            principal: prev.length === 0 && i === 0,
                          })),
                        ]);
                        e.target.value = '';
                      }}
                      className="w-full border border-border rounded px-3 py-2 text-sm bg-background"
                    />
                  </div>

                  {/* Lista de imagens adicionadas */}
                  {novasImagens.length > 0 && (
                    <div className="space-y-2">
                      {novasImagens.map((img, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-secondary/30 rounded p-2">
                          {/* preview */}
                          <div className="w-10 h-10 rounded overflow-hidden bg-secondary flex-shrink-0">
                            {img.arquivo ? (
                              <img src={URL.createObjectURL(img.arquivo)} className="w-full h-full object-cover" alt="" />
                            ) : img.url ? (
                              <img src={img.url} className="w-full h-full object-cover" alt="" onError={(e) => (e.currentTarget.style.display = 'none')} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground"><ImagePlus className="w-4 h-4" /></div>
                            )}
                          </div>

                          {/* nome ou URL */}
                          <div className="flex-1 min-w-0">
                            {img.arquivo ? (
                              <p className="text-xs truncate">{img.arquivo.name}</p>
                            ) : (
                              <input
                                value={img.url}
                                onChange={(e) => setNovasImagens((prev) => prev.map((it, i) => i === idx ? { ...it, url: e.target.value } : it))}
                                placeholder="https://..."
                                className="w-full text-xs border border-border rounded px-2 py-1 bg-background"
                              />
                            )}
                          </div>

                          {/* principal */}
                          <button
                            type="button"
                            title={img.principal ? 'Foto principal' : 'Definir como principal'}
                            onClick={() => setNovasImagens((prev) => prev.map((it, i) => ({ ...it, principal: i === idx })))}
                            className={`p-1 rounded ${img.principal ? 'text-yellow-500' : 'text-muted-foreground hover:text-yellow-400'}`}
                          >
                            <Star className="w-4 h-4" fill={img.principal ? 'currentColor' : 'none'} />
                          </button>

                          {/* remover */}
                          <button
                            type="button"
                            onClick={() => setNovasImagens((prev) => prev.filter((_, i) => i !== idx))}
                            className="p-1 text-muted-foreground hover:text-destructive"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <p className="text-xs text-muted-foreground">⭐ = foto principal (aparece na listagem)</p>
                    </div>
                  )}
                </div>

                <div className="sm:col-span-2 flex items-center gap-6">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={form.destaque} onChange={(e) => setForm({ ...form, destaque: e.target.checked })} />
                    Destaque
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={form.ativo} onChange={(e) => setForm({ ...form, ativo: e.target.checked })} />
                    Ativo
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-border rounded px-4 py-2 text-sm hover:bg-secondary/50">Cancelar</button>
                <button type="submit" disabled={saving} className="flex-1 bg-primary text-primary-foreground rounded px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50">
                  {uploadando ? `Enviando ${novasImagens.length} foto(s)...` : saving ? 'Salvando...' : editId ? 'Salvar Alterações' : 'Criar Produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
