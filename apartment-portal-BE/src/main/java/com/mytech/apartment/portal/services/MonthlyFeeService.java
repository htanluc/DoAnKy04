// src/main/java/com/mytech/apartment/portal/services/MonthlyFeeService.java
package com.mytech.apartment.portal.services;

/**
 * Interface chung cho mọi loại phí chạy trong BillingJob.
 */
public interface MonthlyFeeService {
    /**
     * Thêm dòng phí vào hóa đơn cho kỳ billingPeriod.
     * @param billingPeriod định dạng "yyyy-MM"
     */
    void generateFeeForMonth(String billingPeriod);
    
    /**
     * Thêm dòng phí vào hóa đơn cho một căn hộ cụ thể trong kỳ billingPeriod.
     * @param billingPeriod định dạng "yyyy-MM"
     * @param apartmentId ID của căn hộ cần tạo phí
     */
    void generateFeeForMonth(String billingPeriod, Long apartmentId);
}
