import type { AuthResponse, Categoria, Produto, PaginatedResponse, Endereco, Pedido, Cliente, FreteOpcao } from './types';
import type { ProdutoImagem as ProdutoImagemType } from './types';

type UploadImagemResponse = {
  url: string;
};

// ✅ Corrigido — remove espaços, quebras de linha e garante https://
const rawBase = (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://primordi-production.up.railway.app')
    .replace(/\s+/g, '')        // remove espaços e \n
    .replace(/\/+$/, '');       // remove barra final se houver

const API_BASE = rawBase.startsWith('http')
    ? rawBase
    : `https://${rawBase}`;





export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try { return localStorage.getItem('primordi:accessToken'); } catch { return null; }
}

export function setTokens(access: string, refresh: string) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('primordi:accessToken', access);
    localStorage.setItem('primordi:refreshToken', refresh);
  } catch {}
}

export function clearTokens() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('primordi:accessToken');
    localStorage.removeItem('primordi:refreshToken');
    localStorage.removeItem('primordi:user');
  } catch {}
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> ?? {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    let errorMsg = `Erro ${res.status}`;
    try {
      const body = await res.json();
      errorMsg = body?.message ?? errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }

  if (res.status === 204) return {} as T;
  return res.json();
}

export async function requestFormData<T>(path: string, formData: FormData): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!res.ok) {
    let errorMsg = `Erro ${res.status}`;
    try { const body = await res.json(); errorMsg = body?.message ?? errorMsg; } catch {}
    throw new Error(errorMsg);
  }
  if (res.status === 204) return {} as T;
  return res.json();
}

export const arquivosApi = {
  uploadImagem: (arquivo: File) => {
    const formData = new FormData();
    formData.append('arquivo', arquivo);
    return requestFormData<UploadImagemResponse>('/arquivos/imagem', formData);
  },
};

// Auth
export const authApi = {
  login: (email: string, senha: string) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ email, senha }) }),
  register: (data: { nome: string; email: string; senha: string; cpf?: string; telefone?: string }) =>
    request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  refresh: (refreshToken: string) =>
    request<AuthResponse>('/auth/refresh', { method: 'POST', body: JSON.stringify({ refreshToken }) }),
};

// Categorias
export const categoriasApi = {
  ativas: () => request<Categoria[]>('/categorias/ativas'),
  todas: () => request<Categoria[]>('/categorias'),
  getById: (id: number) => request<Categoria>(`/categorias/${id}`),
  getBySlug: (slug: string) => request<Categoria>(`/categorias/slug/${slug}`),
  create: (data: Partial<Categoria>) => request<Categoria>('/categorias', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Categoria>) => request<Categoria>(`/categorias/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  inativar: (id: number) => request<void>(`/categorias/${id}`, { method: "DELETE" }),
  deletarDefinitivo: (id: number) => request<void>(`/categorias/${id}/definitivo`, { method: "DELETE" }),
};

// Produtos
export const produtosApi = {
  vitrine: () => request<Produto[]>('/produtos/vitrine'),
  destaques: () => request<Produto[]>('/produtos/destaques'),
  getBySlug: (slug: string) => request<Produto>(`/produtos/slug/${slug}`),
  getById: (id: number) => request<Produto>(`/produtos/${id}`),
  listar: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<PaginatedResponse<Produto>>(`/produtos${query}`);
  },
  create: (data: any) => request<Produto>('/produtos', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => request<Produto>(`/produtos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request<void>(`/produtos/${id}`, { method: 'DELETE' }),
  deletarDefinitivo: (id: number) => request<void>(`/produtos/${id}/definitivo`, { method: 'DELETE' }),
  updateEstoque: (id: number, estoque: number) =>
    request<Produto>(`/produtos/${id}/estoque`, { method: 'PATCH', body: JSON.stringify({ estoque }) }),
  addImagem: (id: number, data: { url: string; altText?: string; ordem?: number; principal?: boolean }) =>
    request<ProdutoImagemType>(`/produtos/${id}/imagens`, { method: 'POST', body: JSON.stringify(data) }),
  deleteImagem: (imagemId: number) =>
    request<void>(`/produtos/imagens/${imagemId}`, { method: 'DELETE' }),
  setImagemPrincipal: (produtoId: number, imagemId: number) =>
    request<void>(`/produtos/${produtoId}/imagens/${imagemId}/principal`, { method: 'PATCH' }),
};

// Clientes
export const clientesApi = {
  me: () => request<Cliente>('/clientes/me'),
  admin: {
    listar: (params?: Record<string, string>) => { const query = params ? "?" + new URLSearchParams(params).toString() : ""; return request<PaginatedResponse<Cliente>>(`/admin/clientes${query}`); },
    getById: (id: number) => request<Cliente>(`/admin/clientes/${id}`),
  },
  updateMe: (data: Partial<Cliente>) => request<Cliente>('/clientes/me', { method: 'PUT', body: JSON.stringify(data) }),
  updateSenha: (data: { senhaAtual: string; novaSenha: string }) =>
    request<void>('/clientes/me/senha', { method: 'PATCH', body: JSON.stringify(data) }),
};

// Enderecos
export const enderecosApi = {
  listar: () => request<Endereco[]>('/enderecos'),
  getById: (id: number) => request<Endereco>(`/enderecos/${id}`),
  create: (data: Partial<Endereco>) => request<Endereco>('/enderecos', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Endereco>) =>
    request<Endereco>(`/enderecos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  setPrincipal: (id: number) => request<void>(`/enderecos/${id}/principal`, { method: 'PATCH' }),
  delete: (id: number) => request<void>(`/enderecos/${id}`, { method: 'DELETE' }),
};

// Pedidos
export const pedidosApi = {
  listar: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<PaginatedResponse<Pedido>>(`/pedidos${query}`);
  },
  getById: (id: number) => request<Pedido>(`/pedidos/${id}`),
  getByCodigo: (codigo: string) => request<Pedido>(`/pedidos/codigo/${codigo}`),
  create: (data: { enderecoEntregaId: number; itens: { produtoId: number; quantidade: number }[]; cupomCodigo?: string; valorFrete?: number; observacoes?: string }) =>
    request<Pedido>('/pedidos', { method: 'POST', body: JSON.stringify(data) }),
  cancelar: (id: number, motivo?: string) =>
    request<Pedido>(`/pedidos/${id}/cancelar`, { method: 'PATCH', body: JSON.stringify({ motivo }) }),
  admin: {
    listar: (params?: Record<string, string>) => { const query = params ? "?" + new URLSearchParams(params).toString() : ""; return request<PaginatedResponse<Pedido>>(`/admin/pedidos${query}`); },
    getById: (id: number) => request<Pedido>(`/admin/pedidos/${id}`),
    updateStatus: (id: number, status: string) => request<Pedido>(`/admin/pedidos/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  },
  updateStatus: (id: number, status: string) =>
    request<Pedido>(`/pedidos/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
};

// Fretes
export const fretesApi = {
  calcular: (data: { cepDestino: string; pesoKg: number; alturaCm: number; larguraCm: number; comprimentoCm: number; valorDeclarado?: number }) =>
    request<FreteOpcao[]>('/fretes/calcular', { method: 'POST', body: JSON.stringify(data) }),
};

// Pagamentos
export const pagamentosApi = {
  criar: (data: any) => request<any>('/pagamentos', { method: 'POST', body: JSON.stringify(data) }),
  consultarPorPedido: (pedidoId: number) => request<any>(`/pagamentos/pedido/${pedidoId}`),
  publicKey: () => request<{ publicKey: string }>('/pagamentos/public-key'),
};
