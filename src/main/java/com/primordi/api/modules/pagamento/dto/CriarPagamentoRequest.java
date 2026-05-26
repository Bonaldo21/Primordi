package com.primordi.api.modules.pagamento.dto;

import com.primordi.api.modules.pagamento.domain.MetodoPagamento;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CriarPagamentoRequest {

    @NotNull(message = "pedidoId é obrigatório")
    @Positive(message = "pedidoId deve ser positivo")
    private Long pedidoId;

    @NotNull(message = "método de pagamento é obrigatório")
    private MetodoPagamento metodo;

    @Min(value = 1, message = "parcelas deve ser no mínimo 1")
    @Max(value = 12, message = "parcelas deve ser no máximo 12")
    @Builder.Default
    private Integer parcelas = 1;

    // ===== Dados do pagador (obrigatórios pelo MP) =====

    @NotBlank(message = "email do pagador é obrigatório")
    @Email(message = "email inválido")
    private String pagadorEmail;

    @NotBlank(message = "nome do pagador é obrigatório")
    private String pagadorNome;

    @NotBlank(message = "CPF do pagador é obrigatório")
    @Pattern(regexp = "\\d{11}", message = "CPF deve conter 11 dígitos numéricos")
    private String pagadorCpf;

    // ===== Apenas para CARTÃO (vem do Brick do MP no frontend) =====

    /** Token gerado pelo Card Brick (frontend) - obrigatório p/ cartão */
    private String cardToken;

    /** ID do tipo de pagamento (visa, master, etc.) - opcional, MP detecta */
    private String paymentMethodId;
}
