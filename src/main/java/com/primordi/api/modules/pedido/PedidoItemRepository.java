package com.primordi.api.modules.pedido;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PedidoItemRepository extends JpaRepository<PedidoItem, Long> {

    /**
     * Lista todos os itens de um pedido.
     */
    List<PedidoItem> findByPedidoId(Long pedidoId);

    /**
     * Conta quantos itens de um produto já foram vendidos.
     * Útil pra estatísticas/dashboard.
     */
    long countByProdutoId(Long produtoId);
}
