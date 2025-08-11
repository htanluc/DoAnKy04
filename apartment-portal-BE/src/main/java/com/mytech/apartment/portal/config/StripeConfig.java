package com.mytech.apartment.portal.config;

import com.stripe.Stripe;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;

@Configuration
public class StripeConfig {
    
    @Value("${payment.stripe.secret-key}")
    private String secretKey;
    
    @Value("${payment.stripe.publishable-key}")
    private String publishableKey;
    
    @Value("${payment.stripe.webhook-secret}")
    private String webhookSecret;
    
    @Value("${payment.stripe.success-url}")
    private String successUrl;
    
    @Value("${payment.stripe.cancel-url}")
    private String cancelUrl;
    
    @PostConstruct
    public void initStripe() {
        try {
            if (secretKey == null || secretKey.isBlank()) {
                System.out.println("StripeConfig: secret key is empty, skip Stripe initialization.");
                return;
            }
            // Tránh thực hiện bất kỳ call mạng nào ở startup. Chỉ set apiKey cục bộ.
            Stripe.apiKey = secretKey;
            System.out.println("StripeConfig: Stripe API key set. Initialization completed safely.");
        } catch (Throwable t) {
            // Không fail app nếu môi trường DEV/offline
            System.err.println("StripeConfig: skip initialization due to: " + t.getMessage());
        }
    }
    
    public String getSecretKey() {
        return secretKey;
    }
    
    public String getPublishableKey() {
        return publishableKey;
    }
    
    public String getWebhookSecret() {
        return webhookSecret;
    }
    
    public String getSuccessUrl() {
        return successUrl;
    }
    
    public String getCancelUrl() {
        return cancelUrl;
    }
} 