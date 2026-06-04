package com.primordi.api.modules.frete.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SimularFreteRequest {

    @NotBlank(message = "CEP de destino é obrigatório")
    @Pattern(regexp = "\\d{5}-?\\d{3}", message = "CEP inválido (formato: 00000-000)")
    private String cepDestino;

    /** Peso estimado em kg — padrão 1kg se não informado */
    @DecimalMin(value = "0.01")
    @DecimalMax(value = "30.00")
    private BigDecimal pesoKg;

    /** Valor declarado para seguro (opcional) */
    @DecimalMin(value = "0.00")
    private BigDecimal valorDeclarado;
}
