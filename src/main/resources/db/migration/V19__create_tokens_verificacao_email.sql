CREATE TABLE tokens_verificacao_email (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    token      VARCHAR(36)  NOT NULL UNIQUE,
    cliente_id BIGINT       NOT NULL,
    expira_em  DATETIME     NOT NULL,
    usado      BOOLEAN      NOT NULL DEFAULT FALSE,
    criado_em  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_token_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_cliente_token (cliente_id)
);
