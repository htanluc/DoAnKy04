package com.mytech.apartment.portal.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve uploaded files from the uploads directory
        registry.addResourceHandler("/api/files/**")
                .addResourceLocations("file:uploads/");
        
        // Also serve from uploads directory directly for backward compatibility
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }
} 