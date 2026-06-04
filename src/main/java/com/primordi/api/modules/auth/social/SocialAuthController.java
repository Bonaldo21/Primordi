package com.primordi.api.modules.auth.social;

import com.primordi.api.modules.auth.dto.AuthResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth/social")
@RequiredArgsConstructor
public class SocialAuthController {

    private final SocialAuthService socialAuthService;

    /**
     * Login / cadastro via Google.
     *
     * Fluxo no frontend:
     * 1. Usuário clica em "Entrar com Google"
     * 2. Frontend usa Google Identity Services (GSI) para obter o id_token
     * 3. Frontend envia: POST /api/auth/social/google { "idToken": "..." }
     * 4. API verifica o token com o Google, cria/encontra o cliente e retorna JWT
     */
    @PostMapping("/google")
    public ResponseEntity<AuthResponse> loginComGoogle(@Valid @RequestBody SocialLoginRequest request) {
        AuthResponse response = socialAuthService.loginComGoogle(request.idToken());
        return ResponseEntity.ok(response);
    }
}
