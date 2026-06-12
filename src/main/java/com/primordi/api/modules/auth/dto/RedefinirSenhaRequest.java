package com.primordi.api.modules.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RedefinirSenhaRequest(
        @NotBlank String token,
        @NotBlank @Size(min = 8, message = "A senha deve ter no mínimo 8 caracteres") String novaSenha
) {}
