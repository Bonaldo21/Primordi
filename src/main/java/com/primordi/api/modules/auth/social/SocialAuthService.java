package com.primordi.api.modules.auth.social;

import com.primordi.api.modules.auth.dto.AuthResponse;
import com.primordi.api.modules.auth.jwt.JwtService;
import com.primordi.api.modules.cliente.Cliente;
import com.primordi.api.modules.cliente.ClienteRepository;
import com.primordi.api.modules.cliente.ClienteRole;
import com.primordi.api.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class SocialAuthService {

    private static final String GOOGLE_TOKENINFO_URL =
            "https://oauth2.googleapis.com/tokeninfo?id_token=%s";

    private final ClienteRepository clienteRepository;
    private final JwtService jwtService;
    private final RestTemplate restTemplate = new RestTemplate();

    public AuthResponse loginComGoogle(String idToken) {
        GoogleTokenInfo tokenInfo = verificarTokenGoogle(idToken);

        if (!tokenInfo.isValid()) {
            throw new BusinessException("Token Google inválido ou expirado");
        }

        Cliente cliente = buscarOuCriarClienteGoogle(tokenInfo);
        return montarResposta(cliente);
    }

    private GoogleTokenInfo verificarTokenGoogle(String idToken) {
        try {
            String url = String.format(GOOGLE_TOKENINFO_URL, idToken);
            GoogleTokenInfo info = restTemplate.getForObject(url, GoogleTokenInfo.class);
            if (info == null) throw new BusinessException("Resposta inválida do Google");
            log.debug("Token Google verificado para sub={} email={}", info.getSub(), info.getEmail());
            return info;
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("Erro ao verificar token Google: {}", e.getMessage());
            throw new BusinessException("Não foi possível verificar o token com o Google");
        }
    }

    private Cliente buscarOuCriarClienteGoogle(GoogleTokenInfo info) {
        // 1. Busca por social_id + provider
        Optional<Cliente> porSocialId = clienteRepository
                .findBySocialProviderAndSocialId("GOOGLE", info.getSub());

        if (porSocialId.isPresent()) {
            return porSocialId.get();
        }

        // 2. Busca por e-mail (usuário já cadastrou manualmente)
        Optional<Cliente> porEmail = clienteRepository.findByEmail(info.getEmail().toLowerCase());
        if (porEmail.isPresent()) {
            Cliente cliente = porEmail.get();
            // Vincula o social_id ao cadastro existente
            cliente.setSocialProvider("GOOGLE");
            cliente.setSocialId(info.getSub());
            if (info.isEmailVerified()) cliente.setEmailVerificado(true);
            return clienteRepository.save(cliente);
        }

        // 3. Cria novo cliente via login social
        String nome = info.getName() != null ? info.getName()
                : (info.getGivenName() != null ? info.getGivenName() : "Usuário Google");

        Cliente novo = Cliente.builder()
                .nome(nome)
                .email(info.getEmail().toLowerCase().trim())
                // Senha aleatória — cliente nunca vai usá-la diretamente
                .senha(UUID.randomUUID().toString())
                .socialProvider("GOOGLE")
                .socialId(info.getSub())
                .emailVerificado(info.isEmailVerified())
                .role(ClienteRole.CLIENTE)
                .ativo(true)
                .build();

        log.info("Novo cliente criado via Google: {}", novo.getEmail());
        return clienteRepository.save(novo);
    }

    private AuthResponse montarResposta(Cliente cliente) {
        String accessToken  = jwtService.generateAccessToken(cliente);
        String refreshToken = jwtService.generateRefreshToken(cliente);

        return new AuthResponse(
                accessToken,
                refreshToken,
                "Bearer",
                jwtService.getExpirationMs() / 1000,
                new AuthResponse.UsuarioInfo(
                        cliente.getId(),
                        cliente.getNome(),
                        cliente.getEmail(),
                        cliente.getCpf(),
                        cliente.getRole().name()
                )
        );
    }
}
