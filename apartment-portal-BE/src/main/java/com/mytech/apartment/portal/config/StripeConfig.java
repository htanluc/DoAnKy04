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
        Stripe.apiKey = secretKey;
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