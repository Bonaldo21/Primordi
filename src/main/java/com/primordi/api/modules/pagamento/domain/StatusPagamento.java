package com.primordi.api.modules.pagamento.domain;

import lombok.Getter;

@Getter
public enum StatusPagamento {

    PENDENTE("pending", "Aguardando pagamento"),
    EM_PROCESSO("in_process", "Pagamento em processamento"),
    APROVADO("approved", "Pagamento aprovado"),
    AUTORIZADO("authorized", "Pagamento autorizado (aguardando captura)"),
    REJEITADO("rejected", "Pagamento rejeitado"),
    CANCELADO("cancelled", "Pagamento cancelado"),
    REEMBOLSADO("refunded", "Pagamento reembolsado"),
    ESTORNADO("charged_back", "Pagamento estornado"),
    EXPIRADO("expired", "Pagamento expirado");

    private final String statusMercadoPago;
    private final String descricao;

    StatusPagamento(String statusMercadoPago, String descricao) {
        this.statusMercadoPago = statusMercadoPago;
        this.descricao = descricao;
    }

    /**
     * Converte o status do Mercado Pago para o enum interno.
     */
    public static StatusPagamento fromMercadoPago(String statusMP) {
        if (statusMP == null) return PENDENTE;

        for (StatusPagamento status : values()) {
            if (status.statusMercadoPago.equalsIgnoreCase(statusMP)) {
                return status;
            }
        }
        return PENDENTE;
    }

    public boolean isFinalizado() {
        return this == APROVADO || this == REJEITADO
                || this == CANCELADO || this == REEMBOLSADO
                || this == ESTORNADO;
    }
}
