package com.mytech.apartment.portal.services.gateways;

import com.mytech.apartment.portal.config.StripeConfig;
import com.mytech.apartment.portal.services.PaymentGateway;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Slf4j
public class StripeGateway implements PaymentGateway {

    @Autowired
    private StripeConfig stripeConfig;

    @Override
    public Map<String, Object> createPayment(String orderId, Long amount, String orderInfo) {
        return createPayment(orderId, amount, orderInfo, null, null);
    }

    public Map<String, Object> createPayment(String orderId, Long amount, String orderInfo, Long invoiceId, Long userId) {
        try {
            log.info("=== CREATING STRIPE PAYMENT SESSION ===");
            log.info("Order ID: {}", orderId);
            log.info("Amount: {}", amount);
            log.info("Order Info: {}", orderInfo);
            
            // Validate input parameters
            if (orderId == null || orderId.trim().isEmpty()) {
                throw new IllegalArgumentException("Order ID cannot be null or empty");
            }
            if (amount == null || amount <= 0) {
                throw new IllegalArgumentException("Amount must be positive");
            }
            if (orderInfo == null || orderInfo.trim().isEmpty()) {
                throw new IllegalArgumentException("Order info cannot be null or empty");
            }
            
            // Use provided invoiceId and userId if available, otherwise parse from orderInfo
            Long parsedInvoiceId = invoiceId;
            Long parsedUserId = userId;
            
            if (parsedInvoiceId == null || parsedUserId == null) {
                log.info("Parsing orderInfo for missing data: {}", orderInfo);
                
                if (parsedInvoiceId == null) {
                    // Parse invoiceId using regex - look for "hóa đơn" followed by a number
                    // But avoid matching year patterns like "2024-11"
                    Pattern invoicePattern = Pattern.compile("hóa đơn\\s*(\\d{1,3})(?!-\\d{2})");
                    Matcher invoiceMatcher = invoicePattern.matcher(orderInfo);
                    if (invoiceMatcher.find()) {
                        String matchedId = invoiceMatcher.group(1);
                        // Check if this looks like a year (4 digits starting with 20xx)
                        if (matchedId.length() == 4 && matchedId.startsWith("20")) {
                            log.info("Skipping year pattern: {}", matchedId);
                        } else {
                            parsedInvoiceId = Long.parseLong(matchedId);
                            log.info("Parsed invoiceId from orderInfo: {}", parsedInvoiceId);
                        }
                    } else {
                        // Try alternative patterns for encoding issues
                        Pattern altPattern1 = Pattern.compile("Ä'Æ¡n\\s*(\\d{1,3})(?!-\\d{2})");
                        Matcher altMatcher1 = altPattern1.matcher(orderInfo);
                        if (altMatcher1.find()) {
                            String matchedId = altMatcher1.group(1);
                            if (matchedId.length() == 4 && matchedId.startsWith("20")) {
                                log.info("Skipping year pattern (alt1): {}", matchedId);
                            } else {
                                parsedInvoiceId = Long.parseLong(matchedId);
                                log.info("Parsed invoiceId from orderInfo (alt1): {}", parsedInvoiceId);
                            }
                        } else {
                            log.warn("Could not parse invoiceId from orderInfo: {}", orderInfo);
                        }
                    }
                }
                
                if (parsedUserId == null) {
                    // Parse userId using regex
                    Pattern userPattern = Pattern.compile("User\\s*(\\d+)");
                    Matcher userMatcher = userPattern.matcher(orderInfo);
                    if (userMatcher.find()) {
                        parsedUserId = Long.parseLong(userMatcher.group(1));
                        log.info("Parsed userId from orderInfo: {}", parsedUserId);
                    } else {
                        log.warn("Could not parse userId from orderInfo: {}", orderInfo);
                    }
                }
            }
            
            log.info("Final values - invoiceId: {}, userId: {}", parsedInvoiceId, parsedUserId);
            
            // Validate currency and amount
            String currency = "vnd";
            if (amount < 1000) {
                log.warn("Amount {} is very small for VND currency", amount);
            }
            if (amount > 100000000) {
                log.warn("Amount {} is very large for VND currency", amount);
            }
            
            // Create Stripe Checkout Session with enhanced configuration
            SessionCreateParams.Builder paramsBuilder = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(stripeConfig.getSuccessUrl() + "?session_id={CHECKOUT_SESSION_ID}&orderId=" + orderId)
                .setCancelUrl(stripeConfig.getCancelUrl() + "?orderId=" + orderId)
                .addLineItem(SessionCreateParams.LineItem.builder()
                    .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                        .setCurrency(currency)
                        .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                            .setName("Thanh toán hóa đơn")
                            .setDescription(orderInfo != null ? orderInfo : "Thanh toán dịch vụ chung cư")
                            .build())
                        .setUnitAmount(amount)
                        .build())
                    .setQuantity(1L)
                    .build())
                .putMetadata("orderId", orderId)
                .putMetadata("invoiceId", parsedInvoiceId != null ? parsedInvoiceId.toString() : "")
                .putMetadata("userId", parsedUserId != null ? parsedUserId.toString() : "")
                .putMetadata("orderInfo", orderInfo != null ? orderInfo : "")
                .putMetadata("createdAt", String.valueOf(System.currentTimeMillis()))
                .putMetadata("gateway", "stripe")
                .addPaymentMethodType(SessionCreateParams.PaymentMethodType.CARD)
                .setBillingAddressCollection(SessionCreateParams.BillingAddressCollection.REQUIRED)
                .setLocale(SessionCreateParams.Locale.VI)
                .setSubmitType(SessionCreateParams.SubmitType.PAY);

