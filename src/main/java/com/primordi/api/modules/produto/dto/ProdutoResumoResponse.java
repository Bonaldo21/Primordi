package com.primordi.api.modules.produto.dto;

import com.primordi.api.modules.produto.Produto;

import java.math.BigDecimal;

public record ProdutoResumoResponse(
        Long id,
        String sku,
        String nome,
        String slug,
        String cor,
        BigDecimal preco,
        BigDecimal precoPromocional,
        BigDecimal precoEfetivo,
        BigDecimal precoPixBoleto,
        BigDecimal precoLive,
        Integer estoque,
        Boolean ativo,
        Boolean destaque,
        Boolean daLive,
        String imagemPrincipal,
        Long categoriaId,
        String categoriaNome,
        String categoriaSlug
) {
    public static ProdutoResumoResponse from(Produto p) {
        String imagemPrincipal = p.getImagens().stream()
                .filter(i -> Boolean.TRUE.equals(i.getPrincipal()))
                .map(i -> i.getUrl())
                .findFirst()
                .orElseGet(() -> p.getImagens().isEmpty() ? null : p.getImagens().get(0).getUrl());

        return new ProdutoResumoResponse(
                p.getId(),
                p.getSku(),
                p.getNome(),
                p.getSlug(),
                p.getCor(),
                p.getPreco(),
                p.getPrecoPromocional(),
                p.getPrecoEfetivo(),
                p.getPrecoPixBoleto(),
                p.getPrecoLive(),
                p.getEstoque(),
                p.getAtivo(),
                p.getDestaque(),
                p.getDaLive(),
                imagemPrincipal,
                p.getCategoria().getId(),
                p.getCategoria().getNome(),
                p.getCategoria().getSlug()
        );
    }
}
