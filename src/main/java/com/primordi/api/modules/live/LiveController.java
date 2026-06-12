package com.primordi.api.modules.live;

import com.primordi.api.modules.live.dto.LiveStatusResponse;
import com.primordi.api.modules.produto.dto.ProdutoResumoResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.math.BigDecimal;

@RestController
@RequestMapping("/live")
@RequiredArgsConstructor
public class LiveController {

    private final LiveEventService liveEventService;
    private final LiveService liveService;

    /** Público — retorna status atual da live e produtos */
    @GetMapping("/status")
    public ResponseEntity<LiveStatusResponse> status() {
        return ResponseEntity.ok(liveService.status());
    }

    /**
     * Stream SSE — clientes e admin se inscrevem para receber eventos em tempo real.
     * Frontend: new EventSource('/api/live/eventos')
     */
    @GetMapping(value = "/eventos", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter eventos() {
        return liveEventService.subscribe();
    }

    /** Admin — liga ou desliga a live */
    @PostMapping("/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LiveStatusResponse> toggleLive(
            @RequestParam boolean ativar,
            @RequestParam(required = false) String titulo) {
        return ResponseEntity.ok(liveService.alternarLive(ativar, titulo));
    }

    /** Admin — marca/desmarca um produto como "da live" */
    @PatchMapping("/produtos/{produtoId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProdutoResumoResponse> toggleProdutoLive(
            @PathVariable Long produtoId,
            @RequestParam boolean daLive) {
        return ResponseEntity.ok(liveService.toggleDaLive(produtoId, daLive));
    }

    /** Admin — define preço especial só para a live (body: {"preco": 99.90} ou {} para limpar) */
    @PatchMapping("/produtos/{produtoId}/preco")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProdutoResumoResponse> atualizarPrecoLive(
            @PathVariable Long produtoId,
            @RequestBody java.util.Map<String, Object> body) {
        Object val = body.get("preco");
        BigDecimal preco = val != null && !val.toString().isBlank()
                ? new BigDecimal(val.toString()) : null;
        return ResponseEntity.ok(liveService.atualizarPrecoLive(produtoId, preco));
    }
}
