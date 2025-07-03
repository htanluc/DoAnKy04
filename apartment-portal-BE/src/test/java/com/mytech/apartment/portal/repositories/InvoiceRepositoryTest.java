package com.mytech.apartment.portal.repositories;

import com.mytech.apartment.portal.models.Invoice;
import com.mytech.apartment.portal.models.enums.InvoiceStatus;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.time.LocalDate;
import java.util.Optional;

@DataJpaTest
public class InvoiceRepositoryTest {
    @Autowired
    private InvoiceRepository invoiceRepository;

    @Test
    void testSaveAndFindInvoice() {
        Invoice invoice = Invoice.builder()
                .apartmentId(1L)
                .billingPeriod("2024-06")
                .issueDate(LocalDate.now())
                .dueDate(LocalDate.now().plusDays(10))
                .totalAmount(1000000.0)
                .status(InvoiceStatus.UNPAID)
                .build();
        Invoice saved = invoiceRepository.save(invoice);
        Optional<Invoice> found = invoiceRepository.findById(saved.getId());
        Assertions.assertTrue(found.isPresent());
        Assertions.assertEquals(InvoiceStatus.UNPAID, found.get().getStatus());
    }

    @Test
    void testDeleteInvoice() {
        Invoice invoice = Invoice.builder()
                .apartmentId(2L)
                .billingPeriod("2024-06")
                .issueDate(LocalDate.now())
                .dueDate(LocalDate.now().plusDays(10))
                .totalAmount(2000000.0)
                .status(InvoiceStatus.UNPAID)
                .build();
        Invoice saved = invoiceRepository.save(invoice);
        invoiceRepository.deleteById(saved.getId());
        Assertions.assertFalse(invoiceRepository.findById(saved.getId()).isPresent());
    }
} 