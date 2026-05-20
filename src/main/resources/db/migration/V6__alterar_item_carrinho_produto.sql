-- Remove FK e coluna antiga
ALTER TABLE itens_carrinho DROP CONSTRAINT IF EXISTS fk_item_carrinho_variacao;
ALTER TABLE itens_carrinho DROP COLUMN IF EXISTS produto_variacao_id;

-- Adiciona FK direta para produto
ALTER TABLE itens_carrinho
    ADD COLUMN produto_id BIGINT NOT NULL;

ALTER TABLE itens_carrinho
    ADD CONSTRAINT fk_item_carrinho_produto
        FOREIGN KEY (produto_id) REFERENCES produtos(id);

-- Drop tabela de variações (se ainda existir)
DROP TABLE IF EXISTS produto_variacoes CASCADE;
