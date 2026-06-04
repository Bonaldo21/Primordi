ALTER TABLE pedidos
    MODIFY COLUMN endereco_entrega_id BIGINT NULL,
    ADD COLUMN retirada_na_loja BOOLEAN NOT NULL DEFAULT FALSE AFTER endereco_entrega_id;
