package com.primordi.api.modules.pagamento;

import com.primordi.api.modules.pagamento.dto.CriarPagamentoRequest;
import com.primordi.api.modules.pagamento.dto.PagamentoResponse;
import com.primordi.api.modules.pagamento.dto.WebhookMercadoPagoRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import com.primordi.api.modules.cliente.Cliente;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/pagamentos")
@RequiredArgsConstructor
public class PagamentoController {

    private final PagamentoService service;

    @PostMapping
    public ResponseEntity<PagamentoResponse> criar(
            @Valid @RequestBody CriarPagamentoRequest dto,
            @AuthenticationPrincipal Cliente cliente) {
        return ResponseEntity.ok(service.criarPagamento(dto, cliente));
    }

    @GetMapping("/pedido/{pedidoId}")
    public ResponseEntity<PagamentoResponse> consultarPorPedido(
            @PathVariable Long pedidoId,
            @AuthenticationPrincipal Cliente cliente) {
        return ResponseEntity.ok(service.consultarPorPedido(pedidoId, cliente));
    }

    @GetMapping("/public-key")
    public ResponseEntity<Map<String, String>> publicKey() {
        return ResponseEntity.ok(Map.of("publicKey", service.obterPublicKey()));
    }

    @PostMapping("/webhook")
    public ResponseEntity<Void> webhook(
            @RequestBody WebhookMercadoPagoRequest webhook,
            HttpServletRequest request) {
        String xSignature = request.getHeader("x-signature");
        String xRequestId = request.getHeader("x-request-id");
        log.info("Webhook recebido: type={}", webhook.getType());
        service.processarWebhook(webhook, xSignature, xRequestId);
        return ResponseEntity.ok().build();
    }
}
