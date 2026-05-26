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
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Integração com a API dos Correios.
 * TODO: implementar chamada real ao endpoint dos Correios quando contrato for ativado.
 */
@Slf4j
@Component
public class CorreiosStrategy implements FreteStrategy {

    @Value("${frete.correios.habilitado:false}")
    private boolean habilitado;

    @Value("${frete.correios.contrato:}")
    private String contrato;

    @Value("${frete.correios.senha:}")
    private String senha;

    @Value("${frete.correios.cep-origem:}")
    private String cepOrigem;

    @Value("${frete.correios.api-url:https://api.correios.com.br}")
    private String apiUrl;

    private final RestClient restClient = RestClient.create();

    @Override
    public Transportadora getTransportadora() {
        return Transportadora.CORREIOS;
    }

    @Override
    public List<OpcaoFreteResponse> calcular(CalcularFreteRequest request) {
        if (!habilitado) {
            throw new FreteException("Integração Correios não habilitada");
        }

        log.info("🔍 [CORREIOS] Calculando frete | CEP: {} | Peso: {}kg",
                request.getCepDestino(), request.getPesoKg());

        // TODO: substituir por chamada real à API Correios
        // Exemplo de estrutura quando integrar:
        // var response = restClient.post()
        //     .uri(apiUrl + "/preco/v1/nacional/{servico}")
        //     .header("Authorization", "Bearer " + obterToken())
        //     .body(montarPayload(request))
        //     .retrieve()
        //     .body(CorreiosResponse.class);

        return List.of(
                OpcaoFreteResponse.builder()
                        .transportadora(Transportadora.CORREIOS)
                        .tipoServico(TipoServico.PAC)
                        .nomeServico("PAC")
                        .valor(new BigDecimal("28.50"))
                        .prazoDias(7)
                        .previsaoEntrega(LocalDate.now().plusDays(7))
                        .build(),
                OpcaoFreteResponse.builder()
                        .transportadora(Transportadora.CORREIOS)
                        .tipoServico(TipoServico.SEDEX)
                        .nomeServico("SEDEX")
                        .valor(new BigDecimal("45.00"))
                        .prazoDias(3)
                        .previsaoEntrega(LocalDate.now().plusDays(3))
                        .build()
        );
    }

    @Override
    public String contratar(Long pedidoId, CalcularFreteRequest dados) {
        log.info("📦 [CORREIOS] Gerando etiqueta para pedido {}", pedidoId);
        // TODO: integrar com API de pré-postagem dos Correios
        throw new FreteException("Integração com Correios pendente de implementação");
    }

    @Override
    public RastreamentoResponse rastrear(String codigoRastreio) {
        log.info("🔍 [CORREIOS] Rastreando {}", codigoRastreio);
        // TODO: chamar https://api.correios.com.br/srorastro/v1/objetos/{codigo}
        return RastreamentoResponse.builder()
                .codigoRastreio(codigoRastreio)
                .statusAtual(StatusFrete.EM_TRANSITO)
                .eventos(List.of())
                .build();
    }

    @Override
    public boolean cancelar(String codigoRastreio) {
        log.warn("⚠️ [CORREIOS] Cancelamento não implementado: {}", codigoRastreio);
        return false;
    }

    @Override
    public boolean isHabilitada() {
        return habilitado;
    }
}
