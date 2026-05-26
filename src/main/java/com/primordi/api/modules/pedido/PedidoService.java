package com.primordi.api.modules.pedido;

import com.primordi.api.modules.cliente.Cliente;
import com.primordi.api.modules.endereco.Endereco;
import com.primordi.api.modules.endereco.EnderecoService;
import com.primordi.api.modules.pedido.dto.PedidoItemRequest;
import com.primordi.api.modules.pedido.dto.PedidoRequest;
import com.primordi.api.modules.pedido.dto.PedidoResponse;
import com.primordi.api.modules.produto.Produto;
import com.primordi.api.modules.produto.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Year;

@Service
@RequiredArgsConstructor
public class PedidoService {

    private final PedidoRepository repository;
    private final PedidoMapper mapper;
    private final ProdutoRepository produtoRepository;
    private final EnderecoService enderecoService;

    // ========== LISTAGEM ==========

    @Transactional(readOnly = true)
    public Page<PedidoResponse> listarMeusPedidos(Cliente cliente, Pageable pageable) {
        return repository
                .findByClienteIdOrderByCriadoEmDesc(cliente.getId(), pageable)
                .map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public PedidoResponse buscarPorId(Long id, Cliente cliente) {
        Pedido pedido = repository.findByIdAndClienteId(id, cliente.getId())
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));
        return mapper.toResponse(pedido);
    }

    @Transactional(readOnly = true)
    public PedidoResponse buscarPorCodigo(String codigo, Cliente cliente) {
        Pedido pedido = repository.findByCodigoAndClienteId(codigo, cliente.getId())
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));
        return mapper.toResponse(pedido);
    }

    // ========== CRIAÇÃO ⭐ ==========

    /**
     * Fluxo de criação do pedido:
     * 1. Valida endereço
     * 2. Valida e separa produtos (com estoque)
     * 3. Cria pedido + itens (snapshot)
     * 4. Baixa estoque
     * 5. Gera código único
     * 6. Calcula valores
     * 7. Salva
     */
    @Transactional
    public PedidoResponse criar(PedidoRequest dto, Cliente cliente) {

        // 1️⃣ Valida endereço (e garante que é do cliente)
        Endereco endereco = enderecoService.buscarParaPedido(dto.enderecoEntregaId(), cliente);

        // 2️⃣ Monta pedido base
        Pedido pedido = Pedido.builder()
                .cliente(cliente)
                .enderecoEntrega(endereco)
                .status(StatusPedido.AGUARDANDO_PAGAMENTO)
                .cupomCodigo(dto.cupomCodigo())
                .observacoes(dto.observacoes())
                .valorFrete(dto.valorFrete() != null ? dto.valorFrete() : BigDecimal.ZERO)
                .desconto(BigDecimal.ZERO)
                .build();

        // 3️⃣ Processa cada item
        for (PedidoItemRequest itemDto : dto.itens()) {
            Produto produto = produtoRepository.findById(itemDto.produtoId())
                    .orElseThrow(() -> new RuntimeException(
                            "Produto não encontrado: " + itemDto.produtoId()
                    ));

            // Valida ativo
            if (!Boolean.TRUE.equals(produto.getAtivo())) {
                throw new RuntimeException("Produto inativo: " + produto.getNome());
            }

            // Valida estoque
            if (!produto.temEstoqueDisponivel(itemDto.quantidade())) {
                throw new RuntimeException(
                        "Estoque insuficiente para: " + produto.getNome() +
                                " (disponível: " + produto.getEstoque() + ")"
                );
            }

            // Cria item com SNAPSHOT do produto
            PedidoItem item = PedidoItem.builder()
                    .produto(produto)
                    .produtoNome(produto.getNome())
                    .produtoSku(produto.getSku())
                    .quantidade(itemDto.quantidade())
                    .precoUnitario(produto.getPrecoEfetivo()) // 🎯 usa preço efetivo!
                    .desconto(BigDecimal.ZERO)
                    .build();

            item.recalcularSubtotal();
            pedido.adicionarItem(item);

            // 4️⃣ Baixa estoque
            produto.setEstoque(produto.getEstoque() - itemDto.quantidade());
            produtoRepository.save(produto);
        }

        // 5️⃣ Gera código único
        pedido.setCodigo(gerarCodigoPedido());

        // 6️⃣ Calcula valores finais
        pedido.recalcularValores();

        // 7️⃣ Salva (cascata salva os itens junto)
        Pedido salvo = repository.save(pedido);

        return mapper.toResponse(salvo);
    }

    // ========== CANCELAMENTO ==========

    @Transactional
    public PedidoResponse cancelar(Long id, String motivo, Cliente cliente) {
        Pedido pedido = repository.findByIdAndClienteId(id, cliente.getId())
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));

        if (!pedido.podeSerCancelado()) {
            throw new RuntimeException(
                    "Pedido não pode ser cancelado no status: " + pedido.getStatus()
            );
        }

        // Devolve estoque
        for (PedidoItem item : pedido.getItens()) {
            Produto produto = item.getProduto();
            produto.setEstoque(produto.getEstoque() + item.getQuantidade());
            produtoRepository.save(produto);
        }

        pedido.cancelar(motivo);
        return mapper.toResponse(repository.save(pedido));
    }

    // ========== ADMIN: ATUALIZAR STATUS ==========

    @Transactional
    public PedidoResponse atualizarStatus(Long id, StatusPedido novoStatus) {
        Pedido pedido = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));

        pedido.setStatus(novoStatus);
        return mapper.toResponse(repository.save(pedido));
    }

    // ========== GERAÇÃO DE CÓDIGO ==========

    /**
     * Gera código no formato PED-YYYY-NNNNN
     * Ex: PED-2026-00001
     */
    private String gerarCodigoPedido() {
        int ano = Year.now().getValue();
        String prefixo = "PED-" + ano + "-";

        long sequencial = repository.countByCodigoPrefixo(prefixo) + 1;
        String codigo = prefixo + String.format("%05d", sequencial);

        // Garantia anti-colisão (raríssimo, mas defensivo)
        while (repository.existsByCodigo(codigo)) {
            sequencial++;
            codigo = prefixo + String.format("%05d", sequencial);
        }

        return codigo;
    }
}
