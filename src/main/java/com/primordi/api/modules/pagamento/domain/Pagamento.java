package com.primordi.api.modules.pagamento.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "pagamentos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Pagamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "pedido_id", nullable = false)
    private Long pedidoId;

    @Enumerated(EnumType.STRING)
    @Column(name = "metodo", nullable = false, length = 30)
    private MetodoPagamento metodo;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private StatusPagamento status = StatusPagamento.PENDENTE;

    @Column(name = "status_detalhe", length = 150)
    private String statusDetalhe;

    @Column(name = "valor", nullable = false, precision = 10, scale = 2)
    private BigDecimal valor;

    /** ID da transação no Mercado Pago (payment.id) */
    @Column(name = "transacao_id", length = 100)
    private String transacaoId;

    /** ID da preference (checkout) no Mercado Pago */
    @Column(name = "preference_id", length = 100)
    private String preferenceId;

    @Column(name = "gateway", length = 50)
    @Builder.Default
    private String gateway = "MERCADO_PAGO";

    @Column(name = "parcelas", nullable = false)
    @Builder.Default
    private Integer parcelas = 1;

    @Column(name = "qr_code", columnDefinition = "TEXT")
    private String qrCode;

    @Column(name = "qr_code_base64", columnDefinition = "TEXT")
    private String qrCodeBase64;

    /** URL para boleto OU URL do checkout do MP */
    @Column(name = "link_boleto", length = 500)
    private String linkBoleto;

    @Column(name = "payload_resposta", columnDefinition = "TEXT")
    private String payloadResposta;

    @Column(name = "pago_em")
    private LocalDateTime pagoEm;

    @Column(name = "expira_em")
    private LocalDateTime expiraEm;

    @Column(name = "estornado_em")
    private LocalDateTime estornadoEm;

    @CreationTimestamp
    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @UpdateTimestamp
    @Column(name = "atualizado_em", nullable = false)
    private LocalDateTime atualizadoEm;

    // ============================================================
    // Métodos de negócio
    // ============================================================

    public void aprovar(String detalhe) {
        this.status = StatusPagamento.APROVADO;
        this.statusDetalhe = detalhe;
        this.pagoEm = LocalDateTime.now();
    }

    public void rejeitar(String detalhe) {
        this.status = StatusPagamento.REJEITADO;
        this.statusDetalhe = detalhe;
    }

    public void estornar(String detalhe) {
        this.status = StatusPagamento.ESTORNADO;
        this.statusDetalhe = detalhe;
        this.estornadoEm = LocalDateTime.now();
    }

    public void atualizarStatus(StatusPagamento novoStatus, String detalhe) {
        this.status = novoStatus;
        this.statusDetalhe = detalhe;
        if (novoStatus == StatusPagamento.APROVADO && this.pagoEm == null) {
            this.pagoEm = LocalDateTime.now();
        } else if (novoStatus == StatusPagamento.ESTORNADO && this.estornadoEm == null) {
            this.estornadoEm = LocalDateTime.now();
        }
    }
}
