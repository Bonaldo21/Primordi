package com.primordi.api.modules.auth;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface TokenResetSenhaRepository extends JpaRepository<TokenResetSenha, Long> {
    Optional<TokenResetSenha> findByToken(String token);

    @Modifying
    @Query("UPDATE TokenResetSenha t SET t.usado = true WHERE t.cliente.id = :clienteId AND t.usado = false")
    void invalidarTokensDoCliente(Long clienteId);
}
