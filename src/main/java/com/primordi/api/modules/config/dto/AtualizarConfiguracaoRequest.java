package com.primordi.api.modules.config.dto;

import jakarta.validation.constraints.NotBlank;

public record AtualizarConfiguracaoRequest(
        @NotBlank(message = "chave é obrigatória")
        String chave,
        String valor
) {}
