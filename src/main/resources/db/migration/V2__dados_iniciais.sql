-- V2__create_produtos.sql
-- Catálogo: categorias, produtos e estoque

CREATE TABLE IF NOT EXISTS categorias (
                                          id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                          nome VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(120) NOT NULL UNIQUE,
    descricao TEXT,
    ativa BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS produtos (
                                        id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                        categoria_id BIGINT NOT NULL,
                                        sku VARCHAR(50) NOT NULL UNIQUE,
    nome VARCHAR(200) NOT NULL,
    slug VARCHAR(220) NOT NULL UNIQUE,
    descricao TEXT,
    tipo_couro VARCHAR(80),
    cor VARCHAR(50),
    preco DECIMAL(10,2) NOT NULL,
    preco_promocional DECIMAL(10,2),
    peso_kg DECIMAL(6,3),
    largura_cm DECIMAL(6,2),
    altura_cm DECIMAL(6,2),
    profundidade_cm DECIMAL(6,2),
    estoque INT NOT NULL DEFAULT 0,
    estoque_minimo INT NOT NULL DEFAULT 0,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    destaque BOOLEAN NOT NULL DEFAULT FALSE,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_produtos_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id),
    INDEX idx_produtos_categoria (categoria_id),
    INDEX idx_produtos_ativo (ativo)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS produto_imagens (
                                               id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                               produto_id BIGINT NOT NULL,
                                               url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(200),
    ordem INT NOT NULL DEFAULT 0,
    principal BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_imagens_produto FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE,
    INDEX idx_imagens_produto (produto_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed de categorias iniciais
INSERT INTO categorias (nome, slug, descricao) VALUES
                                                   ('Bolsas', 'bolsas', 'Bolsas de couro femininas e masculinas'),
                                                   ('Carteiras', 'carteiras', 'Carteiras de couro legítimo'),
                                                   ('Cintos', 'cintos', 'Cintos de couro artesanais'),
                                                   ('Sapatos', 'sapatos', 'Calçados em couro'),
                                                   ('Acessórios', 'acessorios', 'Chaveiros, porta-cartões e outros acessórios');
