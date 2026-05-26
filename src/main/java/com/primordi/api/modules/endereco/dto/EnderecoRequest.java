package com.primordi.api.modules.endereco.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record EnderecoRequest(

        @Size(max = 50, message = "Apelido deve ter no máximo 50 caracteres")
        String apelido,

        @NotBlank(message = "CEP é obrigatório")
        @Pattern(regexp = "\\d{5}-?\\d{3}", message = "CEP inválido. Formato: 00000-000")
        String cep,

        @NotBlank(message = "Logradouro é obrigatório")
        @Size(max = 200)
        String logradouro,

        @NotBlank(message = "Número é obrigatório")
        @Size(max = 20)
        String numero,

        @Size(max = 100)
        String complemento,

        @NotBlank(message = "Bairro é obrigatório")
        @Size(max = 100)
        String bairro,

        @NotBlank(message = "Cidade é obrigatória")
        @Size(max = 100)
        String cidade,

        @NotBlank(message = "Estado é obrigatório")
        @Pattern(regexp = "[A-Z]{2}", message = "Estado deve ter 2 letras maiúsculas (ex: SP)")
        String estado,

        String pais,

        Boolean principal
) {
    public EnderecoRequest {
        // valores default
        if (pais == null || pais.isBlank()) pais = "Brasil";
        if (principal == null) principal = false;
    }
}
