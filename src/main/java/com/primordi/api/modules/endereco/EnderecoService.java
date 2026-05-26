package com.primordi.api.modules.endereco;

import com.primordi.api.modules.cliente.Cliente;
import com.primordi.api.modules.endereco.dto.EnderecoRequest;
import com.primordi.api.modules.endereco.dto.EnderecoResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EnderecoService {

    private final EnderecoRepository repository;
    private final EnderecoMapper mapper;

    /**
     * Lista todos os endereços do cliente autenticado.
     */
    @Transactional(readOnly = true)
    public List<EnderecoResponse> listar(Cliente cliente) {
        return repository
                .findByClienteIdOrderByPrincipalDescCriadoEmDesc(cliente.getId())
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    /**
     * Busca um endereço específico do cliente.
     */
    @Transactional(readOnly = true)
    public EnderecoResponse buscarPorId(Long id, Cliente cliente) {
        Endereco endereco = buscarEntidade(id, cliente);
        return mapper.toResponse(endereco);
    }

    /**
     * Cria um novo endereço pro cliente.
     * Se for o primeiro, marca automaticamente como principal.
     */
    @Transactional
    public EnderecoResponse criar(EnderecoRequest dto, Cliente cliente) {
        Endereco endereco = mapper.toEntity(dto);
        endereco.setCliente(cliente);

        long qtd = repository.countByClienteId(cliente.getId());

        // Se for o primeiro endereço, força como principal
        if (qtd == 0) {
            endereco.setPrincipal(true);
        }
        // Se marcou como principal, desmarca os outros
        else if (Boolean.TRUE.equals(endereco.getPrincipal())) {
            repository.desmarcarPrincipais(cliente.getId());
        }

        return mapper.toResponse(repository.save(endereco));
    }

    /**
     * Atualiza um endereço do cliente.
     */
    @Transactional
    public EnderecoResponse atualizar(Long id, EnderecoRequest dto, Cliente cliente) {
        Endereco endereco = buscarEntidade(id, cliente);

        boolean vaiSerPrincipal = Boolean.TRUE.equals(dto.principal());
        boolean eraPrincipal = Boolean.TRUE.equals(endereco.getPrincipal());

        // Se está marcando como principal agora, desmarca os outros
        if (vaiSerPrincipal && !eraPrincipal) {
            repository.desmarcarPrincipais(cliente.getId());
        }

        mapper.updateEntity(endereco, dto);
        return mapper.toResponse(repository.save(endereco));
    }

    /**
     * Define um endereço como principal.
     */
    @Transactional
    public EnderecoResponse definirComoPrincipal(Long id, Cliente cliente) {
        Endereco endereco = buscarEntidade(id, cliente);
        repository.desmarcarPrincipais(cliente.getId());
        endereco.setPrincipal(true);
        return mapper.toResponse(repository.save(endereco));
    }

    /**
     * Remove um endereço do cliente.
     * ⚠️ Se for principal e existirem outros, marca outro como principal.
     */
    @Transactional
    public void deletar(Long id, Cliente cliente) {
        Endereco endereco = buscarEntidade(id, cliente);
        boolean eraPrincipal = Boolean.TRUE.equals(endereco.getPrincipal());

        repository.delete(endereco);

        // Se removeu o principal, promove o mais recente a principal
        if (eraPrincipal) {
            repository.findByClienteIdOrderByPrincipalDescCriadoEmDesc(cliente.getId())
                    .stream()
                    .findFirst()
                    .ifPresent(novoPrincipal -> {
                        novoPrincipal.setPrincipal(true);
                        repository.save(novoPrincipal);
                    });
        }
    }

    // ========== MÉTODOS INTERNOS ==========

    /**
     * Busca a entity garantindo que pertence ao cliente.
     * Lança exceção se não encontrar ou não pertencer.
     */
    private Endereco buscarEntidade(Long id, Cliente cliente) {
        return repository.findByIdAndClienteId(id, cliente.getId())
                .orElseThrow(() -> new RuntimeException(
                        "Endereço não encontrado ou não pertence ao cliente"
                ));
    }

    /**
     * Método público para outros services usarem (ex: PedidoService).
     */
    @Transactional(readOnly = true)
    public Endereco buscarParaPedido(Long id, Cliente cliente) {
        return buscarEntidade(id, cliente);
    }
}
