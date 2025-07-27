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

    @Scheduled(cron = "0 0 0 1 * *")
    public void generateNextMonthTemplate() {
        String nextMonth = YearMonth.now().plusMonths(1).toString();
        waterMeterService.generateHistory(nextMonth);
    }
}