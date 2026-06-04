package com.primordi.api.shared.storage;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.primordi.api.shared.exception.BusinessException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class FileStorageService {

    private final Cloudinary cloudinary;

    public FileStorageService(
            @Value("${cloudinary.cloud-name}") String cloudName,
            @Value("${cloudinary.api-key}") String apiKey,
            @Value("${cloudinary.api-secret}") String apiSecret) {
        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
                "secure", true
        ));
    }

    public String salvarImagem(MultipartFile arquivo) {
        if (arquivo == null || arquivo.isEmpty()) {
            throw new BusinessException("Arquivo de imagem é obrigatório");
        }

        String contentType = arquivo.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BusinessException("Somente arquivos de imagem são permitidos");
        }

        try {
            Map<?, ?> resultado = cloudinary.uploader().upload(
                    arquivo.getBytes(),
                    ObjectUtils.asMap("folder", "primordi/produtos")
            );
            return (String) resultado.get("secure_url");
        } catch (IOException e) {
            throw new BusinessException("Erro ao fazer upload da imagem");
        }
    }
}
