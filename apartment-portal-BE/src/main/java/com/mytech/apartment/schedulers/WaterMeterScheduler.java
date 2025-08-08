package com.mytech.apartment.schedulers;

import com.mytech.apartment.portal.services.WaterMeterService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.YearMonth;

@Component
public class WaterMeterScheduler {

    private final WaterMeterService waterMeterService;

    public WaterMeterScheduler(WaterMeterService waterMeterService) {
        this.waterMeterService = waterMeterService;
    }

    /**
     * Tự động tạo template chỉ số nước cho tháng mới
     * Chạy vào 00:00:00 ngày 1 mỗi tháng
     */
    @Scheduled(cron = "0 0 0 1 * *")
    public void generateNextMonthTemplate() {
        try {
            String currentMonth = YearMonth.now().toString();
            System.out.println("DEBUG: WaterMeterScheduler - Tạo template chỉ số nước cho tháng " + currentMonth);
            waterMeterService.generateHistory(currentMonth);
            System.out.println("DEBUG: WaterMeterScheduler - Hoàn thành tạo template chỉ số nước");
        } catch (Exception e) {
            System.err.println("ERROR: WaterMeterScheduler - Lỗi khi tạo template: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Tạo template chỉ số nước cho tháng hiện tại (manual trigger)
     * Có thể được gọi từ API để tạo template ngay lập tức
     */
    public void generateCurrentMonthTemplate() {
        try {
            String currentMonth = YearMonth.now().toString();
            System.out.println("DEBUG: WaterMeterScheduler - Manual trigger tạo template cho tháng " + currentMonth);
            waterMeterService.generateHistory(currentMonth);
            System.out.println("DEBUG: WaterMeterScheduler - Hoàn thành manual trigger");
        } catch (Exception e) {
            System.err.println("ERROR: WaterMeterScheduler - Lỗi khi manual trigger: " + e.getMessage());
            e.printStackTrace();
        }
    }
}