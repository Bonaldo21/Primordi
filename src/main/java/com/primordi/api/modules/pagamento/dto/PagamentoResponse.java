package com.primordi.api.modules.pagamento.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.primordi.api.modules.pagamento.domain.MetodoPagamento;
import com.primordi.api.modules.pagamento.domain.Pagamento;
import com.primordi.api.modules.pagamento.domain.StatusPagamento;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PagamentoResponse {

    private Long id;
    private Long pedidoId;
    private MetodoPagamento metodo;
    private StatusPagamento status;
    private String statusDetalhe;
    private BigDecimal valor;
    private Integer parcelas;

    // Identificadores do Mercado Pago
    private String transacaoId;
    private String preferenceId;
    private String gateway;

    // PIX
    private String qrCode;
    private String qrCodeBase64;

    // Boleto / Checkout
    private String linkBoleto;

    // Timestamps
    private LocalDateTime pagoEm;
    private LocalDateTime expiraEm;
    private LocalDateTime criadoEm;

    /** Converte Entity → DTO */
    public static PagamentoResponse fromEntity(Pagamento p) {
        return PagamentoResponse.builder()
                .id(p.getId())
                .pedidoId(p.getPedidoId())
                .metodo(p.getMetodo())
                .status(p.getStatus())
                .statusDetalhe(p.getStatusDetalhe())
                .valor(p.getValor())
                .parcelas(p.getParcelas())
                .transacaoId(p.getTransacaoId())
                .preferenceId(p.getPreferenceId())
                .gateway(p.getGateway())
                .qrCode(p.getQrCode())
                .qrCodeBase64(p.getQrCodeBase64())
                .linkBoleto(p.getLinkBoleto())
                .pagoEm(p.getPagoEm())
                .expiraEm(p.getExpiraEm())
                .criadoEm(p.getCriadoEm())
                .build();
    }
}
