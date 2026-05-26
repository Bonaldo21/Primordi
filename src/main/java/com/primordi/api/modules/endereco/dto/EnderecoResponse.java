package com.primordi.api.modules.endereco.dto;

import java.time.LocalDateTime;

public record EnderecoResponse(
        Long id,
        String apelido,
        String cep,
        String logradouro,
        String numero,
        String complemento,
        String bairro,
        String cidade,
        String estado,
        String pais,
        Boolean principal,
        String enderecoCompleto,
        LocalDateTime criadoEm,
        LocalDateTime atualizadoEm
) {}
