package com.primordi.api.modules.produto.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record ProdutoRequest(
        @NotNull(message = "categoriaId é obrigatório")
        Long categoriaId,

        @NotBlank @Size(max = 50)
        String sku,

        @NotBlank @Size(max = 200)
        String nome,

        @NotBlank @Size(max = 220)
        String slug,

        String descricao,

        @Size(max = 80)
        String tipoCouro,

        @Size(max = 50)
        String cor,

        @NotNull @DecimalMin(value = "0.01")
        BigDecimal preco,

        @DecimalMin(value = "0.00")
        BigDecimal precoPromocional,

        @DecimalMin(value = "0.000")
        BigDecimal pesoKg,

        @DecimalMin(value = "0.00")
        BigDecimal larguraCm,

        @DecimalMin(value = "0.00")
        BigDecimal alturaCm,

        @DecimalMin(value = "0.00")
        BigDecimal profundidadeCm,

        @NotNull @Min(0)
        Integer estoque,

        @Min(0)
        Integer estoqueMinimo,

        Boolean ativo,
        Boolean destaque
) {}
