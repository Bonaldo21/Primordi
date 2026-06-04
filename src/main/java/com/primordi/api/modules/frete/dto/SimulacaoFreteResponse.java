package com.primordi.api.modules.frete.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class SimulacaoFreteResponse {
    private String cepDestino;
    private String cidade;
    private String estado;
    private String regiao;
    private List<OpcaoFreteResponse> opcoes;
}
