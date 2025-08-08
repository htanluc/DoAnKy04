package com.mytech.apartment.portal.apis;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mytech.apartment.portal.dtos.ApiResponse;
import com.mytech.apartment.portal.dtos.AutoPaymentSetupRequest;
import com.mytech.apartment.portal.dtos.ManualPaymentRequest;
import com.mytech.apartment.portal.dtos.PaymentDto;
import com.mytech.apartment.portal.dtos.PaymentGatewayRequest;
import com.mytech.apartment.portal.dtos.PaymentGatewayResponse;
import com.mytech.apartment.portal.models.enums.ActivityActionType;
import com.mytech.apartment.portal.models.enums.PaymentMethod;
import com.mytech.apartment.portal.services.SmartActivityLogService;
import com.mytech.apartment.portal.services.AutoPaymentService;
import com.mytech.apartment.portal.services.PaymentGatewayService;
import com.mytech.apartment.portal.services.PaymentService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RequestHeader;
import java.util.HashMap;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/payments")
@Tag(name = "Payment", description = "Payment management endpoints")
@RequiredArgsConstructor
public class PaymentController {
    private static final Logger log = LoggerFactory.getLogger(PaymentController.class);

    private final PaymentService paymentService;
    private final PaymentGatewayService paymentGatewayService;
    private final AutoPaymentService autoPaymentService;
    private final SmartActivityLogService smartActivityLogService;
    private final com.mytech.apartment.portal.services.UserService userService;
    private final com.mytech.apartment.portal.config.StripeConfig stripeConfig;

    // Cooldown mechanism to prevent rapid repeated payment attempts
    private final Map<String, LocalDateTime> paymentCooldowns = new ConcurrentHashMap<>();
    private static final int PAYMENT_COOLDOWN_SECONDS = 5; // 5 seconds cooldown

