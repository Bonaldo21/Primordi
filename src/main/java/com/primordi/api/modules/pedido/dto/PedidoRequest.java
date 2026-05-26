package com.primordi.api.modules.pedido.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

public record PedidoRequest(

        @NotNull(message = "Endereço de entrega é obrigatório")
        Long enderecoEntregaId,

        @NotEmpty(message = "O pedido deve ter pelo menos 1 item")
        @Valid
        List<PedidoItemRequest> itens,

        String cupomCodigo,

        BigDecimal valorFrete,

        String observacoes
) {}
