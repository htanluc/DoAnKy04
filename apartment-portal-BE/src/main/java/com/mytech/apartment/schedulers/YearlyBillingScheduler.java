package com.mytech.apartment.schedulers;

import com.mytech.apartment.portal.services.YearlyBillingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class YearlyBillingScheduler {

    @Autowired
    private YearlyBillingService yearlyBillingService;

    /**
     * Tự động tạo biểu phí 1 năm cho năm tiếp theo
     * Chạy vào 00:00 ngày 1 tháng 12 hàng năm
     */
    @Scheduled(cron = "0 0 0 1 12 *")
    public void generateNextYearInvoices() {
        int nextYear = LocalDate.now().getYear() + 1;
        
        try {
            // Tạo cấu hình phí dịch vụ cho năm tiếp theo
            yearlyBillingService.createYearlyFeeConfig(
                nextYear,
                5000.0,  // Giá dịch vụ/m2
                15000.0, // Giá nước/m3
                50000.0, // Phí gửi xe máy/tháng
                200000.0, // Phí gửi ô tô 4 chỗ/tháng
                250000.0  // Phí gửi ô tô 7 chỗ/tháng
            );
            
            // Tạo biểu phí 1 năm cho tất cả căn hộ
            yearlyBillingService.generateYearlyInvoices(nextYear);
            
            System.out.println("Đã tự động tạo biểu phí 1 năm cho năm " + nextYear);
        } catch (Exception e) {
            System.err.println("Lỗi khi tạo biểu phí 1 năm: " + e.getMessage());
        }
    }

    /**
     * Tạo biểu phí cho năm hiện tại nếu chưa có
     * Chạy vào 00:00 ngày 1 tháng 1 hàng năm
     */
    @Scheduled(cron = "0 0 0 1 1 *")
    public void generateCurrentYearInvoices() {
        int currentYear = LocalDate.now().getYear();
        
        try {
            // Tạo cấu hình phí dịch vụ cho năm hiện tại nếu chưa có
            yearlyBillingService.createYearlyFeeConfig(
                currentYear,
                5000.0,  // Giá dịch vụ/m2
                15000.0, // Giá nước/m3
                50000.0, // Phí gửi xe máy/tháng
                200000.0, // Phí gửi ô tô 4 chỗ/tháng
                250000.0  // Phí gửi ô tô 7 chỗ/tháng
            );
            
            // Tạo biểu phí 1 năm cho tất cả căn hộ
            yearlyBillingService.generateYearlyInvoices(currentYear);
            
            System.out.println("Đã tự động tạo biểu phí 1 năm cho năm " + currentYear);
        } catch (Exception e) {
            System.err.println("Lỗi khi tạo biểu phí 1 năm: " + e.getMessage());
        }
    }
} 