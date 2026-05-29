package com.primordi.api.modules.pedido;

import com.primordi.api.modules.pedido.dto.PedidoResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/admin/pedidos")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminPedidoController {

    private final PedidoService service;

    @GetMapping
    public ResponseEntity<Page<PedidoResponse>> listarTodos(
            @RequestParam(required = false) StatusPedido status,
            @PageableDefault(size = 20, sort = "criadoEm") Pageable pageable) {
        return ResponseEntity.ok(service.listarTodos(status, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PedidoResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorIdAdmin(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<PedidoResponse> atualizarStatus(
            @PathVariable Long id,
            @RequestBody Map<String, StatusPedido> body) {
        return ResponseEntity.ok(service.atualizarStatus(id, body.get("status")));
    }
}