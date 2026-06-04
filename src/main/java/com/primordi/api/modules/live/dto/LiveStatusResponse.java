package com.primordi.api.modules.live.dto;

import com.primordi.api.modules.produto.dto.ProdutoResumoResponse;

import java.util.List;

public record LiveStatusResponse(
        boolean ativa,
        String titulo,
        int clientesConectados,
        List<ProdutoResumoResponse> produtos
) {}
