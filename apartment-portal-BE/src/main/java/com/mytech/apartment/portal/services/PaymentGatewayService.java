package com.mytech.apartment.portal.services;

import com.mytech.apartment.portal.dtos.PaymentGatewayRequest;
import com.mytech.apartment.portal.dtos.PaymentGatewayResponse;
import com.mytech.apartment.portal.models.Payment;
import com.mytech.apartment.portal.models.Invoice;
import com.mytech.apartment.portal.models.User;
import com.mytech.apartment.portal.repositories.PaymentRepository;
import com.mytech.apartment.portal.repositories.InvoiceRepository;
import com.mytech.apartment.portal.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.UUID;

import com.mytech.apartment.portal.models.enums.PaymentStatus;
import com.mytech.apartment.portal.models.enums.PaymentMethod;
import com.mytech.apartment.portal.models.enums.InvoiceStatus;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;
import com.mytech.apartment.portal.services.gateways.MoMoGateway;
import com.mytech.apartment.portal.services.gateways.VNPayGateway;
import com.mytech.apartment.portal.services.gateways.ZaloPayGateway;
import com.mytech.apartment.portal.services.gateways.PayPalGateway;
import com.mytech.apartment.portal.services.gateways.StripeGateway;

@Service
@Slf4j
public class PaymentGatewayService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MoMoGateway moMoGateway;
    @Autowired
    private VNPayGateway vnPayGateway;
    @Autowired
    private ZaloPayGateway zaloPayGateway;
    @Autowired
    private PayPalGateway payPalGateway;
    @Autowired
    private StripeGateway stripeGateway;

    @Value("${payment.momo.api.key:}")
    private String momoApiKey;

    @Value("${payment.vnpay.api.key:}")
    private String vnpayApiKey;

    @Value("${payment.return.url:http://localhost:3000/payment/callback}")
    private String returnUrl;

    @Value("${payment.momo.endpoint}")
    private String momoEndpoint;

    @Value("${payment.momo.partner-code}")
    private String momoPartnerCode;

    @Value("${payment.momo.access-key}")
    private String momoAccessKey;

    @Value("${payment.momo.secret-key}")
    private String momoSecretKey;

    @Value("${payment.vnpay.endpoint}")
    private String vnpayEndpoint;

    @Value("${payment.vnpay.tmn-code}")
    private String vnpayTmnCode;

    @Value("${payment.vnpay.hash-secret}")
    private String vnpayHashSecret;

    @Value("${payment.zalopay.endpoint}")
    private String zalopayEndpoint;

    @Value("${payment.zalopay.app-id}")
    private String zalopayAppId;

    @Value("${payment.zalopay.key1}")
    private String zalopayKey1;

    @Value("${payment.zalopay.key2}")
    private String zalopayKey2;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public PaymentGatewayResponse createPayment(PaymentGatewayRequest request) {
        try {
            // Kiểm tra hóa đơn tồn tại
            Invoice invoice = invoiceRepository.findById(request.getInvoiceId())
                    .orElseThrow(() -> new RuntimeException("Invoice not found"));

            // Lấy user hiện tại
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Tạo transaction ID
            String transactionId = generateTransactionId();

            // Tạo payment record
            Payment payment = new Payment();
            payment.setInvoice(invoice);
            payment.setPaidByUserId(user.getId());
            payment.setAmount(request.getAmount());
            payment.setMethod(PaymentMethod.valueOf(request.getPaymentMethod()));
            payment.setStatus(PaymentStatus.PENDING);
            payment.setReferenceCode(transactionId);
            payment.setPaymentDate(LocalDateTime.now());

            paymentRepository.save(payment);

            // Tạo payment URL dựa trên phương thức
            String paymentUrl = createPaymentUrl(request, transactionId);

            return new PaymentGatewayResponse(
                transactionId,
                paymentUrl,
                "PENDING",
                "Payment created successfully",
                null // QR code sẽ được tạo sau
            );

        } catch (Exception e) {
            throw new RuntimeException("Failed to create payment: " + e.getMessage());
        }
    }

    public void processCallback(String transactionId, String status, String message) {
        try {
            Payment payment = paymentRepository.findByReferenceCode(transactionId)
                    .orElseThrow(() -> new RuntimeException("Payment not found"));

            // Cập nhật trạng thái payment
            payment.setStatus(PaymentStatus.valueOf(status));
            payment.setPaymentDate(LocalDateTime.now());

            // Nếu thanh toán thành công, cập nhật trạng thái hóa đơn
            if (PaymentStatus.SUCCESS.name().equals(status)) {
                Invoice invoice = payment.getInvoice();
                invoice.setStatus(InvoiceStatus.PAID);
                invoiceRepository.save(invoice);
            }

            paymentRepository.save(payment);

        } catch (Exception e) {
            throw new RuntimeException("Failed to process callback: " + e.getMessage());
        }
    }

    public PaymentGatewayResponse checkPaymentStatus(String transactionId) {
        try {
            Payment payment = paymentRepository.findByReferenceCode(transactionId)
                    .orElseThrow(() -> new RuntimeException("Payment not found"));

            return new PaymentGatewayResponse(
                transactionId,
                null,
                payment.getStatus().name(),
                "Payment status retrieved",
                null
            );

        } catch (Exception e) {
            throw new RuntimeException("Failed to check payment status: " + e.getMessage());
        }
    }

    private String generateTransactionId() {
        return "TXN_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8);
    }

    private String createPaymentUrl(PaymentGatewayRequest request, String transactionId) {
        switch (request.getPaymentMethod().toUpperCase()) {
            case "MOMO":
                return createMoMoPaymentUrl(request, transactionId);
            case "VNPAY":
                return createVNPayPaymentUrl(request, transactionId);
            case "BANK_TRANSFER":
                return createBankTransferUrl(request, transactionId);
            case "CREDIT_CARD":
                return createCreditCardUrl(request, transactionId);
            default:
                throw new RuntimeException("Unsupported payment method: " + request.getPaymentMethod());
        }
    }

    private String createMoMoPaymentUrl(PaymentGatewayRequest request, String transactionId) {
        // Trong thực tế, bạn sẽ tích hợp với MoMo API
        // Ở đây tôi chỉ tạo URL demo
        return "https://payment.momo.vn/pay?transactionId=" + transactionId + 
               "&amount=" + request.getAmount() + 
               "&returnUrl=" + returnUrl;
    }

    private String createVNPayPaymentUrl(PaymentGatewayRequest request, String transactionId) {
        // Trong thực tế, bạn sẽ tích hợp với VNPay API
        return "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?transactionId=" + transactionId + 
               "&amount=" + request.getAmount() + 
               "&returnUrl=" + returnUrl;
    }

    private String createBankTransferUrl(PaymentGatewayRequest request, String transactionId) {
        // Trả về thông tin chuyển khoản
        return "bank://transfer?account=123456789&amount=" + request.getAmount() + 
               "&content=" + transactionId;
    }

    private String createCreditCardUrl(PaymentGatewayRequest request, String transactionId) {
        // Trong thực tế, bạn sẽ tích hợp với cổng thanh toán thẻ
        return "https://payment.gateway.com/pay?transactionId=" + transactionId + 
               "&amount=" + request.getAmount() + 
               "&returnUrl=" + returnUrl;
    }

    /**
     * Tạo thanh toán MoMo
     */
    public Map<String, Object> createMoMoPayment(String orderId, Long amount, String orderInfo) {
        return moMoGateway.createPayment(orderId, amount, orderInfo);
    }

    /**
     * Tạo thanh toán VNPay
     */
    public Map<String, Object> createVNPayPayment(String orderId, Long amount, String orderInfo) {
        return vnPayGateway.createPayment(orderId, amount, orderInfo);
    }

    /**
     * Tạo thanh toán VNPay với các tham số chuẩn từ frontend
     */
    public Map<String, Object> createVNPayPaymentWithParams(Map<String, String> params) {
        return vnPayGateway.createPaymentWithParams(params);
    }

    /**
     * Tạo thanh toán VNPay chuẩn tài liệu mẫu: backend tự sinh các trường động, build hash, build URL
     */
    public Map<String, Object> createVNPayPaymentFull(Long amount, String orderInfo, String bankCode, String language) {
        try {
            String vnp_Version = "2.1.0";
            String vnp_Command = "pay";
            String vnp_TmnCode = vnpayTmnCode;
            String vnp_Amount = String.valueOf(amount * 100);
            String vnp_CurrCode = "VND";
            String vnp_TxnRef = String.valueOf(System.currentTimeMillis());
            String vnp_OrderInfo = orderInfo;
            String vnp_OrderType = "other";
            String vnp_Locale = (language != null && !language.isEmpty()) ? language : "vn";
            String vnp_ReturnUrl = returnUrl + "/vnpay-result";
            String vnp_IpAddr = "127.0.0.1";
            java.text.SimpleDateFormat formatter = new java.text.SimpleDateFormat("yyyyMMddHHmmss");
            java.util.Calendar cld = java.util.Calendar.getInstance(java.util.TimeZone.getTimeZone("Etc/GMT+7"));
            String vnp_CreateDate = formatter.format(cld.getTime());
            cld.add(java.util.Calendar.MINUTE, 15);
            String vnp_ExpireDate = formatter.format(cld.getTime());
            java.util.Map<String, String> vnp_Params = new java.util.HashMap<>();
            vnp_Params.put("vnp_Version", vnp_Version);
            vnp_Params.put("vnp_Command", vnp_Command);
            vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
            vnp_Params.put("vnp_Amount", vnp_Amount);
            vnp_Params.put("vnp_CurrCode", vnp_CurrCode);
            if (bankCode != null && !bankCode.isEmpty()) vnp_Params.put("vnp_BankCode", bankCode);
            vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
            vnp_Params.put("vnp_OrderInfo", vnp_OrderInfo);
            vnp_Params.put("vnp_OrderType", vnp_OrderType);
            vnp_Params.put("vnp_Locale", vnp_Locale);
            vnp_Params.put("vnp_ReturnUrl", vnp_ReturnUrl);
            vnp_Params.put("vnp_IpAddr", vnp_IpAddr);
            vnp_Params.put("vnp_CreateDate", vnp_CreateDate);
            vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);
            // Build hashData & query string
            java.util.List<String> fieldNames = new java.util.ArrayList<>(vnp_Params.keySet());
            java.util.Collections.sort(fieldNames);
            StringBuilder hashData = new StringBuilder();
            StringBuilder query = new StringBuilder();
            for (int i = 0; i < fieldNames.size(); i++) {
                String key = fieldNames.get(i);
                String value = vnp_Params.get(key);
                if (value != null && value.length() > 0) {
                    hashData.append(key).append("=").append(java.net.URLEncoder.encode(value, java.nio.charset.StandardCharsets.US_ASCII.toString()));
                    query.append(java.net.URLEncoder.encode(key, java.nio.charset.StandardCharsets.US_ASCII.toString()))
                        .append("=")
                        .append(java.net.URLEncoder.encode(value, java.nio.charset.StandardCharsets.US_ASCII.toString()));
                    if (i < fieldNames.size() - 1) {
                        hashData.append("&");
                        query.append("&");
                    }
                }
            }
            String vnp_SecureHash = com.mytech.apartment.portal.services.gateways.VNPayGateway.generateHmacSHA512(vnpayHashSecret, hashData.toString());
            query.append("&vnp_SecureHash=").append(vnp_SecureHash);
            String paymentUrl = vnpayEndpoint + "?" + query.toString();
            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("payUrl", paymentUrl);
            response.put("status", "success");
            return response;
        } catch (Exception e) {
            throw new RuntimeException("Không thể tạo thanh toán VNPay: " + e.getMessage());
        }
    }

    /**
     * Tạo thanh toán ZaloPay
     */
    public Map<String, Object> createZaloPayPayment(String orderId, Long amount, String orderInfo) {
        return zaloPayGateway.createPayment(orderId, amount, orderInfo);
    }

    /**
     * Tạo thanh toán Visa/Mastercard
     */
    public Map<String, Object> createVisaPayment(String orderId, Long amount, String orderInfo) {
        return stripeGateway.createPayment(orderId, amount, orderInfo);
    }

    public Map<String, Object> createPayPalPayment(String orderId, Long amount, String orderInfo) {
        return payPalGateway.createPayment(orderId, amount, orderInfo);
    }

    /**
     * Xác thực callback từ các cổng thanh toán
     */
    public boolean verifyPaymentCallback(String gateway, Map<String, String> params) {
        try {
            switch (gateway.toLowerCase()) {
                case "momo":
                    return verifyMoMoCallback(params);
                case "vnpay":
                    return verifyVNPayCallback(params);
                case "zalopay":
                    return verifyZaloPayCallback(params);
                default:
                    return false;
            }
        } catch (Exception e) {
            log.error("Error verifying payment callback", e);
            return false;
        }
    }

    private boolean verifyMoMoCallback(Map<String, String> params) {
        // Implement MoMo callback verification
        return true; // Mock implementation
    }

    private boolean verifyVNPayCallback(Map<String, String> params) {
        // Implement VNPay callback verification
        return true; // Mock implementation
    }

    private boolean verifyZaloPayCallback(Map<String, String> params) {
        // Implement ZaloPay callback verification
        return true; // Mock implementation
    }

    /**
     * Tạo HMAC SHA256
     */
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

    /**
     * Tạo HMAC SHA512
     */
    private String generateHmacSHA512(String data, String key) {
        try {
            javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA512");
            javax.crypto.spec.SecretKeySpec secretKeySpec = new javax.crypto.spec.SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(hash);
        } catch (Exception e) {
            throw new RuntimeException("Error generating HMAC SHA512", e);
        }
    }

    /**
     * Convert bytes to hex string
     */
    private String bytesToHex(byte[] bytes) {
        StringBuilder result = new StringBuilder();
        for (byte b : bytes) {
            result.append(String.format("%02x", b));
        }
        return result.toString();
    }

    /**
     * Tạo order ID ngẫu nhiên
     */
    public String generateOrderId() {
        return "ORDER" + System.currentTimeMillis() + new Random().nextInt(1000);
    }
} 