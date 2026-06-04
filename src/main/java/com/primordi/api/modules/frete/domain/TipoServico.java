package com.primordi.api.modules.frete.domain;

public enum TipoServico {
    PAC("04510", "PAC"),
    SEDEX("04014", "SEDEX"),
    SEDEX_10("40215", "SEDEX 10"),
    SEDEX_HOJE("40290", "SEDEX Hoje"),
    EXPRESSO("EXP", "Expresso"),
    ECONOMICO("ECO", "Econômico"),
    RETIRADA("RET", "Retirada"),
    AGENDADO("AGE", "Agendado");

    private final String codigo;
    private final String descricao;

    TipoServico(String codigo, String descricao) {
        this.codigo = codigo;
        this.descricao = descricao;
    }

    public String getCodigo() { return codigo; }
    public String getDescricao() { return descricao; }
}
