package com.mytech.apartment.portal.services;

import com.mytech.apartment.portal.models.ServiceFeeConfig;
import com.mytech.apartment.portal.models.WaterMeterReading;
import com.mytech.apartment.portal.repositories.ServiceFeeConfigRepository;
import com.mytech.apartment.portal.repositories.WaterMeterReadingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;

@Service
public class WaterMeterMonthlyFeeService implements MonthlyFeeService {

    @Autowired
    private WaterMeterReadingRepository waterMeterReadingRepository;

    @Autowired
    private ServiceFeeConfigRepository serviceFeeConfigRepository;

    @Autowired
    private InvoiceService invoiceService;

    @Override
    @Transactional
    public void generateFeeForMonth(String billingPeriod) {
        // Lấy tất cả chỉ số nước của tháng
        List<WaterMeterReading> readings = waterMeterReadingRepository.findAllByReadingMonth(billingPeriod);
        
        for (WaterMeterReading reading : readings) {
            // Tính tiêu thụ nước
            BigDecimal consumption = reading.getConsumption();
            if (consumption.compareTo(BigDecimal.ZERO) > 0) {
                // Lấy cấu hình phí nước cho tháng
                YearMonth yearMonth = YearMonth.parse(billingPeriod);
                Optional<ServiceFeeConfig> config = serviceFeeConfigRepository
                    .findByMonthAndYear(yearMonth.getMonthValue(), yearMonth.getYear());
                
                double waterFeePerM3 = config.map(ServiceFeeConfig::getWaterFeePerM3)
                    .orElse(15000.0); // Giá mặc định 15000 VND/m3

                double waterFee = consumption.doubleValue() * waterFeePerM3;

                // Thêm vào hóa đơn
                invoiceService.addInvoiceItem(
                    reading.getApartmentId().longValue(),
                    billingPeriod,
                    "WATER_FEE",
                    String.format("Phí nước tháng %s (%.2f m³ x %.0f VND/m³)", 
                        billingPeriod, consumption, waterFeePerM3),
                    BigDecimal.valueOf(waterFee)
                );
            }
        }
    }
} 