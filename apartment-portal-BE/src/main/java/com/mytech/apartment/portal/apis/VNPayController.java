package com.mytech.apartment.portal.apis;

import com.mytech.apartment.portal.entities.PaymentTransaction;
import com.mytech.apartment.portal.services.PaymentTransactionService;
import com.mytech.apartment.portal.services.gateways.VNPayGateway;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/vnpay")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class VNPayController {

    private final VNPayGateway vnPayGateway;
    private final PaymentTransactionService paymentTransactionService;

    /*
     * Endpoint cũ - đã được thay thế bằng /api/payments/vnpay
     * Giữ lại để tham khảo, có thể xóa sau khi test xong
     */
    /*
    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createPayment(@RequestBody Map<String, Object> request) {
        log.info("Nhận yêu cầu tạo thanh toán VNPAY: {}", request);
        
        try {
            // Validate input
            if (request == null) {
                log.error("Request body là null");
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Request body không được để trống"
                ));
            }

            String orderId = (String) request.get("orderId");
            Object amountObj = request.get("amount");
            String orderInfo = (String) request.get("orderInfo");
            Object invoiceIdObj = request.get("invoiceId");

            log.info("Thông tin nhận được - orderId: {}, amount: {}, orderInfo: {}, invoiceId: {}", 
                    orderId, amountObj, orderInfo, invoiceIdObj);

            // Validate required fields
            if (orderId == null || orderId.trim().isEmpty()) {
                log.error("orderId bị thiếu hoặc rỗng");
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "orderId là bắt buộc"
                ));
            }

            if (amountObj == null) {
                log.error("amount bị thiếu");
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "amount là bắt buộc"
                ));
            }

            if (orderInfo == null || orderInfo.trim().isEmpty()) {
                log.error("orderInfo bị thiếu hoặc rỗng");
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "orderInfo là bắt buộc"
                ));
            }

            // Convert amount to Long
            Long amount;
            try {
                if (amountObj instanceof Number) {
                    amount = ((Number) amountObj).longValue();
                } else {
                    amount = Long.valueOf(amountObj.toString());
                }
            } catch (NumberFormatException e) {
                log.error("Không thể chuyển đổi amount thành số: {}", amountObj);
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "amount phải là số hợp lệ"
                ));
            }

            // Convert invoiceId to Long if present
            Long invoiceId = null;
            if (invoiceIdObj != null) {
                try {
                    if (invoiceIdObj instanceof Number) {
                        invoiceId = ((Number) invoiceIdObj).longValue();
                    } else {
                        invoiceId = Long.valueOf(invoiceIdObj.toString());
                    }
                } catch (NumberFormatException e) {
                    log.error("Không thể chuyển đổi invoiceId thành số: {}", invoiceIdObj);
                    return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "invoiceId phải là số hợp lệ"
                    ));
                }
            }

            log.info("Đã validate input thành công - orderId: {}, amount: {}, orderInfo: {}, invoiceId: {}", 
                    orderId, amount, orderInfo, invoiceId);

            // Tạo giao dịch thanh toán
            log.info("Bắt đầu tạo giao dịch thanh toán...");
            PaymentTransaction transaction = paymentTransactionService.createTransactionFromPayment(
                orderId, amount, PaymentTransaction.GATEWAY_VNPAY, orderInfo
            );
            log.info("Đã tạo giao dịch thanh toán với ID: {}", transaction.getId());
            
            if (invoiceId != null) {
                transaction.setInvoiceId(invoiceId);
                log.info("Cập nhật invoiceId cho giao dịch: {}", invoiceId);
                paymentTransactionService.saveTransaction(transaction);
            }

            // Tạo thanh toán VNPAY
            log.info("Bắt đầu tạo thanh toán VNPAY...");
            Map<String, Object> paymentResult = vnPayGateway.createPayment(orderId, amount, orderInfo);
            log.info("Đã tạo thanh toán VNPAY thành công: {}", paymentResult);
            
            // Cập nhật thông tin giao dịch
            transaction.setGatewayResponse(paymentResult.toString());
            paymentTransactionService.saveTransaction(transaction);
            log.info("Đã cập nhật thông tin giao dịch với gateway response");

            Map<String, Object> response = Map.of(
                "success", true,
                "data", paymentResult,
                "transactionId", transaction.getId()
            );

            log.info("Trả về response thành công: {}", response);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Lỗi khi tạo thanh toán VNPAY", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "Lỗi khi tạo thanh toán: " + e.getMessage(),
                "errorType", e.getClass().getSimpleName()
            ));
        }
    }
    */

    /**
     * Xử lý callback từ VNPAY
     */
    @GetMapping("/callback")
    public ResponseEntity<Map<String, Object>> handleCallback(@RequestParam Map<String, String> params) {
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
     * Kiểm tra trạng thái giao dịch
     */
    @GetMapping("/status/{transactionRef}")
    public ResponseEntity<Map<String, Object>> checkPaymentStatus(@PathVariable String transactionRef) {
        try {
            Optional<PaymentTransaction> optionalTransaction = paymentTransactionService.findByTransactionRef(transactionRef);
            
            if (optionalTransaction.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            PaymentTransaction transaction = optionalTransaction.get();
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of(
                    "transactionRef", transaction.getTransactionRef(),
                    "status", transaction.getStatus(),
                    "amount", transaction.getAmount(),
                    "gateway", transaction.getGateway(),
                    "createdAt", transaction.getCreatedAt(),
                    "completedAt", transaction.getCompletedAt(),
                    "gatewayTransactionId", transaction.getGatewayTransactionId(),
                    "bankCode", transaction.getBankCode(),
                    "responseCode", transaction.getResponseCode()
                )
            ));

        } catch (Exception e) {
            log.error("Lỗi khi kiểm tra trạng thái giao dịch", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "Lỗi khi kiểm tra trạng thái: " + e.getMessage()
            ));
        }
    }

    /**
     * Lấy danh sách giao dịch VNPAY
     */
    @GetMapping("/transactions")
    public ResponseEntity<Map<String, Object>> getTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status) {
        
        try {
            // TODO: Implement pagination
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "API chưa được triển khai đầy đủ"
            ));
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách giao dịch", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "Lỗi khi lấy danh sách giao dịch: " + e.getMessage()
            ));
        }
    }
}
