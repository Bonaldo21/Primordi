package com.primordi.api.modules.carrinho.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record AdicionarItemRequest(
        @NotNull(message = "produtoId é obrigatório")
        Long produtoId,

        @NotNull
        @Min(value = 1, message = "quantidade deve ser ao menos 1")
        Integer quantidade
) {}