            // Add customer email collection for better tracking
            paramsBuilder.setCustomerCreation(SessionCreateParams.CustomerCreation.ALWAYS);

            Session session = Session.create(paramsBuilder.build());
            
            log.info("=== STRIPE SESSION CREATED SUCCESSFULLY ===");
            log.info("Session ID: {}", session.getId());
            log.info("Order ID: {}", orderId);
            log.info("Invoice ID: {}", parsedInvoiceId);
            log.info("User ID: {}", parsedUserId);
            log.info("Amount: {}", amount);
            log.info("Currency: {}", currency);
            log.info("Metadata: {}", session.getMetadata());
            log.info("Success URL: {}", session.getSuccessUrl());
            log.info("Cancel URL: {}", session.getCancelUrl());
            log.info("Payment URL: {}", session.getUrl());
            log.info("=== END STRIPE SESSION INFO ===");

            Map<String, Object> response = new HashMap<>();
            response.put("orderId", orderId);
            response.put("payUrl", session.getUrl());
            response.put("amount", amount);
            response.put("currency", currency);
            response.put("status", "success");
            response.put("gateway", "stripe");
            response.put("checkoutSessionId", session.getId());
            response.put("invoiceId", parsedInvoiceId);
            response.put("userId", parsedUserId);
            response.put("metadata", session.getMetadata());

            // Ghi audit vào payment_transactions (PENDING) để thống nhất tracking
            try {
                com.mytech.apartment.portal.entities.PaymentTransaction tx = new com.mytech.apartment.portal.entities.PaymentTransaction();
                tx.setTransactionRef(session.getId());
                tx.setInvoiceId(parsedInvoiceId);
                tx.setPaidByUserId(parsedUserId);
                tx.setAmount(amount);
                tx.setGateway("STRIPE");
                tx.setOrderInfo(orderInfo);
                tx.setStatus(com.mytech.apartment.portal.entities.PaymentTransaction.STATUS_PENDING);
                tx.setCreatedAt(java.time.LocalDateTime.now());
                tx.setUpdatedAt(java.time.LocalDateTime.now());
                // Lưu qua service tĩnh đơn giản bằng Spring context là phức tạp; ở đây trả kèm để BE caller lưu
                response.put("__transactionForAudit", tx);
            } catch (Exception ignore) {}
            
