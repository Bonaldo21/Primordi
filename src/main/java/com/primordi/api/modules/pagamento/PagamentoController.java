package com.primordi.api.modules.pagamento;

import com.primordi.api.modules.pagamento.dto.CriarPagamentoRequest;
import com.primordi.api.modules.pagamento.dto.PagamentoResponse;
import com.primordi.api.modules.pagamento.dto.WebhookMercadoPagoRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/pagamentos")
@RequiredArgsConstructor
public class PagamentoController {

    private final PagamentoService service;

    @PostMapping
    public ResponseEntity<PagamentoResponse> criar(@Valid @RequestBody CriarPagamentoRequest dto) {
        return ResponseEntity.ok(service.criarPagamento(dto));
    }

    @GetMapping("/pedido/{pedidoId}")
    public ResponseEntity<PagamentoResponse> consultarPorPedido(@PathVariable Long pedidoId) {
        return ResponseEntity.ok(service.consultarPorPedido(pedidoId));
    }

    @GetMapping("/public-key")
    public ResponseEntity<Map<String, String>> publicKey() {
        return ResponseEntity.ok(Map.of("publicKey", service.obterPublicKey()));
    }

    @PostMapping("/webhook")
    public ResponseEntity<Void> webhook(@RequestBody WebhookMercadoPagoRequest webhook) {
        log.info("Webhook recebido: type={}", webhook.getType());
        service.processarWebhook(webhook);
        return ResponseEntity.ok().build();
    }
}
