package com.primordi.api.modules.frete.service;

import com.primordi.api.modules.frete.dto.*;
import com.primordi.api.modules.frete.strategy.MelhorEnvioStrategy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class FreteSimuladorService {

    private final ViaCepService viaCepService;
    private final MelhorEnvioStrategy melhorEnvioStrategy;

    @Value("${frete.fixo.valor-base:25.00}")
    private BigDecimal valorBase;

    @Value("${frete.fixo.valor-por-kg:5.00}")
    private BigDecimal valorPorKg;

    // Dimensões padrão para artigos de couro (bolsas, carteiras, cintos)
    private static final int ALTURA_CM    = 5;
    private static final int LARGURA_CM   = 15;
    private static final int COMPRIMENTO_CM = 20;

    public SimulacaoFreteResponse simular(SimularFreteRequest request) {
        String cepLimpo = request.getCepDestino().replaceAll("\\D", "");
        BigDecimal peso = request.getPesoKg() != null ? request.getPesoKg() : BigDecimal.valueOf(0.5);

        ViaCepService.ViaCepResponse cepInfo = viaCepService.consultar(cepLimpo);
        String cidade = cepInfo != null ? cepInfo.getLocalidade() : "Não identificada";
        String estado = cepInfo != null ? cepInfo.getUf() : null;
        String regiao = viaCepService.nomeRegiao(estado);

        List<OpcaoFreteResponse> opcoes;

        if (melhorEnvioStrategy.isHabilitada()) {
            try {
                CalcularFreteRequest calcRequest = CalcularFreteRequest.builder()
                        .cepDestino(cepLimpo)
                        .pesoKg(peso)
                        .alturaCm(ALTURA_CM)
                        .larguraCm(LARGURA_CM)
                        .comprimentoCm(COMPRIMENTO_CM)
                        .valorDeclarado(request.getValorDeclarado())
                        .build();

                opcoes = melhorEnvioStrategy.calcular(calcRequest);
                log.info("[Simulador] Melhor Envio retornou {} opções para CEP {}", opcoes.size(), cepLimpo);
            } catch (Exception e) {
                log.warn("[Simulador] Falha no Melhor Envio, usando frete fixo: {}", e.getMessage());
                opcoes = calcularFreteFixo(peso, estado);
            }
        } else {
            opcoes = calcularFreteFixo(peso, estado);
        }

        return SimulacaoFreteResponse.builder()
                .cepDestino(cepLimpo)
                .cidade(cidade)
                .estado(estado != null ? estado : "ND")
                .regiao(regiao)
                .opcoes(opcoes)
                .build();
    }

    private List<OpcaoFreteResponse> calcularFreteFixo(BigDecimal peso, String estado) {
        double fator = viaCepService.fatorRegional(estado);
        BigDecimal base = valorBase.add(valorPorKg.multiply(peso))
                .multiply(BigDecimal.valueOf(fator))
                .setScale(2, RoundingMode.HALF_UP);
        int prazo = prazoBase(estado);

        return List.of(
                OpcaoFreteResponse.builder()
                        .nomeServico("Entrega Econômica")
                        .valor(base)
                        .prazoDias(prazo)
                        .previsaoEntrega(LocalDate.now().plusDays(prazo))
                        .observacao("Prazo estimado")
                        .build(),
                OpcaoFreteResponse.builder()
                        .nomeServico("Entrega Expressa")
                        .valor(base.multiply(BigDecimal.valueOf(1.8)).setScale(2, RoundingMode.HALF_UP))
                        .prazoDias(2)
                        .previsaoEntrega(LocalDate.now().plusDays(2))
                        .build()
        );
    }

    private int prazoBase(String uf) {
        if (uf == null) return 10;
        return switch (uf.toUpperCase()) {
            case "SP"                                       -> 3;
            case "RJ", "MG", "ES"                          -> 5;
            case "PR", "SC", "RS"                          -> 6;
            case "MS", "MT", "GO", "DF"                    -> 7;
            case "BA", "SE", "AL", "PE", "PB",
                 "RN", "CE", "PI", "MA"                    -> 9;
            case "AM", "PA", "RO", "AC", "RR", "AP", "TO" -> 14;
            default                                         -> 10;
        };
    }
}
