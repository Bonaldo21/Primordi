package com.primordi.api.modules.produto;

import com.primordi.api.modules.categoria.Categoria;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "produtos",
        indexes = {
                @Index(name = "idx_produtos_categoria", columnList = "categoria_id"),
                @Index(name = "idx_produtos_ativo", columnList = "ativo")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;

    @Column(nullable = false, unique = true, length = 50)
    private String sku;

    @Column(nullable = false, length = 200)
    private String nome;

    @Column(nullable = false, unique = true, length = 220)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Column(name = "tipo_couro", length = 80)
    private String tipoCouro;

    @Column(length = 50)
    private String cor;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal preco;

    @Column(name = "preco_promocional", precision = 10, scale = 2)
    private BigDecimal precoPromocional;

    @Column(name = "preco_a_vista", precision = 10, scale = 2)
    private BigDecimal precoAVista;

    @Column(name = "preco_live", precision = 10, scale = 2)
    private BigDecimal precoLive;

    @Column(name = "peso_kg", precision = 6, scale = 3)
    private BigDecimal pesoKg;

    @Column(name = "largura_cm", precision = 6, scale = 2)
    private BigDecimal larguraCm;

    @Column(name = "altura_cm", precision = 6, scale = 2)
    private BigDecimal alturaCm;

    @Column(name = "profundidade_cm", precision = 6, scale = 2)
    private BigDecimal profundidadeCm;

    @Column(nullable = false)
    @Builder.Default
    private Integer estoque = 0;

    @Column(name = "estoque_minimo", nullable = false)
    @Builder.Default
    private Integer estoqueMinimo = 0;

    @Column(nullable = false)
    @Builder.Default
    private Boolean ativo = true;

    @Column(nullable = false)
    @Builder.Default
    private Boolean destaque = false;

    @Column(name = "da_live", nullable = false)
    @Builder.Default
    private Boolean daLive = false;

    @CreationTimestamp
    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @UpdateTimestamp
    @Column(name = "atualizado_em", nullable = false)
    private LocalDateTime atualizadoEm;

    @OneToMany(
            mappedBy = "produto",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    @Builder.Default
    private List<ProdutoImagem> imagens = new ArrayList<>();

    // ===== Métodos de domínio =====

    /**
     * Preço efetivo: precoLive (quando em live) > precoPromocional > preco.
     */
    @Transient
    public BigDecimal getPrecoEfetivo() {
        if (precoLive != null && precoLive.compareTo(BigDecimal.ZERO) > 0) {
            return precoLive;
        }
        if (precoPromocional != null && precoPromocional.compareTo(BigDecimal.ZERO) > 0) {
            return precoPromocional;
        }
        return preco;
    }

    /**
     * Preço à vista (PIX/Boleto) = preço no cartão com 10% de desconto.
     */
    @Transient
    public BigDecimal getPrecoPixBoleto() {
        return getPrecoEfetivo().multiply(new BigDecimal("0.90")).setScale(2, java.math.RoundingMode.HALF_UP);
    }

    /**
     * Indica se o produto está com estoque baixo.
     */
    @Transient
    public boolean isEstoqueBaixo() {
        return estoque != null && estoqueMinimo != null && estoque <= estoqueMinimo;
    }

    /**
     * Indica se o produto pode ser comprado na quantidade desejada.
     */
    @Transient
    public boolean temEstoqueDisponivel(int quantidadeDesejada) {
        return estoque != null && estoque >= quantidadeDesejada;
    }

    /**
     * Helpers para gerenciar imagens mantendo a relação bidirecional.
     */
    public void adicionarImagem(ProdutoImagem imagem) {
        imagens.add(imagem);
        imagem.setProduto(this);
    }

    public void removerImagem(ProdutoImagem imagem) {
        imagens.remove(imagem);
        imagem.setProduto(null);
    }
}
