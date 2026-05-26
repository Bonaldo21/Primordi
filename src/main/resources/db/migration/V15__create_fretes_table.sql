-- =====================================================================
-- V15 - Cria a tabela de fretes e índices de suporte
-- Módulo: frete
-- =====================================================================

CREATE TABLE fretes (
                        id                BIGINT       NOT NULL AUTO_INCREMENT,
                        pedido_id         BIGINT       NOT NULL,
                        transportadora    VARCHAR(30)  NOT NULL,
                        tipo_servico      VARCHAR(20)  NOT NULL,
                        status            VARCHAR(30)  NOT NULL DEFAULT 'AGUARDANDO_POSTAGEM',

                        valor             DECIMAL(10,2) NOT NULL,
                        prazo_dias        INT           NOT NULL,
                        previsao_entrega  DATE          NULL,

                        codigo_rastreio   VARCHAR(50)  NULL,
                        cep_origem        VARCHAR(9)   NULL,
                        cep_destino       VARCHAR(9)   NOT NULL,

                        peso_kg           DECIMAL(8,3) NULL,
                        altura_cm         INT          NULL,
                        largura_cm        INT          NULL,
                        comprimento_cm    INT          NULL,

                        postado_em        DATETIME     NULL,
                        entregue_em       DATETIME     NULL,

                        criado_em         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        atualizado_em     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

                        CONSTRAINT pk_fretes PRIMARY KEY (id),
                        CONSTRAINT uk_fretes_pedido UNIQUE (pedido_id),

    -- Se você tem tabela `pedidos`, descomente a FK:
    -- CONSTRAINT fk_fretes_pedido
    --     FOREIGN KEY (pedido_id) REFERENCES pedidos (id)
    --     ON DELETE RESTRICT ON UPDATE CASCADE,

                        CONSTRAINT ck_fretes_valor_positivo CHECK (valor >= 0),
                        CONSTRAINT ck_fretes_prazo_positivo CHECK (prazo_dias >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_frete_pedido          ON fretes (pedido_id);
CREATE INDEX idx_frete_codigo_rastreio ON fretes (codigo_rastreio);
CREATE INDEX idx_frete_status          ON fretes (status);
CREATE INDEX idx_frete_transportadora  ON fretes (transportadora);
CREATE INDEX idx_frete_previsao        ON fretes (previsao_entrega);
