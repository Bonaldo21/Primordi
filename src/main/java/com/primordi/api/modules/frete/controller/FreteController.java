package com.primordi.api.modules.frete.controller;

import com.primordi.api.modules.frete.domain.Frete;
import com.primordi.api.modules.frete.domain.Transportadora;
import com.primordi.api.modules.frete.dto.*;
import com.primordi.api.modules.frete.service.FreteCalculadoraService;
import com.primordi.api.modules.frete.service.FreteService;
import com.primordi.api.modules.frete.service.FreteSimuladorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fretes")
@RequiredArgsConstructor
public class FreteController {

    private final FreteService freteService;
    private final FreteCalculadoraService calculadoraService;
    private final FreteSimuladorService simuladorService;

    /**
     * Simula frete publicamente (sem autenticação).
     * Consulta ViaCEP para obter cidade/estado e aplica fator regional.
     */
    @PostMapping("/simular")
    public ResponseEntity<SimulacaoFreteResponse> simular(@Valid @RequestBody SimularFreteRequest request) {
        return ResponseEntity.ok(simuladorService.simular(request));
    }

    /** Calcula opções de frete em todas as transportadoras */
    @PostMapping("/calcular")
    public ResponseEntity<List<OpcaoFreteResponse>> calcular(@Valid @RequestBody CalcularFreteRequest request) {
        return ResponseEntity.ok(calculadoraService.calcularTodas(request));
    }

    /** Calcula frete apenas em uma transportadora */
    @PostMapping("/calcular/{transportadora}")
    public ResponseEntity<List<OpcaoFreteResponse>> calcularPor(
            @PathVariable Transportadora transportadora,
            @Valid @RequestBody CalcularFreteRequest request) {
        return ResponseEntity.ok(calculadoraService.calcularPor(transportadora, request));
    }

    /** Contrata um frete para um pedido */
    @PostMapping("/contratar")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<Frete> contratar(@Valid @RequestBody ContratarFreteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(freteService.contratar(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Frete> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(freteService.buscarPorId(id));
    }

    @GetMapping("/pedido/{pedidoId}")
    public ResponseEntity<Frete> buscarPorPedido(@PathVariable Long pedidoId) {
        return ResponseEntity.ok(freteService.buscarPorPedido(pedidoId));
    }

    @GetMapping("/rastrear/{codigoRastreio}")
    public ResponseEntity<RastreamentoResponse> rastrear(@PathVariable String codigoRastreio) {
        return ResponseEntity.ok(freteService.rastrear(codigoRastreio));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cancelar(@PathVariable Long id) {
        freteService.cancelar(id);
    }
}
