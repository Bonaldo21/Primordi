package com.primordi.api.modules.produto;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Long> {

    // ========== EXISTÊNCIA / BUSCA SIMPLES ==========

    Optional<Produto> findBySlug(String slug);

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);

    boolean existsBySku(String sku);

    boolean existsBySkuAndIdNot(String sku, Long id);

    // ========== LISTAGEM COM FILTROS ==========

    /**
     * Busca produtos com filtros opcionais (todos podem ser null/false).
     * Usado tanto pela vitrine pública quanto pelo admin.
     * Busca em nome, SKU e cor (case-insensitive).
     */
    @Query("""
            SELECT DISTINCT p FROM Produto p
            LEFT JOIN FETCH p.categoria
            WHERE (:categoriaId IS NULL OR p.categoria.id = :categoriaId)
              AND (:apenasAtivos = false OR p.ativo = true)
              AND (:apenasDestaque = false OR p.destaque = true)
              AND (:busca IS NULL
                   OR LOWER(p.nome) LIKE LOWER(CONCAT('%', :busca, '%'))
                   OR LOWER(p.sku)  LIKE LOWER(CONCAT('%', :busca, '%'))
                   OR LOWER(p.cor)  LIKE LOWER(CONCAT('%', :busca, '%')))
            """)
    Page<Produto> buscarComFiltros(
            @Param("categoriaId") Long categoriaId,
            @Param("apenasAtivos") boolean apenasAtivos,
            @Param("apenasDestaque") boolean apenasDestaque,
            @Param("busca") String busca,
            Pageable pageable
    );

    // ========== DETALHE COM RELACIONAMENTOS ==========

    /** Busca produto carregando categoria e imagens (pra tela de detalhe) */
    @Query("""
            SELECT p FROM Produto p
            LEFT JOIN FETCH p.categoria
            LEFT JOIN FETCH p.imagens
            WHERE p.id = :id
            """)
    Optional<Produto> findByIdComDetalhes(@Param("id") Long id);

    @Query("""
            SELECT p FROM Produto p
            LEFT JOIN FETCH p.categoria
            LEFT JOIN FETCH p.imagens
            WHERE p.slug = :slug
            """)
    Optional<Produto> findBySlugComDetalhes(@Param("slug") String slug);

    // ========== ESTOQUE / RELATÓRIOS ==========

    /** Produtos com estoque baixo (estoque <= estoqueMinimo) e ativos */
    @Query("""
            SELECT p FROM Produto p
            LEFT JOIN FETCH p.categoria
            WHERE p.ativo = true
              AND p.estoque <= p.estoqueMinimo
            ORDER BY p.estoque ASC
            """)
    java.util.List<Produto> buscarComEstoqueBaixo();

    /** Produtos sem estoque e ativos (esgotados) */
    @Query("""
            SELECT p FROM Produto p
            WHERE p.ativo = true AND p.estoque = 0
            """)
    java.util.List<Produto> buscarEsgotados();

    /** Produtos marcados para a live, ativos */
    @Query("""
            SELECT p FROM Produto p
            LEFT JOIN FETCH p.imagens
            LEFT JOIN FETCH p.categoria
            WHERE p.daLive = true AND p.ativo = true
            ORDER BY p.nome ASC
            """)
    java.util.List<Produto> buscarProdutosDaLive();

    java.util.List<Produto> findByDaLiveTrueAndAtivoTrue();
}
