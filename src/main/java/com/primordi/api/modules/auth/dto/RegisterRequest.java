package com.primordi.api.modules.auth.dto;

import jakarta.validation.constraints.*;

public record RegisterRequest(
        @NotBlank @Size(max = 150) String nome,
        @NotBlank @Email @Size(max = 150) String email,
        @NotBlank @Size(min = 8, max = 100, message = "Senha deve ter entre 8 e 100 caracteres") String senha,
        @Size(max = 14) String cpf,
        @Size(max = 20) String telefone
) {}
