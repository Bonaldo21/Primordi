package com.primordi.api.modules.frete.domain;

public enum Transportadora {
    CORREIOS("Correios"),
    MELHOR_ENVIO("Melhor Envio"),
    JADLOG("Jadlog"),
    LOGGI("Loggi"),
    RETIRADA_LOJA("Retirada na Loja"),
    FRETE_FIXO("Frete Fixo");

    private final String descricao;

    Transportadora(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
