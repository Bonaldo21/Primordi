package com.primordi.api.modules.carrinho.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record CarrinhoResponse(
        Long id,
        Long clienteId,
        List<ItemCarrinhoResponse> itens,
        Integer totalItens,
        BigDecimal valorTotal,
        LocalDateTime atualizadoEm
) {}
