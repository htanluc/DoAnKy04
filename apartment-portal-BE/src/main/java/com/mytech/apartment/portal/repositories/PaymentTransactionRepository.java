package com.mytech.apartment.portal.repositories;

import com.mytech.apartment.portal.entities.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {

    /**
     * Tìm giao dịch theo mã giao dịch
     */
    Optional<PaymentTransaction> findByTransactionRef(String transactionRef);

    /**
     * Tìm giao dịch theo mã hóa đơn
     */
    List<PaymentTransaction> findByInvoiceId(Long invoiceId);

    /**
     * Tìm giao dịch theo trạng thái
     */
    List<PaymentTransaction> findByStatus(String status);

    /**
     * Tìm giao dịch theo gateway
     */
    List<PaymentTransaction> findByGateway(String gateway);

    /**
     * Tìm giao dịch theo mã giao dịch gateway
     */
    Optional<PaymentTransaction> findByGatewayTransactionId(String gatewayTransactionId);

    /**
     * Tìm giao dịch theo khoảng thời gian
     */
    @Query("SELECT pt FROM PaymentTransaction pt WHERE pt.createdAt BETWEEN :startDate AND :endDate")
    List<PaymentTransaction> findByCreatedAtBetween(@Param("startDate") LocalDateTime startDate, 
                                                   @Param("endDate") LocalDateTime endDate);

    /**
     * Tìm giao dịch theo trạng thái và khoảng thời gian
     */
    @Query("SELECT pt FROM PaymentTransaction pt WHERE pt.status = :status AND pt.createdAt BETWEEN :startDate AND :endDate")
    List<PaymentTransaction> findByStatusAndCreatedAtBetween(@Param("status") String status,
                                                           @Param("startDate") LocalDateTime startDate,
                                                           @Param("endDate") LocalDateTime endDate);

    /**
     * Đếm giao dịch theo trạng thái
     */
    long countByStatus(String status);

    /**
     * Đếm giao dịch theo gateway
     */
    long countByGateway(String gateway);

    /**
     * Tìm giao dịch thành công theo mã hóa đơn
     */
    @Query("SELECT pt FROM PaymentTransaction pt WHERE pt.invoiceId = :invoiceId AND pt.status = 'SUCCESS'")
    Optional<PaymentTransaction> findSuccessfulTransactionByInvoiceId(@Param("invoiceId") Long invoiceId);

    /**
     * Tìm giao dịch chờ xử lý
     */
    @Query("SELECT pt FROM PaymentTransaction pt WHERE pt.status = 'PENDING' AND pt.createdAt < :expiryTime")
    List<PaymentTransaction> findExpiredPendingTransactions(@Param("expiryTime") LocalDateTime expiryTime);
}
