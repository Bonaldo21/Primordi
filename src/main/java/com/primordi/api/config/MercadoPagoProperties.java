package com.primordi.api.modules.pagamento.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "mercadopago")
@Getter
@Setter
public class MercadoPagoProperties {

    /** Token privado de acesso ao SDK (TEST-... ou APP_USR-...) */
    private String accessToken;

    /** Chave pública (usada no frontend pro Checkout Brick) */
    private String publicKey;

    /** Segredo para validar assinatura do webhook */
    private String webhookSecret;

    /** URL pública que o MP chamará nas notificações */
    private String notificationUrl;

    /** URLs de retorno do checkout */
    private String successUrl;
    private String failureUrl;
    private String pendingUrl;

    /** true = ambiente de testes */
    private boolean sandbox = true;
}
