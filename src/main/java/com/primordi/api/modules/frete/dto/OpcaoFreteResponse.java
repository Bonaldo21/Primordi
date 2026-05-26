package com.primordi.api.modules.frete.dto;

import com.primordi.api.modules.frete.domain.TipoServico;
import com.primordi.api.modules.frete.domain.Transportadora;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class OpcaoFreteResponse {
    private Transportadora transportadora;
    private TipoServico tipoServico;
    private String nomeServico;
    private BigDecimal valor;
    private Integer prazoDias;
    private LocalDate previsaoEntrega;
    private String observacao;
}
