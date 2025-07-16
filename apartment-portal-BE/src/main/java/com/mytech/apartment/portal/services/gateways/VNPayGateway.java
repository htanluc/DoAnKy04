package com.mytech.apartment.portal.services.gateways;

import com.mytech.apartment.portal.services.PaymentGateway;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class VNPayGateway implements PaymentGateway {

    @Value("${payment.vnpay.endpoint}")
    private String endpoint;

    @Value("${payment.vnpay.tmn-code}")
    private String tmnCode;

    @Value("${payment.vnpay.hash-secret}")
    private String hashSecret;

    @Value("${payment.return.url}")
    private String returnUrl;

    @Override
    public Map<String, Object> createPayment(String orderId, Long amount, String orderInfo) {
        try {
            String vnp_Version = "2.1.0";
            String vnp_Command = "pay";
            String vnp_TxnRef = orderId;
            String vnp_IpAddr = "127.0.0.1";
            String vnp_Amount = String.valueOf(amount * 100); // VNPay tính bằng xu
            String vnp_CurrCode = "VND";
            String vnp_BankCode = "";
            String vnp_Locale = "vn";
            String vnp_OrderType = "other";
            String vnp_ReturnUrl = returnUrl + "/vnpay/callback";
            String vnp_TxnTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));

            // Tạo chuỗi hash data
            String hashData = vnp_Version + "|" + vnp_Command + "|" + tmnCode + "|" + vnp_Amount + "|" + vnp_CurrCode + "|" + vnp_BankCode + "|" + vnp_Locale + "|" + orderInfo + "|" + vnp_OrderType + "|" + vnp_ReturnUrl + "|" + vnp_TxnRef + "|" + vnp_TxnTime + "|" + vnp_IpAddr;
            String vnp_SecureHash = generateHmacSHA512(hashData, hashSecret);

            // Tạo URL thanh toán
            String paymentUrl = endpoint + "?" +
                    "vnp_Version=" + vnp_Version +
                    "&vnp_Command=" + vnp_Command +
                    "&vnp_TmnCode=" + tmnCode +
                    "&vnp_Amount=" + vnp_Amount +
                    "&vnp_CurrCode=" + vnp_CurrCode +
                    "&vnp_BankCode=" + vnp_BankCode +
                    "&vnp_Locale=" + vnp_Locale +
                    "&vnp_OrderInfo=" + URLEncoder.encode(orderInfo, StandardCharsets.UTF_8.toString()) +
                    "&vnp_OrderType=" + vnp_OrderType +
                    "&vnp_ReturnUrl=" + URLEncoder.encode(vnp_ReturnUrl, StandardCharsets.UTF_8.toString()) +
                    "&vnp_TxnRef=" + vnp_TxnRef +
                    "&vnp_TxnTime=" + vnp_TxnTime +
                    "&vnp_IpAddr=" + vnp_IpAddr +
                    "&vnp_SecureHash=" + vnp_SecureHash;

            Map<String, Object> response = new HashMap<>();
            response.put("orderId", orderId);
            response.put("payUrl", paymentUrl);
            response.put("amount", amount);
            response.put("status", "success");
            response.put("gateway", "vnpay");

            return response;
        } catch (Exception e) {
            log.error("Error creating VNPay payment", e);
            throw new RuntimeException("Không thể tạo thanh toán VNPay: " + e.getMessage());
        }
    }

    public Map<String, Object> createPaymentWithParams(Map<String, String> params) {
        try {
            // Validate required fields
            String[] required = {"vnp_TmnCode", "vnp_Amount", "vnp_Command", "vnp_CreateDate", "vnp_CurrCode", "vnp_IpAddr", "vnp_Locale", "vnp_OrderInfo", "vnp_OrderType", "vnp_ReturnUrl", "vnp_TxnRef"};
            for (String key : required) {
                if (!params.containsKey(key) || params.get(key) == null || params.get(key).isEmpty()) {
                    throw new IllegalArgumentException("Thiếu trường bắt buộc: " + key);
                }
            }
            // Build hashData string theo chuẩn VNPay (cần đúng thứ tự, tuỳ config)
            StringBuilder hashData = new StringBuilder();
            for (String key : required) {
                if (hashData.length() > 0) hashData.append('|');
                hashData.append(params.get(key));
            }
            String vnp_SecureHash = generateHmacSHA512(hashData.toString(), hashSecret);
            // Build URL
            StringBuilder url = new StringBuilder(endpoint + "?");
            for (String key : required) {
                url.append(key).append("=").append(URLEncoder.encode(params.get(key), StandardCharsets.UTF_8)).append("&");
            }
            url.append("vnp_SecureHash=").append(vnp_SecureHash);
            Map<String, Object> response = new HashMap<>();
            response.put("payUrl", url.toString());
            response.put("status", "success");
            return response;
        } catch (Exception e) {
            log.error("Error creating VNPay payment with params", e);
            throw new RuntimeException("Không thể tạo thanh toán VNPay: " + e.getMessage());
        }
    }

    @Override
    public boolean verifyCallback(Map<String, String> params) {
        try {
            String vnp_SecureHash = params.get("vnp_SecureHash");
            String vnp_TxnRef = params.get("vnp_TxnRef");
            String vnp_Amount = params.get("vnp_Amount");
            String vnp_OrderInfo = params.get("vnp_OrderInfo");
            String vnp_ResponseCode = params.get("vnp_ResponseCode");
            String vnp_TransactionNo = params.get("vnp_TransactionNo");
            String vnp_TransactionStatus = params.get("vnp_TransactionStatus");
            String vnp_TxnTime = params.get("vnp_TxnTime");

            // Tạo chuỗi hash để verify
            String hashData = vnp_TxnRef + "|" + vnp_Amount + "|" + vnp_OrderInfo + "|" + vnp_ResponseCode + "|" + vnp_TransactionNo + "|" + vnp_TransactionStatus + "|" + vnp_TxnTime;
            String expectedHash = generateHmacSHA512(hashData, hashSecret);

            return expectedHash.equals(vnp_SecureHash);
        } catch (Exception e) {
            log.error("Error verifying VNPay callback", e);
            return false;
        }
    }

    @Override
    public Map<String, Object> checkPaymentStatus(String orderId) {
        try {
            // Trong thực tế, bạn sẽ gọi API VNPay để kiểm tra trạng thái
            Map<String, Object> response = new HashMap<>();
            response.put("orderId", orderId);
            response.put("status", "pending");
            response.put("gateway", "vnpay");
            return response;
        } catch (Exception e) {
            log.error("Error checking VNPay payment status", e);
            throw new RuntimeException("Không thể kiểm tra trạng thái thanh toán VNPay");
        }
    }

    @Override
    public String getGatewayName() {
        return "VNPay";
    }

    // Đổi thành public static để gọi từ service ngoài
    public static String generateHmacSHA512(String key, String data) {
        try {
            if (key == null || data == null) {
                throw new NullPointerException();
            }
            final javax.crypto.Mac hmac512 = javax.crypto.Mac.getInstance("HmacSHA512");
            byte[] hmacKeyBytes = key.getBytes();
            final javax.crypto.spec.SecretKeySpec secretKey = new javax.crypto.spec.SecretKeySpec(hmacKeyBytes, "HmacSHA512");
            hmac512.init(secretKey);
            byte[] dataBytes = data.getBytes(java.nio.charset.StandardCharsets.UTF_8);
            byte[] result = hmac512.doFinal(dataBytes);
            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();
        } catch (Exception ex) {
            return "";
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