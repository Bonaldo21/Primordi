package com.primordi.api.modules.pagamento.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class WebhookMercadoPagoRequest {

    /** ID da notificação */
    private Long id;

    /** "payment", "merchant_order", etc. */
    private String type;

    /** Ex: "payment.created", "payment.updated" */
    private String action;

    /** Data da criação da notificação */
    private String dateCreated;

    /** Ambiente real ou sandbox */
    private Boolean liveMode;

    /** Dados (contém o ID do pagamento no MP) */
    private Data data;

    @lombok.Data
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Data {
        /** ID do payment no Mercado Pago */
        private String id;
    }
}
