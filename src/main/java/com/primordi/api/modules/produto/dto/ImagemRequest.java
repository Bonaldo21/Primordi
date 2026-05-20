package com.primordi.api.modules.produto.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ImagemRequest(
        @NotBlank @Size(max = 500)
        String url,

        @Size(max = 200)
        String altText,

        Integer ordem,
        Boolean principal
) {}
