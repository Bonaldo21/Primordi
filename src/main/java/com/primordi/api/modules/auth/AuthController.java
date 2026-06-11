package com.primordi.api.modules.auth;

import com.primordi.api.modules.auth.dto.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticação", description = "Cadastro, login e refresh de token")
public class AuthController {

    private final AuthService authService;

    @Value("${primordi.email.frontend-url}")
    private String frontendUrl;

    @PostMapping("/register")
    @Operation(summary = "Cadastra novo cliente")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    @Operation(summary = "Faz login e retorna tokens JWT")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request,
                                               HttpServletRequest httpRequest) {
        String ip = obterIp(httpRequest);
        return ResponseEntity.ok(authService.login(request, ip));
    }

    private String obterIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    @PostMapping("/refresh")
    @Operation(summary = "Renova access token usando refresh token")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(authService.refresh(request));
    }

    @GetMapping("/verificar-email")
    @Operation(summary = "Confirma o e-mail do cliente via token e redireciona para o frontend")
    public ResponseEntity<Void> verificarEmail(@RequestParam String token) {
        String destino;
        try {
            authService.verificarEmail(token);
            destino = frontendUrl + "/verificar-email?status=ok";
        } catch (Exception e) {
            destino = frontendUrl + "/verificar-email?status=erro&message=" + java.net.URLEncoder.encode(e.getMessage(), java.nio.charset.StandardCharsets.UTF_8);
        }
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.LOCATION, destino);
        return ResponseEntity.status(HttpStatus.FOUND).headers(headers).build();
    }

    @PostMapping("/reenviar-verificacao")
    @Operation(summary = "Reenvia e-mail de verificação")
    public ResponseEntity<Void> reenviarVerificacao(@RequestBody java.util.Map<String, String> body) {
        authService.reenviarVerificacao(body.get("email"));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/esqueci-senha")
    @Operation(summary = "Envia e-mail para redefinição de senha")
    public ResponseEntity<Void> esqueciSenha(@Valid @RequestBody EsqueciSenhaRequest request) {
        authService.esqueciSenha(request.email());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/redefinir-senha")
    @Operation(summary = "Redefine a senha usando o token recebido por e-mail")
    public ResponseEntity<Void> redefinirSenha(@Valid @RequestBody RedefinirSenhaRequest request) {
        authService.redefinirSenha(request.token(), request.novaSenha());
        return ResponseEntity.ok().build();
    }
}
