package com.mytech.apartment.portal.services;

import com.mytech.apartment.portal.entities.PaymentTransaction;
import com.mytech.apartment.portal.repositories.PaymentTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentTransactionService {

    private final PaymentTransactionRepository paymentTransactionRepository;

    /**
     * Lưu giao dịch thanh toán mới
     */
    public PaymentTransaction saveTransaction(PaymentTransaction transaction) {
        try {
            log.info("Bắt đầu lưu giao dịch thanh toán: {}", transaction);
            
            if (transaction == null) {
                throw new IllegalArgumentException("Transaction không được để trống");
            }
            
            if (transaction.getTransactionRef() == null || transaction.getTransactionRef().trim().isEmpty()) {
                throw new IllegalArgumentException("TransactionRef không được để trống");
            }
            
            if (transaction.getAmount() == null || transaction.getAmount() <= 0) {
                throw new IllegalArgumentException("Amount phải lớn hơn 0");
            }
            
            if (transaction.getGateway() == null || transaction.getGateway().trim().isEmpty()) {
                throw new IllegalArgumentException("Gateway không được để trống");
            }
            
            transaction.setCreatedAt(LocalDateTime.now());
            transaction.setUpdatedAt(LocalDateTime.now());
            
            log.info("Đã set thời gian cho transaction - createdAt: {}, updatedAt: {}", 
                    transaction.getCreatedAt(), transaction.getUpdatedAt());
            
            PaymentTransaction savedTransaction = paymentTransactionRepository.save(transaction);
            log.info("Đã lưu giao dịch thanh toán thành công với ID: {}", savedTransaction.getId());
            return savedTransaction;
        } catch (Exception e) {
            log.error("Lỗi khi lưu giao dịch thanh toán: {}", transaction, e);
            throw new RuntimeException("Không thể lưu giao dịch thanh toán: " + e.getMessage(), e);
        }
    }

    /**
     * Cập nhật trạng thái giao dịch
     */
    public PaymentTransaction updateTransactionStatus(Long transactionId, String status, String gatewayResponse) {
        try {
            Optional<PaymentTransaction> optionalTransaction = paymentTransactionRepository.findById(transactionId);
            if (optionalTransaction.isPresent()) {
                PaymentTransaction transaction = optionalTransaction.get();
                transaction.setStatus(status);
                transaction.setGatewayResponse(gatewayResponse);
                transaction.setUpdatedAt(LocalDateTime.now());
                
                PaymentTransaction updatedTransaction = paymentTransactionRepository.save(transaction);
                log.info("Đã cập nhật trạng thái giao dịch {} thành: {}", transactionId, status);
                return updatedTransaction;
            } else {
                log.error("Không tìm thấy giao dịch với ID: {}", transactionId);
                throw new RuntimeException("Không tìm thấy giao dịch");
            }
        } catch (Exception e) {
            log.error("Lỗi khi cập nhật trạng thái giao dịch", e);
            throw new RuntimeException("Không thể cập nhật trạng thái giao dịch: " + e.getMessage());
        }
    }

    /**
     * Tìm giao dịch theo ID
     */
    public Optional<PaymentTransaction> findById(Long transactionId) {
        return paymentTransactionRepository.findById(transactionId);
    }

    /**
     * Tìm giao dịch theo mã giao dịch
     */
    public Optional<PaymentTransaction> findByTransactionRef(String transactionRef) {
        return paymentTransactionRepository.findByTransactionRef(transactionRef);
    }

    /**
     * Tìm giao dịch theo mã hóa đơn
     */
    public List<PaymentTransaction> findByInvoiceId(Long invoiceId) {
        return paymentTransactionRepository.findByInvoiceId(invoiceId);
    }

    /**
     * Lấy danh sách giao dịch theo trạng thái
     */
    public List<PaymentTransaction> findByStatus(String status) {
        return paymentTransactionRepository.findByStatus(status);
    }

    /**
     * Lấy tất cả giao dịch
     */
    public List<PaymentTransaction> findAll() {
        return paymentTransactionRepository.findAll();
    }

    /**
     * Xóa giao dịch
     */
    public void deleteTransaction(Long transactionId) {
        try {
            paymentTransactionRepository.deleteById(transactionId);
            log.info("Đã xóa giao dịch: {}", transactionId);
        } catch (Exception e) {
            log.error("Lỗi khi xóa giao dịch", e);
            throw new RuntimeException("Không thể xóa giao dịch: " + e.getMessage());
        }
    }

    /**
     * Tạo giao dịch mới từ thông tin thanh toán
     */
    public PaymentTransaction createTransactionFromPayment(String orderId, Long amount, String gateway, String orderInfo) {
        try {
            log.info("Bắt đầu tạo giao dịch thanh toán - orderId: {}, amount: {}, gateway: {}, orderInfo: {}", 
                    orderId, amount, gateway, orderInfo);
            
            // Validate input parameters
            if (orderId == null || orderId.trim().isEmpty()) {
                throw new IllegalArgumentException("orderId không được để trống");
            }
            if (amount == null || amount <= 0) {
                throw new IllegalArgumentException("amount phải lớn hơn 0");
            }
            if (gateway == null || gateway.trim().isEmpty()) {
                throw new IllegalArgumentException("gateway không được để trống");
            }
            if (orderInfo == null || orderInfo.trim().isEmpty()) {
                throw new IllegalArgumentException("orderInfo không được để trống");
            }
            
            log.info("Đã validate input parameters thành công");
            
            // Tạo transactionRef tạm thời - numeric để tránh ký tự không số; sẽ đồng bộ lại bằng vnp_TxnRef sau khi tạo URL
            String uniqueTransactionRef = String.valueOf(System.currentTimeMillis());
            
            PaymentTransaction transaction = new PaymentTransaction();
            transaction.setTransactionRef(uniqueTransactionRef);
            transaction.setAmount(amount);
            transaction.setGateway(gateway);
            transaction.setOrderInfo(orderInfo);
            transaction.setStatus("PENDING");
            transaction.setCreatedAt(LocalDateTime.now());
            transaction.setUpdatedAt(LocalDateTime.now());
            
            log.info("Đã tạo transaction object với transactionRef unique: {}", transaction);
            
            return saveTransaction(transaction);
        } catch (Exception e) {
            log.error("Lỗi khi tạo giao dịch thanh toán - orderId: {}, amount: {}, gateway: {}, orderInfo: {}", 
                    orderId, amount, gateway, orderInfo, e);
            throw new RuntimeException("Không thể tạo giao dịch thanh toán: " + e.getMessage(), e);
        }
    }
}
