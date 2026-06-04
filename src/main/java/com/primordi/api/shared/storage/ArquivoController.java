package com.primordi.api.shared.storage;

import com.primordi.api.shared.storage.dto.UploadImagemResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/arquivos")
@RequiredArgsConstructor
public class ArquivoController {

    private final FileStorageService fileStorageService;

    @PostMapping("/imagem")
    public ResponseEntity<UploadImagemResponse> uploadImagem(
            @RequestPart("arquivo") MultipartFile arquivo) {
        String url = fileStorageService.salvarImagem(arquivo);
        return ResponseEntity.ok(new UploadImagemResponse(url));
    }
}
