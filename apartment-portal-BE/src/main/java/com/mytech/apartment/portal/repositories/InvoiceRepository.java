package com.mytech.apartment.portal.repositories;

import com.mytech.apartment.portal.models.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByApartmentIdIn(List<Long> apartmentIds);
    List<Invoice> findByStatus(com.mytech.apartment.portal.models.enums.InvoiceStatus status);
}
