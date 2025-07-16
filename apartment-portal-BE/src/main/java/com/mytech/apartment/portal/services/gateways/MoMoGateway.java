package com.mytech.apartment.portal.services.gateways;

import com.mytech.apartment.portal.services.PaymentGateway;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class MoMoGateway implements PaymentGateway {

    @Value("${payment.momo.endpoint}")
    private String endpoint;

    @Value("${payment.momo.partner-code}")
    private String partnerCode;

    @Value("${payment.momo.access-key}")
    private String accessKey;

    @Value("${payment.momo.secret-key}")
    private String secretKey;

    @Value("${payment.return.url}")
    private String returnUrl;

    @Override
    public Map<String, Object> createPayment(String orderId, Long amount, String orderInfo) {
        try {
            String requestId = String.valueOf(System.currentTimeMillis());
            String orderType = "momo_wallet";
            String extraData = "";

            // Tạo chuỗi signature
            String rawSignature = "accessKey=" + accessKey +
                    "&amount=" + amount +
                    "&extraData=" + extraData +
                    "&ipnUrl=" + returnUrl + "/momo/callback" +
                    "&orderId=" + orderId +
                    "&orderInfo=" + orderInfo +
                    "&partnerCode=" + partnerCode +
                    "&redirectUrl=" + returnUrl + "/success" +
                    "&requestId=" + requestId +
                    "&requestType=" + "captureWallet";

            String signature = generateHmacSHA256(rawSignature, secretKey);

            // Tạo request body
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("partnerCode", partnerCode);
            requestBody.put("partnerName", "Apartment Portal");
            requestBody.put("storeId", "Apartment Store");
            requestBody.put("requestId", requestId);
            requestBody.put("amount", amount);
            requestBody.put("orderId", orderId);
            requestBody.put("orderInfo", orderInfo);
            requestBody.put("redirectUrl", returnUrl + "/success");
            requestBody.put("ipnUrl", returnUrl + "/momo/callback");
            requestBody.put("lang", "vi");
            requestBody.put("extraData", extraData);
            requestBody.put("requestType", "captureWallet");
            requestBody.put("signature", signature);

            // Trong thực tế, bạn sẽ gọi API MoMo ở đây
            // String response = restTemplate.postForObject(endpoint, requestBody, String.class);
            
            // Mock response cho demo
            Map<String, Object> response = new HashMap<>();
            response.put("requestId", requestId);
            response.put("orderId", orderId);
            response.put("payUrl", "https://test-payment.momo.vn/v2/gateway/api/create?orderId=" + orderId);
            response.put("signature", signature);
            response.put("status", "success");
            response.put("gateway", "momo");

            return response;
        } catch (Exception e) {
            log.error("Error creating MoMo payment", e);
            throw new RuntimeException("Không thể tạo thanh toán MoMo: " + e.getMessage());
        }
    }

    @Override
    public boolean verifyCallback(Map<String, String> params) {
        try {
            String orderId = params.get("orderId");
            String resultCode = params.get("resultCode");
            String message = params.get("message");
            String signature = params.get("signature");

            // Tạo chuỗi signature để verify
            String rawSignature = "accessKey=" + accessKey +
                    "&amount=" + params.get("amount") +
                    "&extraData=" + params.get("extraData") +
                    "&message=" + message +
                    "&orderId=" + orderId +
                    "&orderInfo=" + params.get("orderInfo") +
                    "&orderType=" + params.get("orderType") +
                    "&partnerCode=" + partnerCode +
                    "&payType=" + params.get("payType") +
                    "&requestId=" + params.get("requestId") +
                    "&responseTime=" + params.get("responseTime") +
                    "&resultCode=" + resultCode +
                    "&transId=" + params.get("transId");

            String expectedSignature = generateHmacSHA256(rawSignature, secretKey);
            return expectedSignature.equals(signature);
        } catch (Exception e) {
            log.error("Error verifying MoMo callback", e);
            return false;
        }
    }

    @Override
    public Map<String, Object> checkPaymentStatus(String orderId) {
        try {
            // Trong thực tế, bạn sẽ gọi API MoMo để kiểm tra trạng thái
            Map<String, Object> response = new HashMap<>();
            response.put("orderId", orderId);
            response.put("status", "pending");
            response.put("gateway", "momo");
            return response;
        } catch (Exception e) {
            log.error("Error checking MoMo payment status", e);
            throw new RuntimeException("Không thể kiểm tra trạng thái thanh toán MoMo");
        }
    }

    @Override
    public String getGatewayName() {
        return "MoMo";
    }

    private String generateHmacSHA256(String data, String key) {
        try {
            javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
            javax.crypto.spec.SecretKeySpec secretKeySpec = new javax.crypto.spec.SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(hash);
        } catch (Exception e) {
            throw new RuntimeException("Error generating HMAC SHA256", e);
        }
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder result = new StringBuilder();
        for (byte b : bytes) {
            result.append(String.format("%02x", b));
        }
        return result.toString();
    }
} 