package com.primordi.api.modules.live;

import com.primordi.api.modules.config.ConfiguracaoService;
import com.primordi.api.modules.live.dto.LiveStatusResponse;
import com.primordi.api.modules.produto.Produto;
import com.primordi.api.modules.produto.ProdutoRepository;
import com.primordi.api.modules.produto.dto.ProdutoResumoResponse;
import com.primordi.api.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class LiveService {

    private final ProdutoRepository produtoRepository;
    private final ConfiguracaoService configuracaoService;
    private final LiveEventService liveEventService;

    @Transactional(readOnly = true)
    public LiveStatusResponse status() {
        boolean ativa = "true".equals(configuracaoService.obterValor("live.ativa"));
        String titulo = configuracaoService.obterValor("live.titulo");
        List<ProdutoResumoResponse> produtos = produtoRepository.buscarProdutosDaLive()
                .stream().map(ProdutoResumoResponse::from).toList();

        return new LiveStatusResponse(ativa, titulo, liveEventService.totalConectados(), produtos);
    }

    /** Admin: ligar/desligar a live */
    public LiveStatusResponse alternarLive(boolean ativar, String titulo) {
        configuracaoService.atualizar(
                new com.primordi.api.modules.config.dto.AtualizarConfiguracaoRequest(
                        "live.ativa", String.valueOf(ativar)));

        if (titulo != null && !titulo.isBlank()) {
            configuracaoService.atualizar(
                    new com.primordi.api.modules.config.dto.AtualizarConfiguracaoRequest(
                            "live.titulo", titulo));
        }

        liveEventService.publicar(LiveEvent.builder()
                .tipo(ativar ? LiveEventType.LIVE_INICIADA : LiveEventType.LIVE_ENCERRADA)
                .dados(Map.of("ativa", ativar, "titulo",
                        configuracaoService.obterValor("live.titulo")))
                .build());

        return status();
    }

    /** Admin: define preço especial só para a live (null = restaura preço normal) */
    public ProdutoResumoResponse atualizarPrecoLive(Long produtoId, BigDecimal precoLive) {
        Produto produto = produtoRepository.findById(produtoId)
                .orElseThrow(() -> new ResourceNotFoundException("Produto", produtoId));
        produto.setPrecoLive(precoLive);
        Produto salvo = produtoRepository.save(produto);

        liveEventService.publicar(LiveEvent.builder()
                .tipo(LiveEventType.PRODUTO_LIVE_ATUALIZADO)
                .dados(Map.of("produtoId", produtoId, "nome", produto.getNome(),
                        "precoLive", precoLive != null ? precoLive : ""))
                .build());

        return ProdutoResumoResponse.from(salvo);
    }

    /** Admin: marca/desmarca produto como "da live" */
    public ProdutoResumoResponse toggleDaLive(Long produtoId, boolean daLive) {
        Produto produto = produtoRepository.findById(produtoId)
                .orElseThrow(() -> new ResourceNotFoundException("Produto", produtoId));
        produto.setDaLive(daLive);
        if (!daLive) produto.setPrecoLive(null); // limpa preço live ao remover
        Produto salvo = produtoRepository.save(produto);

        liveEventService.publicar(LiveEvent.builder()
                .tipo(LiveEventType.PRODUTO_LIVE_ATUALIZADO)
                .dados(Map.of("produtoId", produtoId, "nome", produto.getNome(), "daLive", daLive))
                .build());

        return ProdutoResumoResponse.from(salvo);
    }
}
