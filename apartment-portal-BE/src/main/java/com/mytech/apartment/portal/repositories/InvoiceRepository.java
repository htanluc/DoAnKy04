// src/main/java/com/mytech/apartment/portal/repositories/InvoiceRepository.java
package com.mytech.apartment.portal.repositories;

import com.mytech.apartment.portal.models.Invoice;
import com.mytech.apartment.portal.models.enums.InvoiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
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
    
    /** Đếm hóa đơn theo billing period bắt đầu với prefix */
    @Query("SELECT COUNT(i) FROM Invoice i WHERE i.billingPeriod LIKE :prefix%")
    long countByBillingPeriodStartingWith(@Param("prefix") String prefix);
    
    /** Đếm hóa đơn theo billing period và status */
    @Query("SELECT COUNT(i) FROM Invoice i WHERE i.billingPeriod LIKE :prefix% AND i.status = :status")
    long countByBillingPeriodStartingWithAndStatus(@Param("prefix") String prefix, @Param("status") InvoiceStatus status);
    
    /** Tính tổng tiền theo billing period */
    @Query("SELECT SUM(i.totalAmount) FROM Invoice i WHERE i.billingPeriod LIKE :prefix%")
    Double sumTotalAmountByBillingPeriodStartingWith(@Param("prefix") String prefix);
    
    /** Lấy hóa đơn mới nhất theo apartmentId */
    Optional<Invoice> findTopByApartmentIdOrderByBillingPeriodDesc(Long apartmentId);
    
    /** Lấy tất cả hóa đơn theo apartmentId sắp xếp theo billing period */
    List<Invoice> findByApartmentIdOrderByBillingPeriodDesc(Long apartmentId);
    
    /** Lấy hóa đơn quá hạn (due date trước ngày hiện tại và status UNPAID) */
    List<Invoice> findByDueDateBeforeAndStatus(LocalDate date, InvoiceStatus status);
}
