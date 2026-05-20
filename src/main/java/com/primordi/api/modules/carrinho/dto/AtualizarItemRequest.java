package com.primordi.api.modules.carrinho.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record AtualizarItemRequest(
        @NotNull(message = "quantidade é obrigatória")
        @Min(value = 1, message = "quantidade deve ser no mínimo 1")
        Integer quantidade
) {}
