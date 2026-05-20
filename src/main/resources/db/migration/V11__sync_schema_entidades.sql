-- ============================================================
-- V11 - Sincroniza schema com as entidades JPA
-- ============================================================
-- Correções:
-- 1. categorias: remove coluna duplicada 'ativa' (entidade usa 'ativo')
-- 2. clientes:   renomeia 'senha_hash' para 'senha'
-- ============================================================

-- ------------------------------------------------------------
-- 1) CATEGORIAS — remover coluna duplicada 'ativa'
-- ------------------------------------------------------------
-- Antes de dropar, garantimos que 'ativo' reflete o valor de 'ativa'
-- (caso existam registros antigos com valores divergentes)
UPDATE categorias
SET ativo = ativa
WHERE ativo <> ativa;

ALTER TABLE categorias
DROP COLUMN ativa;

-- ------------------------------------------------------------
-- 2) CLIENTES — renomear 'senha_hash' para 'senha'
-- ------------------------------------------------------------
ALTER TABLE clientes
    CHANGE COLUMN senha_hash senha VARCHAR(255) NOT NULL;
