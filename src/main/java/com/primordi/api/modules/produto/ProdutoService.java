package com.primordi.api.modules.produto;

import com.primordi.api.modules.categoria.Categoria;
import com.primordi.api.modules.categoria.CategoriaRepository;
import com.primordi.api.modules.live.LiveEvent;
import com.primordi.api.modules.live.LiveEventService;
import com.primordi.api.modules.live.LiveEventType;
import com.primordi.api.modules.pedido.PedidoItemRepository;
import com.primordi.api.modules.produto.dto.*;
import com.primordi.api.shared.exception.BusinessException;
import com.primordi.api.shared.exception.ResourceNotFoundException;
import com.primordi.api.shared.util.SlugUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class ProdutoService {

    private final ProdutoRepository produtoRepository;
    private final ProdutoImagemRepository imagemRepository;
    private final CategoriaRepository categoriaRepository;
    private final LiveEventService liveEventService;
    private final PedidoItemRepository pedidoItemRepository;

    // ========== LISTAGEM ==========

    @Transactional(readOnly = true)
    public Page<ProdutoResumoResponse> listar(
            Long categoriaId, Boolean apenasAtivos, Boolean apenasDestaque,
            String busca, Pageable pageable) {

        return produtoRepository.buscarComFiltros(
                        categoriaId,
                        apenasAtivos != null && apenasAtivos,
                        apenasDestaque != null && apenasDestaque,
                        (busca == null || busca.isBlank()) ? null : busca.trim(),
                        pageable
                )
                .map(ProdutoResumoResponse::from);
    }

    @Transactional(readOnly = true)
    public ProdutoResponse buscarPorId(Long id) {
        Produto produto = produtoRepository.findByIdComDetalhes(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produto", id));
        return ProdutoResponse.from(produto);
    }

    @Transactional(readOnly = true)
    public ProdutoResponse buscarPorSlug(String slug) {
        Produto produto = produtoRepository.findBySlugComDetalhes(slug)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Produto com slug '" + slug + "' não encontrado"));
        return ProdutoResponse.from(produto);
    }

    // ========== CRIAÇÃO ==========

    public ProdutoResponse criar(ProdutoRequest request) {
        Categoria categoria = categoriaRepository.findById(request.categoriaId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoria", request.categoriaId()));

        // SKU obrigatório e único
        if (request.sku() == null || request.sku().isBlank()) {
            throw new BusinessException("SKU é obrigatório");
        }
        if (produtoRepository.existsBySku(request.sku())) {
            throw new BusinessException("SKU já cadastrado: " + request.sku());
        }

        // Slug: usa o informado se válido, senão gera a partir do nome
        String slug = (request.slug() != null && !request.slug().isBlank())
                ? garantirSlugUnico(SlugUtil.toSlug(request.slug()), null)
                : gerarSlugUnico(request.nome(), null);

        validarPrecoPromocional(request.preco(), request.precoPromocional());

        Produto produto = Produto.builder()
                .categoria(categoria)
                .sku(request.sku())
                .nome(request.nome())
                .slug(slug)
                .descricao(request.descricao())
                .tipoCouro(request.tipoCouro())
                .cor(request.cor())
                .preco(request.preco())
                .precoPromocional(request.precoPromocional())
                .pesoKg(request.pesoKg())
                .larguraCm(request.larguraCm())
                .alturaCm(request.alturaCm())
                .profundidadeCm(request.profundidadeCm())
                .estoque(request.estoque() != null ? request.estoque() : 0)
                .estoqueMinimo(request.estoqueMinimo() != null ? request.estoqueMinimo() : 0)
                .ativo(request.ativo() == null || request.ativo())
                .destaque(request.destaque() != null && request.destaque())
                .build();

        return ProdutoResponse.from(produtoRepository.save(produto));
    }

    // ========== ATUALIZAÇÃO ==========

    public ProdutoResponse atualizar(Long id, ProdutoUpdateRequest request) {
        Produto produto = buscarEntidade(id);

        if (request.categoriaId() != null) {
            Categoria categoria = categoriaRepository.findById(request.categoriaId())
                    .orElseThrow(() -> new ResourceNotFoundException("Categoria", request.categoriaId()));
            produto.setCategoria(categoria);
        }

        if (request.sku() != null && !request.sku().isBlank()
                && !request.sku().equals(produto.getSku())) {
            if (produtoRepository.existsBySku(request.sku())) {
                throw new BusinessException("SKU já cadastrado: " + request.sku());
            }
            produto.setSku(request.sku());
        }

        if (request.nome() != null && !request.nome().isBlank()) {
            produto.setNome(request.nome());
            // Se não veio slug explícito, regera baseado no novo nome
            if (request.slug() == null || request.slug().isBlank()) {
                produto.setSlug(gerarSlugUnico(request.nome(), id));
            }
        }

        if (request.slug() != null && !request.slug().isBlank()) {
            produto.setSlug(garantirSlugUnico(SlugUtil.toSlug(request.slug()), id));
        }

        if (request.descricao() != null) produto.setDescricao(request.descricao());
        if (request.tipoCouro() != null) produto.setTipoCouro(request.tipoCouro());
        if (request.cor() != null) produto.setCor(request.cor());
        if (request.preco() != null) produto.setPreco(request.preco());
        if (request.precoPromocional() != null) produto.setPrecoPromocional(request.precoPromocional());
        if (request.pesoKg() != null) produto.setPesoKg(request.pesoKg());
        if (request.larguraCm() != null) produto.setLarguraCm(request.larguraCm());
        if (request.alturaCm() != null) produto.setAlturaCm(request.alturaCm());
        if (request.profundidadeCm() != null) produto.setProfundidadeCm(request.profundidadeCm());
        if (request.estoque() != null) produto.setEstoque(request.estoque());
        if (request.estoqueMinimo() != null) produto.setEstoqueMinimo(request.estoqueMinimo());
        if (request.destaque() != null) produto.setDestaque(request.destaque());
        if (request.daLive() != null) produto.setDaLive(request.daLive());
        if (request.ativo() != null) produto.setAtivo(request.ativo());

        validarPrecoPromocional(produto.getPreco(), produto.getPrecoPromocional());

        return ProdutoResponse.from(produtoRepository.save(produto));
    }

    public void deletar(Long id) {
        Produto produto = buscarEntidade(id);
        produto.setAtivo(false);
        produtoRepository.save(produto);
    }

    public void deletarDefinitivo(Long id) {
        Produto produto = buscarEntidade(id);
        long totalPedidos = pedidoItemRepository.countByProdutoId(id);
        if (totalPedidos > 0) {
            throw new BusinessException(
                "Não é possível excluir este produto pois ele está vinculado a " +
                totalPedidos + " pedido(s). Use a opção de inativar."
            );
        }
        produtoRepository.delete(produto);
    }

    // ========== ESTOQUE ==========

    public ProdutoResponse atualizarEstoque(Long produtoId, Integer novoEstoque) {
        if (novoEstoque == null || novoEstoque < 0) {
            throw new BusinessException("Estoque não pode ser nulo ou negativo");
        }
        Produto produto = buscarEntidade(produtoId);
        int estoqueAnterior = produto.getEstoque();
        produto.setEstoque(novoEstoque);
        ProdutoResponse response = ProdutoResponse.from(produtoRepository.save(produto));

        liveEventService.publicar(LiveEvent.builder()
                .tipo(LiveEventType.ESTOQUE_ATUALIZADO)
                .dados(Map.of("produtoId", produtoId, "nome", produto.getNome(),
                        "estoqueAnterior", estoqueAnterior, "estoqueNovo", novoEstoque))
                .build());

        return response;
    }

    // ========== IMAGENS ==========

    public ImagemResponse adicionarImagem(Long produtoId, ImagemRequest request) {
        Produto produto = buscarEntidade(produtoId);

        boolean ehPrincipal = request.principal() != null && request.principal();

        // Se vai ser principal, desmarca as outras
        if (ehPrincipal) {
            imagemRepository.desmarcarPrincipalDoProduto(produtoId);
        }

        ProdutoImagem imagem = ProdutoImagem.builder()
                .produto(produto)
                .url(request.url())
                .altText(request.altText())
                .ordem(request.ordem() != null ? request.ordem() : 0)
                .principal(ehPrincipal)
                .build();

        return ImagemResponse.from(imagemRepository.save(imagem));
    }

    public void removerImagem(Long imagemId) {
        if (!imagemRepository.existsById(imagemId)) {
            throw new ResourceNotFoundException("Imagem", imagemId);
        }
        imagemRepository.deleteById(imagemId);
    }

    public ImagemResponse marcarComoPrincipal(Long produtoId, Long imagemId) {
        ProdutoImagem imagem = imagemRepository.findById(imagemId)
                .orElseThrow(() -> new ResourceNotFoundException("Imagem", imagemId));

        if (!imagem.getProduto().getId().equals(produtoId)) {
            throw new BusinessException("Imagem não pertence a esse produto");
        }

        imagemRepository.desmarcarPrincipalDoProduto(produtoId);
        imagem.setPrincipal(true);
        return ImagemResponse.from(imagemRepository.save(imagem));
    }

    // ========== HELPERS ==========

    private Produto buscarEntidade(Long id) {
        return produtoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produto", id));
    }

    private String gerarSlugUnico(String nome, Long ignorarId) {
        return garantirSlugUnico(SlugUtil.toSlug(nome), ignorarId);
    }

    private String garantirSlugUnico(String slugBase, Long ignorarId) {
        String slug = slugBase;
        int contador = 2;

        while (ignorarId == null
                ? produtoRepository.existsBySlug(slug)
                : produtoRepository.existsBySlugAndIdNot(slug, ignorarId)) {
            slug = slugBase + "-" + contador++;
        }
        return slug;
    }

    private void validarPrecoPromocional(BigDecimal preco, BigDecimal promocional) {
        if (promocional != null && preco != null
                && promocional.compareTo(BigDecimal.ZERO) > 0
                && promocional.compareTo(preco) >= 0) {
            throw new BusinessException("Preço promocional deve ser menor que o preço normal");
        }
    }
}
