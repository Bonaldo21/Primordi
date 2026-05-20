package com.primordi.api.modules.auth;

import com.primordi.api.modules.auth.dto.*;
import com.primordi.api.modules.auth.jwt.JwtService;
import com.primordi.api.modules.cliente.Cliente;
import com.primordi.api.modules.cliente.ClienteRepository;
import com.primordi.api.modules.cliente.ClienteRole;
import com.primordi.api.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final ClienteRepository clienteRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        if (clienteRepository.existsByEmail(request.email())) {
            throw new BusinessException("E-mail já cadastrado");
        }

        if (request.cpf() != null && !request.cpf().isBlank()
                && clienteRepository.existsByCpf(request.cpf())) {
            throw new BusinessException("CPF já cadastrado");
        }

        Cliente cliente = Cliente.builder()
                .nome(request.nome())
                .email(request.email().toLowerCase().trim())
                .senha(passwordEncoder.encode(request.senha()))
                .cpf(request.cpf())
                .telefone(request.telefone())
                .role(ClienteRole.CLIENTE)
                .ativo(true)
                .emailVerificado(false)
                .build();

        cliente = clienteRepository.save(cliente);

        return montarResposta(cliente);
    }

    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.email().toLowerCase().trim(),
                            request.senha()
                    )
            );
        } catch (BadCredentialsException e) {
            throw new BusinessException("E-mail ou senha inválidos");
        }

        Cliente cliente = clienteRepository.findByEmail(request.email().toLowerCase().trim())
                .orElseThrow(() -> new BusinessException("Usuário não encontrado"));

        return montarResposta(cliente);
    }

    public AuthResponse refresh(RefreshTokenRequest request) {
        String refreshToken = request.refreshToken();

        if (!jwtService.isRefreshToken(refreshToken)) {
            throw new BusinessException("Token inválido");
        }

        String email;
        try {
            email = jwtService.extractEmail(refreshToken);
        } catch (Exception e) {
            throw new BusinessException("Refresh token expirado ou inválido");
        }

        Cliente cliente = clienteRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("Usuário não encontrado"));

        if (!jwtService.isTokenValid(refreshToken, cliente)) {
            throw new BusinessException("Refresh token expirado");
        }

        return montarResposta(cliente);
    }

    private AuthResponse montarResposta(Cliente cliente) {
        String accessToken = jwtService.generateAccessToken(cliente);
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
                        cliente.getRole().name()
                )
        );
    }
}
