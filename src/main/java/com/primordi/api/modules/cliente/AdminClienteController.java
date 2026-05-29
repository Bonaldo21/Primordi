package com.primordi.api.modules.cliente;

import com.primordi.api.modules.cliente.dto.ClienteResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/clientes")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminClienteController {

    private final ClienteService service;

    @GetMapping
    public ResponseEntity<Page<ClienteResponse>> listarTodos(
            @PageableDefault(size = 20, sort = "criadoEm") Pageable pageable) {
        return ResponseEntity.ok(service.listarTodos(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClienteResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }
}