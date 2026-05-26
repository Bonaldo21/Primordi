package com.primordi.api.modules.pagamento.domain;

import lombok.Getter;

@Getter
public enum MetodoPagamento {

    PIX("PIX"),
    CARTAO_CREDITO("Cartão de Crédito"),
    CARTAO_DEBITO("Cartão de Débito"),
    BOLETO("Boleto Bancário");

    private final String descricao;

    MetodoPagamento(String descricao) {
        this.descricao = descricao;
    }
}
