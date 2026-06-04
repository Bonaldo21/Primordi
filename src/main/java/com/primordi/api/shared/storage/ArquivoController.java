package com.primordi.api.shared.storage;

import com.primordi.api.shared.storage.dto.UploadImagemResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;

@RestController
@RequestMapping("/arquivos")
@RequiredArgsConstructor
public class ArquivoController {

    private final FileStorageService fileStorageService;

    @Value("${APP_PUBLIC_URL:}")
    private String appPublicUrl;

    @PostMapping("/imagem")
    public ResponseEntity<UploadImagemResponse> uploadImagem(
            @RequestPart("arquivo") MultipartFile arquivo,
            HttpServletRequest request) {
        String nomeArquivo = fileStorageService.salvarImagem(arquivo);
        String url = resolverBaseUrl(request) + "/uploads/" + nomeArquivo;
        return ResponseEntity.ok(new UploadImagemResponse(url));
    }

    /**
     * Resolve a URL pública correta mesmo atrás de proxy/Railway.
     * Prioridade: env var APP_PUBLIC_URL > X-Forwarded headers > fallback do request.
     */
    private String resolverBaseUrl(HttpServletRequest request) {
        if (appPublicUrl != null && !appPublicUrl.isBlank()) {
            return appPublicUrl.replaceAll("/+$", "") + request.getContextPath();
        }

        String proto = request.getHeader("X-Forwarded-Proto");
        String host  = request.getHeader("X-Forwarded-Host");

        if (proto != null && host != null) {
            return proto + "://" + host + request.getContextPath();
        }

        // fallback sem porta explícita (evita :8080 em URLs públicas)
        return request.getScheme() + "://" + request.getServerName() + request.getContextPath();
    }
}
