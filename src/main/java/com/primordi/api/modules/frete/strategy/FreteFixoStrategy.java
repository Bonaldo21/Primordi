package com.primordi.api.modules.frete.strategy;

import com.primordi.api.modules.frete.domain.StatusFrete;
import com.primordi.api.modules.frete.domain.TipoServico;
import com.primordi.api.modules.frete.domain.Transportadora;
import com.primordi.api.modules.frete.dto.CalcularFreteRequest;
import com.primordi.api.modules.frete.dto.OpcaoFreteResponse;
import com.primordi.api.modules.frete.dto.RastreamentoResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Strategy de fallback — útil para desenvolvimento e ambientes sem integração real.
 * Calcula frete baseado em regras simples (peso + faixa de CEP).
 */
@Slf4j
@Component
public class FreteFixoStrategy implements FreteStrategy {

    @Value("${frete.fixo.habilitado:true}")
    private boolean habilitado;

    @Value("${frete.fixo.valor-base:25.00}")
    private BigDecimal valorBase;

    @Value("${frete.fixo.valor-por-kg:5.00}")
    private BigDecimal valorPorKg;

    @Value("${frete.fixo.prazo-dias:7}")
    private Integer prazoDias;

    @Override
    public Transportadora getTransportadora() {
        return Transportadora.FRETE_FIXO;
    }

    @Override
    public List<OpcaoFreteResponse> calcular(CalcularFreteRequest request) {
        BigDecimal valor = valorBase.add(valorPorKg.multiply(request.getPesoKg()));

        OpcaoFreteResponse economico = OpcaoFreteResponse.builder()
                .transportadora(Transportadora.FRETE_FIXO)
                .tipoServico(TipoServico.ECONOMICO)
                .nomeServico("Entrega Econômica")
                .valor(valor)
                .prazoDias(prazoDias)
                .previsaoEntrega(LocalDate.now().plusDays(prazoDias))
                .observacao("Frete calculado por regra fixa")
                .build();

        OpcaoFreteResponse expresso = OpcaoFreteResponse.builder()
                .transportadora(Transportadora.FRETE_FIXO)
                .tipoServico(TipoServico.EXPRESSO)
                .nomeServico("Entrega Expressa")
                .valor(valor.multiply(BigDecimal.valueOf(1.8)))
                .prazoDias(2)
                .previsaoEntrega(LocalDate.now().plusDays(2))
                .observacao("Entrega acelerada")
                .build();

        return List.of(economico, expresso);
    }

    @Override
    public String contratar(Long pedidoId, CalcularFreteRequest dados) {
        String codigo = "FIX" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        log.info("📦 [FRETE-FIXO] Contratado para pedido {} | rastreio: {}", pedidoId, codigo);
        return codigo;
    }

    @Override
    public RastreamentoResponse rastrear(String codigoRastreio) {
        return RastreamentoResponse.builder()
                .codigoRastreio(codigoRastreio)
                .statusAtual(StatusFrete.EM_TRANSITO)
                .eventos(List.of(
                        RastreamentoResponse.EventoRastreamento.builder()
                                .data(LocalDateTime.now().minusDays(1))
                                .local("Centro de Distribuição - SP")
                                .descricao("Objeto postado")
                                .status(StatusFrete.POSTADO)
                                .build(),
                        RastreamentoResponse.EventoRastreamento.builder()
                                .data(LocalDateTime.now())
                                .local("Em trânsito")
                                .descricao("Objeto em transferência")
                                .status(StatusFrete.EM_TRANSITO)
                                .build()
                ))
                .build();
    }

    @Override
    public boolean cancelar(String codigoRastreio) {
        log.info("❌ [FRETE-FIXO] Cancelado: {}", codigoRastreio);
        return true;
    }

    @Override
    public boolean isHabilitada() {
        return habilitado;
    }
}
