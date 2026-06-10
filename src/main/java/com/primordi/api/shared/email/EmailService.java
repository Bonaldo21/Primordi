package com.primordi.api.shared.email;

import com.resend.Resend;
import com.resend.services.emails.model.CreateEmailOptions;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailService {

    private final Resend resend; // null se RESEND_API_KEY não configurado
    private final String from;
    private final String frontendUrl;

    public EmailService(
            @Value("${primordi.email.resend-api-key:}") String apiKey,
            @Value("${primordi.email.from}") String from,
            @Value("${primordi.email.frontend-url}") String frontendUrl) {
        this.resend = (apiKey != null && !apiKey.isBlank()) ? new Resend(apiKey) : null;
        this.from = from;
        this.frontendUrl = frontendUrl;
    }

    public void enviarVerificacaoEmail(String destinatario, String nome, String token) {
        if (resend == null) {
            log.warn("RESEND_API_KEY não configurado — e-mail de verificação não enviado para {}", destinatario);
            return;
        }
        String link = frontendUrl + "/verificar-email?token=" + token;

        String html = """
                <div style="font-family:sans-serif;max-width:520px;margin:auto">
                  <h2 style="color:#4a2c0a">Confirme seu e-mail — Primordi Couro</h2>
                  <p>Olá, <strong>%s</strong>!</p>
                  <p>Clique no botão abaixo para confirmar seu e-mail. O link é válido por 24 horas.</p>
                  <a href="%s"
                     style="display:inline-block;padding:12px 24px;background:#4a2c0a;color:#fff;
                            text-decoration:none;border-radius:6px;font-weight:bold">
                    Confirmar e-mail
                  </a>
                  <p style="margin-top:24px;color:#888;font-size:13px">
                    Se você não criou uma conta na Primordi, ignore este e-mail.
                  </p>
                </div>
                """.formatted(nome, link);

        CreateEmailOptions options = CreateEmailOptions.builder()
                .from(from)
                .to(destinatario)
                .subject("Confirme seu e-mail — Primordi Couro")
                .html(html)
                .build();

        try {
            resend.emails().send(options);
            log.info("E-mail de verificação enviado para {}", destinatario);
        } catch (Exception e) {
            log.error("Falha ao enviar e-mail de verificação para {}: {}", destinatario, e.getMessage());
        }
    }
}
