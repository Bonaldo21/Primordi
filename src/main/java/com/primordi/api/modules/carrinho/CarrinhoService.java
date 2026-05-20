package com.primordi.api.modules.carrinho;

import com.primordi.api.modules.carrinho.dto.AdicionarItemRequest;
import com.primordi.api.modules.carrinho.dto.AtualizarItemRequest;
import com.primordi.api.modules.cliente.Cliente;
import com.primordi.api.modules.produto.Produto;
import com.primordi.api.modules.produto.ProdutoRepository;
import com.primordi.api.shared.exception.BusinessException;
import com.primordi.api.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class CarrinhoService {

    private final CarrinhoRepository carrinhoRepository;
    private final ItemCarrinhoRepository itemCarrinhoRepository;
    private final ProdutoRepository produtoRepository;

    // ========== BUSCA ==========

    @Transactional
    public Carrinho obterOuCriar(Cliente cliente) {
        return carrinhoRepository.findByClienteId(cliente.getId())
                .orElseGet(() -> carrinhoRepository.save(
                        Carrinho.builder().cliente(cliente).build()
                ));
    }

    @Transactional(readOnly = true)
    public Carrinho buscarDoCliente(Cliente cliente) {
        return carrinhoRepository.findByClienteId(cliente.getId())
                .orElseGet(() -> Carrinho.builder().cliente(cliente).build());
    }

    // ========== OPERAÇÕES ==========

    @Transactional
    public Carrinho adicionarItem(Cliente cliente, AdicionarItemRequest request) {
        Carrinho carrinho = obterOuCriar(cliente);

        Produto produto = produtoRepository.findById(request.produtoId())
                .orElseThrow(() -> new ResourceNotFoundException("Produto", request.produtoId()));

        validarProdutoDisponivel(produto);

        BigDecimal precoFinal = calcularPrecoFinal(produto);

        // Busca item existente (na lista em memória, evita problema com id null)
        ItemCarrinho itemExistente = carrinho.getItens().stream()
                .filter(i -> i.getProduto().getId().equals(produto.getId()))
                .findFirst()
                .orElse(null);

        if (itemExistente != null) {
            int novaQuantidade = itemExistente.getQuantidade() + request.quantidade();
            validarEstoque(produto, novaQuantidade);

            itemExistente.setQuantidade(novaQuantidade);
            itemExistente.setPrecoUnitario(precoFinal); // atualiza preço caso tenha mudado
        } else {
            validarEstoque(produto, request.quantidade());

            ItemCarrinho novo = ItemCarrinho.builder()
                    .produto(produto)
                    .quantidade(request.quantidade())
                    .precoUnitario(precoFinal)
                    .build();
            carrinho.adicionarItem(novo);
        }

        return carrinhoRepository.save(carrinho);
    }

    @Transactional
    public Carrinho atualizarItem(Cliente cliente, Long itemId, AtualizarItemRequest request) {
        Carrinho carrinho = carrinhoRepository.findByClienteId(cliente.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Carrinho do cliente não encontrado"));

        ItemCarrinho item = carrinho.getItens().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Item", itemId));

        validarEstoque(item.getProduto(), request.quantidade());

        item.setQuantidade(request.quantidade());
        return carrinhoRepository.save(carrinho);
    }

    @Transactional
    public Carrinho removerItem(Cliente cliente, Long itemId) {
        Carrinho carrinho = carrinhoRepository.findByClienteId(cliente.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Carrinho do cliente não encontrado"));

        ItemCarrinho item = carrinho.getItens().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Item", itemId));

        carrinho.removerItem(item);
        return carrinhoRepository.save(carrinho);
    }

    @Transactional
    public void limpar(Cliente cliente) {
        carrinhoRepository.findByClienteId(cliente.getId())
                .ifPresent(c -> {
                    c.limpar();
                    carrinhoRepository.save(c);
                });
    }

    // ========== HELPERS ==========

    private void validarProdutoDisponivel(Produto produto) {
        if (Boolean.FALSE.equals(produto.getAtivo())) {
            throw new BusinessException("Produto indisponível: " + produto.getNome());
        }
    }

    private void validarEstoque(Produto produto, int quantidadeDesejada) {
        if (produto.getEstoque() == null || produto.getEstoque() < quantidadeDesejada) {
            throw new BusinessException(
                    "Estoque insuficiente para '" + produto.getNome() +
                            "' (disponível: " + (produto.getEstoque() == null ? 0 : produto.getEstoque()) +
                            ", solicitado: " + quantidadeDesejada + ")"
            );
        }
    }

    /**
     * Preço final: usa promocional se válido, senão o normal.
     */
    private BigDecimal calcularPrecoFinal(Produto produto) {
        if (produto.getPrecoPromocional() != null
                && produto.getPrecoPromocional().compareTo(BigDecimal.ZERO) > 0) {
            return produto.getPrecoPromocional();
        }
        return produto.getPreco();
    }
}
