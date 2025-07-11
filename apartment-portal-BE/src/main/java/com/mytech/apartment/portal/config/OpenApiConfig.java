package com.mytech.apartment.portal.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI apiInfo() {
        return new OpenAPI()
            .info(new Info()
                .title("Apartment Portal API")
                .version("v1.0.0")
                .description("API documentation for Apartment Management Portal")
                .contact(new Contact()
                    .name("Your Name")
                    .email("you@example.com")
                )
            );
    }
}
