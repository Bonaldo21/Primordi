package com.primordi.api.modules.frete.strategy;

import com.primordi.api.modules.frete.domain.Transportadora;
import com.primordi.api.modules.frete.dto.CalcularFreteRequest;
import com.primordi.api.modules.frete.dto.OpcaoFreteResponse;
import com.primordi.api.modules.frete.dto.RastreamentoResponse;

import java.util.List;

/**
 * Contrato para integração com transportadoras.
 * Cada implementação cuida de uma transportadora específica.
 */
public interface FreteStrategy {

    /** Identifica qual transportadora essa strategy atende */
    Transportadora getTransportadora();

    /** Calcula opções de frete disponíveis para essa transportadora */
    List<OpcaoFreteResponse> calcular(CalcularFreteRequest request);

    /** Contrata o frete e retorna código de rastreio */
    String contratar(Long pedidoId, CalcularFreteRequest dados);

    /** Consulta rastreamento */
    RastreamentoResponse rastrear(String codigoRastreio);

    /** Cancela o frete (se possível) */
    boolean cancelar(String codigoRastreio);

    /** Indica se essa strategy está habilitada via config */
    boolean isHabilitada();
}
