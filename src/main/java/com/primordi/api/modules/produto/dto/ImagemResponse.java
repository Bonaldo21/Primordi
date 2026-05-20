package com.primordi.api.modules.produto.dto;

import com.primordi.api.modules.produto.ProdutoImagem;

public record ImagemResponse(
        Long id,
        String url,
        String altText,
        Integer ordem,
        Boolean principal
) {
    public static ImagemResponse from(ProdutoImagem i) {
        return new ImagemResponse(
                i.getId(),
                i.getUrl(),
                i.getAltText(),
                i.getOrdem(),
                i.getPrincipal()
        );
    }
}
