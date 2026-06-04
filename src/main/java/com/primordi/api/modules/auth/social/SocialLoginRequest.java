package com.primordi.api.modules.auth.social;

import jakarta.validation.constraints.NotBlank;

public record SocialLoginRequest(
        @NotBlank(message = "provedor é obrigatório")
        String provedor,      // "google", "facebook"

        @NotBlank(message = "idToken é obrigatório")
        String idToken        // token emitido pelo provedor e enviado pelo frontend
) {}
