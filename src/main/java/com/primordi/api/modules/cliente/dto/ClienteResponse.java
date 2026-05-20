package com.primordi.api.modules.cliente.dto;

import com.primordi.api.modules.cliente.Cliente;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record ClienteResponse(
        Long id,
        String nome,
        String email,
        String cpf,
        String telefone,
        LocalDate dataNascimento,
        String role,
        Boolean ativo,
        Boolean emailVerificado,
        LocalDateTime criadoEm
) {
    public static ClienteResponse from(Cliente c) {
        return new ClienteResponse(
                c.getId(), c.getNome(), c.getEmail(),
                c.getCpf(), c.getTelefone(), c.getDataNascimento(),
                c.getRole().name(), c.getAtivo(), c.getEmailVerificado(),
                c.getCriadoEm()
        );
    }
}
