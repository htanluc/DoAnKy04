// src/main/java/com/mytech/apartment/portal/repositories/InvoiceRepository.java
package com.mytech.apartment.portal.repositories;

import com.mytech.apartment.portal.models.Invoice;
import com.mytech.apartment.portal.models.enums.InvoiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    /** Lấy danh sách apartmentId duy nhất để sinh hóa đơn */
    @Query("SELECT DISTINCT i.apartmentId FROM Invoice i")
    List<Long> findDistinctApartmentIds();

    /** Tìm hóa đơn theo apartmentId và kỳ thanh toán */
    Optional<Invoice> findByApartmentIdAndBillingPeriod(Long apartmentId, String billingPeriod);

    /** Lấy danh sách hóa đơn theo nhiều apartmentId */
    List<Invoice> findByApartmentIdIn(List<Long> apartmentIds);

    /** Lấy danh sách hóa đơn theo status */
    List<Invoice> findByStatus(InvoiceStatus status);
}
