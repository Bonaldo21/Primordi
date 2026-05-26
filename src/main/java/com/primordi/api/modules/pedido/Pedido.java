package com.primordi.api.modules.pedido;

import com.primordi.api.modules.cliente.Cliente;
import com.primordi.api.modules.endereco.Endereco;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pedidos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Código público do pedido (ex: PED-2026-00001).
     * Mostrado pro cliente em vez do ID interno.
     */
    @Column(nullable = false, unique = true, length = 20)
    private String codigo;

    // ========== RELACIONAMENTOS ==========

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "endereco_entrega_id", nullable = false)
    private Endereco enderecoEntrega;

    @OneToMany(
            mappedBy = "pedido",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    @Builder.Default
    private List<PedidoItem> itens = new ArrayList<>();

    // ========== STATUS ==========

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private StatusPedido status = StatusPedido.AGUARDANDO_PAGAMENTO;

    // ========== VALORES ==========

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    @Column(nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal desconto = BigDecimal.ZERO;

    @Column(name = "valor_frete", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal valorFrete = BigDecimal.ZERO;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total;

    // ========== EXTRAS ==========

    @Column(name = "cupom_codigo", length = 50)
    private String cupomCodigo;

    @Column(columnDefinition = "TEXT")
    private String observacoes;

    @Column(name = "cancelado_em")
    private LocalDateTime canceladoEm;

    @Column(name = "motivo_cancelamento", length = 255)
    private String motivoCancelamento;

    // ========== AUDITORIA ==========

    @CreationTimestamp
    @Column(name = "criado_em", updatable = false)
    private LocalDateTime criadoEm;

    @UpdateTimestamp
    @Column(name = "atualizado_em")
    private LocalDateTime atualizadoEm;

    // ========== MÉTODOS DE NEGÓCIO ==========

    /**
     * Adiciona um item mantendo a sincronia bidirecional.
     */
    public void adicionarItem(PedidoItem item) {
        itens.add(item);
        item.setPedido(this);
    }

    /**
     * Remove um item do pedido.
     */
    public void removerItem(PedidoItem item) {
        itens.remove(item);
        item.setPedido(null);
    }

    /**
     * Recalcula subtotal (soma dos itens) e total final.
     * Total = subtotal - desconto + frete
     */
    public void recalcularValores() {
        this.subtotal = itens.stream()
                .map(PedidoItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal desc = desconto != null ? desconto : BigDecimal.ZERO;
        BigDecimal frete = valorFrete != null ? valorFrete : BigDecimal.ZERO;

        this.total = subtotal.subtract(desc).add(frete);
    }

    /**
     * Cancela o pedido com motivo.
     */
    public void cancelar(String motivo) {
        this.status = StatusPedido.CANCELADO;
        this.canceladoEm = LocalDateTime.now();
        this.motivoCancelamento = motivo;
    }

    /**
     * Verifica se o pedido ainda pode ser cancelado.
     */
    public boolean podeSerCancelado() {
        return status == StatusPedido.AGUARDANDO_PAGAMENTO
                || status == StatusPedido.PAGAMENTO_APROVADO;
    }
}
