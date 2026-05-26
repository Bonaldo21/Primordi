package com.primordi.api.modules.pedido.dto;

import java.math.BigDecimal;

public record PedidoItemResponse(
        Long id,
        Long produtoId,
        String produtoNome,
        String produtoSku,
        Integer quantidade,
        BigDecimal precoUnitario,
        BigDecimal desconto,
        BigDecimal subtotal
) {}