    /**
     * Check if payment is in cooldown for the given user and invoice
     */
    private boolean isPaymentInCooldown(Long userId, Long invoiceId) {
        String key = userId + "-" + invoiceId;
        LocalDateTime lastAttempt = paymentCooldowns.get(key);
        if (lastAttempt != null) {
            LocalDateTime cooldownEnd = lastAttempt.plusSeconds(PAYMENT_COOLDOWN_SECONDS);
            if (LocalDateTime.now().isBefore(cooldownEnd)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Set payment cooldown for the given user and invoice
     */
    private void setPaymentCooldown(Long userId, Long invoiceId) {
        String key = userId + "-" + invoiceId;
        paymentCooldowns.put(key, LocalDateTime.now());
    }

    /**
     * Get all payments
     * Lấy danh sách tất cả thanh toán
     */
    @GetMapping
    public List<PaymentDto> getAllPayments() {
        return paymentService.getAllPayments();
    }

    /**
     * Get payment by ID
     * Lấy thông tin thanh toán theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<PaymentDto> getPaymentById(@PathVariable Long id) {
        return paymentService.getPaymentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Manual payment (admin)
     * Thanh toán thủ công (admin)
     */
    @PostMapping("/manual")
    public ResponseEntity<PaymentDto> recordManualPayment(@RequestBody ManualPaymentRequest request) {
        try {
            PaymentDto paymentDto = paymentService.recordManualPayment(request);
            
            // Log admin payment activity with detailed error handling (smart logging)
            try {
                smartActivityLogService.logSmartActivity(ActivityActionType.PAY_INVOICE, 
                    "Admin ghi nhận thanh toán thủ công cho hóa đơn #%d, số tiền: %,.0f VND", 
                    request.getInvoiceId(), request.getAmount());
                System.out.println("PaymentController: Activity logged successfully for manual payment");
            } catch (Exception e) {
                System.err.println("PaymentController: Error logging activity: " + e.getMessage());
                e.printStackTrace();
            }
            
            return ResponseEntity.ok(paymentDto);
        } catch (RuntimeException e) {
            System.err.println("PaymentController: Error recording manual payment: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(null);
        }
    }

    /**
     * Create payment via gateway
     * Tạo thanh toán qua cổng thanh toán
     */
    @PostMapping("/gateway")
    public ResponseEntity<PaymentGatewayResponse> createPaymentViaGateway(
            @Valid @RequestBody PaymentGatewayRequest request) {
        try {
            // Check cooldown
            String username = org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication().getName();
            Long userId = userService.getUserIdByPhoneNumber(username);
            
            if (userId != null && isPaymentInCooldown(userId, request.getInvoiceId())) {
                return ResponseEntity.badRequest().body(new PaymentGatewayResponse(
                    null, null, "FAILED", "Vui lòng đợi 5 giây trước khi thử lại", null
                ));
            }
            
            // Set cooldown
            if (userId != null) {
                setPaymentCooldown(userId, request.getInvoiceId());
            }
            
            PaymentGatewayResponse response = paymentGatewayService.createPayment(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new PaymentGatewayResponse(
                null, null, "FAILED", e.getMessage(), null
            ));
        }
    }

    /**
     * Create MoMo payment
     * Tạo thanh toán MoMo
     */
    @PostMapping("/momo")
    @Operation(summary = "Create MoMo payment", description = "Create payment via MoMo wallet")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createMoMoPayment(
            @RequestParam Long invoiceId,
            @RequestParam Long amount,
            @RequestParam String orderInfo) {
        try {
            // Check cooldown
            String username = org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication().getName();
            Long userId = userService.getUserIdByPhoneNumber(username);
            
            if (userId != null && isPaymentInCooldown(userId, invoiceId)) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Vui lòng đợi 5 giây trước khi thử lại"));
            }
            
            // Set cooldown
            if (userId != null) {
                setPaymentCooldown(userId, invoiceId);
            }

            String orderId = paymentGatewayService.generateOrderId();
            Map<String, Object> response = paymentGatewayService.createMoMoPayment(orderId, amount, orderInfo);

            // Đảm bảo trả về đúng trường payUrl
            Map<String, Object> data = new java.util.HashMap<>();
            data.put("payUrl", response.get("payUrl"));
            return ResponseEntity.ok(ApiResponse.success("Tạo thanh toán MoMo thành công", data));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Create VNPay payment
     * Tạo thanh toán VNPay
     */
    @PostMapping("/vnpay")
    @Operation(summary = "Create VNPay payment", description = "Create payment via VNPay")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createVNPayPayment(
            @RequestParam Long amount,
            @RequestParam String orderInfo,
            @RequestParam(required = false) String bankCode,
            @RequestParam(required = false) String language) {
        try {
            Map<String, Object> response = paymentGatewayService.createVNPayPaymentFull(amount, orderInfo, bankCode, language);

            Map<String, Object> data = new java.util.HashMap<>();
            data.put("payUrl", response.get("payUrl"));
            return ResponseEntity.ok(ApiResponse.success("Tạo thanh toán VNPay thành công", data));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Create ZaloPay payment
     * Tạo thanh toán ZaloPay
     */
    @PostMapping("/zalopay")
    @Operation(summary = "Create ZaloPay payment", description = "Create payment via ZaloPay")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createZaloPayPayment(
            @RequestParam Long invoiceId,
            @RequestParam Long amount,
            @RequestParam String orderInfo) {
        try {
            // Check cooldown
            String username = org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication().getName();
            Long userId = userService.getUserIdByPhoneNumber(username);
            
            if (userId != null && isPaymentInCooldown(userId, invoiceId)) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Vui lòng đợi 5 giây trước khi thử lại"));
            }
            
            // Set cooldown
            if (userId != null) {
                setPaymentCooldown(userId, invoiceId);
            }

            String orderId = paymentGatewayService.generateOrderId();
            Map<String, Object> response = paymentGatewayService.createZaloPayPayment(orderId, amount, orderInfo);

            Map<String, Object> data = new java.util.HashMap<>();
            data.put("payUrl", response.get("payUrl"));
            return ResponseEntity.ok(ApiResponse.success("Tạo thanh toán ZaloPay thành công", data));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Create Visa/Mastercard payment
     * Tạo thanh toán thẻ quốc tế
     */
    @PostMapping("/visa")
    @Operation(summary = "Create Visa payment", description = "Create payment via Visa/Mastercard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createVisaPayment(
            @RequestParam Long invoiceId,
            @RequestParam Long amount,
            @RequestParam String orderInfo) {
        try {
            // Check cooldown
            String username = org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication().getName();
            Long userId = userService.getUserIdByPhoneNumber(username);
            
            if (userId != null && isPaymentInCooldown(userId, invoiceId)) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Vui lòng đợi 5 giây trước khi thử lại"));
            }
            
            // Set cooldown
            if (userId != null) {
                setPaymentCooldown(userId, invoiceId);
            }

            String orderId = paymentGatewayService.generateOrderId();
            Map<String, Object> response = paymentGatewayService.createVisaPayment(orderId, amount, orderInfo);

            Map<String, Object> data = new java.util.HashMap<>();
            data.put("payUrl", response.get("payUrl"));
            return ResponseEntity.ok(ApiResponse.success("Tạo thanh toán thẻ quốc tế thành công", data));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Create PayPal payment
     * Tạo thanh toán PayPal
     */
    @PostMapping("/paypal")
    @Operation(summary = "Create PayPal payment", description = "Create payment via PayPal")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createPayPalPayment(
            @RequestParam Long invoiceId,
            @RequestParam Long amount,
            @RequestParam String orderInfo) {
        try {
            // Check cooldown
            String username = org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication().getName();
            Long userId = userService.getUserIdByPhoneNumber(username);
            
            if (userId != null && isPaymentInCooldown(userId, invoiceId)) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Vui lòng đợi 5 giây trước khi thử lại"));
            }
            
            // Set cooldown
            if (userId != null) {
                setPaymentCooldown(userId, invoiceId);
            }

            String orderId = paymentGatewayService.generateOrderId();
            Map<String, Object> response = paymentGatewayService.createPayPalPayment(orderId, amount, orderInfo);

            Map<String, Object> data = new java.util.HashMap<>();
            data.put("payUrl", response.get("payUrl"));
            return ResponseEntity.ok(ApiResponse.success("Tạo thanh toán PayPal thành công", data));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Create Stripe payment (Visa/Mastercard)
     * Tạo thanh toán Stripe
     */
    @PostMapping("/stripe")
    @Operation(summary = "Create Stripe payment", description = "Create payment via Stripe for Visa/Mastercard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createStripePayment(
            @RequestParam Long invoiceId,
            @RequestParam Long amount,
            @RequestParam String orderInfo) {
        try {
            // Check cooldown
            String username = org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication().getName();
            Long userId = userService.getUserIdByPhoneNumber(username);
            
            if (userId != null && isPaymentInCooldown(userId, invoiceId)) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Vui lòng đợi 5 giây trước khi thử lại"));
            }
            
            // Set cooldown
            if (userId != null) {
                setPaymentCooldown(userId, invoiceId);
            }

            // Cập nhật orderInfo để bao gồm thông tin user
            String updatedOrderInfo = orderInfo + " - User " + userId;

            String orderId = paymentGatewayService.generateOrderId();
            // Pass invoiceId explicitly to avoid regex parsing issues
            Map<String, Object> response = paymentGatewayService.createStripePayment(orderId, amount, updatedOrderInfo, invoiceId, userId);

            Map<String, Object> data = new java.util.HashMap<>();
            data.put("payUrl", response.get("payUrl"));
            data.put("checkoutSessionId", response.get("checkoutSessionId"));
            return ResponseEntity.ok(ApiResponse.success("Tạo thanh toán Stripe thành công", data));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Payment gateway callback
     * Callback từ cổng thanh toán
     */
    @PostMapping("/gateway/callback")
    public ResponseEntity<ApiResponse<String>> paymentCallback(
            @RequestParam String transactionId,
            @RequestParam String status,
            @RequestParam(required = false) String message) {
        try {
            paymentGatewayService.processCallback(transactionId, status, message);
            return ResponseEntity.ok(ApiResponse.success("Xử lý callback thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * MoMo callback
     * Callback từ MoMo
     */
    @PostMapping("/momo/callback")
    @Operation(summary = "MoMo callback", description = "Handle callback from MoMo payment gateway")
    public ResponseEntity<ApiResponse<String>> momoCallback(@RequestBody Map<String, String> params) {
        try {
            boolean isValid = paymentGatewayService.verifyPaymentCallback("momo", params);
            if (isValid) {
                // Xử lý thanh toán thành công
                String orderId = params.get("orderId");
                String resultCode = params.get("resultCode");
                if ("0".equals(resultCode)) {
                    // Thanh toán thành công
                    return ResponseEntity.ok(ApiResponse.success("Thanh toán MoMo thành công"));
                } else {
                    return ResponseEntity.ok(ApiResponse.error("Thanh toán MoMo thất bại"));
                }
            } else {
                return ResponseEntity.badRequest().body(ApiResponse.error("Callback không hợp lệ"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * VNPay callback
     * Callback từ VNPay
     */
    @PostMapping("/vnpay/callback")
    @Operation(summary = "VNPay callback", description = "Handle callback from VNPay payment gateway")
    public ResponseEntity<ApiResponse<String>> vnpayCallback(@RequestParam Map<String, String> params) {
        try {
            boolean isValid = paymentGatewayService.verifyPaymentCallback("vnpay", params);
            if (isValid) {
                String vnp_ResponseCode = params.get("vnp_ResponseCode");
                if ("00".equals(vnp_ResponseCode)) {
                    return ResponseEntity.ok(ApiResponse.success("Thanh toán VNPay thành công"));
                } else {
                    return ResponseEntity.ok(ApiResponse.error("Thanh toán VNPay thất bại"));
                }
            } else {
                return ResponseEntity.badRequest().body(ApiResponse.error("Callback không hợp lệ"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * ZaloPay callback
     * Callback từ ZaloPay
     */
    @PostMapping("/zalopay/callback")
    @Operation(summary = "ZaloPay callback", description = "Handle callback from ZaloPay payment gateway")
    public ResponseEntity<ApiResponse<String>> zalopayCallback(@RequestBody Map<String, String> params) {
        try {
            boolean isValid = paymentGatewayService.verifyPaymentCallback("zalopay", params);
            if (isValid) {
                String return_code = params.get("return_code");
                if ("1".equals(return_code)) {
                    return ResponseEntity.ok(ApiResponse.success("Thanh toán ZaloPay thành công"));
                } else {
                    return ResponseEntity.ok(ApiResponse.error("Thanh toán ZaloPay thất bại"));
                }
            } else {
                return ResponseEntity.badRequest().body(ApiResponse.error("Callback không hợp lệ"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * PayPal callback
     * Callback từ PayPal
     */
    @PostMapping("/paypal/callback")
    @Operation(summary = "PayPal callback", description = "Handle callback from PayPal payment gateway")
    public ResponseEntity<ApiResponse<String>> paypalCallback(@RequestBody Map<String, String> params) {
        try {
            boolean isValid = paymentGatewayService.verifyPaymentCallback("paypal", params);
            if (isValid) {
                String paymentStatus = params.get("payment_status");
                if ("Completed".equals(paymentStatus)) {
                    return ResponseEntity.ok(ApiResponse.success("Thanh toán PayPal thành công"));
                } else {
                    return ResponseEntity.ok(ApiResponse.error("Thanh toán PayPal thất bại"));
                }
            } else {
                return ResponseEntity.badRequest().body(ApiResponse.error("Callback không hợp lệ"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Stripe webhook endpoint
     * Webhook từ Stripe để xử lý payment events
     */
    @PostMapping("/stripe/webhook")
    @Operation(summary = "Stripe webhook", description = "Handle webhook events from Stripe")
    public ResponseEntity<String> stripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String signature) {
        try {
            System.out.println("=== STRIPE WEBHOOK RECEIVED ===");
            System.out.println("Payload: " + payload);
            System.out.println("Signature: " + signature);

            // Verify webhook signature
            com.stripe.model.Event event = com.stripe.net.Webhook.constructEvent(
                payload, signature, stripeConfig.getWebhookSecret());

            System.out.println("Event Type: " + event.getType());

            // Process the event
            if ("checkout.session.completed".equals(event.getType())) {
                com.stripe.model.checkout.Session session = (com.stripe.model.checkout.Session) event.getData().getObject();
                System.out.println("Session ID: " + session.getId());
                System.out.println("Payment Status: " + session.getPaymentStatus());
                System.out.println("Amount Total: " + session.getAmountTotal());

                // Extract metadata
                String orderId = session.getMetadata().get("orderId");
                String invoiceIdStr = session.getMetadata().get("invoiceId");
                String userIdStr = session.getMetadata().get("userId");

                System.out.println("OrderId: " + orderId);
                System.out.println("InvoiceId: " + invoiceIdStr);
                System.out.println("UserId: " + userIdStr);

                // Process successful payment
                if ("paid".equals(session.getPaymentStatus()) &&
                    invoiceIdStr != null && userIdStr != null) {
                    try {
                        Long invoiceId = Long.parseLong(invoiceIdStr);
                        Long userId = Long.parseLong(userIdStr);

                        // Tạo payment record
                        com.mytech.apartment.portal.dtos.ManualPaymentRequest paymentRequest =
                            new com.mytech.apartment.portal.dtos.ManualPaymentRequest();
                        paymentRequest.setInvoiceId(invoiceId);
                        paymentRequest.setPaidByUserId(userId);
                        paymentRequest.setAmount((double) session.getAmountTotal()); // VND amount is already in correct units
                        paymentRequest.setMethod("VISA");
                        paymentRequest.setReferenceCode(session.getId());

                        // Lưu payment vào database
                        com.mytech.apartment.portal.dtos.PaymentDto savedPayment = paymentService.recordManualPayment(paymentRequest);
                        System.out.println("✅ Webhook: Payment recorded successfully");
                        
                        // Log successful payment activity (smart logging)
                        try {
                            // Get user object for logging since webhook context has no authenticated user
                            com.mytech.apartment.portal.models.User user = userService.getUserEntityById(userId);
                            if (user != null) {
                                smartActivityLogService.logSmartActivity(user, ActivityActionType.PAY_INVOICE, 
                                    "Thanh toán thành công hóa đơn #%d qua Stripe, số tiền: %,.0f VND", 
                                    invoiceId, (double) session.getAmountTotal());
                            } else {
                                System.err.println("User not found for logging payment activity: " + userId);
                            }
                        } catch (Exception e) {
                            System.err.println("Error logging payment activity: " + e.getMessage());
                        }
                    } catch (Exception e) {
                        System.err.println("❌ Webhook: Error recording payment: " + e.getMessage());
                    }
                }
            }

            return ResponseEntity.ok("Webhook processed successfully");
        } catch (com.stripe.exception.SignatureVerificationException e) {
            System.err.println("Webhook signature verification failed: " + e.getMessage());
            return ResponseEntity.badRequest().body("Invalid signature");
        } catch (Exception e) {
            System.err.println("Webhook error: " + e.getMessage());
            return ResponseEntity.badRequest().body("Webhook error");
        }
    }

    /**
     * Stripe payment cancel callback
     * Callback hủy từ Stripe
     */
    @GetMapping("/stripe/cancel")
    @Operation(summary = "Stripe cancel callback", description = "Handle cancelled payment from Stripe checkout page")
    public ResponseEntity<String> stripeCancelCallback(
            @RequestParam String orderId) {
        try {
            System.out.println("=== STRIPE CANCEL CALLBACK ===");
            System.out.println("OrderId: " + orderId);

            String htmlResponse = String.format("""
                <!DOCTYPE html>
                <html lang="vi">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Thanh toán bị hủy</title>
                    <style>
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                            background: linear-gradient(135deg, #ff6b6b 0%%, #ee5a24 100%%);
                            margin: 0;
                            padding: 20px;
                            min-height: 100vh;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        }
                        .cancel-container {
                            background: white;
                            border-radius: 12px;
                            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                            padding: 40px;
                            text-align: center;
                            max-width: 500px;
                            width: 100%%;
                        }
                        .cancel-icon {
                            font-size: 64px;
                            color: #ff6b6b;
                            margin-bottom: 20px;
                        }
                        .cancel-title {
                            color: #ff6b6b;
                            font-size: 24px;
                            font-weight: 600;
                            margin-bottom: 10px;
                        }
                        .cancel-message {
                            color: #6b7280;
                            margin-bottom: 30px;
                        }
                        .back-button {
                            background: #6772e5;
                            color: white;
                            border: none;
                            padding: 12px 24px;
                            border-radius: 6px;
                            font-size: 16px;
                            cursor: pointer;
                            text-decoration: none;
                            display: inline-block;
                        }
                        .back-button:hover {
                            background: #5469d4;
                        }
                    </style>
                </head>
                <body>
                    <div class="cancel-container">
                        <div class="cancel-icon">❌</div>
                        <h1 class="cancel-title">Thanh toán bị hủy!</h1>
                        <p class="cancel-message">Giao dịch thanh toán đã bị hủy. Vui lòng thử lại nếu cần.</p>
                        <p>Mã đơn hàng: %s</p>
                        <a href="javascript:window.close();" class="back-button">Đóng trang này</a>
                        <br><br>
                        <a href="http://localhost:3001/dashboard/invoices" class="back-button" style="background: #10b981;">Quay lại trang hóa đơn</a>
                    </div>
                </body>
                </html>
                """, orderId);

            return ResponseEntity.ok(htmlResponse);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi xử lý hủy thanh toán: " + e.getMessage());
        }
    }

    /**
     * Stripe payment success callback
     * Callback thành công từ Stripe
     */
    @GetMapping("/stripe/success")
    @Operation(summary = "Stripe success callback", description = "Handle successful payment from Stripe checkout page")
    public ResponseEntity<String> stripeSuccessCallback(
            @RequestParam String session_id,
            @RequestParam String orderId) {
        try {
            System.out.println("=== STRIPE SUCCESS CALLBACK ===");
            System.out.println("Session ID: " + session_id);
            System.out.println("OrderId: " + orderId);

            // Verify payment with Stripe
            try {
                com.stripe.model.checkout.Session session = com.stripe.model.checkout.Session.retrieve(session_id);
                System.out.println("Payment Status: " + session.getPaymentStatus());
                System.out.println("Amount Total: " + session.getAmountTotal());

                // Extract metadata from session - PRIORITIZE DIRECT METADATA
                String invoiceIdStr = session.getMetadata().get("invoiceId");
                String userIdStr = session.getMetadata().get("userId");
                String orderInfo = session.getMetadata().get("orderInfo");

                System.out.println("=== METADATA DEBUG ===");
                System.out.println("All metadata: " + session.getMetadata());
                System.out.println("InvoiceId from metadata: " + invoiceIdStr);
                System.out.println("UserId from metadata: " + userIdStr);
                System.out.println("OrderInfo from metadata: " + orderInfo);
                System.out.println("InvoiceId is null: " + (invoiceIdStr == null));
                System.out.println("UserId is null: " + (userIdStr == null));
                System.out.println("InvoiceId is empty: " + (invoiceIdStr != null && invoiceIdStr.isEmpty()));
                System.out.println("UserId is empty: " + (userIdStr != null && userIdStr.isEmpty()));
                System.out.println("=== END METADATA DEBUG ===");

                // ONLY use fallback parsing if metadata is completely missing or empty
                boolean needFallback = (invoiceIdStr == null || invoiceIdStr.trim().isEmpty() ||
                                       userIdStr == null || userIdStr.trim().isEmpty());

                if (needFallback && orderInfo != null) {
                    System.out.println("=== FALLBACK PARSING FROM ORDERINFO (METADATA MISSING) ===");
                    System.out.println("OrderInfo: " + orderInfo);

                    // Parse invoiceId using regex - avoid matching year patterns like "2024-11"
                    java.util.regex.Pattern invoicePattern = java.util.regex.Pattern.compile("hóa đơn\\s*(\\d+)(?!-\\d{2})");
                    java.util.regex.Matcher invoiceMatcher = invoicePattern.matcher(orderInfo);
                    if (invoiceMatcher.find()) {
                        invoiceIdStr = invoiceMatcher.group(1);
                        System.out.println("Parsed invoiceId from orderInfo (fallback): " + invoiceIdStr);
                    } else {
                        // Try alternative patterns for encoding issues
                        java.util.regex.Pattern altPattern1 = java.util.regex.Pattern.compile("Ä'Æ¡n\\s*(\\d+)(?!-\\d{2})");
                        java.util.regex.Matcher altMatcher1 = altPattern1.matcher(orderInfo);
                        if (altMatcher1.find()) {
                            invoiceIdStr = altMatcher1.group(1);
                            System.out.println("Parsed invoiceId from orderInfo (fallback alt1): " + invoiceIdStr);
                        } else {
                            // Try to extract from the beginning of the string
                            java.util.regex.Pattern altPattern2 = java.util.regex.Pattern.compile("^.*?(\\d+)(?!-\\d{2}).*User");
                            java.util.regex.Matcher altMatcher2 = altPattern2.matcher(orderInfo);
                            if (altMatcher2.find()) {
                                invoiceIdStr = altMatcher2.group(1);
                                System.out.println("Parsed invoiceId from orderInfo (fallback alt2): " + invoiceIdStr);
                            }
                        }
                    }

                    // Parse userId using regex
                    java.util.regex.Pattern userPattern = java.util.regex.Pattern.compile("User\\s*(\\d+)");
                    java.util.regex.Matcher userMatcher = userPattern.matcher(orderInfo);
                    if (userMatcher.find()) {
                        userIdStr = userMatcher.group(1);
                        System.out.println("Parsed userId from orderInfo (fallback): " + userIdStr);
                    }

                    System.out.println("=== END FALLBACK PARSING ===");
                } else if (!needFallback) {
                    System.out.println("✅ Using invoiceId and userId directly from metadata");
                    System.out.println("InvoiceId: " + invoiceIdStr);
                    System.out.println("UserId: " + userIdStr);
                }

                // Xử lý thanh toán thành công và lưu vào database
                if ("paid".equals(session.getPaymentStatus()) && invoiceIdStr != null && !invoiceIdStr.trim().isEmpty() && userIdStr != null && !userIdStr.trim().isEmpty()) {
                    try {
                        Long invoiceId = Long.parseLong(invoiceIdStr.trim());
                        Long userId = Long.parseLong(userIdStr.trim());

                        System.out.println("=== PROCESSING PAYMENT ===");
                        System.out.println("Invoice ID: " + invoiceId);
                        System.out.println("User ID: " + userId);
                        System.out.println("Amount from Stripe: " + session.getAmountTotal());
                        System.out.println("Amount in VND: " + session.getAmountTotal()); // VND doesn't need division
                        System.out.println("Session ID: " + session_id);

                        // Kiểm tra xem payment đã tồn tại chưa
                        boolean paymentExists = paymentService.getPaymentsByInvoice(invoiceId)
                            .stream()
                            .anyMatch(payment -> session_id.equals(payment.getReferenceCode()));

                        if (paymentExists) {
                            System.out.println("⚠️ Payment already exists for session: " + session_id);
                            System.out.println("✅ Payment was already recorded successfully");
                        } else {
                            // Tạo payment record
                            com.mytech.apartment.portal.dtos.ManualPaymentRequest paymentRequest =
                                new com.mytech.apartment.portal.dtos.ManualPaymentRequest();
                            paymentRequest.setInvoiceId(invoiceId);
                            paymentRequest.setPaidByUserId(userId);
                            paymentRequest.setAmount((double) session.getAmountTotal()); // VND amount is already in correct units
                            paymentRequest.setMethod("VISA");
                            paymentRequest.setReferenceCode(session_id);

                            // Lưu payment vào database
                            com.mytech.apartment.portal.dtos.PaymentDto savedPayment = paymentService.recordManualPayment(paymentRequest);
                            System.out.println("✅ Payment recorded successfully");
                            System.out.println("Payment ID: " + savedPayment.getId());
                            System.out.println("Payment Status: " + savedPayment.getStatus());
                            
                            // Log successful payment activity (smart logging)
                            try {
                                // Get user object for logging since callback context has no authenticated user
                                com.mytech.apartment.portal.models.User user = userService.getUserEntityById(userId);
                                if (user != null) {
                                    smartActivityLogService.logSmartActivity(user, ActivityActionType.PAY_INVOICE, 
                                        "Thanh toán thành công hóa đơn #%d qua Stripe, số tiền: %,.0f VND", 
                                        invoiceId, (double) session.getAmountTotal());
                                } else {
                                    System.err.println("User not found for logging payment activity: " + userId);
                                }
                            } catch (Exception e) {
                                System.err.println("Error logging payment activity: " + e.getMessage());
                            }
                        }
                    } catch (NumberFormatException e) {
                        System.err.println("❌ Lỗi khi parse invoiceId hoặc userId: " + e.getMessage());
                        System.err.println("InvoiceId string: '" + invoiceIdStr + "'");
                        System.err.println("UserId string: '" + userIdStr + "'");
                        e.printStackTrace();
                    } catch (Exception e) {
                        System.err.println("❌ Lỗi khi lưu payment: " + e.getMessage());
                        e.printStackTrace();
                    }
                } else {
                    System.out.println("❌ Payment not completed or missing data");
                    System.out.println("Payment Status: " + session.getPaymentStatus());
                    System.out.println("InvoiceId: '" + invoiceIdStr + "' (null: " + (invoiceIdStr == null) + ", empty: " + (invoiceIdStr != null && invoiceIdStr.trim().isEmpty()) + ")");
                    System.out.println("UserId: '" + userIdStr + "' (null: " + (userIdStr == null) + ", empty: " + (userIdStr != null && userIdStr.trim().isEmpty()) + ")");
                }
            } catch (Exception e) {
                System.err.println("❌ Lỗi khi verify payment với Stripe: " + e.getMessage());
                e.printStackTrace();
            }

            // Xử lý an toàn số tiền từ session
            String formattedAmount = "0";
            try {
                com.stripe.model.checkout.Session session = com.stripe.model.checkout.Session.retrieve(session_id);
                long amountValue = session.getAmountTotal(); // VND amount is already in correct units
                java.text.DecimalFormat df = new java.text.DecimalFormat("#,###");
                df.setParseBigDecimal(true);
                formattedAmount = df.format(amountValue);
            } catch (Exception e) {
                System.err.println("Lỗi khi format amount: " + e.getMessage());
            }

            String htmlResponse = String.format("""
                <!DOCTYPE html>
                <html lang="vi">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Thanh toán thành công</title>
                    <style>
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                            background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%);
                            margin: 0;
                            padding: 20px;
                            min-height: 100vh;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        }
                        .success-container {
                            background: white;
                            border-radius: 12px;
                            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                            padding: 40px;
                            text-align: center;
                            max-width: 500px;
                            width: 100%%;
                        }
                        .success-icon {
                            font-size: 64px;
                            color: #10b981;
                            margin-bottom: 20px;
                        }
                        .success-title {
                            color: #10b981;
                            font-size: 24px;
                            font-weight: 600;
                            margin-bottom: 10px;
                        }
                        .success-message {
                            color: #6b7280;
                            margin-bottom: 30px;
                        }
                        .amount {
                            font-size: 28px;
                            font-weight: 600;
                            color: #1f2937;
                            margin-bottom: 20px;
                        }
                        .back-button {
                            background: #6772e5;
                            color: white;
                            border: none;
                            padding: 12px 24px;
                            border-radius: 6px;
                            font-size: 16px;
                            cursor: pointer;
                            text-decoration: none;
                            display: inline-block;
                        }
                        .back-button:hover {
                            background: #5469d4;
                        }
                    </style>
                </head>
                <body>
                    <div class="success-container">
                        <div class="success-icon">✅</div>
                        <h1 class="success-title">Thanh toán thành công!</h1>
                        <p class="success-message">Cảm ơn bạn đã thanh toán. Giao dịch đã được xử lý thành công.</p>
                        <div class="amount">%s VND</div>
                        <p>Mã đơn hàng: %s</p>
                        <p>Session ID: %s</p>
                        <a href="javascript:window.close();" class="back-button">Đóng trang này</a>
                        <br><br>
                        <a href="http://localhost:3001/dashboard/invoices" class="back-button" style="background: #10b981;">Quay lại trang hóa đơn</a>
                    </div>
                </body>
                </html>
                """, formattedAmount, orderId, session_id);

            return ResponseEntity.ok(htmlResponse);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi xử lý thanh toán: " + e.getMessage());
        }
    }

    /**
     * Check payment status
     * Kiểm tra trạng thái thanh toán
     */
    @GetMapping("/gateway/status/{transactionId}")
    public ResponseEntity<PaymentGatewayResponse> checkPaymentStatus(@PathVariable String transactionId) {
        try {
            PaymentGatewayResponse response = paymentGatewayService.checkPaymentStatus(transactionId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new PaymentGatewayResponse(
                transactionId, null, "FAILED", e.getMessage(), null
            ));
        }
    }

    /**
     * Setup auto payment
     * Thiết lập thanh toán tự động
     */
    @PostMapping("/auto/setup")
    public ResponseEntity<ApiResponse<String>> setupAutoPayment(
            @Valid @RequestBody AutoPaymentSetupRequest request) {
        try {
            autoPaymentService.setupAutoPayment(request);
            return ResponseEntity.ok(ApiResponse.success("Thiết lập thanh toán tự động thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get auto payment settings
     * Lấy cài đặt thanh toán tự động
     */
    @GetMapping("/auto/settings")
    public ResponseEntity<AutoPaymentSetupRequest> getAutoPaymentSettings() {
        try {
            AutoPaymentSetupRequest settings = autoPaymentService.getAutoPaymentSettings();
            return ResponseEntity.ok(settings);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Cancel auto payment
     * Hủy thanh toán tự động
     */
    @DeleteMapping("/auto/cancel")
    public ResponseEntity<ApiResponse<String>> cancelAutoPayment() {
        try {
            autoPaymentService.cancelAutoPayment();
            return ResponseEntity.ok(ApiResponse.success("Hủy thanh toán tự động thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get payment methods
     * Lấy danh sách phương thức thanh toán
     */
    @GetMapping("/methods")
    public ResponseEntity<List<PaymentMethod>> getPaymentMethods() {
        try {
            List<PaymentMethod> methods = paymentService.getPaymentMethods();
            return ResponseEntity.ok(methods);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get payments by invoice
     * Lấy thanh toán theo hóa đơn
     */
    @GetMapping("/invoice/{invoiceId}")
    public ResponseEntity<List<PaymentDto>> getPaymentsByInvoice(@PathVariable Long invoiceId) {
        try {
            List<PaymentDto> payments = paymentService.getPaymentsByInvoice(invoiceId);
            return ResponseEntity.ok(payments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get payments by status
     * Lấy thanh toán theo trạng thái
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<PaymentDto>> getPaymentsByStatus(@PathVariable String status) {
        try {
            List<PaymentDto> payments = paymentService.getPaymentsByStatus(status);
            return ResponseEntity.ok(payments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Delete payment
     * Xóa thanh toán
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePayment(@PathVariable Long id) {
        try {
            paymentService.deletePayment(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}