-- V5__create_pedidos.sql
-- Fluxo de vendas: pedidos, itens, pagamentos e entregas

CREATE TABLE IF NOT EXISTS pedidos (
                                       id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                       codigo VARCHAR(20) NOT NULL UNIQUE,
    cliente_id BIGINT NOT NULL,
    endereco_entrega_id BIGINT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'AGUARDANDO_PAGAMENTO',
    subtotal DECIMAL(10,2) NOT NULL,
    desconto DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    valor_frete DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total DECIMAL(10,2) NOT NULL,
    cupom_codigo VARCHAR(50),
    observacoes TEXT,
    cancelado_em TIMESTAMP NULL,
    motivo_cancelamento VARCHAR(255),
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_pedidos_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    CONSTRAINT fk_pedidos_endereco FOREIGN KEY (endereco_entrega_id) REFERENCES enderecos(id),
    INDEX idx_pedidos_cliente (cliente_id),
    INDEX idx_pedidos_status (status),
    INDEX idx_pedidos_criado_em (criado_em)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pedido_itens (
                                            id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                            pedido_id BIGINT NOT NULL,
                                            produto_id BIGINT NOT NULL,
    -- snapshot dos dados do produto no momento da compra
                                            produto_nome VARCHAR(200) NOT NULL,
    produto_sku VARCHAR(50) NOT NULL,
    quantidade INT NOT NULL CHECK (quantidade > 0),
    preco_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_itens_pedido FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    CONSTRAINT fk_itens_produto FOREIGN KEY (produto_id) REFERENCES produtos(id),
    INDEX idx_itens_pedido (pedido_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pagamentos (
                                          id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                          pedido_id BIGINT NOT NULL,
                                          metodo VARCHAR(30) NOT NULL, -- PIX, BOLETO, CARTAO_CREDITO, CARTAO_DEBITO
    status VARCHAR(30) NOT NULL DEFAULT 'PENDENTE',
    valor DECIMAL(10,2) NOT NULL,
    transacao_id VARCHAR(100),
    gateway VARCHAR(50), -- ex: MERCADO_PAGO, STRIPE, PAGSEGURO
    parcelas INT NOT NULL DEFAULT 1,
    qr_code TEXT, -- para PIX
    link_boleto VARCHAR(500), -- para boleto
    pago_em TIMESTAMP NULL,
    estornado_em TIMESTAMP NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_pagamentos_pedido FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    INDEX idx_pagamentos_pedido (pedido_id),
    INDEX idx_pagamentos_status (status),
    INDEX idx_pagamentos_transacao (transacao_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS entregas (
                                        id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                        pedido_id BIGINT NOT NULL UNIQUE,
                                        transportadora VARCHAR(80),
    codigo_rastreio VARCHAR(50),
    url_rastreio VARCHAR(500),
    status VARCHAR(30) NOT NULL DEFAULT 'AGUARDANDO_ENVIO',
    prazo_estimado_dias INT,
    valor_frete DECIMAL(10,2),
    enviado_em TIMESTAMP NULL,
    entregue_em TIMESTAMP NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_entregas_pedido FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    INDEX idx_entregas_status (status),
    INDEX idx_entregas_rastreio (codigo_rastreio)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
