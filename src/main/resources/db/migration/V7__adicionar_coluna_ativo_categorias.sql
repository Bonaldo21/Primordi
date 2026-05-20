-- V7__adicionar_coluna_ativo_categorias.sql
-- Add missing column 'ativo' to categorias table
ALTER TABLE categorias
    ADD COLUMN ativo BOOLEAN NOT NULL DEFAULT TRUE;
