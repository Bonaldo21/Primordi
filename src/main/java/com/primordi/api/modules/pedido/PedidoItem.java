package com.primordi.api.modules.pedido;

import com.primordi.api.modules.produto.Produto;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "pedido_itens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PedidoItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ========== RELACIONAMENTOS ==========

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pedido_id", nullable = false)
    private Pedido pedido;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "produto_id", nullable = false)
    private Produto produto;

    // ========== SNAPSHOT DO PRODUTO ==========
    // Salvamos os dados do produto NO MOMENTO da compra.
    // Se o produto mudar de preço/nome depois, o pedido mantém a info original.

    /**
     * Nome do produto no momento da compra (snapshot).
     */
    @Column(name = "produto_nome", nullable = false, length = 200)
    private String produtoNome;

    /**
     * SKU do produto no momento da compra (snapshot).
     */
    @Column(name = "produto_sku", length = 50)
    private String produtoSku;

    // ========== QUANTIDADE E VALORES ==========

    @Column(nullable = false)
    private Integer quantidade;

    /**
     * Preço unitário no momento da compra.
     */
    @Column(name = "preco_unitario", nullable = false, precision = 10, scale = 2)
    private BigDecimal precoUnitario;

    /**
     * Desconto aplicado neste item.
     */
    @Column(nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal desconto = BigDecimal.ZERO;

    /**
     * Subtotal do item: (precoUnitario * quantidade) - desconto
     */
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    // ========== MÉTODOS DE NEGÓCIO ==========

    /**
     * Recalcula o subtotal do item.
     */
    public void recalcularSubtotal() {
        BigDecimal desc = desconto != null ? desconto : BigDecimal.ZERO;
        this.subtotal = precoUnitario
                .multiply(BigDecimal.valueOf(quantidade))
                .subtract(desc);
    }

    /**
     * Antes de persistir, garante o subtotal calculado.
     */
    @PrePersist
    @PreUpdate
    public void prePersist() {
        recalcularSubtotal();
    }
}
