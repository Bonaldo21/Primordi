package com.primordi.api.modules.pagamento.repository;

import com.primordi.api.modules.pagamento.domain.Pagamento;
import com.primordi.api.modules.pagamento.domain.StatusPagamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PagamentoRepository extends JpaRepository<Pagamento, Long> {

    /** Busca pagamento pelo ID do Mercado Pago (payment.id) */
    Optional<Pagamento> findByTransacaoId(String transacaoId);

    /** Busca pagamento pelo preference_id (checkout) */
    Optional<Pagamento> findByPreferenceId(String preferenceId);

    /** Lista todos os pagamentos de um pedido (mais recentes primeiro) */
    List<Pagamento> findByPedidoIdOrderByCriadoEmDesc(Long pedidoId);

    /** Último pagamento aprovado de um pedido */
    Optional<Pagamento> findFirstByPedidoIdAndStatusOrderByPagoEmDesc(
            Long pedidoId, StatusPagamento status);

    /** Verifica se já existe pagamento aprovado pro pedido */
    boolean existsByPedidoIdAndStatus(Long pedidoId, StatusPagamento status);
}
