package com.primordi.api.modules.config.dto;

import com.primordi.api.modules.config.Configuracao;

public record ConfiguracaoResponse(String chave, String valor, String descricao, String grupo) {
    public static ConfiguracaoResponse from(Configuracao c) {
        return new ConfiguracaoResponse(c.getChave(), c.getValor(), c.getDescricao(), c.getGrupo());
    }
}
