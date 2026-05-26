package com.primordi.api.modules.endereco;

import com.primordi.api.modules.endereco.dto.EnderecoRequest;
import com.primordi.api.modules.endereco.dto.EnderecoResponse;
import org.springframework.stereotype.Component;

@Component
public class EnderecoMapper {

    public Endereco toEntity(EnderecoRequest dto) {
        return Endereco.builder()
                .apelido(dto.apelido())
                .cep(normalizarCep(dto.cep()))
                .logradouro(dto.logradouro())
                .numero(dto.numero())
                .complemento(dto.complemento())
                .bairro(dto.bairro())
                .cidade(dto.cidade())
                .estado(dto.estado().toUpperCase())
                .pais(dto.pais())
                .principal(dto.principal())
                .build();
    }

    public void updateEntity(Endereco entity, EnderecoRequest dto) {
        entity.setApelido(dto.apelido());
        entity.setCep(normalizarCep(dto.cep()));
        entity.setLogradouro(dto.logradouro());
        entity.setNumero(dto.numero());
        entity.setComplemento(dto.complemento());
        entity.setBairro(dto.bairro());
        entity.setCidade(dto.cidade());
        entity.setEstado(dto.estado().toUpperCase());
        entity.setPais(dto.pais());
        entity.setPrincipal(dto.principal());
    }

    public EnderecoResponse toResponse(Endereco entity) {
        return new EnderecoResponse(
                entity.getId(),
                entity.getApelido(),
                entity.getCep(),
                entity.getLogradouro(),
                entity.getNumero(),
                entity.getComplemento(),
                entity.getBairro(),
                entity.getCidade(),
                entity.getEstado(),
                entity.getPais(),
                entity.getPrincipal(),
                entity.getEnderecoCompleto(),
                entity.getCriadoEm(),
                entity.getAtualizadoEm()
        );
    }

    /**
     * Normaliza CEP pro formato 00000-000.
     */
    private String normalizarCep(String cep) {
        if (cep == null) return null;
        String digits = cep.replaceAll("\\D", "");
        if (digits.length() == 8) {
            return digits.substring(0, 5) + "-" + digits.substring(5);
        }
        return cep;
    }
}
