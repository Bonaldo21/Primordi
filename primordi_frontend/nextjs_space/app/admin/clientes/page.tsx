'use client';

import { useState, useEffect } from 'react';
import { Users, Eye } from 'lucide-react';
import { clientesApi } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import type { Cliente } from '@/lib/types';

export default function AdminClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [selecionado, setSelecionado] = useState<Cliente | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await clientesApi.admin.listar({ size: '50', sort: 'criadoEm,desc' });
        setClientes(res?.content ?? []);
      } catch { setClientes([]); } finally { setLoading(false); }
    }
    load();
  }, []);

  const filtrados = clientes.filter((c) =>
    !busca || (c as any)?.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    (c as any)?.email?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" /> Clientes
        </h1>
        <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome ou email..."
          className="text-sm border border-border rounded-md px-3 py-1.5 bg-background w-64" />
      </div>

      {loading ? <p className="text-muted-foreground">Carregando...</p> : filtrados.length === 0 ? (
        <p className="text-muted-foreground">Nenhum cliente encontrado.</p>
      ) : (
        <div className="bg-card rounded-lg overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left px-4 py-3 font-medium">Nome</th>
                  <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Email</th>
                  <th className="text-center px-4 py-3 font-medium hidden md:table-cell">Verificado</th>
                  <th className="text-center px-4 py-3 font-medium">Ativo</th>
                  <th className="text-right px-4 py-3 font-medium hidden sm:table-cell">Cadastro</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((c) => (
                  <tr key={(c as any)?.id} className="border-b border-border/50 hover:bg-secondary/20">
                    <td className="px-4 py-3 font-medium">{(c as any)?.nome ?? '-'}</td>
                    <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">{(c as any)?.email ?? '-'}</td>
                    <td className="px-4 py-3 text-center hidden md:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${(c as any)?.emailVerificado ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {(c as any)?.emailVerificado ? 'Sim' : 'Não'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${(c as any)?.ativo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {(c as any)?.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right hidden sm:table-cell text-muted-foreground text-xs">{formatDateTime((c as any)?.criadoEm)}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setSelecionado(c)} className="p-1 text-muted-foreground hover:text-primary">
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

      {selecionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-xl w-full max-w-md p-6" style={{ boxShadow: 'var(--shadow-lg)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold">Detalhes do Cliente</h2>
              <button onClick={() => setSelecionado(null)} className="text-muted-foreground hover:text-foreground text-xl">✕</button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Nome</span><span>{(selecionado as any)?.nome ?? '-'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{(selecionado as any)?.email ?? '-'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">CPF</span><span>{(selecionado as any)?.cpf ?? '-'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Telefone</span><span>{(selecionado as any)?.telefone ?? '-'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Email verificado</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${(selecionado as any)?.emailVerificado ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {(selecionado as any)?.emailVerificado ? 'Sim' : 'Não'}
                </span>
              </div>
              <div className="flex justify-between"><span className="text-muted-foreground">Status</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${(selecionado as any)?.ativo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {(selecionado as any)?.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <div className="flex justify-between"><span className="text-muted-foreground">Cadastro</span><span>{formatDateTime((selecionado as any)?.criadoEm)}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