            return response;
            
        } catch (StripeException e) {
            log.error("Stripe API error creating payment", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("gateway", "stripe");
            errorResponse.put("error_type", e.getClass().getSimpleName());
            errorResponse.put("error_message", e.getMessage());
            errorResponse.put("orderId", orderId);
            errorResponse.put("amount", amount);
            
            // Handle specific Stripe errors
            if (e.getMessage().contains("amount_too_small")) {
                errorResponse.put("user_message", "Số tiền thanh toán quá nhỏ");
            } else if (e.getMessage().contains("amount_too_large")) {
                errorResponse.put("user_message", "Số tiền thanh toán quá lớn");
            } else if (e.getMessage().contains("invalid_currency")) {
                errorResponse.put("user_message", "Loại tiền tệ không hợp lệ");
            } else if (e.getMessage().contains("invalid_payment_method")) {
                errorResponse.put("user_message", "Phương thức thanh toán không hợp lệ");
            } else {
                errorResponse.put("user_message", "Lỗi thanh toán: " + e.getMessage());
            }
            
            throw new RuntimeException("Lỗi Stripe API: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            log.error("Invalid input parameters", e);
            throw new RuntimeException("Tham số đầu vào không hợp lệ: " + e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error creating Stripe payment", e);
            throw new RuntimeException("Không thể tạo thanh toán Stripe: " + e.getMessage());
        }
    }

    @Override
    public boolean verifyCallback(Map<String, String> params) {
        try {
            log.info("=== VERIFYING STRIPE CALLBACK ===");
            
            // Verify webhook signature
            String signature = params.get("stripe-signature");
            String payload = params.get("payload");
            
            if (signature == null || payload == null) {
                log.warn("Missing Stripe webhook signature or payload");
                return false;
            }
            
            log.info("Signature: {}", signature);
            log.info("Payload length: {}", payload.length());
            
            // In production, verify webhook signature
            try {
                com.stripe.model.Event event = com.stripe.net.Webhook.constructEvent(
                    payload, signature, stripeConfig.getWebhookSecret());
                log.info("Webhook signature verified successfully");
                log.info("Event type: {}", event.getType());
                return true;
            } catch (com.stripe.exception.SignatureVerificationException e) {
                log.error("Webhook signature verification failed", e);
                return false;
            }
        } catch (Exception e) {
            log.error("Error verifying Stripe callback", e);
            return false;
        }
    }

    @Override
    public Map<String, Object> checkPaymentStatus(String orderId) {
        try {
            log.info("=== CHECKING STRIPE PAYMENT STATUS ===");
            log.info("Order ID: {}", orderId);
            
            // Retrieve session to check payment status
            Session session = Session.retrieve(orderId);
            
            log.info("Session ID: {}", session.getId());
            log.info("Payment Status: {}", session.getPaymentStatus());
            log.info("Amount Total: {}", session.getAmountTotal());
            log.info("Currency: {}", session.getCurrency());
            
            Map<String, Object> response = new HashMap<>();
            response.put("orderId", orderId);
            response.put("status", session.getPaymentStatus());
            response.put("gateway", "stripe");
            response.put("sessionId", session.getId());
            response.put("amount", session.getAmountTotal());
            response.put("currency", session.getCurrency());
            response.put("customerEmail", session.getCustomerEmail());
            response.put("metadata", session.getMetadata());
            response.put("created", session.getCreated());
            response.put("expiresAt", session.getExpiresAt());
            
            // Add detailed status information
            if ("paid".equals(session.getPaymentStatus())) {
                response.put("payment_completed", true);
                response.put("payment_date", session.getCreated());
            } else if ("unpaid".equals(session.getPaymentStatus())) {
                response.put("payment_completed", false);
                response.put("payment_failed", true);
            } else if ("pending".equals(session.getPaymentStatus())) {
                response.put("payment_completed", false);
                response.put("payment_pending", true);
            }
            
            log.info("=== PAYMENT STATUS CHECK COMPLETED ===");
            return response;
        } catch (StripeException e) {
            log.error("Error checking Stripe payment status", e);
            Map<String, Object> response = new HashMap<>();
            response.put("orderId", orderId);
            response.put("status", "error");
            response.put("gateway", "stripe");
            response.put("error", e.getMessage());
            response.put("error_type", e.getClass().getSimpleName());
            return response;
        }
    }

    @Override
    public String getGatewayName() {
        return "Stripe";
    }
    
    /**
     * Get comprehensive test information for Stripe
     * Lấy thông tin test toàn diện cho Stripe
     */
    public Map<String, Object> getTestInformation() {
        Map<String, Object> testInfo = new HashMap<>();
        
        // Test cards
        Map<String, String> testCards = new HashMap<>();
        testCards.put("visa_success", "4242424242424242");
        testCards.put("visa_declined", "4000000000000002");
        testCards.put("mastercard_success", "5555555555554444");
        testCards.put("amex_success", "378282246310005");
        testCards.put("requires_authentication", "4000002500003155");
        testCards.put("insufficient_funds", "4000000000009995");
        testCards.put("expired_card", "4000000000000069");
        testCards.put("incorrect_cvc", "4000000000000127");
        testInfo.put("test_cards", testCards);
        
        // Test amounts
        Map<String, List<Long>> testAmounts = new HashMap<>();
        testAmounts.put("vnd", List.of(10000L, 50000L, 100000L, 500000L, 1000000L));
        testAmounts.put("usd", List.of(100L, 500L, 1000L, 5000L, 10000L));
        testInfo.put("test_amounts", testAmounts);
        
        // Test scenarios
        Map<String, String> testScenarios = new HashMap<>();
        testScenarios.put("successful_payment", "Use any card ending in 4242, 4444, or 0005");
        testScenarios.put("declined_payment", "Use any card ending in 0002, 9995, 0069, or 0127");
        testScenarios.put("3d_secure", "Use card ending in 3155 for 3D Secure testing");
        testScenarios.put("fraudulent", "Use card ending in 0019 to simulate fraud");
        testInfo.put("test_scenarios", testScenarios);
        
        // Configuration info
        Map<String, Object> configInfo = new HashMap<>();
        configInfo.put("currency", "vnd");
        configInfo.put("locale", "vi");
        configInfo.put("billing_address_required", true);
        configInfo.put("customer_creation", "always");
        configInfo.put("payment_method_collection", "always");
        testInfo.put("configuration", configInfo);
        
        return testInfo;
    }
} 