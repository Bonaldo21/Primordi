package com.primordi.api.modules.frete.service;

import com.primordi.api.modules.frete.domain.Transportadora;
import com.primordi.api.modules.frete.dto.CalcularFreteRequest;
import com.primordi.api.modules.frete.dto.OpcaoFreteResponse;
import com.primordi.api.modules.frete.exception.FreteException;
import com.primordi.api.modules.frete.strategy.FreteStrategy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Orquestra todas as strategies habilitadas e devolve as opções consolidadas.
 */
@Slf4j
@Service
public class FreteCalculadoraService {

    private final Map<Transportadora, FreteStrategy> strategies;

    public FreteCalculadoraService(List<FreteStrategy> strategiesList) {
        this.strategies = strategiesList.stream()
                .collect(Collectors.toMap(FreteStrategy::getTransportadora, Function.identity()));
        log.info("🚚 {} estratégias de frete registradas: {}",
                strategies.size(), strategies.keySet());
    }

    /**
     * Calcula frete em TODAS as transportadoras habilitadas e retorna opções ordenadas por valor.
     */
    public List<OpcaoFreteResponse> calcularTodas(CalcularFreteRequest request) {
        normalizarCep(request);

        List<OpcaoFreteResponse> opcoes = strategies.values().stream()
                .filter(FreteStrategy::isHabilitada)
                .flatMap(s -> calcularSafe(s, request).stream())
                .sorted(Comparator.comparing(OpcaoFreteResponse::getValor))
                .toList();

        if (opcoes.isEmpty()) {
            throw new FreteException("Nenhuma opção de frete disponível para o CEP informado");
        }

        log.info("📊 {} opções de frete calculadas para CEP {}",
                opcoes.size(), request.getCepDestino());
        return opcoes;
    }

    /**
     * Calcula frete em uma transportadora específica.
     */
    public List<OpcaoFreteResponse> calcularPor(Transportadora transportadora, CalcularFreteRequest request) {
        normalizarCep(request);
        return obterStrategy(transportadora).calcular(request);
    }

    /**
     * Retorna a strategy de uma transportadora específica.
     */
    public FreteStrategy obterStrategy(Transportadora transportadora) {
        FreteStrategy strategy = strategies.get(transportadora);
        if (strategy == null) {
            throw new FreteException("Transportadora não suportada: " + transportadora);
        }
        if (!strategy.isHabilitada()) {
            throw new FreteException("Transportadora " + transportadora + " não está habilitada");
        }
        return strategy;
    }

    /** Wrapper que loga falhas sem quebrar o cálculo global */
    private List<OpcaoFreteResponse> calcularSafe(FreteStrategy strategy, CalcularFreteRequest request) {
        try {
            return strategy.calcular(request);
        } catch (Exception e) {
            log.error("❌ Falha ao calcular frete em {}: {}",
                    strategy.getTransportadora(), e.getMessage());
            return List.of();
        }
    }

    private void normalizarCep(CalcularFreteRequest request) {
        if (request.getCepDestino() != null) {
            request.setCepDestino(request.getCepDestino().replaceAll("\\D", ""));
        }
    }
}
