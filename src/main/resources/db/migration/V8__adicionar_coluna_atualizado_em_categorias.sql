-- V8__adicionar_coluna_atualizado_em_categorias.sql
-- Add missing column 'atualizado_em' to categorias table
ALTER TABLE categorias
    ADD COLUMN atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
