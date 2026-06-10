package com.primordi.api.modules.pedido;

import com.primordi.api.modules.endereco.EnderecoMapper;
import com.primordi.api.modules.pedido.dto.PedidoItemResponse;
import com.primordi.api.modules.pedido.dto.PedidoResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class PedidoMapper {

    private final EnderecoMapper enderecoMapper;

    public PedidoItemResponse toItemResponse(PedidoItem item) {
        return new PedidoItemResponse(
                item.getId(),
                item.getProduto().getId(),
                item.getProdutoNome(),
                item.getProdutoSku(),
                item.getQuantidade(),
                item.getPrecoUnitario(),
                item.getDesconto(),
                item.getSubtotal()
        );
    }

    public PedidoResponse toResponse(Pedido pedido) {
        List<PedidoItemResponse> itens = pedido.getItens().stream()
                .map(this::toItemResponse)
                .toList();

        PedidoResponse.ClienteResumo clienteResumo = pedido.getCliente() != null
                ? new PedidoResponse.ClienteResumo(
                        pedido.getCliente().getId(),
                        pedido.getCliente().getNome(),
                        pedido.getCliente().getEmail())
                : null;

        return new PedidoResponse(
                pedido.getId(),
                pedido.getCodigo(),
                pedido.getStatus(),
                clienteResumo,
                enderecoMapper.toResponse(pedido.getEnderecoEntrega()),
                itens,
                pedido.getSubtotal(),
                pedido.getDesconto(),
                pedido.getValorFrete(),
                pedido.getTotal(),
                pedido.getCupomCodigo(),
                pedido.getObservacoes(),
                pedido.getCriadoEm(),
                pedido.getCanceladoEm(),
                pedido.getMotivoCancelamento()
        );
    }
}
