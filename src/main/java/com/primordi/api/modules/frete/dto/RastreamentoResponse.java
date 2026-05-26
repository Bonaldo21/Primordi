package com.primordi.api.modules.frete.dto;

import com.primordi.api.modules.frete.domain.StatusFrete;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class RastreamentoResponse {
    private String codigoRastreio;
    private StatusFrete statusAtual;
    private List<EventoRastreamento> eventos;

    @Data
    @Builder
    public static class EventoRastreamento {
        private LocalDateTime data;
        private String local;
        private String descricao;
        private StatusFrete status;
    }
}
