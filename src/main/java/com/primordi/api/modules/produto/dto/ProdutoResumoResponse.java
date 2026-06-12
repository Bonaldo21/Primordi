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
        return fromComLive(p, false);
    }

    public static ProdutoResumoResponse fromComLive(Produto p, boolean liveAtiva) {
        String imagemPrincipal = p.getImagens().stream()
                .filter(i -> Boolean.TRUE.equals(i.getPrincipal()))
                .map(i -> i.getUrl())
                .findFirst()
                .orElseGet(() -> p.getImagens().isEmpty() ? null : p.getImagens().get(0).getUrl());

        java.math.BigDecimal precoEfetivo = p.getPrecoEfetivo();
        if (liveAtiva && Boolean.TRUE.equals(p.getDaLive())
                && p.getPrecoLive() != null && p.getPrecoLive().compareTo(java.math.BigDecimal.ZERO) > 0) {
            precoEfetivo = p.getPrecoLive();
        }
        java.math.BigDecimal precoPixBoleto = precoEfetivo
                .multiply(new java.math.BigDecimal("0.90"))
                .setScale(2, java.math.RoundingMode.HALF_UP);

        return new ProdutoResumoResponse(
                p.getId(),
                p.getSku(),
                p.getNome(),
                p.getSlug(),
                p.getCor(),
                p.getPreco(),
                p.getPrecoPromocional(),
                precoEfetivo,
                precoPixBoleto,
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
