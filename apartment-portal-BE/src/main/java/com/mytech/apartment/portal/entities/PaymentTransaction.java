package com.mytech.apartment.portal.entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "payment_transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "transaction_ref", unique = true, nullable = false)
    private String transactionRef;

    @Column(name = "invoice_id")
    private Long invoiceId;

    @Column(name = "amount", nullable = false)
    private Long amount;

    @Column(name = "gateway", nullable = false)
    private String gateway;

    @Column(name = "order_info")
    private String orderInfo;

    @Column(name = "paid_by_user_id")
    private Long paidByUserId;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "gateway_response", columnDefinition = "TEXT")
    private String gatewayResponse;

    @Column(name = "gateway_transaction_id")
    private String gatewayTransactionId;

    @Column(name = "bank_code")
    private String bankCode;

    @Column(name = "response_code")
    private String responseCode;

    @Column(name = "transaction_time")
    private String transactionTime;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    // Trạng thái giao dịch
    public static final String STATUS_PENDING = "PENDING";
    public static final String STATUS_SUCCESS = "SUCCESS";
    public static final String STATUS_FAILED = "FAILED";
    public static final String STATUS_CANCELLED = "CANCELLED";
    public static final String STATUS_EXPIRED = "EXPIRED";

    // Gateway
    public static final String GATEWAY_VNPAY = "VNPAY";
    public static final String GATEWAY_STRIPE = "STRIPE";
    public static final String GATEWAY_MOMO = "MOMO";
}
