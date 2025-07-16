package com.mytech.apartment.portal.repositories;

import com.mytech.apartment.portal.models.Payment;
import com.mytech.apartment.portal.models.enums.PaymentMethod;
import com.mytech.apartment.portal.models.enums.PaymentStatus;
import com.mytech.apartment.portal.models.Invoice;
import com.mytech.apartment.portal.models.enums.InvoiceStatus;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;

@SpringBootTest
@Transactional
public class PaymentRepositoryTest {
    @Autowired
    private PaymentRepository paymentRepository;
    @Autowired
    private InvoiceRepository invoiceRepository;

    @Test
    void testSaveAndFindPayment() {
        // Tạo invoice hợp lệ trước
        Invoice invoice = Invoice.builder()
                .apartmentId(1L)
                .billingPeriod("2024-06")
                .issueDate(LocalDate.now())
                .dueDate(LocalDate.now().plusDays(10))
                .totalAmount(1000000.0)
                .status(InvoiceStatus.UNPAID)
                .build();
        Invoice savedInvoice = invoiceRepository.save(invoice);
        Payment payment = Payment.builder()
                .invoice(savedInvoice)
                .paidByUserId(1L)
                .amount(500000.0)
                .method(PaymentMethod.CASH)
                .status(PaymentStatus.SUCCESS)
                .build();
        Payment saved = paymentRepository.save(payment);
        Optional<Payment> found = paymentRepository.findById(saved.getId());
        Assertions.assertTrue(found.isPresent());
        Assertions.assertEquals(PaymentStatus.SUCCESS, found.get().getStatus());
    }

    @Test
    void testDeletePayment() {
        // Tạo invoice hợp lệ trước
        Invoice invoice = Invoice.builder()
                .apartmentId(2L)
                .billingPeriod("2024-06")
                .issueDate(LocalDate.now())
                .dueDate(LocalDate.now().plusDays(10))
                .totalAmount(700000.0)
                .status(InvoiceStatus.UNPAID)
                .build();
        Invoice savedInvoice = invoiceRepository.save(invoice);
        Payment payment = Payment.builder()
                .invoice(savedInvoice)
                .paidByUserId(2L)
                .amount(700000.0)
                .method(PaymentMethod.BANK_TRANSFER)
                .status(PaymentStatus.SUCCESS)
                .build();
        Payment saved = paymentRepository.save(payment);
        paymentRepository.deleteById(saved.getId());
        Assertions.assertFalse(paymentRepository.findById(saved.getId()).isPresent());
    }
} 