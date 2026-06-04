package com.primordi.api.modules.auth.social;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class GoogleTokenInfo {

    /** Subject (ID único do usuário no Google) */
    private String sub;

    private String email;

    @JsonProperty("email_verified")
    private String emailVerified;

    private String name;

    @JsonProperty("given_name")
    private String givenName;

    @JsonProperty("family_name")
    private String familyName;

    private String picture;

    /** ID da aplicação — deve corresponder ao CLIENT_ID configurado */
    private String aud;

    /** Erro retornado pelo Google quando o token é inválido */
    @JsonProperty("error_description")
    private String errorDescription;

    public boolean isValid() {
        return sub != null && !sub.isBlank() && errorDescription == null;
    }

    public boolean isEmailVerified() {
        return "true".equalsIgnoreCase(emailVerified);
    }
}
