package com.mytech.apartment.portal.services;

import com.mytech.apartment.portal.dtos.ManualPaymentRequest;
import com.mytech.apartment.portal.dtos.PaymentDto;
import com.mytech.apartment.portal.mappers.PaymentMapper;
import com.mytech.apartment.portal.models.Invoice;
import com.mytech.apartment.portal.models.Payment;
import com.mytech.apartment.portal.repositories.InvoiceRepository;
import com.mytech.apartment.portal.repositories.PaymentRepository;
import com.mytech.apartment.portal.models.enums.PaymentMethod;
import com.mytech.apartment.portal.models.enums.PaymentStatus;
import com.mytech.apartment.portal.models.enums.InvoiceStatus;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PaymentService {
    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private PaymentMapper paymentMapper;

    public List<PaymentDto> getAllPayments() {
        return paymentRepository.findAll().stream()
                .map(paymentMapper::toDto)
                .collect(Collectors.toList());
    }

    public Optional<PaymentDto> getPaymentById(Long id) {
        return paymentRepository.findById(id).map(paymentMapper::toDto);
    }

    public void deletePayment(Long id) {
        if (!paymentRepository.existsById(id)) {
            throw new RuntimeException("Payment not found with id " + id);
        }
        paymentRepository.deleteById(id);
    }

    @Transactional
    public PaymentDto recordManualPayment(ManualPaymentRequest request) {
        Invoice invoice = invoiceRepository.findById(request.getInvoiceId())
                .orElseThrow(() -> new RuntimeException("Invoice not found with id " + request.getInvoiceId()));

        Payment payment = new Payment();
        payment.setInvoice(invoice);
        payment.setPaidByUserId(request.getPaidByUserId());
        payment.setAmount(request.getAmount());
        payment.setMethod(request.getMethod() != null ? PaymentMethod.valueOf(request.getMethod()) : null);
        payment.setReferenceCode(request.getReferenceCode());
        payment.setStatus(PaymentStatus.SUCCESS); // Manual payments are considered successful

        Payment savedPayment = paymentRepository.save(payment);

        // Tính tổng số tiền đã thanh toán từ database
        double totalPaid = paymentRepository.findByInvoiceId(request.getInvoiceId())
                .stream()
                .filter(p -> p.getStatus() == PaymentStatus.SUCCESS)
                .mapToDouble(Payment::getAmount)
                .sum();
        
        System.out.println("=== PAYMENT DEBUG INFO ===");
        System.out.println("Invoice ID: " + request.getInvoiceId());
        System.out.println("Invoice Total Amount: " + invoice.getTotalAmount());
        System.out.println("Total Paid: " + totalPaid);
        System.out.println("Current Invoice Status: " + invoice.getStatus());
        System.out.println("Payment Amount: " + request.getAmount());
        System.out.println("Comparison: " + totalPaid + " >= " + invoice.getTotalAmount() + " = " + (totalPaid >= invoice.getTotalAmount()));
        
        // Cập nhật trạng thái hóa đơn
        if (totalPaid >= invoice.getTotalAmount()) {
            invoice.setStatus(InvoiceStatus.PAID);
            System.out.println("✅ Invoice status updated to PAID");
        } else if (totalPaid > 0) {
            invoice.setStatus(InvoiceStatus.PARTIAL);
            System.out.println("⚠️ Invoice status updated to PARTIAL");
        } else {
            invoice.setStatus(InvoiceStatus.UNPAID);
            System.out.println("❌ Invoice status remains UNPAID");
        }
        
        // Lưu cập nhật hóa đơn
        invoiceRepository.save(invoice);
        System.out.println("=== END PAYMENT DEBUG ===");

        return paymentMapper.toDto(savedPayment);
    }

    public List<PaymentMethod> getPaymentMethods() {
        // Trả về tất cả các phương thức thanh toán enum
        return List.of(PaymentMethod.values());
    }

    public List<PaymentDto> getPaymentsByInvoice(Long invoiceId) {
        return paymentRepository.findByInvoiceId(invoiceId).stream()
            .map(paymentMapper::toDto)
            .collect(Collectors.toList());
    }

    public List<PaymentDto> getPaymentsByStatus(String status) {
        return paymentRepository.findByStatus(PaymentStatus.valueOf(status)).stream()
            .map(paymentMapper::toDto)
            .collect(Collectors.toList());
    }
    
    public com.mytech.apartment.portal.repositories.InvoiceRepository getInvoiceRepository() {
        return invoiceRepository;
    }
    
    @Transactional
    public void updateInvoiceStatus(Long invoiceId) {
        System.out.println("=== FORCE UPDATE INVOICE STATUS ===");
        System.out.println("Invoice ID: " + invoiceId);
        
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found with id " + invoiceId));
        
        System.out.println("Original Invoice Status: " + invoice.getStatus());
        System.out.println("Invoice Total Amount: " + invoice.getTotalAmount());
        
        // Tính tổng số tiền đã thanh toán
        double totalPaid = paymentRepository.findByInvoiceId(invoiceId)
                .stream()
                .filter(p -> p.getStatus() == PaymentStatus.SUCCESS)
                .mapToDouble(Payment::getAmount)
                .sum();
        
        System.out.println("Total Paid Amount: " + totalPaid);
        System.out.println("Comparison: " + totalPaid + " >= " + invoice.getTotalAmount() + " = " + (totalPaid >= invoice.getTotalAmount()));
        
        // Cập nhật trạng thái hóa đơn
        if (totalPaid >= invoice.getTotalAmount()) {
            invoice.setStatus(InvoiceStatus.PAID);
            System.out.println("✅ Invoice status updated to PAID");
        } else if (totalPaid > 0) {
            invoice.setStatus(InvoiceStatus.PARTIAL);
            System.out.println("⚠️ Invoice status updated to PARTIAL");
        } else {
            invoice.setStatus(InvoiceStatus.UNPAID);
            System.out.println("❌ Invoice status updated to UNPAID");
        }
        
        // Lưu cập nhật hóa đơn
        Invoice savedInvoice = invoiceRepository.save(invoice);
        System.out.println("Final Invoice Status: " + savedInvoice.getStatus());
        System.out.println("=== END FORCE UPDATE ===");
    }
} 