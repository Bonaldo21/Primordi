package com.primordi.api.modules.categoria.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CategoriaRequest(
        @NotBlank(message = "Nome é obrigatório")
        @Size(max = 100, message = "Nome deve ter no máximo 100 caracteres")
        String nome,

        @Size(max = 1000, message = "Descrição muito longa")
        String descricao,

        @Size(max = 500)
        String imagemUrl,

        Integer ordem
) {}
