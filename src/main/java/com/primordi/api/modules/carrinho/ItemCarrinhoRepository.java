package com.primordi.api.modules.carrinho;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ItemCarrinhoRepository extends JpaRepository<ItemCarrinho, Long> {

    Optional<ItemCarrinho> findByCarrinhoIdAndProdutoId(Long carrinhoId, Long produtoId);
}
