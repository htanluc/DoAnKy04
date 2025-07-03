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
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import com.mytech.apartment.portal.models.enums.PaymentStatus;
import com.mytech.apartment.portal.models.enums.PaymentMethod;
import com.mytech.apartment.portal.models.enums.InvoiceStatus;

@Service
public class PaymentGatewayService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private UserRepository userRepository;

    @Value("${payment.momo.api.key:}")
    private String momoApiKey;

    @Value("${payment.vnpay.api.key:}")
    private String vnpayApiKey;

    @Value("${payment.return.url:http://localhost:3000/payment/callback}")
    private String returnUrl;

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
} 