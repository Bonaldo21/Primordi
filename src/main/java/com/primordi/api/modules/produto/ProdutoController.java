package com.primordi.api.modules.produto;

import com.primordi.api.modules.produto.dto.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Map;

@RestController
@RequestMapping("/produtos")
@RequiredArgsConstructor
@Tag(name = "Produtos", description = "Gestão de produtos e imagens")
public class ProdutoController {

    private final ProdutoService service;

    // ========== CONSULTAS ==========

    @GetMapping
    @Operation(summary = "Lista produtos com filtros e paginação")
    public ResponseEntity<Page<ProdutoResumoResponse>> listar(
            @RequestParam(required = false) Long categoriaId,
            @RequestParam(required = false, defaultValue = "false") Boolean apenasAtivos,
            @RequestParam(required = false, defaultValue = "false") Boolean apenasDestaque,
            @RequestParam(required = false) String busca,
            @PageableDefault(size = 20, sort = "id") Pageable pageable) {

        return ResponseEntity.ok(
                service.listar(categoriaId, apenasAtivos, apenasDestaque, busca, pageable)
        );
    }

    @GetMapping("/vitrine")
    @Operation(summary = "Lista pública (apenas ativos) — para a loja")
    public ResponseEntity<Page<ProdutoResumoResponse>> vitrine(
            @RequestParam(required = false) Long categoriaId,
            @RequestParam(required = false) String busca,
            @PageableDefault(size = 20) Pageable pageable) {

        return ResponseEntity.ok(
                service.listar(categoriaId, true, false, busca, pageable)
        );
    }

    @GetMapping("/destaques")
    @Operation(summary = "Produtos em destaque (home da loja)")
    public ResponseEntity<Page<ProdutoResumoResponse>> destaques(
            @PageableDefault(size = 8) Pageable pageable) {
        return ResponseEntity.ok(service.listar(null, true, true, null, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Busca produto por ID (com imagens)")
    public ResponseEntity<ProdutoResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @GetMapping("/slug/{slug}")
    @Operation(summary = "Busca produto por slug")
    public ResponseEntity<ProdutoResponse> buscarPorSlug(@PathVariable String slug) {
        return ResponseEntity.ok(service.buscarPorSlug(slug));
    }

    // ========== CRUD ==========

    @PostMapping
    @Operation(summary = "Cria novo produto")
    public ResponseEntity<ProdutoResponse> criar(@Valid @RequestBody ProdutoRequest request) {
        ProdutoResponse criado = service.criar(request);
        return ResponseEntity.created(URI.create("/produtos/" + criado.id())).body(criado);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualiza produto")
    public ResponseEntity<ProdutoResponse> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody ProdutoUpdateRequest request) {
        return ResponseEntity.ok(service.atualizar(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Inativa produto (soft delete)")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/definitivo")
    @Operation(summary = "Remove produto do banco permanentemente (cuidado!)")
    public ResponseEntity<Void> deletarDefinitivo(@PathVariable Long id) {
        service.deletarDefinitivo(id);
        return ResponseEntity.noContent().build();
    }

    // ========== ESTOQUE ==========

    @PatchMapping("/{id}/estoque")
    @Operation(summary = "Atualiza estoque do produto")
    public ResponseEntity<ProdutoResponse> atualizarEstoque(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> body) {
        Integer novoEstoque = body.get("estoque");
        return ResponseEntity.ok(service.atualizarEstoque(id, novoEstoque));
    }

    // ========== IMAGENS ==========

    @PostMapping("/{id}/imagens")
    @Operation(summary = "Adiciona imagem (URL externa) ao produto")
    public ResponseEntity<ImagemResponse> adicionarImagem(
            @PathVariable Long id,
            @Valid @RequestBody ImagemRequest request) {
        return ResponseEntity.ok(service.adicionarImagem(id, request));
    }

    @PatchMapping("/{id}/imagens/{imagemId}/principal")
    @Operation(summary = "Marca imagem como principal")
    public ResponseEntity<ImagemResponse> marcarPrincipal(
            @PathVariable Long id,
            @PathVariable Long imagemId) {
        return ResponseEntity.ok(service.marcarComoPrincipal(id, imagemId));
    }

    @DeleteMapping("/imagens/{imagemId}")
    @Operation(summary = "Remove imagem")
    public ResponseEntity<Void> removerImagem(@PathVariable Long imagemId) {
        service.removerImagem(imagemId);
        return ResponseEntity.noContent().build();
    }
}
