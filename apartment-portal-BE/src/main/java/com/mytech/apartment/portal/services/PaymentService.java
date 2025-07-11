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

        // Update invoice status if fully paid
        double totalPaid = invoice.getPayments().stream().mapToDouble(Payment::getAmount).sum() + savedPayment.getAmount();
        if (totalPaid >= invoice.getTotalAmount()) {
            invoice.setStatus(InvoiceStatus.PAID);
            invoiceRepository.save(invoice);
        }

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
} 