package com.primordi.api.modules.frete.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
public class ViaCepService {

    private static final String VIA_CEP_URL = "https://viacep.com.br/ws/%s/json/";

    private final RestTemplate restTemplate = new RestTemplate();

    public ViaCepResponse consultar(String cep) {
        String cepLimpo = cep.replaceAll("\\D", "");
        try {
            String url = String.format(VIA_CEP_URL, cepLimpo);
            ViaCepResponse response = restTemplate.getForObject(url, ViaCepResponse.class);
            if (response == null || Boolean.TRUE.equals(response.getErro())) {
                log.warn("CEP não encontrado: {}", cepLimpo);
                return null;
            }
            log.debug("CEP {} → {}/{}", cepLimpo, response.getLocalidade(), response.getUf());
            return response;
        } catch (Exception e) {
            log.error("Erro ao consultar ViaCEP para {}: {}", cepLimpo, e.getMessage());
            return null;
        }
    }

    /** Retorna multiplicador de frete baseado na região do CEP de destino */
    public double fatorRegional(String uf) {
        if (uf == null) return 1.0;
        return switch (uf.toUpperCase()) {
            case "SP"                           -> 1.0;
            case "RJ", "MG", "ES"              -> 1.15;
            case "PR", "SC", "RS"              -> 1.2;
            case "MS", "MT", "GO", "DF"        -> 1.35;
            case "BA", "SE", "AL", "PE", "PB",
                 "RN", "CE", "PI", "MA"        -> 1.5;
            case "AM", "PA", "RO", "AC", "RR",
                 "AP", "TO"                    -> 1.8;
            default                             -> 1.3;
        };
    }

    public String nomeRegiao(String uf) {
        if (uf == null) return "Desconhecida";
        return switch (uf.toUpperCase()) {
            case "SP", "RJ", "MG", "ES"                   -> "Sudeste";
            case "PR", "SC", "RS"                          -> "Sul";
            case "MS", "MT", "GO", "DF"                   -> "Centro-Oeste";
            case "BA", "SE", "AL", "PE", "PB",
                 "RN", "CE", "PI", "MA"                   -> "Nordeste";
            case "AM", "PA", "RO", "AC", "RR", "AP", "TO" -> "Norte";
            default                                         -> "Outras";
        };
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ViaCepResponse {
        private String cep;
        private String logradouro;
        private String bairro;
        private String localidade;
        private String uf;
        @JsonProperty("erro")
        private Boolean erro;
    }
}
