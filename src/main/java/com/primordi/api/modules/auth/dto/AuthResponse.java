package com.primordi.api.modules.auth.dto;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        Long expiresIn,
        UsuarioInfo usuario
) {
    public record UsuarioInfo(
            Long id,
            String nome,
            String email,
            String role
    ) {}
}
