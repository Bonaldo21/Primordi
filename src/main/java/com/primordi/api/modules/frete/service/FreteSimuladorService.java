package com.primordi.api.modules.frete.service;

import com.primordi.api.modules.frete.domain.TipoServico;
import com.primordi.api.modules.frete.domain.Transportadora;
import com.primordi.api.modules.frete.dto.*;
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

    @Value("${frete.fixo.valor-base:25.00}")
    private BigDecimal valorBase;

    @Value("${frete.fixo.valor-por-kg:5.00}")
    private BigDecimal valorPorKg;

    /**
     * Simula frete com base no CEP e peso, consultando ViaCEP para fator regional.
     * Endpoint público — não exige autenticação.
     */
    public SimulacaoFreteResponse simular(SimularFreteRequest request) {
        String cepLimpo = request.getCepDestino().replaceAll("\\D", "");
        BigDecimal peso = request.getPesoKg() != null ? request.getPesoKg() : BigDecimal.ONE;

        ViaCepService.ViaCepResponse cepInfo = viaCepService.consultar(cepLimpo);

        String cidade  = cepInfo != null ? cepInfo.getLocalidade() : "Não identificada";
        String estado  = cepInfo != null ? cepInfo.getUf() : null;
        String regiao  = viaCepService.nomeRegiao(estado);
        double fator   = viaCepService.fatorRegional(estado);

        BigDecimal valorBase = calcularBase(peso, fator);

        OpcaoFreteResponse economico = OpcaoFreteResponse.builder()
                .transportadora(Transportadora.FRETE_FIXO)
                .tipoServico(TipoServico.ECONOMICO)
                .nomeServico("Entrega Econômica")
                .valor(valorBase)
                .prazoDias(prazoBase(estado))
                .previsaoEntrega(LocalDate.now().plusDays(prazoBase(estado)))
                .observacao("Simulação — prazo pode variar conforme disponibilidade")
                .build();

        OpcaoFreteResponse expresso = OpcaoFreteResponse.builder()
                .transportadora(Transportadora.FRETE_FIXO)
                .tipoServico(TipoServico.EXPRESSO)
                .nomeServico("Entrega Expressa")
                .valor(valorBase.multiply(BigDecimal.valueOf(1.8)).setScale(2, RoundingMode.HALF_UP))
                .prazoDias(2)
                .previsaoEntrega(LocalDate.now().plusDays(2))
                .observacao("Entrega prioritária")
                .build();

        OpcaoFreteResponse agendada = OpcaoFreteResponse.builder()
                .transportadora(Transportadora.FRETE_FIXO)
                .tipoServico(TipoServico.AGENDADO)
                .nomeServico("Entrega Agendada")
                .valor(valorBase.multiply(BigDecimal.valueOf(1.3)).setScale(2, RoundingMode.HALF_UP))
                .prazoDias(prazoBase(estado) - 1)
                .previsaoEntrega(LocalDate.now().plusDays(prazoBase(estado) - 1))
                .observacao("Escolha o dia e horário da entrega")
                .build();

        log.info("Simulação frete CEP={} UF={} fator={} valorBase={}", cepLimpo, estado, fator, valorBase);

        return SimulacaoFreteResponse.builder()
                .cepDestino(cepLimpo)
                .cidade(cidade)
                .estado(estado != null ? estado : "ND")
                .regiao(regiao)
                .opcoes(List.of(economico, agendada, expresso))
                .build();
    }

    private BigDecimal calcularBase(BigDecimal peso, double fatorRegional) {
        BigDecimal base = valorBase.add(valorPorKg.multiply(peso));
        return base.multiply(BigDecimal.valueOf(fatorRegional)).setScale(2, RoundingMode.HALF_UP);
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
