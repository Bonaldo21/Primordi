package com.primordi.api.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    private static final String SECURITY_SCHEME_NAME = "bearerAuth";

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Primordi API — Loja de Couro")
                        .description("API REST para o e-commerce Primordi. " +
                                "Gerencia produtos, categorias, clientes, carrinho, pedidos, " +
                                "pagamentos e entregas.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Primordi")
                                .email("contato@primordi.com.br"))
                        .license(new License()
                                .name("Proprietário")
                                .url("https://primordi.com.br")))
                .servers(List.of(
                        new Server().url("http://localhost:8080/api").description("Local"),
                        new Server().url("https://api.primordi.com.br").description("Produção")
                ))
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME_NAME,
                                new SecurityScheme()
                                        .name(SECURITY_SCHEME_NAME)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Insira o token JWT obtido no endpoint /auth/login. " +
                                                "Formato: apenas o token, sem o prefixo 'Bearer '.")));
    }
}
