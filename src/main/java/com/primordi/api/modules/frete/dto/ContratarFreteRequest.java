package com.primordi.api.modules.frete.dto;

import com.primordi.api.modules.frete.domain.TipoServico;
import com.primordi.api.modules.frete.domain.Transportadora;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContratarFreteRequest {

    @NotNull @Positive
    private Long pedidoId;

    @NotNull
    private Transportadora transportadora;

    @NotNull
    private TipoServico tipoServico;

    @NotNull @Valid
    private CalcularFreteRequest dadosEnvio;
}
