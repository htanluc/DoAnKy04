package com.mytech.apartment.portal.repositories;

import com.mytech.apartment.portal.models.Payment;
import com.mytech.apartment.portal.models.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByReferenceCode(String referenceCode);
    List<Payment> findByInvoiceId(Long invoiceId);
    List<Payment> findByStatus(PaymentStatus status);
}
