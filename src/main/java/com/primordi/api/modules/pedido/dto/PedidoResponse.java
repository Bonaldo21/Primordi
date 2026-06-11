package com.primordi.api.modules.pedido.dto;

import com.primordi.api.modules.endereco.dto.EnderecoResponse;
import com.primordi.api.modules.pedido.StatusPedido;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record PedidoResponse(
        Long id,
        String codigo,
        StatusPedido status,
        ClienteResumo cliente,
        EnderecoResponse enderecoEntrega,
        List<PedidoItemResponse> itens,
        BigDecimal subtotal,
        BigDecimal desconto,
        BigDecimal valorFrete,
        BigDecimal total,
        String cupomCodigo,
        Boolean retiradaNaLoja,
        String lojaRetirada,
        String observacoes,
        LocalDateTime criadoEm,
        LocalDateTime canceladoEm,
        String motivoCancelamento
) {
    public record ClienteResumo(Long id, String nome, String email) {}
}
