-- =====================================================
-- V13: Adiciona coluna desconto em pedido_itens
-- Alinha o schema com a entity PedidoItem
-- =====================================================

ALTER TABLE pedido_itens
    ADD COLUMN desconto DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER preco_unitario;
