package com.primordi.api.modules.frete.repository;

import com.primordi.api.modules.frete.domain.Frete;
import com.primordi.api.modules.frete.domain.StatusFrete;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FreteRepository extends JpaRepository<Frete, Long> {

    Optional<Frete> findByPedidoId(Long pedidoId);

    Optional<Frete> findByCodigoRastreio(String codigoRastreio);

    List<Frete> findByStatus(StatusFrete status);

    boolean existsByPedidoId(Long pedidoId);
}
