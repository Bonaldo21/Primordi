package com.primordi.api.modules.categoria.dto;

import jakarta.validation.constraints.Size;

public record CategoriaUpdateRequest(
        @Size(max = 100)
        String nome,

        @Size(max = 1000)
        String descricao,

        @Size(max = 500)
        String imagemUrl,

        Integer ordem,

        Boolean ativo
) {}
