package com.primordi.api.modules.produto;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProdutoImagemRepository extends JpaRepository<ProdutoImagem, Long> {

    List<ProdutoImagem> findByProdutoIdOrderByOrdemAsc(Long produtoId);

    @Modifying
    @Query("UPDATE ProdutoImagem i SET i.principal = false WHERE i.produto.id = :produtoId")
    void desmarcarPrincipalDoProduto(@Param("produtoId") Long produtoId);
}
