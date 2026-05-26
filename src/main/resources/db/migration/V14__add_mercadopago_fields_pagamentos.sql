-- ============================================================
-- Adiciona campos necessários para integração com Mercado Pago
-- ============================================================
ALTER TABLE pagamentos
    ADD COLUMN preference_id    VARCHAR(100) NULL AFTER transacao_id,
    ADD COLUMN qr_code_base64   TEXT         NULL AFTER qr_code,
    ADD COLUMN status_detalhe   VARCHAR(150) NULL AFTER status,
    ADD COLUMN payload_resposta TEXT         NULL AFTER link_boleto,
    ADD COLUMN expira_em        TIMESTAMP    NULL AFTER pago_em;

-- Índice para busca rápida pelo preference_id (webhook)
CREATE INDEX idx_pagamentos_preference ON pagamentos(preference_id);
