package com.primordi.api.modules.carrinho;

import com.primordi.api.modules.carrinho.dto.CarrinhoResponse;
import com.primordi.api.modules.carrinho.dto.ItemCarrinhoResponse;
import com.primordi.api.modules.produto.Produto;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class CarrinhoMapper {

    public ItemCarrinhoResponse toItemResponse(ItemCarrinho item) {
        Produto produto = item.getProduto();

        String imagemUrl = produto.getImagens().stream()
                .filter(i -> Boolean.TRUE.equals(i.getPrincipal()))
                .map(i -> i.getUrl())
                .findFirst()
                .orElseGet(() -> produto.getImagens().isEmpty()
                        ? null
                        : produto.getImagens().get(0).getUrl());

        return new ItemCarrinhoResponse(
                item.getId(),
                produto.getId(),
                produto.getNome(),
                produto.getSku(),
                produto.getSlug(),
                produto.getCor(),
                produto.getTipoCouro(),
                imagemUrl,
                item.getQuantidade(),
                item.getPrecoUnitario(),
                item.getSubtotal(),
                produto.getEstoque()
        );
    }

    public CarrinhoResponse toResponse(Carrinho carrinho) {
        List<ItemCarrinhoResponse> itens = carrinho.getItens().stream()
                .map(this::toItemResponse)
                .toList();

        int totalItens = itens.stream().mapToInt(ItemCarrinhoResponse::quantidade).sum();
        BigDecimal valorTotal = itens.stream()
                .map(ItemCarrinhoResponse::subtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new CarrinhoResponse(
                carrinho.getId(),
                carrinho.getCliente().getId(),
                itens,
                totalItens,
                valorTotal,
                carrinho.getAtualizadoEm()
        );
    }
}
