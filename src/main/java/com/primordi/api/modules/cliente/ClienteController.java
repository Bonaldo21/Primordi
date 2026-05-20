package com.primordi.api.modules.cliente;

import com.primordi.api.modules.cliente.dto.AlterarSenhaRequest;
import com.primordi.api.modules.cliente.dto.ClienteResponse;
import com.primordi.api.modules.cliente.dto.ClienteUpdateRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/clientes")
@RequiredArgsConstructor
@Tag(name = "Clientes", description = "Perfil do cliente autenticado")
@SecurityRequirement(name = "bearerAuth")
public class ClienteController {

    private final ClienteService service;

    @GetMapping("/me")
    @Operation(summary = "Retorna dados do cliente logado")
    public ResponseEntity<ClienteResponse> meusDados(@AuthenticationPrincipal Cliente cliente) {
        return ResponseEntity.ok(service.buscarPorEmail(cliente.getEmail()));
    }

    @PutMapping("/me")
    @Operation(summary = "Atualiza dados do cliente logado")
    public ResponseEntity<ClienteResponse> atualizar(
            @AuthenticationPrincipal Cliente cliente,
            @Valid @RequestBody ClienteUpdateRequest request) {
        return ResponseEntity.ok(service.atualizarPerfil(cliente.getEmail(), request));
    }

    @PatchMapping("/me/senha")
    @Operation(summary = "Altera senha do cliente logado")
    public ResponseEntity<Void> alterarSenha(
            @AuthenticationPrincipal Cliente cliente,
            @Valid @RequestBody AlterarSenhaRequest request) {
        service.alterarSenha(cliente.getEmail(), request);
        return ResponseEntity.noContent().build();
    }
}
