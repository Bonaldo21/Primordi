package com.primordi.api.modules.pedido;

import com.primordi.api.modules.cliente.Cliente;
import com.primordi.api.modules.pedido.dto.PedidoRequest;
import com.primordi.api.modules.pedido.dto.PedidoResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Map;

@RestController
@RequestMapping("/api/pedidos")
@RequiredArgsConstructor
public class PedidoController {

    private final PedidoService service;

    /**
     * Lista meus pedidos (paginado).
     */
    @GetMapping
    public ResponseEntity<Page<PedidoResponse>> listarMeusPedidos(
            @AuthenticationPrincipal Cliente cliente,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        return ResponseEntity.ok(service.listarMeusPedidos(cliente, pageable));
    }

    /**
     * Detalhe de um pedido por ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<PedidoResponse> buscarPorId(
            @PathVariable Long id,
            @AuthenticationPrincipal Cliente cliente
    ) {
        return ResponseEntity.ok(service.buscarPorId(id, cliente));
    }

    /**
     * Busca pelo código público (PED-2026-00001).
     */
    @GetMapping("/codigo/{codigo}")
    public ResponseEntity<PedidoResponse> buscarPorCodigo(
            @PathVariable String codigo,
            @AuthenticationPrincipal Cliente cliente
    ) {
        return ResponseEntity.ok(service.buscarPorCodigo(codigo, cliente));
    }

    /**
     * Cria um novo pedido (checkout).
     */
    @PostMapping
    public ResponseEntity<PedidoResponse> criar(
            @Valid @RequestBody PedidoRequest dto,
            @AuthenticationPrincipal Cliente cliente
    ) {
        PedidoResponse criado = service.criar(dto, cliente);
        return ResponseEntity
                .created(URI.create("/api/pedidos/" + criado.id()))
                .body(criado);
    }

    /**
     * Cancela meu pedido.
     */
    @PatchMapping("/{id}/cancelar")
    public ResponseEntity<PedidoResponse> cancelar(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal Cliente cliente
    ) {
        String motivo = body != null ? body.get("motivo") : "Cancelado pelo cliente";
        return ResponseEntity.ok(service.cancelar(id, motivo, cliente));
    }

    // ========== ADMIN ==========

    /**
     * Atualiza status (somente admin).
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PedidoResponse> atualizarStatus(
            @PathVariable Long id,
            @RequestBody Map<String, StatusPedido> body
    ) {
        return ResponseEntity.ok(service.atualizarStatus(id, body.get("status")));
    }
}
