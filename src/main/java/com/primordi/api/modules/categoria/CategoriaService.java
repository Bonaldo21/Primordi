package com.primordi.api.modules.categoria;

import com.primordi.api.modules.categoria.dto.CategoriaRequest;
import com.primordi.api.modules.categoria.dto.CategoriaResponse;
import com.primordi.api.modules.categoria.dto.CategoriaUpdateRequest;
import com.primordi.api.shared.exception.BusinessException;
import com.primordi.api.shared.exception.ResourceNotFoundException;
import com.primordi.api.shared.util.SlugUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoriaService {

    private final CategoriaRepository repository;

    @Transactional(readOnly = true)
    public List<CategoriaResponse> listarTodas() {
        return repository.findAll().stream()
                .map(CategoriaResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CategoriaResponse> listarAtivas() {
        return repository.findAllByAtivoTrueOrderByOrdemAscNomeAsc().stream()
                .map(CategoriaResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public CategoriaResponse buscarPorId(Long id) {
        return CategoriaResponse.from(buscarEntidade(id));
    }

    @Transactional(readOnly = true)
    public CategoriaResponse buscarPorSlug(String slug) {
        Categoria categoria = repository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Categoria com slug '" + slug + "' não encontrada"));
        return CategoriaResponse.from(categoria);
    }

    public CategoriaResponse criar(CategoriaRequest request) {
        String slug = SlugUtil.toSlug(request.nome());

        if (repository.existsBySlug(slug)) {
            throw new BusinessException("Já existe uma categoria com o nome '" + request.nome() + "'");
        }

        Categoria categoria = Categoria.builder()
                .nome(request.nome())
                .slug(slug)
                .descricao(request.descricao())
                .imagemUrl(request.imagemUrl())
                .ordem(request.ordem() != null ? request.ordem() : 0)
                .ativo(true)
                .build();

        return CategoriaResponse.from(repository.save(categoria));
    }

    public CategoriaResponse atualizar(Long id, CategoriaUpdateRequest request) {
        Categoria categoria = buscarEntidade(id);

        if (request.nome() != null && !request.nome().isBlank()) {
            String novoSlug = SlugUtil.toSlug(request.nome());
            if (repository.existsBySlugAndIdNot(novoSlug, id)) {
                throw new BusinessException("Já existe outra categoria com esse nome");
            }
            categoria.setNome(request.nome());
            categoria.setSlug(novoSlug);
        }

        if (request.descricao() != null) categoria.setDescricao(request.descricao());
        if (request.imagemUrl() != null) categoria.setImagemUrl(request.imagemUrl());
        if (request.ordem() != null) categoria.setOrdem(request.ordem());
        if (request.ativo() != null) categoria.setAtivo(request.ativo());

        return CategoriaResponse.from(repository.save(categoria));
    }

    public void deletar(Long id) {
        Categoria categoria = buscarEntidade(id);
        // Soft delete — apenas inativa
        categoria.setAtivo(false);
        repository.save(categoria);
    }

    public void deletarDefinitivo(Long id) {
        Categoria categoria = buscarEntidade(id);
        repository.delete(categoria);
    }

    private Categoria buscarEntidade(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria", id));
    }
}
