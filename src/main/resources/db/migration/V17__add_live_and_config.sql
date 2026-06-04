-- =====================================================================
-- V17 - Live dashboard: campo da_live em produtos + tabela configuracoes
-- =====================================================================

ALTER TABLE produtos
    ADD COLUMN da_live TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Produto exibido na live';

CREATE INDEX idx_produtos_da_live ON produtos (da_live);

-- Tabela de configurações gerais do site (chave-valor)
CREATE TABLE configuracoes (
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    chave      VARCHAR(100) NOT NULL UNIQUE COMMENT 'Ex: social.whatsapp, social.instagram',
    valor      TEXT         NULL,
    descricao  VARCHAR(255) NULL,
    grupo      VARCHAR(50)  NOT NULL DEFAULT 'geral' COMMENT 'Ex: social, loja, live',
    criado_em  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_configuracoes PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Valores padrão das redes sociais
INSERT INTO configuracoes (chave, valor, descricao, grupo) VALUES
    ('social.whatsapp',  NULL, 'Número WhatsApp com DDD (ex: 5511999999999)', 'social'),
    ('social.instagram', NULL, 'Perfil do Instagram (ex: @primordi)', 'social'),
    ('social.facebook',  NULL, 'URL da página do Facebook', 'social'),
    ('social.tiktok',    NULL, 'Perfil do TikTok', 'social'),
    ('social.youtube',   NULL, 'URL do canal no YouTube', 'social'),
    ('live.titulo',      'Live Primordi', 'Título padrão da live', 'live'),
    ('live.ativa',       'false', 'Se há uma live em andamento', 'live');
