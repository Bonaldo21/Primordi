import type { Produto, Categoria } from './types';

export const sampleCategories: Categoria[] = [
  { id: 1, nome: 'Bolsas', slug: 'bolsas', descricao: 'Bolsas artesanais em couro legítimo', imagemUrl: 'https://cdn.abacus.ai/images/92d1e8db-604d-4f75-80ca-da07d164648f.png', ordem: 1, ativo: true, criadoEm: '', atualizadoEm: '' },
  { id: 2, nome: 'Carteiras', slug: 'carteiras', descricao: 'Carteiras e porta-cartões em couro', imagemUrl: 'https://cdn.abacus.ai/images/ce241e03-f00d-40e2-a530-e6b3c62c898d.png', ordem: 2, ativo: true, criadoEm: '', atualizadoEm: '' },
  { id: 3, nome: 'Acessórios', slug: 'acessorios', descricao: 'Cintos, chaveiros e acessórios em couro', imagemUrl: 'https://cdn.abacus.ai/images/0e08c09a-6595-4fc3-a347-e1acb9df2e67.png', ordem: 3, ativo: true, criadoEm: '', atualizadoEm: '' },
  { id: 4, nome: 'Viagem', slug: 'viagem', descricao: 'Mochilas e necessaires para viagem', imagemUrl: 'https://cdn.abacus.ai/images/181e0dc0-18d1-4081-a055-45eed0ba776a.png', ordem: 4, ativo: true, criadoEm: '', atualizadoEm: '' },
  { id: 5, nome: 'Escritório', slug: 'escritorio', descricao: 'Cases, capas e itens para escritório', imagemUrl: 'https://cdn.abacus.ai/images/7e305de6-b4d5-4b99-9230-b5d57c0e2568.png', ordem: 5, ativo: true, criadoEm: '', atualizadoEm: '' },
];

