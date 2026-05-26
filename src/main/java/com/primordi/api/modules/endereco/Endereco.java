package com.primordi.api.modules.endereco;

import com.primordi.api.modules.cliente.Cliente;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "enderecos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Endereco {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ========== RELACIONAMENTO ==========

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    // ========== APELIDO (opcional) ==========

    /**
     * Apelido pro endereço (ex: "Casa", "Trabalho", "Casa da mãe").
     * Ajuda o cliente a identificar rápido na hora do checkout.
     */
    @Column(length = 50)
    private String apelido;

    // ========== DADOS DO ENDEREÇO ==========

    @Column(nullable = false, length = 9)
    private String cep;

    @Column(nullable = false, length = 200)
    private String logradouro;

    @Column(nullable = false, length = 20)
    private String numero;

    @Column(length = 100)
    private String complemento;

    @Column(nullable = false, length = 100)
    private String bairro;

    @Column(nullable = false, length = 100)
    private String cidade;

    @Column(nullable = false, length = 2, columnDefinition = "CHAR(2)")
    private String estado;

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String pais = "Brasil";

    // ========== FLAGS ==========

    /**
     * Marca se é o endereço principal do cliente.
     * Só UM endereço por cliente deve ter principal=true (controlado no Service).
     */
    @Column(nullable = false)
    @Builder.Default
    private Boolean principal = false;

    // ========== AUDITORIA ==========

    @CreationTimestamp
    @Column(name = "criado_em", updatable = false)
    private LocalDateTime criadoEm;

    @UpdateTimestamp
    @Column(name = "atualizado_em")
    private LocalDateTime atualizadoEm;

    // ========== MÉTODOS UTILITÁRIOS ==========

    /**
     * Retorna o endereço formatado em uma linha.
     * Útil pra exibir no front ou em emails.
     */
    public String getEnderecoCompleto() {
        StringBuilder sb = new StringBuilder();
        sb.append(logradouro).append(", ").append(numero);
        if (complemento != null && !complemento.isBlank()) {
            sb.append(" - ").append(complemento);
        }
        sb.append(" - ").append(bairro);
        sb.append(", ").append(cidade).append("/").append(estado);
        sb.append(" - CEP: ").append(cep);
        return sb.toString();
    }
}
