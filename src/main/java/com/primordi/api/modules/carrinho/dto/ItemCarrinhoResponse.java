package com.primordi.api.modules.carrinho.dto;

import java.math.BigDecimal;

public record ItemCarrinhoResponse(
        Long id,
        Long produtoId,
        String produtoNome,
        String produtoSku,
        String produtoSlug,
        String cor,
        String tipoCouro,
        String imagemUrl,
        Integer quantidade,
        BigDecimal precoUnitario,
        BigDecimal subtotal,
        Integer estoqueDisponivel
) {}
