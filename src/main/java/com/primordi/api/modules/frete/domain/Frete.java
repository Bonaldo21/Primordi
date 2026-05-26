package com.primordi.api.modules.frete.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "fretes", indexes = {
        @Index(name = "idx_frete_pedido", columnList = "pedido_id"),
        @Index(name = "idx_frete_codigo_rastreio", columnList = "codigo_rastreio"),
        @Index(name = "idx_frete_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Frete {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "pedido_id", nullable = false)
    private Long pedidoId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Transportadora transportadora;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_servico", nullable = false, length = 20)
    private TipoServico tipoServico;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private StatusFrete status = StatusFrete.AGUARDANDO_POSTAGEM;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal valor;

    @Column(name = "prazo_dias", nullable = false)
    private Integer prazoDias;

    @Column(name = "previsao_entrega")
    private LocalDate previsaoEntrega;

    @Column(name = "codigo_rastreio", length = 50)
    private String codigoRastreio;

    @Column(name = "cep_origem", length = 9)
    private String cepOrigem;

    @Column(name = "cep_destino", nullable = false, length = 9)
    private String cepDestino;

    @Column(name = "peso_kg", precision = 8, scale = 3)
    private BigDecimal pesoKg;

    @Column(name = "altura_cm")
    private Integer alturaCm;
    @Column(name = "largura_cm")
    private Integer larguraCm;
    @Column(name = "comprimento_cm")
    private Integer comprimentoCm;

    @Column(name = "postado_em")
    private LocalDateTime postadoEm;

    @Column(name = "entregue_em")
    private LocalDateTime entregueEm;

    @CreationTimestamp
    @Column(name = "criado_em", updatable = false)
    private LocalDateTime criadoEm;

    @UpdateTimestamp
    @Column(name = "atualizado_em")
    private LocalDateTime atualizadoEm;

    // ===== Métodos de negócio =====

    public boolean isEntregue() {
        return status == StatusFrete.ENTREGUE;
    }

    public boolean podeCancelar() {
        return status == StatusFrete.AGUARDANDO_POSTAGEM;
    }

    public void marcarComoPostado(String codigoRastreio) {
        this.codigoRastreio = codigoRastreio;
        this.status = StatusFrete.POSTADO;
        this.postadoEm = LocalDateTime.now();
    }

    public void marcarComoEntregue() {
        this.status = StatusFrete.ENTREGUE;
        this.entregueEm = LocalDateTime.now();
    }
}
