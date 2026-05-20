package com.primordi.api.modules.cliente.dto;

import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record ClienteUpdateRequest(
        @Size(max = 150) String nome,
        @Size(max = 14) String cpf,
        @Size(max = 20) String telefone,
        LocalDate dataNascimento
) {}
