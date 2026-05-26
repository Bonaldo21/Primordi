package com.primordi.api.modules.pagamento.dto;

import com.primordi.api.modules.pagamento.domain.StatusPagamento;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class PagamentoStatusResponse {

    private Long id;
    private StatusPagamento status;
    private String statusDetalhe;
    private LocalDateTime pagoEm;

    public boolean isFinalizado() {
        return status == StatusPagamento.APROVADO
                || status == StatusPagamento.REJEITADO
                || status == StatusPagamento.CANCELADO
                || status == StatusPagamento.ESTORNADO
                || status == StatusPagamento.EXPIRADO;
    }
}
