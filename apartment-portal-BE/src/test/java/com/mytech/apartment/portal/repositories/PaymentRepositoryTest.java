package com.mytech.apartment.portal.repositories;

import com.mytech.apartment.portal.models.Payment;
import com.mytech.apartment.portal.models.enums.PaymentMethod;
import com.mytech.apartment.portal.models.enums.PaymentStatus;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.Optional;

@DataJpaTest
public class PaymentRepositoryTest {
    @Autowired
    private PaymentRepository paymentRepository;

    @Test
    void testSaveAndFindPayment() {
        Payment payment = Payment.builder()
                .invoice(null)
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
        Payment payment = Payment.builder()
                .invoice(null)
                .paidByUserId(2L)
                .amount(700000.0)
                .method(PaymentMethod.BANK)
                .status(PaymentStatus.SUCCESS)
                .build();
        Payment saved = paymentRepository.save(payment);
        paymentRepository.deleteById(saved.getId());
        Assertions.assertFalse(paymentRepository.findById(saved.getId()).isPresent());
    }
} 