package com.primordi.api.modules.frete.service;

import com.primordi.api.modules.frete.domain.Frete;
import com.primordi.api.modules.frete.domain.StatusFrete;
import com.primordi.api.modules.frete.dto.ContratarFreteRequest;
import com.primordi.api.modules.frete.dto.RastreamentoResponse;
import com.primordi.api.modules.frete.exception.FreteException;
import com.primordi.api.modules.frete.repository.FreteRepository;
import com.primordi.api.modules.frete.strategy.FreteStrategy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Slf4j
@Service
@RequiredArgsConstructor
public class FreteService {

    private final FreteRepository freteRepository;
    private final FreteCalculadoraService calculadoraService;

    /**
     * Contrata um frete: chama a transportadora, gera código de rastreio e persiste.
     */
    @Transactional
    public Frete contratar(ContratarFreteRequest request) {
        if (freteRepository.existsByPedidoId(request.getPedidoId())) {
            throw new FreteException("Já existe um frete para o pedido " + request.getPedidoId());
        }

        FreteStrategy strategy = calculadoraService.obterStrategy(request.getTransportadora());

        // Calcula o valor antes de contratar (garantia de consistência)
        var opcoes = strategy.calcular(request.getDadosEnvio());
        var opcaoEscolhida = opcoes.stream()
                .filter(o -> o.getTipoServico() == request.getTipoServico())
                .findFirst()
                .orElseThrow(() -> new FreteException(
                        "Serviço " + request.getTipoServico() + " indisponível em " + request.getTransportadora()));

        String codigoRastreio = strategy.contratar(request.getPedidoId(), request.getDadosEnvio());

        Frete frete = Frete.builder()
                .pedidoId(request.getPedidoId())
                .transportadora(request.getTransportadora())
                .tipoServico(request.getTipoServico())
                .status(StatusFrete.AGUARDANDO_POSTAGEM)
                .valor(opcaoEscolhida.getValor())
                .prazoDias(opcaoEscolhida.getPrazoDias())
                .previsaoEntrega(LocalDate.now().plusDays(opcaoEscolhida.getPrazoDias()))
                .codigoRastreio(codigoRastreio)
                .cepDestino(request.getDadosEnvio().getCepDestino())
                .pesoKg(request.getDadosEnvio().getPesoKg())
                .alturaCm(request.getDadosEnvio().getAlturaCm())
                .larguraCm(request.getDadosEnvio().getLarguraCm())
                .comprimentoCm(request.getDadosEnvio().getComprimentoCm())
                .build();

        Frete salvo = freteRepository.save(frete);
        log.info("✅ Frete contratado | pedido: {} | rastreio: {} | valor: R${}",
                salvo.getPedidoId(), salvo.getCodigoRastreio(), salvo.getValor());
        return salvo;
    }

    @Transactional(readOnly = true)
    public Frete buscarPorId(Long id) {
        return freteRepository.findById(id)
                .orElseThrow(() -> new FreteException("Frete não encontrado: " + id));
    }

    @Transactional(readOnly = true)
    public Frete buscarPorPedido(Long pedidoId) {
        return freteRepository.findByPedidoId(pedidoId)
                .orElseThrow(() -> new FreteException("Frete não encontrado para pedido: " + pedidoId));
    }

    @Transactional(readOnly = true)
    public RastreamentoResponse rastrear(String codigoRastreio) {
        Frete frete = freteRepository.findByCodigoRastreio(codigoRastreio)
                .orElseThrow(() -> new FreteException("Código de rastreio não encontrado"));

        FreteStrategy strategy = calculadoraService.obterStrategy(frete.getTransportadora());
        return strategy.rastrear(codigoRastreio);
    }

    @Transactional
    public void atualizarStatus(Long freteId, StatusFrete novoStatus) {
        Frete frete = buscarPorId(freteId);
        frete.setStatus(novoStatus);

        if (novoStatus == StatusFrete.ENTREGUE) {
            frete.marcarComoEntregue();
        }

        freteRepository.save(frete);
        log.info("🔄 Frete {} atualizado para status {}", freteId, novoStatus);
    }

    @Transactional
    public void cancelar(Long freteId) {
        Frete frete = buscarPorId(freteId);
        if (!frete.podeCancelar()) {
            throw new FreteException("Frete não pode ser cancelado no status atual: " + frete.getStatus());
        }

        FreteStrategy strategy = calculadoraService.obterStrategy(frete.getTransportadora());
        boolean cancelado = strategy.cancelar(frete.getCodigoRastreio());

        if (!cancelado) {
            throw new FreteException("Transportadora não permitiu o cancelamento");
        }

        frete.setStatus(StatusFrete.CANCELADO);
        freteRepository.save(frete);
        log.info("❌ Frete {} cancelado", freteId);
    }
}
