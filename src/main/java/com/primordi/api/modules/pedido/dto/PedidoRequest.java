package com.primordi.api.modules.pedido.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.math.BigDecimal;
import java.util.List;

public record PedidoRequest(

        Long enderecoEntregaId,

        Boolean retiradaNaLoja,

        String lojaRetirada,

        @NotEmpty(message = "O pedido deve ter pelo menos 1 item")
        @Valid
        List<PedidoItemRequest> itens,

        String cupomCodigo,

        BigDecimal valorFrete,

        String observacoes
) {}
