export interface Usuario {
  id: number;
  nome: string;
  email: string;
  cpf: string | null;
  role: 'CLIENTE' | 'ADMIN';
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  usuario: Usuario;
}

export interface Categoria {
  id: number;
  nome: string;
  slug: string;
  descricao: string | null;
  imagemUrl: string | null;
  ordem: number;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export interface ProdutoImagem {
  id: number;
  url: string;
  altText: string | null;
  ordem: number;
  principal: boolean;
}

export interface Produto {
  id: number;
  sku: string;
  nome: string;
  slug: string;
  descricao: string | null;
  tipoCouro: string | null;
  cor: string | null;
  preco: number;
  precoPromocional: number | null;
  precoEfetivo: number;
  precoPixBoleto: number;
  largura: number | null;
  altura: number | null;
  profundidade: number | null;
  peso: number | null;
  estoque: number;
  estoqueMinimo: number;
  ativo: boolean;
  destaque: boolean;
  categoria: Categoria | null;
  imagens: ProdutoImagem[];
  criadoEm: string;
  atualizadoEm: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface Endereco {
  id: number;
  apelido: string | null;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string | null;
  bairro: string;
  cidade: string;
  estado: string;
  pais: string;
  principal: boolean;
}

export interface PedidoItem {
  id: number;
  produtoId: number;
  produtoNome: string;
  produtoSku: string;
  precoUnitario: number;
  desconto: number;
  subtotal: number;
  quantidade: number;
}

export type StatusPedido = 'AGUARDANDO_PAGAMENTO' | 'PAGAMENTO_APROVADO' | 'EM_SEPARACAO' | 'ENVIADO' | 'ENTREGUE' | 'CANCELADO' | 'ESTORNADO';

export interface Pedido {
  id: number;
  codigo: string;
  status: StatusPedido;
  subtotal: number;
  desconto: number;
  valorFrete: number;
  total: number;
  cupomCodigo: string | null;
  observacoes: string | null;
  canceladoEm: string | null;
  motivoCancelamento: string | null;
  itens: PedidoItem[];
  enderecoEntrega: Endereco | null;
  cliente: { id: number; nome: string; email: string } | null;
  criadoEm: string;
  atualizadoEm: string;
}

export interface Cliente {
  id: number;
  nome: string;
  email: string;
  cpf: string | null;
  telefone: string | null;
  dataNascimento: string | null;
  role: string;
  ativo: boolean;
  emailVerificado: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export interface FreteOpcao {
  transportadora: string;
  tipoServico: string;
  nomeServico: string;
  valor: number;
  prazoDias: number;
  previsaoEntrega: string;
  observacao?: string;
}

export interface CartItem {
  produto: Produto;
  quantidade: number;
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  details?: string[];
}
