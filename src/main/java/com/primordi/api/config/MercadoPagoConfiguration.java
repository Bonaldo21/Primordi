package com.primordi.api.config;

import com.mercadopago.MercadoPagoConfig;
import com.primordi.api.modules.pagamento.config.MercadoPagoProperties; // ⬅️ IMPORT AQUI
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class MercadoPagoConfiguration {

    private final MercadoPagoProperties properties;

    @PostConstruct
    public void init() {
        if (properties.getAccessToken() == null || properties.getAccessToken().isBlank()) {
            log.warn("⚠️  MercadoPago access-token NÃO configurado! Pagamentos não funcionarão.");
            return;
        }

        MercadoPagoConfig.setAccessToken(properties.getAccessToken());

        String ambiente = properties.isSandbox() ? "SANDBOX (testes)" : "PRODUÇÃO";
        String tokenMasc = mascarar(properties.getAccessToken());

        log.info("✅ MercadoPago SDK inicializado | Ambiente: {} | Token: {}", ambiente, tokenMasc);
        log.info("🔔 Webhook URL: {}", properties.getNotificationUrl());
    }

    private String mascarar(String token) {
        if (token.length() <= 12) return "****";
        return token.substring(0, 8) + "..." + token.substring(token.length() - 4);
    }
}
