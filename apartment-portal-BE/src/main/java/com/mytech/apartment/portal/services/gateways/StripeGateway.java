package com.mytech.apartment.portal.services.gateways;

import com.mytech.apartment.portal.services.PaymentGateway;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class StripeGateway implements PaymentGateway {

    @Value("${payment.stripe.publishable-key}")
    private String publishableKey;

    @Value("${payment.stripe.secret-key}")
    private String secretKey;

    @Value("${payment.return.url}")
    private String returnUrl;

    @Override
    public Map<String, Object> createPayment(String orderId, Long amount, String orderInfo) {
        try {
            // Mock implementation cho demo
            String stripeUrl = "https://checkout.stripe.com/pay/cs_test_" + System.currentTimeMillis();

            Map<String, Object> response = new HashMap<>();
            response.put("orderId", orderId);
            response.put("payUrl", stripeUrl);
            response.put("amount", amount);
            response.put("status", "success");
            response.put("gateway", "stripe");
            return response;
        } catch (Exception e) {
            log.error("Error creating Stripe payment", e);
            throw new RuntimeException("Không thể tạo thanh toán Stripe: " + e.getMessage());
        }
    }

    @Override
    public boolean verifyCallback(Map<String, String> params) {
        // Mock verify
        return true;
    }

    @Override
    public Map<String, Object> checkPaymentStatus(String orderId) {
        Map<String, Object> response = new HashMap<>();
        response.put("orderId", orderId);
        response.put("status", "pending");
        response.put("gateway", "stripe");
        return response;
    }

    @Override
    public String getGatewayName() {
        return "Stripe";
    }
} 