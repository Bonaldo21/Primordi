package com.primordi.api.shared.storage;

import com.primordi.api.shared.exception.BusinessException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${primordi.upload.dir:uploads}")
    private String uploadDir;

    public String salvarImagem(MultipartFile arquivo) {
        if (arquivo == null || arquivo.isEmpty()) {
            throw new BusinessException("Arquivo de imagem é obrigatório");
        }

        String contentType = arquivo.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BusinessException("Somente arquivos de imagem são permitidos");
        }

        String extensao = extrairExtensao(arquivo.getOriginalFilename());
        String nomeArquivo = UUID.randomUUID() + extensao;

        try {
            Path pastaUpload = Path.of(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(pastaUpload);
            Path destino = pastaUpload.resolve(nomeArquivo);
            Files.copy(arquivo.getInputStream(), destino, StandardCopyOption.REPLACE_EXISTING);
            return nomeArquivo;
        } catch (IOException e) {
            throw new BusinessException("Erro ao salvar arquivo de imagem");
        }
    }

    private String extrairExtensao(String nomeOriginal) {
        if (nomeOriginal == null || nomeOriginal.isBlank()) {
            return ".bin";
        }

        int idx = nomeOriginal.lastIndexOf('.');
        if (idx < 0 || idx == nomeOriginal.length() - 1) {
            return ".bin";
        }

        String ext = nomeOriginal.substring(idx).toLowerCase(Locale.ROOT);
        if (!ext.matches("\\.[a-z0-9]{1,10}")) {
            return ".bin";
        }

        return ext;
    }
}
