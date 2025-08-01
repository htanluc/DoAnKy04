// src/main/java/com/mytech/apartment/portal/jobs/BillingJob.java
package com.mytech.apartment.jobs;

import com.mytech.apartment.portal.services.InvoiceService;
import com.mytech.apartment.portal.services.MonthlyFeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Component
public class BillingJob {

    @Autowired
    private InvoiceService invoiceService;

    // Spring sẽ inject tất cả bean implement MonthlyFeeService
    @Autowired
    private List<MonthlyFeeService> feeServices;

    // Tạm thời comment để tránh chạy liên tục
    // Chạy vào 00:00 ngày 5 hàng tháng
    // @Scheduled(cron = "0 0 0 5 * *")
    public void runMonthlyBilling() {
        String period = LocalDate.now()
            .minusMonths(1)
            .format(DateTimeFormatter.ofPattern("yyyy-MM"));

        // 1) Sinh hóa đơn cơ bản
        invoiceService.generateInvoicesForMonth(period);

        // 2) Chạy tất cả FeeService (nước, điện, giữ xe…)
        feeServices.forEach(svc -> svc.generateFeeForMonth(period));

        // 3) Thông báo cư dân
        invoiceService.notifyResidents(period);
    }
}
