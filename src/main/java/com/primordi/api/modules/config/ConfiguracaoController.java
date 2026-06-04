package com.primordi.api.modules.config;

import com.primordi.api.modules.config.dto.AtualizarConfiguracaoRequest;
import com.primordi.api.modules.config.dto.ConfiguracaoResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/configuracoes")
@RequiredArgsConstructor
public class ConfiguracaoController {

    private final ConfiguracaoService service;

    /** Público — retorna links de redes sociais para o rodapé do site */
    @GetMapping("/social")
    public ResponseEntity<Map<String, String>> redesSociais() {
        return ResponseEntity.ok(service.mapaDoGrupo("social"));
    }

    /** Admin — lista todas as configurações de um grupo */
    @GetMapping("/{grupo}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ConfiguracaoResponse>> listarGrupo(@PathVariable String grupo) {
        return ResponseEntity.ok(service.listarPorGrupo(grupo));
    }

    /** Admin — atualiza uma configuração */
    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ConfiguracaoResponse> atualizar(
            @Valid @RequestBody AtualizarConfiguracaoRequest request) {
        return ResponseEntity.ok(service.atualizar(request));
    }

    /** Admin — atualiza várias configurações de uma vez (ex: salvar todas as redes sociais) */
    @PutMapping("/lote")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ConfiguracaoResponse>> atualizarLote(
            @RequestBody List<@Valid AtualizarConfiguracaoRequest> requests) {
        return ResponseEntity.ok(service.atualizarVarias(requests));
    }
}
