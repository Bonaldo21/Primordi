package com.primordi.api.modules.frete.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CalcularFreteRequest {

    @NotBlank(message = "CEP de destino é obrigatório")
    @Pattern(regexp = "\\d{5}-?\\d{3}", message = "CEP inválido (formato: 00000-000)")
    private String cepDestino;

    @NotNull(message = "peso é obrigatório")
    @DecimalMin(value = "0.01", message = "peso deve ser maior que zero")
    @DecimalMax(value = "30.00", message = "peso máximo é 30kg")
    private BigDecimal pesoKg;

    @NotNull @Min(1) @Max(100)
    private Integer alturaCm;

    @NotNull @Min(1) @Max(100)
    private Integer larguraCm;

    @NotNull @Min(1) @Max(100)
    private Integer comprimentoCm;

    /** Valor declarado dos produtos (para seguro) */
    @DecimalMin(value = "0.00")
    private BigDecimal valorDeclarado;
}
