package com.primordi.api.modules.categoria.dto;

import com.primordi.api.modules.categoria.Categoria;

import java.time.LocalDateTime;

public record CategoriaResponse(
        Long id,
        String nome,
        String slug,
        String descricao,
        String imagemUrl,
        Integer ordem,
        Boolean ativo,
        LocalDateTime criadoEm,
        LocalDateTime atualizadoEm
) {
    public static CategoriaResponse from(Categoria c) {
        return new CategoriaResponse(
                c.getId(),
                c.getNome(),
                c.getSlug(),
                c.getDescricao(),
                c.getImagemUrl(),
                c.getOrdem(),
                c.getAtivo(),
                c.getCriadoEm(),
                c.getAtualizadoEm()
        );
    }
}
