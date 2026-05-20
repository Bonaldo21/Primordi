-- V4__create_carrinho.sql
-- Carrinho de compras do cliente (persistente)

CREATE TABLE IF NOT EXISTS carrinhos (
                                         id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                         cliente_id BIGINT NOT NULL UNIQUE,
                                         criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                         atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                         CONSTRAINT fk_carrinho_cliente FOREIGN KEY (cliente_id)
    REFERENCES clientes(id) ON DELETE CASCADE,
    INDEX idx_carrinhos_cliente_id (cliente_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS itens_carrinho (
                                              id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                              carrinho_id BIGINT NOT NULL,
                                              produto_id BIGINT NOT NULL,
                                              quantidade INT NOT NULL,
                                              preco_unitario DECIMAL(10,2) NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_itens_carrinho_carrinho FOREIGN KEY (carrinho_id)
    REFERENCES carrinhos(id) ON DELETE CASCADE,
    CONSTRAINT fk_itens_carrinho_produto FOREIGN KEY (produto_id)
    REFERENCES produtos(id) ON DELETE RESTRICT,
    CONSTRAINT uk_carrinho_produto UNIQUE (carrinho_id, produto_id),
    CONSTRAINT chk_quantidade_positiva CHECK (quantidade > 0),
    INDEX idx_itens_carrinho_id (carrinho_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
