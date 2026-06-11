package com.primordi.api.modules.frete.strategy;

import com.primordi.api.modules.frete.domain.StatusFrete;
import com.primordi.api.modules.frete.domain.TipoServico;
import com.primordi.api.modules.frete.domain.Transportadora;
import com.primordi.api.modules.frete.dto.CalcularFreteRequest;
import com.primordi.api.modules.frete.dto.OpcaoFreteResponse;
import com.primordi.api.modules.frete.dto.RastreamentoResponse;
import com.primordi.api.modules.frete.exception.FreteException;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Slf4j
@Component
public class MelhorEnvioStrategy implements FreteStrategy {

    @Value("${frete.melhor-envio.habilitado:false}")
    private boolean habilitado;

    @Value("${frete.melhor-envio.token:}")
    private String token;

    @Value("${frete.melhor-envio.sandbox:false}")
    private boolean sandbox;

    @Value("${frete.melhor-envio.cep-origem:13932016}")
    private String cepOrigem;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    // DTO internos para a API do Melhor Envio
    @JsonIgnoreProperties(ignoreUnknown = true)
    record MeServico(String id, String name, String price, Integer delivery_time,
                     MeEmpresa company, String error) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record MeEmpresa(String name) {}

    @Override
    public Transportadora getTransportadora() {
        return Transportadora.MELHOR_ENVIO;
    }

    @Override
    public List<OpcaoFreteResponse> calcular(CalcularFreteRequest request) {
        if (!habilitado) throw new FreteException("Integração Melhor Envio não habilitada");

        String cepDestino = request.getCepDestino().replaceAll("\\D", "");
        String baseUrl = sandbox
                ? "https://sandbox.melhorenvio.com.br"
                : "https://melhorenvio.com.br";

        Map<String, Object> body = Map.of(
                "from", Map.of("postal_code", cepOrigem.replaceAll("\\D", "")),
                "to",   Map.of("postal_code", cepDestino),
                "package", Map.of(
                        "height", request.getAlturaCm(),
                        "width",  request.getLarguraCm(),
                        "length", request.getComprimentoCm(),
                        "weight", request.getPesoKg()
                ),
                "options", Map.of("receipt", false, "own_hand", false)
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));
        headers.set("User-Agent", "Primordi (cauakingg@gmail.com)");

        try {
            ResponseEntity<MeServico[]> response = restTemplate.exchange(
                    baseUrl + "/api/v2/me/shipment/calculate",
                    HttpMethod.POST,
                    new HttpEntity<>(body, headers),
                    MeServico[].class
            );

            MeServico[] servicos = response.getBody();
            if (servicos == null) return List.of();

            List<OpcaoFreteResponse> opcoes = new ArrayList<>();
            for (MeServico s : servicos) {
                if (s.error() != null && !s.error().isBlank()) {
                    log.debug("[ME] Serviço {} indisponível: {}", s.name(), s.error());
                    continue;
                }
                if (s.price() == null) continue;

                BigDecimal valor = new BigDecimal(s.price());
                int prazo = s.delivery_time() != null ? s.delivery_time() : 7;
                String empresa = s.company() != null ? s.company().name() : "Transportadora";

                opcoes.add(OpcaoFreteResponse.builder()
                        .transportadora(Transportadora.MELHOR_ENVIO)
                        .tipoServico(tipoServico(s.name()))
                        .nomeServico(empresa + " — " + s.name())
                        .valor(valor)
                        .prazoDias(prazo)
                        .previsaoEntrega(LocalDate.now().plusDays(prazo))
                        .build());
            }

            log.info("[ME] {} opções retornadas para CEP {}", opcoes.size(), cepDestino);
            return opcoes;

        } catch (Exception e) {
            log.error("[ME] Erro ao chamar API Melhor Envio: {}", e.getMessage());
            throw new FreteException("Erro ao calcular frete: " + e.getMessage());
        }
    }

    private TipoServico tipoServico(String nome) {
        if (nome == null) return TipoServico.ECONOMICO;
        String n = nome.toLowerCase();
        if (n.contains("sedex") || n.contains("expresso") || n.contains("express")) return TipoServico.EXPRESSO;
        if (n.contains("agendado") || n.contains("home")) return TipoServico.AGENDADO;
        return TipoServico.ECONOMICO;
    }

    @Override
    public String contratar(Long pedidoId, CalcularFreteRequest dados) {
        throw new FreteException("Contratação automática de frete não implementada");
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
