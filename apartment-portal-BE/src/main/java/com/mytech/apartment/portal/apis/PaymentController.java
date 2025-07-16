package com.mytech.apartment.portal.apis;

import java.util.List;
import java.util.Map;

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
import com.mytech.apartment.portal.models.enums.PaymentMethod;
import com.mytech.apartment.portal.services.AutoPaymentService;
import com.mytech.apartment.portal.services.PaymentGatewayService;
import com.mytech.apartment.portal.services.PaymentService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/payments")
@Tag(name = "Payment", description = "Payment management endpoints")
public class PaymentController {
    @Autowired
    private PaymentService paymentService;
    
    @Autowired
    private PaymentGatewayService paymentGatewayService;
    
    @Autowired
    private AutoPaymentService autoPaymentService;

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
            return ResponseEntity.ok(paymentDto);
        } catch (RuntimeException e) {
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