export const sampleProducts: Produto[] = [
  {
    id: 1, sku: 'BLS-001', nome: 'Bolsa Tote Clássica', slug: 'bolsa-tote-classica',
    descricao: 'Bolsa tote espaçosa em couro legítimo marrom, perfeita para o dia a dia. Design atemporal com acabamento artesanal e costuras reforçadas.',
    tipoCouro: 'Couro Vegetal', cor: 'Marrom', preco: 489.90, precoPromocional: null, precoEfetivo: 489.90,
    largura: 35, altura: 30, profundidade: 12, peso: 0.8, estoque: 15, estoqueMinimo: 3, ativo: true, destaque: true,
    categoria: sampleCategories[0], imagens: [{ id: 1, url: 'https://cdn.abacus.ai/images/92d1e8db-604d-4f75-80ca-da07d164648f.png', altText: 'Bolsa Tote Clássica', ordem: 1, principal: true }],
    criadoEm: '2025-01-15', atualizadoEm: '2025-01-15'
  },
  {
    id: 2, sku: 'BLS-002', nome: 'Bolsa Crossbody Minimal', slug: 'bolsa-crossbody-minimal',
    descricao: 'Bolsa crossbody compacta em couro tan com ferragens douradas. Ideal para passeios e eventos.',
    tipoCouro: 'Couro Curtido', cor: 'Tan', preco: 359.90, precoPromocional: 299.90, precoEfetivo: 299.90,
    largura: 22, altura: 16, profundidade: 6, peso: 0.4, estoque: 22, estoqueMinimo: 5, ativo: true, destaque: true,
    categoria: sampleCategories[0], imagens: [{ id: 2, url: 'https://cdn.abacus.ai/images/7b711a6f-8e42-4765-bc7a-dd4660845f80.png', altText: 'Bolsa Crossbody Minimal', ordem: 1, principal: true }],
    criadoEm: '2025-01-15', atualizadoEm: '2025-01-15'
  },
  {
    id: 3, sku: 'CRT-001', nome: 'Carteira Bifold Slim', slug: 'carteira-bifold-slim',
    descricao: 'Carteira bifold masculina em couro marrom escuro, design slim e elegante com compartimentos para cartões e notas.',
    tipoCouro: 'Couro Vegetal', cor: 'Marrom Escuro', preco: 189.90, precoPromocional: null, precoEfetivo: 189.90,
    largura: 11, altura: 9, profundidade: 1.5, peso: 0.08, estoque: 40, estoqueMinimo: 10, ativo: true, destaque: true,
    categoria: sampleCategories[1], imagens: [{ id: 3, url: 'https://cdn.abacus.ai/images/ce241e03-f00d-40e2-a530-e6b3c62c898d.png', altText: 'Carteira Bifold Slim', ordem: 1, principal: true }],
    criadoEm: '2025-01-15', atualizadoEm: '2025-01-15'
  },
  {
    id: 4, sku: 'CRT-002', nome: 'Porta-Cartões Minimal', slug: 'porta-cartoes-minimal',
    descricao: 'Porta-cartões compacto em couro tan com 5 compartimentos. Prático e elegante para o dia a dia.',
    tipoCouro: 'Couro Curtido', cor: 'Tan', preco: 119.90, precoPromocional: null, precoEfetivo: 119.90,
    largura: 10, altura: 7, profundidade: 0.8, peso: 0.04, estoque: 60, estoqueMinimo: 15, ativo: true, destaque: false,
    categoria: sampleCategories[1], imagens: [{ id: 4, url: 'https://cdn.abacus.ai/images/ac438380-5436-4381-98cb-b52bfb62649b.png', altText: 'Porta-Cartões Minimal', ordem: 1, principal: true }],
    criadoEm: '2025-01-15', atualizadoEm: '2025-01-15'
  },
  {
    id: 5, sku: 'ACS-001', nome: 'Cinto Clássico', slug: 'cinto-classico',
    descricao: 'Cinto masculino em couro escuro com fivela em latão envelhecido. Acabamento artesanal e durabilidade excepcional.',
    tipoCouro: 'Couro Vegetal', cor: 'Marrom Escuro', preco: 159.90, precoPromocional: null, precoEfetivo: 159.90,
    largura: 3.5, altura: 110, profundidade: 0.4, peso: 0.2, estoque: 35, estoqueMinimo: 8, ativo: true, destaque: true,
    categoria: sampleCategories[2], imagens: [{ id: 5, url: 'https://cdn.abacus.ai/images/0e08c09a-6595-4fc3-a347-e1acb9df2e67.png', altText: 'Cinto Clássico', ordem: 1, principal: true }],
    criadoEm: '2025-01-15', atualizadoEm: '2025-01-15'
  },
  {
    id: 6, sku: 'ESC-001', nome: 'Case Laptop 14"', slug: 'case-laptop-14',
    descricao: 'Case protetor para laptop de até 14 polegadas em couro cognac. Design minimalista com interior acolchoado.',
    tipoCouro: 'Couro Curtido', cor: 'Cognac', preco: 279.90, precoPromocional: 239.90, precoEfetivo: 239.90,
    largura: 36, altura: 26, profundidade: 2, peso: 0.35, estoque: 18, estoqueMinimo: 5, ativo: true, destaque: true,
    categoria: sampleCategories[4], imagens: [{ id: 6, url: 'https://cdn.abacus.ai/images/7e305de6-b4d5-4b99-9230-b5d57c0e2568.png', altText: 'Case Laptop', ordem: 1, principal: true }],
    criadoEm: '2025-01-15', atualizadoEm: '2025-01-15'
  },
  {
    id: 7, sku: 'VGM-001', nome: 'Mochila Heritage', slug: 'mochila-heritage',
    descricao: 'Mochila unissex em couro marrom com estilo vintage. Espaçosa com múltiplos compartimentos e alças ajustáveis.',
    tipoCouro: 'Couro Vegetal', cor: 'Castanho', preco: 599.90, precoPromocional: null, precoEfetivo: 599.90,
    largura: 30, altura: 42, profundidade: 14, peso: 1.2, estoque: 10, estoqueMinimo: 3, ativo: true, destaque: true,
    categoria: sampleCategories[3], imagens: [{ id: 7, url: 'https://cdn.abacus.ai/images/181e0dc0-18d1-4081-a055-45eed0ba776a.png', altText: 'Mochila Heritage', ordem: 1, principal: true }],
    criadoEm: '2025-01-15', atualizadoEm: '2025-01-15'
  },
  {
    id: 8, sku: 'BLS-003', nome: 'Clutch Essencial', slug: 'clutch-essencial',
    descricao: 'Clutch feminina em couro tan natural com zíper. Compacta e versátil, perfeita para dia e noite.',
    tipoCouro: 'Couro Curtido', cor: 'Tan Natural', preco: 199.90, precoPromocional: null, precoEfetivo: 199.90,
    largura: 24, altura: 14, profundidade: 3, peso: 0.15, estoque: 28, estoqueMinimo: 8, ativo: true, destaque: false,
    categoria: sampleCategories[0], imagens: [{ id: 8, url: 'https://cdn.abacus.ai/images/7ec7f358-fe0b-4f85-90bf-7306472a1bf3.png', altText: 'Clutch Essencial', ordem: 1, principal: true }],
    criadoEm: '2025-01-15', atualizadoEm: '2025-01-15'
  },
  {
    id: 9, sku: 'VGM-002', nome: 'Necessaire Viajante', slug: 'necessaire-viajante',
    descricao: 'Necessaire em couro marrom para viagem. Interior impermeável com amplo espaço para itens de higiene.',
    tipoCouro: 'Couro Vegetal', cor: 'Marrom', preco: 229.90, precoPromocional: 199.90, precoEfetivo: 199.90,
    largura: 25, altura: 12, profundidade: 10, peso: 0.25, estoque: 20, estoqueMinimo: 5, ativo: true, destaque: false,
    categoria: sampleCategories[3], imagens: [{ id: 9, url: 'https://cdn.abacus.ai/images/71803e82-2bb7-49f4-a8a2-558bfb1eac17.png', altText: 'Necessaire Viajante', ordem: 1, principal: true }],
    criadoEm: '2025-01-15', atualizadoEm: '2025-01-15'
  },
  {
    id: 10, sku: 'ACS-002', nome: 'Chaveiro Artesanal', slug: 'chaveiro-artesanal',
    descricao: 'Chaveiro em couro com argola em latão. Acessório compacto e sofisticado para suas chaves.',
    tipoCouro: 'Couro Vegetal', cor: 'Tan', preco: 59.90, precoPromocional: null, precoEfetivo: 59.90,
    largura: 3, altura: 10, profundidade: 0.5, peso: 0.03, estoque: 100, estoqueMinimo: 20, ativo: true, destaque: false,
    categoria: sampleCategories[2], imagens: [{ id: 10, url: 'https://cdn.abacus.ai/images/8e74a09e-01c3-4694-8c40-a793d6a0051d.png', altText: 'Chaveiro Artesanal', ordem: 1, principal: true }],
    criadoEm: '2025-01-15', atualizadoEm: '2025-01-15'
  },
  {
    id: 11, sku: 'ESC-002', nome: 'Capa Journal A5', slug: 'capa-journal-a5',
    descricao: 'Capa para caderno A5 em couro marrom com costura à mão. Protege e personaliza seu diário ou agenda.',
    tipoCouro: 'Couro Vegetal', cor: 'Marrom', preco: 149.90, precoPromocional: null, precoEfetivo: 149.90,
    largura: 16, altura: 22, profundidade: 2, peso: 0.15, estoque: 25, estoqueMinimo: 5, ativo: true, destaque: false,
    categoria: sampleCategories[4], imagens: [{ id: 11, url: 'https://cdn.abacus.ai/images/105cc2a5-50de-47d4-b087-9268932a0f1b.png', altText: 'Capa Journal A5', ordem: 1, principal: true }],
    criadoEm: '2025-01-15', atualizadoEm: '2025-01-15'
  },
  {
    id: 12, sku: 'ACS-003', nome: 'Sleeve Celular', slug: 'sleeve-celular',
    descricao: 'Sleeve universal para celular em couro tan natural. Proteção elegante com acabamento premium.',
    tipoCouro: 'Couro Curtido', cor: 'Tan Natural', preco: 89.90, precoPromocional: null, precoEfetivo: 89.90,
    largura: 8, altura: 16, profundidade: 1, peso: 0.05, estoque: 45, estoqueMinimo: 10, ativo: true, destaque: false,
    categoria: sampleCategories[2], imagens: [{ id: 12, url: 'https://cdn.abacus.ai/images/7eef0ebe-97a6-41ed-9fee-826306c079de.png', altText: 'Sleeve Celular', ordem: 1, principal: true }],
    criadoEm: '2025-01-15', atualizadoEm: '2025-01-15'
  },
];
