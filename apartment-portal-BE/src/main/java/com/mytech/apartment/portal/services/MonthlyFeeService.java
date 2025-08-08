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
}
