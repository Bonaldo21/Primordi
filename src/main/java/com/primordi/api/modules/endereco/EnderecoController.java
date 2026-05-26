package com.primordi.api.modules.endereco;

import com.primordi.api.modules.cliente.Cliente;
import com.primordi.api.modules.endereco.dto.EnderecoRequest;
import com.primordi.api.modules.endereco.dto.EnderecoResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/enderecos")
@RequiredArgsConstructor
public class EnderecoController {

    private final EnderecoService service;

    /**
     * Lista todos os endereços do cliente logado.
     */
    @GetMapping
    public ResponseEntity<List<EnderecoResponse>> listar(
            @AuthenticationPrincipal Cliente cliente
    ) {
        return ResponseEntity.ok(service.listar(cliente));
    }

    /**
     * Busca um endereço específico.
     */
    @GetMapping("/{id}")
    public ResponseEntity<EnderecoResponse> buscarPorId(
            @PathVariable Long id,
            @AuthenticationPrincipal Cliente cliente
    ) {
        return ResponseEntity.ok(service.buscarPorId(id, cliente));
    }

    /**
     * Cria um novo endereço.
     */
    @PostMapping
    public ResponseEntity<EnderecoResponse> criar(
            @Valid @RequestBody EnderecoRequest dto,
            @AuthenticationPrincipal Cliente cliente
    ) {
        EnderecoResponse criado = service.criar(dto, cliente);
        return ResponseEntity
                .created(URI.create("/api/enderecos/" + criado.id()))
                .body(criado);
    }

    /**
     * Atualiza um endereço existente.
     */
    @PutMapping("/{id}")
    public ResponseEntity<EnderecoResponse> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody EnderecoRequest dto,
            @AuthenticationPrincipal Cliente cliente
    ) {
        return ResponseEntity.ok(service.atualizar(id, dto, cliente));
    }

    /**
     * Marca um endereço como principal.
     */
    @PatchMapping("/{id}/principal")
    public ResponseEntity<EnderecoResponse> definirComoPrincipal(
            @PathVariable Long id,
            @AuthenticationPrincipal Cliente cliente
    ) {
        return ResponseEntity.ok(service.definirComoPrincipal(id, cliente));
    }

    /**
     * Deleta um endereço.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(
            @PathVariable Long id,
            @AuthenticationPrincipal Cliente cliente
    ) {
        service.deletar(id, cliente);
        return ResponseEntity.noContent().build();
    }
}
