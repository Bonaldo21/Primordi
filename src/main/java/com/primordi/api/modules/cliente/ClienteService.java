package com.primordi.api.modules.cliente;

import com.primordi.api.modules.cliente.dto.AlterarSenhaRequest;
import com.primordi.api.modules.cliente.dto.ClienteResponse;
import com.primordi.api.modules.cliente.dto.ClienteUpdateRequest;
import com.primordi.api.shared.exception.BusinessException;
import com.primordi.api.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ClienteService {

    private final ClienteRepository repository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public Page<ClienteResponse> listarTodos(Pageable pageable) {
        return repository.findAll(pageable).map(ClienteResponse::from);
    }

    @Transactional(readOnly = true)
    public ClienteResponse buscarPorEmail(String email) {
        return repository.findByEmail(email)
                .map(ClienteResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado"));
    }

    public ClienteResponse buscarPorId(Long id) {
        Cliente cliente = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente", id));
        return ClienteResponse.from(cliente);
    }


    public ClienteResponse atualizarPerfil(String email, ClienteUpdateRequest request) {
        Cliente cliente = repository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado"));

        if (request.nome() != null && !request.nome().isBlank()) cliente.setNome(request.nome());
        if (request.cpf() != null) {
            if (repository.existsByCpf(request.cpf())
                    && !request.cpf().equals(cliente.getCpf())) {
                throw new BusinessException("CPF já cadastrado");
            }
            cliente.setCpf(request.cpf());
        }
        if (request.telefone() != null) cliente.setTelefone(request.telefone());
        if (request.dataNascimento() != null) cliente.setDataNascimento(request.dataNascimento());

        return ClienteResponse.from(repository.save(cliente));
    }

    public void alterarSenha(String email, AlterarSenhaRequest request) {
        Cliente cliente = repository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado"));

        if (!passwordEncoder.matches(request.senhaAtual(), cliente.getSenha())) {
            throw new BusinessException("Senha atual incorreta");
        }

        cliente.setSenha(passwordEncoder.encode(request.novaSenha()));
        repository.save(cliente);
    }
}
