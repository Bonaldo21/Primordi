-- =====================================================================
-- V17 - Adiciona suporte a login social (Google, Facebook, etc.)
-- =====================================================================

ALTER TABLE clientes
    ADD COLUMN social_provider VARCHAR(20)  NULL COMMENT 'Provedor social: GOOGLE, FACEBOOK',
    ADD COLUMN social_id       VARCHAR(100) NULL COMMENT 'ID único do usuário no provedor';

CREATE INDEX idx_clientes_social ON clientes (social_provider, social_id);
