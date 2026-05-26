package com.primordi.api.modules.pedido;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    // ========== BUSCAS DO CLIENTE ==========

    /**
     * Lista pedidos do cliente, paginado, mais recente primeiro.
     */
    Page<Pedido> findByClienteIdOrderByCriadoEmDesc(Long clienteId, Pageable pageable);

    /**
     * Busca um pedido específico do cliente (segurança).
     */
    Optional<Pedido> findByIdAndClienteId(Long id, Long clienteId);

    /**
     * Busca pelo código público (PED-2026-00001).
     */
    Optional<Pedido> findByCodigo(String codigo);

    /**
     * Busca pelo código garantindo que pertence ao cliente.
     */
    Optional<Pedido> findByCodigoAndClienteId(String codigo, Long clienteId);

    // ========== BUSCAS ADMIN ==========

    /**
     * Lista todos os pedidos (admin), com filtro opcional de status.
     */
    Page<Pedido> findByStatus(StatusPedido status, Pageable pageable);

    /**
     * Lista pedidos por período (relatórios).
     */
    List<Pedido> findByCriadoEmBetween(LocalDateTime inicio, LocalDateTime fim);

    // ========== GERAÇÃO DE CÓDIGO ==========

    /**
     * Pega o último número sequencial usado no ano.
     * Ex: se o último foi PED-2026-00042, retorna 42.
     */
    @Query("SELECT COUNT(p) FROM Pedido p WHERE p.codigo LIKE :prefixo%")
    long countByCodigoPrefixo(@Param("prefixo") String prefixo);

    // ========== VALIDAÇÕES ==========

    boolean existsByCodigo(String codigo);
}
