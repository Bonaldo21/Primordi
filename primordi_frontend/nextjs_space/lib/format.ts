export function formatCurrency(value: number | null | undefined): string {
  const v = value ?? 0;
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return '-';
  try {
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(date));
  } catch { return '-'; }
}

export function formatDateTime(date: string | null | undefined): string {
  if (!date) return '-';
  try {
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(date));
  } catch { return '-'; }
}

export function getStatusLabel(status: string | null | undefined): string {
  const map: Record<string, string> = {
    AGUARDANDO_PAGAMENTO: 'Aguardando Pagamento',
    PAGAMENTO_APROVADO: 'Pagamento Aprovado',
    EM_SEPARACAO: 'Em Separação',
    ENVIADO: 'Enviado',
    ENTREGUE: 'Entregue',
    CANCELADO: 'Cancelado',
    ESTORNADO: 'Estornado',
  };
  return map[status ?? ''] ?? status ?? '-';
}

export function getStatusColor(status: string | null | undefined): string {
  const map: Record<string, string> = {
    AGUARDANDO_PAGAMENTO: 'bg-yellow-100 text-yellow-800',
    PAGAMENTO_APROVADO: 'bg-green-100 text-green-800',
    EM_SEPARACAO: 'bg-blue-100 text-blue-800',
    ENVIADO: 'bg-indigo-100 text-indigo-800',
    ENTREGUE: 'bg-emerald-100 text-emerald-800',
    CANCELADO: 'bg-red-100 text-red-800',
    ESTORNADO: 'bg-gray-100 text-gray-800',
  };
  return map[status ?? ''] ?? 'bg-gray-100 text-gray-800';
}

const API_BASE = (() => {
  const raw = (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://primordi-production.up.railway.app/api')
    .replace(/\s+/g, '').replace(/\/+$/, '');
  return raw.startsWith('http') ? raw : `https://${raw}`;
})();

/**
 * Qualquer URL que contenha /uploads/ é um arquivo salvo pelo nosso backend.
 * Sempre reconstrói com o host público correto, independente do que está salvo no banco.
 * URLs externas (imgur, cloudinary, etc.) são retornadas sem alteração.
 */
function normalizarUrlImagem(url: string | null | undefined): string | null {
  if (!url) return null;
  const match = url.match(/\/uploads\/.+/);
  if (match) return `${API_BASE}${match[0]}`;
  return url; // URL externa — retorna sem alterar
}

export function getProdutoImagem(produto: any): string {
  // ProdutoResponse (detalhe): tem array imagens[]
  const imgs = produto?.imagens ?? [];
  const principal = imgs.find((i: any) => i?.principal);
  const urlDaLista = principal?.url ?? imgs?.[0]?.url ?? null;

  // ProdutoResumoResponse (listagem): tem campo imagemPrincipal string
  const url = urlDaLista ?? produto?.imagemPrincipal ?? null;
  return normalizarUrlImagem(url) ?? '/placeholder-product.svg';
}
