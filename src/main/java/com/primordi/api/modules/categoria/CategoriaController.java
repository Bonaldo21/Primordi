package com.primordi.api.modules.categoria;

import com.primordi.api.modules.categoria.dto.CategoriaRequest;
import com.primordi.api.modules.categoria.dto.CategoriaResponse;
import com.primordi.api.modules.categoria.dto.CategoriaUpdateRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/categorias")
@RequiredArgsConstructor
@Tag(name = "Categorias", description = "Gestão de categorias de produtos")
public class CategoriaController {

    private final CategoriaService service;

    @GetMapping
    @Operation(summary = "Lista todas as categorias (admin)")
    public ResponseEntity<List<CategoriaResponse>> listarTodas() {
        return ResponseEntity.ok(service.listarTodas());
    }

    @GetMapping("/ativas")
    @Operation(summary = "Lista categorias ativas (público — para a vitrine)")
    public ResponseEntity<List<CategoriaResponse>> listarAtivas() {
        return ResponseEntity.ok(service.listarAtivas());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Busca categoria por ID")
    public ResponseEntity<CategoriaResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @GetMapping("/slug/{slug}")
    @Operation(summary = "Busca categoria por slug (URL amigável)")
    public ResponseEntity<CategoriaResponse> buscarPorSlug(@PathVariable String slug) {
        return ResponseEntity.ok(service.buscarPorSlug(slug));
    }

    @PostMapping
    @Operation(summary = "Cria nova categoria")
    public ResponseEntity<CategoriaResponse> criar(@Valid @RequestBody CategoriaRequest request) {
        CategoriaResponse criada = service.criar(request);
        return ResponseEntity
                .created(URI.create("/api/categorias/" + criada.id()))
                .body(criada);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualiza categoria")
    public ResponseEntity<CategoriaResponse> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody CategoriaUpdateRequest request) {
        return ResponseEntity.ok(service.atualizar(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Inativa categoria (soft delete)")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/definitivo")
    @Operation(summary = "Remove categoria do banco (cuidado!)")
    public ResponseEntity<Void> deletarDefinitivo(@PathVariable Long id) {
        service.deletarDefinitivo(id);
        return ResponseEntity.noContent().build();
    }
}
