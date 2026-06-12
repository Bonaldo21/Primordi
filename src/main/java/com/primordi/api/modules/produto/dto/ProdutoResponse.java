package com.primordi.api.modules.produto.dto;

import com.primordi.api.modules.produto.Produto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

public record ProdutoResponse(
        Long id,
        Long categoriaId,
        String categoriaNome,
        String categoriaSlug,
        String sku,
        String nome,
        String slug,
        String descricao,
        String tipoCouro,
        String cor,
        BigDecimal preco,
        BigDecimal precoPromocional,
        BigDecimal precoEfetivo,
        BigDecimal precoPixBoleto,
        BigDecimal pesoKg,
        BigDecimal larguraCm,
        BigDecimal alturaCm,
        BigDecimal profundidadeCm,
        Integer estoque,
        Integer estoqueMinimo,
        Boolean ativo,
        Boolean destaque,
        List<ImagemResponse> imagens,
        LocalDateTime criadoEm,
        LocalDateTime atualizadoEm
) {
    public static ProdutoResponse from(Produto p) {
        return fromComLive(p, false);
    }

    public static ProdutoResponse fromComLive(Produto p, boolean liveAtiva) {
        java.math.BigDecimal precoEfetivo = p.getPrecoEfetivo();
        if (liveAtiva && Boolean.TRUE.equals(p.getDaLive())
                && p.getPrecoLive() != null && p.getPrecoLive().compareTo(java.math.BigDecimal.ZERO) > 0) {
            precoEfetivo = p.getPrecoLive();
        }
        java.math.BigDecimal precoPixBoleto = precoEfetivo
                .multiply(new java.math.BigDecimal("0.90"))
                .setScale(2, java.math.RoundingMode.HALF_UP);

        return new ProdutoResponse(
                p.getId(),
                p.getCategoria().getId(),
                p.getCategoria().getNome(),
                p.getCategoria().getSlug(),
                p.getSku(),
                p.getNome(),
                p.getSlug(),
                p.getDescricao(),
                p.getTipoCouro(),
                p.getCor(),
                p.getPreco(),
                p.getPrecoPromocional(),
                precoEfetivo,
                precoPixBoleto,
                p.getPesoKg(),
                p.getLarguraCm(),
                p.getAlturaCm(),
                p.getProfundidadeCm(),
                p.getEstoque(),
                p.getEstoqueMinimo(),
                p.getAtivo(),
                p.getDestaque(),
                p.getImagens().stream()
                        .sorted(Comparator.comparingInt(i -> i.getOrdem() == null ? 0 : i.getOrdem()))
                        .map(ImagemResponse::from)
                        .toList(),
                p.getCriadoEm(),
                p.getAtualizadoEm()
        );
    }
}
