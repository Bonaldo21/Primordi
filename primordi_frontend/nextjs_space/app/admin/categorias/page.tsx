'use client';

import { useState, useEffect } from 'react';
import { Tags, Trash2, Plus, Pencil, X } from 'lucide-react';
import { categoriasApi, arquivosApi } from '@/lib/api';
import { sampleCategories } from '@/lib/sample-data';
import type { Categoria } from '@/lib/types';
import { toast } from 'sonner';

const emptyForm = { nome: '', descricao: '', imagemUrl: '', ativo: true };

export default function AdminCategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [imagemArquivo, setImagemArquivo] = useState<File | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const c = await categoriasApi.todas();
      setCategorias((c ?? [])?.length > 0 ? c : sampleCategories);
    } catch { setCategorias(sampleCategories); } finally { setLoading(false); }
  }

  const openCreate = () => { setEditId(null); setForm(emptyForm); setImagemArquivo(null); setShowModal(true); };
  const openEdit = (c: Categoria) => {
    setEditId(c.id);
    setForm({ nome: c.nome ?? '', descricao: (c as any).descricao ?? '', imagemUrl: (c as any).imagemUrl ?? '', ativo: c.ativo ?? true });
    setImagemArquivo(null);
    setShowModal(true);
  };

  const handleDeleteDefinitivo = async (id: number) => {
    if (!confirm("Excluir PERMANENTEMENTE? Esta ação não pode ser desfeita!")) return;
    try {
      await categoriasApi.deletarDefinitivo(id);
      setCategorias((prev) => prev.filter((c) => c?.id !== id));
      toast.success("Categoria excluída permanentemente");
    } catch (err: any) { toast.error(err?.message ?? "Erro"); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Inativar categoria?')) return;
    try {
      await categoriasApi.inativar(id);
      setCategorias((prev) => prev.filter((c) => c?.id !== id));
      toast.success('Inativada com sucesso!' +
          '');
    } catch (err: any) { toast.error(err?.message ?? 'Erro'); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim()) return toast.error('Nome é obrigatório');
    setSaving(true);
    try {
      const imagemUrlManual = form.imagemUrl.trim();
      let imagemUrl = imagemUrlManual;
      if (imagemArquivo) {
        const upload = await arquivosApi.uploadImagem(imagemArquivo);
        imagemUrl = upload.url;
      }
      const payload = { ...form, imagemUrl };
      if (editId) {
        const updated = await categoriasApi.update(editId, payload);
        setCategorias((prev) => prev.map((c) => c.id === editId ? updated : c));
        toast.success('Categoria atualizada!');
      } else {
        const nova = await categoriasApi.create(payload);
        setCategorias((prev) => [...prev, nova]);
        toast.success('Categoria criada!');
      }
      setImagemArquivo(null);
      setShowModal(false);
    } catch (err: any) { toast.error(err?.message ?? 'Erro'); } finally { setSaving(false); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight flex items-center gap-2">
          <Tags className="w-6 h-6 text-primary" /> Categorias
        </h1>
        <button onClick={openCreate} className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Nova Categoria
        </button>
      </div>

      {loading ? <p className="text-muted-foreground">Carregando...</p> : (
        <div className="bg-card rounded-lg overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left px-4 py-3 font-medium">Nome</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Slug</th>
                <th className="text-center px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {categorias.map((c) => (
                <tr key={c?.id} className="border-b border-border/50 hover:bg-secondary/20">
                  <td className="px-4 py-3 font-medium">{c?.nome}</td>
                  <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">{c?.slug}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded ${c?.ativo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {c?.ativo ? 'Ativa' : 'Inativa'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right flex justify-end gap-2">
                    <button onClick={() => openEdit(c)} className="p-1 text-muted-foreground hover:text-primary"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(c?.id)} title="Inativar" className="p-1 text-muted-foreground hover:text-yellow-600"><Pencil className="w-3 h-3" /></button>
                    <button onClick={() => handleDeleteDefinitivo(c?.id)} title="Excluir definitivamente" className="p-1 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4 text-red-500" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-card rounded-lg w-full max-w-md p-6" style={{ boxShadow: 'var(--shadow-lg)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold">{editId ? 'Editar Categoria' : 'Nova Categoria'}</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome *</label>
                <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className="w-full border border-border rounded px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Ex: Bolsas" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descrição</label>
                <textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} className="w-full border border-border rounded px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary" rows={3} placeholder="Descrição da categoria" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Imagem (arquivo)</label>
                <input type="file" accept="image/*" onChange={(e) => setImagemArquivo(e.target.files?.[0] ?? null)} className="w-full border border-border rounded px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">URL da Imagem</label>
                <input value={form.imagemUrl} onChange={(e) => setForm({ ...form, imagemUrl: e.target.value })} className="w-full border border-border rounded px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary" placeholder="https://..." />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="ativo" checked={form.ativo} onChange={(e) => setForm({ ...form, ativo: e.target.checked })} />
                <label htmlFor="ativo" className="text-sm">Ativa</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-border rounded px-4 py-2 text-sm hover:bg-secondary/50">Cancelar</button>
                <button type="submit" disabled={saving} className="flex-1 bg-primary text-primary-foreground rounded px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50">
                  {saving ? 'Salvando...' : editId ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
