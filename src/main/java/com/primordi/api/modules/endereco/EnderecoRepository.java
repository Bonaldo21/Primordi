package com.primordi.api.modules.endereco;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnderecoRepository extends JpaRepository<Endereco, Long> {

    /**
     * Lista todos os endereços de um cliente (mais recente primeiro).
     */
    List<Endereco> findByClienteIdOrderByPrincipalDescCriadoEmDesc(Long clienteId);

    /**
     * Busca um endereço específico de um cliente (segurança).
     */
    Optional<Endereco> findByIdAndClienteId(Long id, Long clienteId);

    /**
     * Busca o endereço principal do cliente.
     */
    Optional<Endereco> findByClienteIdAndPrincipalTrue(Long clienteId);

    /**
     * Conta quantos endereços o cliente tem.
     */
    long countByClienteId(Long clienteId);

    /**
     * Desmarca todos os endereços como principal de um cliente.
     * Usado quando vai marcar um novo como principal.
     */
    @Modifying
    @Query("UPDATE Endereco e SET e.principal = false WHERE e.cliente.id = :clienteId")
    void desmarcarPrincipais(@Param("clienteId") Long clienteId);
}
