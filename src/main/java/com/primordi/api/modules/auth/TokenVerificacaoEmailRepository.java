package com.primordi.api.modules.auth;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TokenVerificacaoEmailRepository extends JpaRepository<TokenVerificacaoEmail, Long> {
    Optional<TokenVerificacaoEmail> findByToken(String token);
}
