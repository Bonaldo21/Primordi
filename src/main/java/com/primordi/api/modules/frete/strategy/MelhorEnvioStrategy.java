package com.primordi.api.modules.frete.strategy;

import com.primordi.api.modules.frete.domain.StatusFrete;
import com.primordi.api.modules.frete.domain.TipoServico;
import com.primordi.api.modules.frete.domain.Transportadora;
import com.primordi.api.modules.frete.dto.CalcularFreteRequest;
import com.primordi.api.modules.frete.dto.OpcaoFreteResponse;
import com.primordi.api.modules.frete.dto.RastreamentoResponse;
import com.primordi.api.modules.frete.exception.FreteException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Integração com Melhor Envio (agregador de transportadoras).
 * Docs: https://docs.melhorenvio.com.br
 */
@Slf4j
@Component
public class MelhorEnvioStrategy implements FreteStrategy {

    @Value("${frete.melhor-envio.habilitado:false}")
    private boolean habilitado;

    @Value("${frete.melhor-envio.token:}")
    private String token;

    @Value("${frete.melhor-envio.sandbox:true}")
    private boolean sandbox;

    @Override
    public Transportadora getTransportadora() {
        return Transportadora.MELHOR_ENVIO;
    }

    @Override
    public List<OpcaoFreteResponse> calcular(CalcularFreteRequest request) {
        if (!habilitado) {
            throw new FreteException("Integração Melhor Envio não habilitada");
        }
        log.info("🔍 [ME] Calculando frete | CEP: {}", request.getCepDestino());

        // TODO: POST /api/v2/me/shipment/calculate
        return List.of(
                OpcaoFreteResponse.builder()
                        .transportadora(Transportadora.MELHOR_ENVIO)
                        .tipoServico(TipoServico.ECONOMICO)
                        .nomeServico("Jadlog .Package")
                        .valor(new BigDecimal("22.90"))
                        .prazoDias(5)
                        .previsaoEntrega(LocalDate.now().plusDays(5))
                        .build()
        );
    }

    @Override
    public String contratar(Long pedidoId, CalcularFreteRequest dados) {
        throw new FreteException("Integração Melhor Envio pendente");
    }

    @Override
    public RastreamentoResponse rastrear(String codigoRastreio) {
        return RastreamentoResponse.builder()
                .codigoRastreio(codigoRastreio)
                .statusAtual(StatusFrete.EM_TRANSITO)
                .eventos(List.of())
                .build();
    }

    @Override
    public boolean cancelar(String codigoRastreio) {
        return false;
    }

    @Override
    public boolean isHabilitada() {
        return habilitado;
    }
}
