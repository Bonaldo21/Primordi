package com.primordi.api.modules.auth;

import com.primordi.api.modules.auth.dto.*;
import com.primordi.api.modules.auth.jwt.JwtService;
import com.primordi.api.modules.cliente.Cliente;
import com.primordi.api.modules.cliente.ClienteRepository;
import com.primordi.api.modules.cliente.ClienteRole;
import com.primordi.api.shared.email.EmailService;
import com.primordi.api.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final ClienteRepository clienteRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final TokenVerificacaoEmailRepository tokenRepository;
    private final TokenResetSenhaRepository resetTokenRepository;
    private final EmailService emailService;

    @Value("${primordi.email.verificacao-expiracao-horas:24}")
    private int expiracaoHoras;

    // Rate limiting: máx 5 tentativas falhas por IP em 15 minutos
    private static final int MAX_TENTATIVAS = 5;
    private static final long JANELA_MS = 15 * 60 * 1000L;

    private record Tentativas(AtomicInteger count, Instant inicio) {}
    private final ConcurrentHashMap<String, Tentativas> loginAttempts = new ConcurrentHashMap<>();

    private void verificarRateLimit(String ip) {
        loginAttempts.entrySet().removeIf(e ->
                Instant.now().toEpochMilli() - e.getValue().inicio().toEpochMilli() > JANELA_MS);

        Tentativas t = loginAttempts.get(ip);
        if (t != null && t.count().get() >= MAX_TENTATIVAS) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                    "Muitas tentativas de login. Aguarde 15 minutos.");
        }
    }

    private void registrarFalha(String ip) {
        loginAttempts.compute(ip, (k, v) -> {
            if (v == null) return new Tentativas(new AtomicInteger(1), Instant.now());
            v.count().incrementAndGet();
            return v;
        });
    }

    private void limparTentativas(String ip) {
        loginAttempts.remove(ip);
    }

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
        enviarTokenVerificacao(cliente);

        return montarResposta(cliente);
    }

    private void enviarTokenVerificacao(Cliente cliente) {
        String token = UUID.randomUUID().toString();
        tokenRepository.save(TokenVerificacaoEmail.builder()
                .token(token)
                .cliente(cliente)
                .expiraEm(LocalDateTime.now().plusHours(expiracaoHoras))
                .build());
        emailService.enviarVerificacaoEmail(cliente.getEmail(), cliente.getNome(), token);
    }

    public void verificarEmail(String token) {
        TokenVerificacaoEmail tv = tokenRepository.findByToken(token)
                .orElseThrow(() -> new BusinessException("Token inválido"));

        if (tv.getUsado()) throw new BusinessException("Token já utilizado");
        if (tv.getExpiraEm().isBefore(LocalDateTime.now())) throw new BusinessException("Token expirado");

        tv.getCliente().setEmailVerificado(true);
        clienteRepository.save(tv.getCliente());
        tv.setUsado(true);
        tokenRepository.save(tv);
    }

    public AuthResponse login(LoginRequest request, String ip) {
        verificarRateLimit(ip);
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.email().toLowerCase().trim(),
                            request.senha()
                    )
            );
        } catch (BadCredentialsException e) {
            registrarFalha(ip);
            throw new BusinessException("E-mail ou senha inválidos");
        }

        limparTentativas(ip);
        Cliente cliente = clienteRepository.findByEmail(request.email().toLowerCase().trim())
                .orElseThrow(() -> new BusinessException("Usuário não encontrado"));

        if (!Boolean.TRUE.equals(cliente.getEmailVerificado())) {
            throw new BusinessException("E-mail não verificado. Verifique sua caixa de entrada e confirme seu e-mail antes de entrar.");
        }

        return montarResposta(cliente);
    }

    public void esqueciSenha(String email) {
        // Sempre retorna sucesso para não revelar se o e-mail existe
        clienteRepository.findByEmail(email.toLowerCase().trim()).ifPresent(cliente -> {
            String token = UUID.randomUUID().toString();
            resetTokenRepository.save(TokenResetSenha.builder()
                    .token(token)
                    .cliente(cliente)
                    .expiraEm(LocalDateTime.now().plusHours(1))
                    .build());
            emailService.enviarResetSenha(cliente.getEmail(), cliente.getNome(), token);
        });
    }

    public void redefinirSenha(String token, String novaSenha) {
        TokenResetSenha tr = resetTokenRepository.findByToken(token)
                .orElseThrow(() -> new BusinessException("Link inválido ou expirado"));

        if (tr.getUsado()) throw new BusinessException("Este link já foi utilizado");
        if (tr.getExpiraEm().isBefore(LocalDateTime.now())) throw new BusinessException("Link expirado. Solicite um novo.");

        tr.getCliente().setSenha(passwordEncoder.encode(novaSenha));
        clienteRepository.save(tr.getCliente());
        tr.setUsado(true);
        resetTokenRepository.save(tr);
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
                        cliente.getCpf(),       // ← adicionado
                        cliente.getRole().name()
                )
        );
    }
}