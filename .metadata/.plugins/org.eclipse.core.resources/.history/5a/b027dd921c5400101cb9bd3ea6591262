package com.mytech.apartment.portal.apis;

import com.mytech.apartment.portal.dtos.*;
import com.mytech.apartment.portal.services.PaymentService;
import com.mytech.apartment.portal.services.PaymentGatewayService;
import com.mytech.apartment.portal.services.AutoPaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
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
    public ResponseEntity<List<PaymentMethodDto>> getPaymentMethods() {
        try {
            List<PaymentMethodDto> methods = paymentService.getPaymentMethods();
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

    // Deleting payments can have financial implications and should be handled with care.
    // It might be better to have a "void" or "cancel" status instead of outright deletion.
    // For this example, we'll keep the delete endpoint but add this caution.
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePayment(@PathVariable Long id) {
        try {
            paymentService.deletePayment(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
} 