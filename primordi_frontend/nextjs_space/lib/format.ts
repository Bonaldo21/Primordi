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

export function getProdutoImagem(produto: any): string {
  const imgs = produto?.imagens ?? [];
  const principal = imgs.find((i: any) => i?.principal);
  return principal?.url ?? imgs?.[0]?.url ?? '/placeholder-product.svg';
}
