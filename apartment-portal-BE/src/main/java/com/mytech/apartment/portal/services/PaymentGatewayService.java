package com.mytech.apartment.portal.services;

import com.mytech.apartment.portal.dtos.PaymentGatewayRequest;
import com.mytech.apartment.portal.dtos.PaymentGatewayResponse;
import com.mytech.apartment.portal.models.Payment;
import com.mytech.apartment.portal.models.Invoice;
import com.mytech.apartment.portal.models.User;
import com.mytech.apartment.portal.repositories.PaymentRepository;
import com.mytech.apartment.portal.services.PaymentService;
import com.mytech.apartment.portal.repositories.InvoiceRepository;
import com.mytech.apartment.portal.repositories.UserRepository;
import com.mytech.apartment.portal.services.UserService;
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
import com.mytech.apartment.portal.services.PaymentTransactionService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.http.ResponseEntity;
import com.mytech.apartment.portal.entities.PaymentTransaction;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import java.util.Optional;

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
    private UserService userService;

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

    @Autowired
    private PaymentTransactionService paymentTransactionService;

    @Autowired
    private PaymentService paymentService;

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

    // Removed deprecated passthrough method createVNPayPaymentWithParams - not needed

    /**
     * Tạo thanh toán VNPay chuẩn tài liệu mẫu: backend tự sinh các trường động, build hash, build URL
     */
    public Map<String, Object> createVNPayPaymentFull(Long amount, String orderInfo, String bankCode, String language) {
        try {
            // Cập nhật version theo chuẩn VNPay mới nhất
            String vnp_Version = "2.1.1";
            String vnp_Command = "pay";
            String vnp_TmnCode = vnpayTmnCode;
            String vnp_Amount = String.valueOf(amount * 100);
            String vnp_CurrCode = "VND";
            String vnp_TxnRef = String.valueOf(System.currentTimeMillis());
            String vnp_OrderInfo = orderInfo;
            // Cập nhật OrderType theo chuẩn VNPay
            String vnp_OrderType = "topup";
            String vnp_Locale = (language != null && !language.isEmpty()) ? language : "vn";
            String vnp_ReturnUrl = returnUrl + "/vnpay-result";
            String vnp_IpAddr = "127.0.0.1";
            java.text.SimpleDateFormat formatter = new java.text.SimpleDateFormat("yyyyMMddHHmmss");
            java.util.Calendar cld = java.util.Calendar.getInstance(java.util.TimeZone.getTimeZone("Etc/GMT+7"));
            String vnp_CreateDate = formatter.format(cld.getTime());
            cld.add(java.util.Calendar.MINUTE, 15);
            String vnp_ExpireDate = formatter.format(cld.getTime());
            
            // Sử dụng TreeMap để tự động sắp xếp theo thứ tự alphabet
            java.util.Map<String, String> vnp_Params = new java.util.TreeMap<>();
            vnp_Params.put("vnp_Amount", vnp_Amount);
            vnp_Params.put("vnp_Command", vnp_Command);
            vnp_Params.put("vnp_CreateDate", vnp_CreateDate);
            vnp_Params.put("vnp_CurrCode", vnp_CurrCode);
            vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);
            vnp_Params.put("vnp_IpAddr", vnp_IpAddr);
            vnp_Params.put("vnp_Locale", vnp_Locale);
            vnp_Params.put("vnp_OrderInfo", vnp_OrderInfo);
            vnp_Params.put("vnp_OrderType", vnp_OrderType);
            vnp_Params.put("vnp_ReturnUrl", vnp_ReturnUrl);
            vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
            vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
            vnp_Params.put("vnp_Version", vnp_Version);
            
            if (bankCode != null && !bankCode.isEmpty()) {
                vnp_Params.put("vnp_BankCode", bankCode);
            }
            
            // Build hashData & query string theo chuẩn VNPay mới
            StringBuilder hashData = new StringBuilder();
            StringBuilder query = new StringBuilder();
            
            for (java.util.Map.Entry<String, String> entry : vnp_Params.entrySet()) {
                String key = entry.getKey();
                String value = entry.getValue();
                
                if (value != null && value.length() > 0) {
                    // Hash data: key=value|key=value (theo chuẩn VNPAY)
                    if (hashData.length() > 0) {
                        hashData.append("|");
                    }
                    hashData.append(key).append("=").append(value);
                    
                    // Query string: key=value&key=value (cho URL)
                    if (query.length() > 0) {
                        query.append("&");
                    }
                    query.append(key).append("=").append(java.net.URLEncoder.encode(value, java.nio.charset.StandardCharsets.UTF_8));
                }
            }
            
            String hashDataString = hashData.toString();
            String vnp_SecureHash = com.mytech.apartment.portal.services.gateways.VNPayGateway.generateHmacSHA512(vnpayHashSecret, hashDataString);
            query.append("&vnp_SecureHash=").append(vnp_SecureHash);
            String paymentUrl = vnpayEndpoint + "?" + query.toString();
            
            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("payUrl", paymentUrl);
            response.put("status", "success");
            response.put("hashData", hashDataString);
            response.put("secureHash", vnp_SecureHash);
            return response;
        } catch (Exception e) {
            throw new RuntimeException("Không thể tạo thanh toán VNPay: " + e.getMessage());
        }
    }

    /**
     * Xử lý luồng Return URL từ VNPay: xác thực chữ ký, cập nhật trạng thái giao dịch
     * và trả về thông tin tóm tắt để FE hiển thị.
     */
    public Map<String, Object> processVNPayReturn(Map<String, String> params) {
        try {
            log.info("[VNPay Return] Nhận tham số: {}", params);

            boolean isValid = vnPayGateway.verifyCallback(params);
            if (!isValid) {
                return Map.of(
                    "success", false,
                    "message", "Callback không hợp lệ",
                    "status", PaymentTransaction.STATUS_FAILED
                );
            }

            String vnp_TxnRef = params.get("vnp_TxnRef");
            String vnp_ResponseCode = params.get("vnp_ResponseCode");
            String vnp_TransactionStatus = params.get("vnp_TransactionStatus");
            String vnp_TransactionNo = params.get("vnp_TransactionNo");
            String vnp_Amount = params.get("vnp_Amount");
            String vnp_BankCode = params.get("vnp_BankCode");
            String vnp_TxnTime = params.get("vnp_TxnTime");

            Optional<PaymentTransaction> optionalTransaction = paymentTransactionService.findByTransactionRef(vnp_TxnRef);
            if (optionalTransaction.isEmpty()) {
                log.error("[VNPay Return] Không tìm thấy giao dịch với mã: {}", vnp_TxnRef);
                return Map.of(
                    "success", false,
                    "message", "Không tìm thấy giao dịch",
                    "transactionRef", vnp_TxnRef,
                    "status", PaymentTransaction.STATUS_FAILED
                );
            }

            PaymentTransaction transaction = optionalTransaction.get();
            String status;
            if ("00".equals(vnp_ResponseCode) && "00".equals(vnp_TransactionStatus)) {
                status = PaymentTransaction.STATUS_SUCCESS;
                transaction.setCompletedAt(LocalDateTime.now());
            } else {
                status = PaymentTransaction.STATUS_FAILED;
            }

            transaction.setStatus(status);
            transaction.setGatewayTransactionId(vnp_TransactionNo);
            transaction.setBankCode(vnp_BankCode);
            transaction.setResponseCode(vnp_ResponseCode);
            transaction.setTransactionTime(vnp_TxnTime);
            transaction.setGatewayResponse(params.toString());
            // Đồng bộ paidByUserId nếu có payment PENDING tương ứng
            try {
                paymentRepository.findByReferenceCode(vnp_TxnRef).ifPresent(p -> {
                    if (transaction.getPaidByUserId() == null) {
                        transaction.setPaidByUserId(p.getPaidByUserId());
                    }
                });
            } catch (Exception ignore) {}
            paymentTransactionService.saveTransaction(transaction);

            log.info("[VNPay Return] Đã cập nhật giao dịch {} thành: {}", vnp_TxnRef, status);

            // Nếu thành công: tạo/ cập nhật Payment vào bảng payments và cập nhật Invoice
            if (PaymentTransaction.STATUS_SUCCESS.equals(status) && transaction.getInvoiceId() != null) {
                try {
                    Long invoiceId = transaction.getInvoiceId();
                    Invoice invoice = invoiceRepository.findById(invoiceId).orElse(null);
                    Long paidByUserId = transaction.getPaidByUserId();
                    if (invoice != null) {
                        String finalRef = (vnp_TransactionNo != null && !vnp_TransactionNo.isBlank()) ? vnp_TransactionNo : vnp_TxnRef;
                        // Nếu đã có payment theo reference → cập nhật SUCCESS; nếu chưa → tạo mới payment SUCCESS
                        paymentRepository.findByReferenceCode(finalRef).ifPresentOrElse(p -> {
                            p.setStatus(PaymentStatus.SUCCESS);
                            paymentRepository.save(p);
                        }, () -> {
                            Payment p = new Payment();
                            p.setInvoice(invoice);
                            // Nếu không có user thì dùng 0L để không vi phạm not null (hoặc bạn có thể map theo apartment→user)
                            p.setPaidByUserId(paidByUserId != null ? paidByUserId : 0L);
                            p.setAmount(Double.valueOf(transaction.getAmount()));
                            p.setMethod(PaymentMethod.VNPAY);
                            p.setStatus(PaymentStatus.SUCCESS);
                            p.setReferenceCode(finalRef);
                            paymentRepository.save(p);
                        });
                    }

                    // Đồng bộ invoice status từ tổng payments
                    paymentService.updateInvoiceStatus(invoiceId);
                } catch (Exception e) {
                    log.error("[VNPay Return] Lỗi khi cập nhật Payment/Invoice: {}", e.getMessage());
                }
            }

            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Xử lý return thành công");
            result.put("transactionRef", vnp_TxnRef);
            result.put("status", status);
            result.put("amount", vnp_Amount);
            result.put("bankCode", vnp_BankCode);
            return result;
        } catch (Exception e) {
            log.error("[VNPay Return] Lỗi xử lý: ", e);
            return Map.of(
                "success", false,
                "message", "Lỗi khi xử lý return: " + e.getMessage(),
                "status", PaymentTransaction.STATUS_FAILED
            );
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

    public Map<String, Object> createStripePayment(String orderId, Long amount, String orderInfo) {
        return stripeGateway.createPayment(orderId, amount, orderInfo);
    }

    public Map<String, Object> createStripePayment(String orderId, Long amount, String orderInfo, Long invoiceId, Long userId) {
        Map<String, Object> data = stripeGateway.createPayment(orderId, amount, orderInfo, invoiceId, userId);
        try {
            String checkoutSessionId = null;
            Object sid = data.get("checkoutSessionId");
            if (sid != null) checkoutSessionId = String.valueOf(sid);

            // Ghi audit vào payment_transactions
            PaymentTransaction tx = new PaymentTransaction();
            tx.setTransactionRef(checkoutSessionId != null ? checkoutSessionId : ("STRIPE_" + System.currentTimeMillis()));
            tx.setInvoiceId(invoiceId);
            tx.setPaidByUserId(userId);
            tx.setAmount(amount);
            tx.setGateway(PaymentTransaction.GATEWAY_STRIPE);
            tx.setOrderInfo(orderInfo);
            tx.setStatus(PaymentTransaction.STATUS_PENDING);
            tx.setCreatedAt(LocalDateTime.now());
            tx.setUpdatedAt(LocalDateTime.now());
            try { tx.setGatewayResponse(data.toString()); } catch (Exception ignore) {}
            paymentTransactionService.saveTransaction(tx);
        } catch (Exception e) {
            log.warn("Không thể ghi audit payment_transactions cho Stripe: {}", e.getMessage());
        }
        return data;
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
        try {
            // Lấy các tham số từ callback VNPAY
            String vnp_SecureHash = params.get("vnp_SecureHash");
            String vnp_TxnRef = params.get("vnp_TxnRef");
            String vnp_Amount = params.get("vnp_Amount");
            String vnp_OrderInfo = params.get("vnp_OrderInfo");
            String vnp_ResponseCode = params.get("vnp_ResponseCode");
            String vnp_TransactionNo = params.get("vnp_TransactionNo");
            String vnp_TransactionStatus = params.get("vnp_TransactionStatus");
            String vnp_TxnTime = params.get("vnp_TxnTime");
            String vnp_BankCode = params.get("vnp_BankCode");
            String vnp_CardType = params.get("vnp_CardType");
            String vnp_PayDate = params.get("vnp_PayDate");

            // Kiểm tra các tham số bắt buộc
            if (vnp_SecureHash == null || vnp_TxnRef == null || vnp_Amount == null) {
                log.error("VNPay callback missing required parameters");
                return false;
            }

            // Tạo chuỗi hash data theo chuẩn VNPAY
            // Loại bỏ vnp_SecureHash và sắp xếp theo thứ tự alphabet
            Map<String, String> sortedParams = new HashMap<>();
            for (Map.Entry<String, String> entry : params.entrySet()) {
                String key = entry.getKey();
                String value = entry.getValue();
                if (!"vnp_SecureHash".equals(key) && value != null && !value.isEmpty()) {
                    sortedParams.put(key, value);
                }
            }

            // Sắp xếp theo thứ tự alphabet
            java.util.List<String> fieldNames = new java.util.ArrayList<>(sortedParams.keySet());
            java.util.Collections.sort(fieldNames);

            // Tạo chuỗi hash data theo chuẩn VNPay: dùng giá trị đã URL-encode để đồng bộ (URLEncoder)
            StringBuilder hashData = new StringBuilder();
            for (int i = 0; i < fieldNames.size(); i++) {
                String key = fieldNames.get(i);
                String value = sortedParams.get(key);
                if (value != null && value.length() > 0) {
                    if (hashData.length() > 0) hashData.append("&");
                    String encodedValue = java.net.URLEncoder.encode(value, java.nio.charset.StandardCharsets.UTF_8);
                    hashData.append(key).append("=").append(encodedValue);
                }
            }

            // Tạo hash để so sánh
            String expectedHash = generateHmacSHA512(hashData.toString(), vnpayHashSecret);

            // So sánh hash
            boolean isValidHash = expectedHash.equals(vnp_SecureHash);
            
            if (isValidHash) {
                log.info("VNPay callback verified successfully for transaction: {}", vnp_TxnRef);
                
                // Xử lý giao dịch thành công
                if ("00".equals(vnp_ResponseCode)) {
                    // Giao dịch thành công
                    log.info("VNPay payment successful for transaction: {}", vnp_TxnRef);
                    
                    // Lưu thông tin giao dịch vào database
                    try {
                        // Tìm payment record dựa trên vnp_TxnRef
                        // Cập nhật trạng thái thanh toán
                        // Ghi log hoạt động
                        log.info("VNPay transaction {} processed successfully", vnp_TxnRef);
                    } catch (Exception e) {
                        log.error("Error processing VNPay transaction: {}", e.getMessage());
                    }
                } else {
                    log.warn("VNPay payment failed for transaction: {} with response code: {}", vnp_TxnRef, vnp_ResponseCode);
                }
                
                return true;
            } else {
                log.error("VNPay callback hash verification failed for transaction: {}", vnp_TxnRef);
                return false;
            }
        } catch (Exception e) {
            log.error("Error verifying VNPay callback", e);
            return false;
        }
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

    @PostMapping("/vnpay/create")
    public ResponseEntity<Map<String, Object>> createVNPayPayment(@RequestBody Map<String, Object> request) {
        try {
            String orderId = (String) request.get("orderId");
            Long amount = Long.valueOf(request.get("amount").toString());
            String orderInfo = (String) request.get("orderInfo");
            Long invoiceId = request.get("invoiceId") != null ? Long.valueOf(request.get("invoiceId").toString()) : null;

            if (orderId == null || amount == null || orderInfo == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Thiếu thông tin bắt buộc"
                ));
            }

            // Tạo giao dịch thanh toán
            PaymentTransaction transaction = paymentTransactionService.createTransactionFromPayment(
                orderId, amount, "VNPAY", orderInfo
            );
            // Gắn invoiceId nếu FE truyền orderId = invoiceId
            try {
                if (orderId != null && orderId.trim().matches("\\d+")) {
                    transaction.setInvoiceId(Long.parseLong(orderId.trim()));
                }
            } catch (Exception ignore) {}
            
            if (invoiceId != null) {
                transaction.setInvoiceId(invoiceId);
                paymentTransactionService.saveTransaction(transaction);
            }

            // Tạo thanh toán VNPAY
            Map<String, Object> paymentResult = vnPayGateway.createPayment(orderId, amount, orderInfo);

            // Đồng bộ transactionRef với vnp_TxnRef do gateway tạo (đảm bảo callback/return tìm thấy)
            Object txnRefFromGateway = paymentResult.get("transactionRef");
            if (txnRefFromGateway instanceof String && !((String) txnRefFromGateway).isBlank()) {
                transaction.setTransactionRef((String) txnRefFromGateway);
            }

            // Cập nhật thông tin giao dịch
            transaction.setGatewayResponse(paymentResult.toString());
            paymentTransactionService.saveTransaction(transaction);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", paymentResult,
                "transactionId", transaction.getId()
            ));

        } catch (Exception e) {
            log.error("Lỗi khi tạo thanh toán VNPAY", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "Lỗi khi tạo thanh toán: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/vnpay/callback")
    public ResponseEntity<Map<String, Object>> handleVNPayCallback(@RequestParam Map<String, String> params) {
        try {
            log.info("Nhận callback VNPAY: {}", params);
            
            // Xác thực callback
            if (!vnPayGateway.verifyCallback(params)) {
                log.error("Callback VNPAY không hợp lệ");
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Callback không hợp lệ"
                ));
            }

            // Lấy thông tin từ callback
            String vnp_TxnRef = params.get("vnp_TxnRef");
            String vnp_ResponseCode = params.get("vnp_ResponseCode");
            String vnp_TransactionStatus = params.get("vnp_TransactionStatus");
            String vnp_TransactionNo = params.get("vnp_TransactionNo");
            String vnp_Amount = params.get("vnp_Amount");
            String vnp_BankCode = params.get("vnp_BankCode");
            String vnp_TxnTime = params.get("vnp_TxnTime");

            // Tìm giao dịch theo transactionRef
            Optional<PaymentTransaction> optionalTransaction = paymentTransactionService.findByTransactionRef(vnp_TxnRef);
            if (optionalTransaction.isEmpty()) {
                log.error("Không tìm thấy giao dịch với mã: {}", vnp_TxnRef);
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Không tìm thấy giao dịch"
                ));
            }

            PaymentTransaction transaction = optionalTransaction.get();
            
            // Cập nhật trạng thái giao dịch
            String status;
            if ("00".equals(vnp_ResponseCode) && "00".equals(vnp_TransactionStatus)) {
                status = PaymentTransaction.STATUS_SUCCESS;
                transaction.setCompletedAt(LocalDateTime.now());
            } else {
                status = PaymentTransaction.STATUS_FAILED;
            }

            // Cập nhật thông tin giao dịch
            transaction.setStatus(status);
            transaction.setGatewayTransactionId(vnp_TransactionNo);
            transaction.setBankCode(vnp_BankCode);
            transaction.setResponseCode(vnp_ResponseCode);
            transaction.setTransactionTime(vnp_TxnTime);
            transaction.setGatewayResponse(params.toString());
            
            paymentTransactionService.saveTransaction(transaction);

            log.info("Đã cập nhật giao dịch {} thành: {}", vnp_TxnRef, status);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Xử lý callback thành công",
                "transactionRef", vnp_TxnRef,
                "status", status
            ));

        } catch (Exception e) {
            log.error("Lỗi khi xử lý callback VNPAY", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "Lỗi khi xử lý callback: " + e.getMessage()
            ));
        }
    }

    /**
     * Xử lý thanh toán VNPay
     */
    public ResponseEntity<?> processVNPayPayment(String orderId, Long amount, String orderInfo) {
        log.info("Bắt đầu xử lý thanh toán VNPay - orderId: {}, amount: {}, orderInfo: {}", orderId, amount, orderInfo);
        
        try {
            // Validate input parameters
            if (orderId == null || orderId.trim().isEmpty()) {
                log.error("orderId không được để trống");
                return ResponseEntity.badRequest().body(Map.of("error", "orderId không được để trống"));
            }
            if (amount == null || amount <= 0) {
                log.error("amount phải lớn hơn 0");
                return ResponseEntity.badRequest().body(Map.of("error", "amount phải lớn hơn 0"));
            }
            if (orderInfo == null || orderInfo.trim().isEmpty()) {
                log.error("orderInfo không được để trống");
                return ResponseEntity.badRequest().body(Map.of("error", "orderInfo không được để trống"));
            }
            
            log.info("Đã validate input parameters thành công");
            
            // Tạo giao dịch thanh toán
            PaymentTransaction transaction = paymentTransactionService.createTransactionFromPayment(
                orderId, amount, "VNPAY", orderInfo
            );

            // Gắn paidByUserId từ SecurityContext để dùng khi return tạo Payment
            try {
                String usernameCtx = SecurityContextHolder.getContext().getAuthentication().getName();
                Long uid = null;
                try { uid = userService.getUserIdByPhoneNumber(usernameCtx); } catch (Exception ignore) {}
                if (uid == null) {
                    User u = userRepository.findByUsername(usernameCtx).orElse(null);
                    if (u != null) uid = u.getId();
                }
                if (uid != null) transaction.setPaidByUserId(uid);
            } catch (Exception ignore) {}

            // Gắn invoiceId nếu orderId là số (map orderId -> invoiceId)
            try {
                if (orderId != null && orderId.trim().matches("\\d+")) {
                    Long invoiceId = Long.parseLong(orderId.trim());
                    transaction.setInvoiceId(invoiceId);
                    paymentTransactionService.saveTransaction(transaction);
                    log.info("Đã gán invoiceId={} cho transactionRef {}", invoiceId, transaction.getTransactionRef());
                }
            } catch (Exception ex) {
                log.warn("Không thể gán invoiceId từ orderId='{}': {}", orderId, ex.getMessage());
            }

            log.info("Đã tạo giao dịch thanh toán: {}", transaction);
            
            // Tạo URL thanh toán VNPay với transactionRef đã tạo
            Map<String, Object> paymentData = vnPayGateway.createPayment(
                orderId, amount, orderInfo
            );
            
            if (paymentData == null || paymentData.isEmpty()) {
                log.error("Không thể tạo dữ liệu thanh toán VNPay");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Không thể tạo dữ liệu thanh toán VNPay"));
            }
            
            log.info("Đã tạo dữ liệu thanh toán VNPay thành công: {}", paymentData);
            
            // Đồng bộ transactionRef trong DB với vnp_TxnRef mà gateway trả về để tìm ra giao dịch ở bước return/callback
            Object gatewayTxnRef = paymentData.get("transactionRef");
            if (gatewayTxnRef instanceof String && !((String) gatewayTxnRef).isBlank()) {
                transaction.setTransactionRef((String) gatewayTxnRef);
            }

            // Cập nhật trạng thái giao dịch
            transaction.setStatus("PROCESSING");
            // Lưu lại toàn bộ phản hồi để tiện debug sau này
            try {
                transaction.setGatewayResponse(paymentData.toString());
            } catch (Exception ignore) {}
            paymentTransactionService.saveTransaction(transaction);

            // Nếu là STRIPE tạo payment, audit sang payment_transactions nếu gateway trả kèm tx
            try {
                if (paymentData.containsKey("__transactionForAudit") &&
                    paymentData.get("__transactionForAudit") instanceof com.mytech.apartment.portal.entities.PaymentTransaction txAudit) {
                    paymentTransactionService.saveTransaction(txAudit);
                }
            } catch (Exception ignore) {}
            
            log.info("Đã cập nhật trạng thái giao dịch thành PROCESSING");
            
            // Thêm transactionId vào response
            paymentData.put("transactionId", transaction.getId());

            return ResponseEntity.ok(paymentData);
            
        } catch (IllegalArgumentException e) {
            log.error("Lỗi validation: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Lỗi khi xử lý thanh toán VNPay - orderId: {}, amount: {}, orderInfo: {}", 
                    orderId, amount, orderInfo, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Lỗi nội bộ: " + e.getMessage()));
        }
    }
} 