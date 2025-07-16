package com.mytech.apartment.portal.services.gateways;

import com.mytech.apartment.portal.services.PaymentGateway;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class ZaloPayGateway implements PaymentGateway {

    @Value("${payment.zalopay.endpoint}")
    private String endpoint;

    @Value("${payment.zalopay.app-id}")
    private String appId;

    @Value("${payment.zalopay.key1}")
    private String key1;

    @Value("${payment.zalopay.key2}")
    private String key2;

    @Value("${payment.return.url}")
    private String returnUrl;

    @Override
    public Map<String, Object> createPayment(String orderId, Long amount, String orderInfo) {
        try {
            String appUser = "ApartmentPortal";
            String appTime = String.valueOf(System.currentTimeMillis());
            String amountStr = String.valueOf(amount);
            String appTransId = orderId;
            String embedData = "{}";
            String item = "[]";
            String bankCode = "zalopayapp";

            // Tạo chuỗi hmac
            String data = appId + "|" + appTransId + "|" + appUser + "|" + amountStr + "|" + appTime + "|" + embedData + "|" + item;
            String mac = generateHmacSHA256(data, key1);

            // Tạo request body
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("app_id", appId);
            requestBody.put("app_user", appUser);
            requestBody.put("app_time", appTime);
            requestBody.put("amount", amountStr);
            requestBody.put("app_trans_id", appTransId);
            requestBody.put("embed_data", embedData);
            requestBody.put("item", item);
            requestBody.put("bank_code", bankCode);
            requestBody.put("description", orderInfo);
            requestBody.put("mac", mac);

            // Trong thực tế, bạn sẽ gọi API ZaloPay ở đây
            // String response = restTemplate.postForObject(endpoint, requestBody, String.class);
            
            // Mock response cho demo
            Map<String, Object> response = new HashMap<>();
            response.put("orderId", orderId);
            response.put("payUrl", "https://sandbox.zalopay.com.vn/v001/tpe/createorder?app_id=" + appId);
            response.put("amount", amount);
            response.put("status", "success");
            response.put("gateway", "zalopay");

            return response;
        } catch (Exception e) {
            log.error("Error creating ZaloPay payment", e);
            throw new RuntimeException("Không thể tạo thanh toán ZaloPay: " + e.getMessage());
        }
    }

    @Override
    public boolean verifyCallback(Map<String, String> params) {
        try {
            String appTransId = params.get("app_trans_id");
            String amount = params.get("amount");
            String appTime = params.get("app_time");
            String mac = params.get("mac");

            // Tạo chuỗi hmac để verify
            String data = appId + "|" + appTransId + "|" + amount + "|" + appTime;
            String expectedMac = generateHmacSHA256(data, key2);

            return expectedMac.equals(mac);
        } catch (Exception e) {
            log.error("Error verifying ZaloPay callback", e);
            return false;
        }
    }

    @Override
    public Map<String, Object> checkPaymentStatus(String orderId) {
        try {
            // Trong thực tế, bạn sẽ gọi API ZaloPay để kiểm tra trạng thái
            Map<String, Object> response = new HashMap<>();
            response.put("orderId", orderId);
            response.put("status", "pending");
            response.put("gateway", "zalopay");
            return response;
        } catch (Exception e) {
            log.error("Error checking ZaloPay payment status", e);
            throw new RuntimeException("Không thể kiểm tra trạng thái thanh toán ZaloPay");
        }
    }

    @Override
    public String getGatewayName() {
        return "ZaloPay";
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