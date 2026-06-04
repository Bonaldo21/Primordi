package com.primordi.api.modules.config;

import com.primordi.api.modules.config.dto.AtualizarConfiguracaoRequest;
import com.primordi.api.modules.config.dto.ConfiguracaoResponse;
import com.primordi.api.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ConfiguracaoService {

    private final ConfiguracaoRepository repository;

    @Transactional(readOnly = true)
    public List<ConfiguracaoResponse> listarPorGrupo(String grupo) {
        return repository.findByGrupoOrderByChave(grupo)
                .stream().map(ConfiguracaoResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public Map<String, String> mapaDoGrupo(String grupo) {
        return repository.findByGrupoOrderByChave(grupo).stream()
                .collect(Collectors.toMap(Configuracao::getChave, c -> c.getValor() != null ? c.getValor() : ""));
    }

    public ConfiguracaoResponse atualizar(AtualizarConfiguracaoRequest request) {
        Configuracao config = repository.findByChave(request.chave())
                .orElseThrow(() -> new ResourceNotFoundException("Configuração '" + request.chave() + "' não encontrada"));
        config.setValor(request.valor());
        return ConfiguracaoResponse.from(repository.save(config));
    }

    public List<ConfiguracaoResponse> atualizarVarias(List<AtualizarConfiguracaoRequest> requests) {
        return requests.stream().map(this::atualizar).toList();
    }

    @Transactional(readOnly = true)
    public String obterValor(String chave) {
        return repository.findByChave(chave).map(Configuracao::getValor).orElse(null);
    }
}
