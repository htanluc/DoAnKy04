package com.mytech.apartment.portal.services;

import com.mytech.apartment.portal.models.Apartment;
import com.mytech.apartment.portal.models.ServiceFeeConfig;
import com.mytech.apartment.portal.models.WaterMeterReading;
import com.mytech.apartment.portal.repositories.ApartmentRepository;
import com.mytech.apartment.portal.repositories.ServiceFeeConfigRepository;
import com.mytech.apartment.portal.repositories.WaterMeterReadingRepository;
import java.util.stream.Collectors;
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
    
    @Autowired
    private ApartmentRepository apartmentRepository;

    @Override
    @Transactional
    public void generateFeeForMonth(String billingPeriod) {
        // Lấy tất cả căn hộ
        List<Long> apartmentIds = apartmentRepository.findAll().stream()
            .map(apartment -> apartment.getId())
            .collect(Collectors.toList());
        
        System.out.println("==== WATER METER BILLING DEBUG ====");
        System.out.println("DEBUG: WaterMeterMonthlyFeeService - Tìm thấy " + apartmentIds.size() + " căn hộ");
        System.out.println("DEBUG: Billing period: " + billingPeriod);
        
        // Lấy cấu hình phí nước cho tháng
        YearMonth yearMonth = YearMonth.parse(billingPeriod);
        Optional<ServiceFeeConfig> config = serviceFeeConfigRepository
            .findByMonthAndYear(yearMonth.getMonthValue(), yearMonth.getYear());
        
        double waterFeePerM3 = config.map(ServiceFeeConfig::getWaterFeePerM3)
            .orElse(15000.0); // Giá mặc định 15000 VND/m3
        
        for (Long apartmentId : apartmentIds) {
            if (apartmentId == 56) {
                System.out.println("📍 PROCESSING APARTMENT 56 - START");
            }
            
            // Tìm chỉ số nước của căn hộ này
            Optional<WaterMeterReading> readingOpt = waterMeterReadingRepository
                .findByApartmentIdAndReadingMonth(apartmentId.intValue(), billingPeriod);
            
            if (apartmentId == 56) {
                System.out.println("📊 Apartment 56 - Reading exists: " + readingOpt.isPresent());
                if (readingOpt.isPresent()) {
                    WaterMeterReading r = readingOpt.get();
                    System.out.println("📊 Apartment 56 - Previous: " + r.getPreviousReading());
                    System.out.println("📊 Apartment 56 - Current: " + r.getCurrentReading()); 
                    System.out.println("📊 Apartment 56 - Consumption: " + r.getConsumption());
                }
            }
            
            double waterFee = 0.0;
            String description;
            
            if (readingOpt.isPresent()) {
                WaterMeterReading reading = readingOpt.get();
                BigDecimal consumption = reading.getConsumption();
                if (consumption.compareTo(BigDecimal.ZERO) > 0) {
                    waterFee = consumption.doubleValue() * waterFeePerM3;
                    description = String.format("Phí nước tháng %s (%.2f m³ x %.0f VND/m³)", 
                        billingPeriod, consumption, waterFeePerM3);
                } else {
                    description = String.format("Phí nước tháng %s (0 m³ x %.0f VND/m³)", 
                        billingPeriod, waterFeePerM3);
                }
            } else {
                description = String.format("Phí nước tháng %s (0 m³ x %.0f VND/m³)", 
                    billingPeriod, waterFeePerM3);
            }
            
            if (apartmentId == 56) {
                System.out.println("💰 Apartment 56 - Calculated water fee: " + waterFee + " VND");
                System.out.println("💰 Apartment 56 - Description: " + description);
                System.out.println("💰 Apartment 56 - Water rate: " + waterFeePerM3 + " VND/m3");
            }

            System.out.println("DEBUG: WaterMeterMonthlyFeeService - Căn hộ " + apartmentId + 
                " phí nước " + waterFee + " VND");

            // Thêm vào hóa đơn (luôn thêm, có thể là 0)
            try {
                invoiceService.addInvoiceItem(
                    apartmentId,
                    billingPeriod,
                    "WATER_FEE",
                    description,
                    BigDecimal.valueOf(waterFee)
                );
                if (apartmentId == 56) {
                    System.out.println("✅ Apartment 56 - Successfully added water fee to invoice!");
                }
                System.out.println("DEBUG: WaterMeterMonthlyFeeService - Đã thêm phí nước cho căn hộ " + apartmentId);
            } catch (Exception e) {
                if (apartmentId == 56) {
                    System.err.println("❌ Apartment 56 - Failed to add water fee: " + e.getMessage());
                    e.printStackTrace();
                }
                System.err.println("DEBUG: WaterMeterMonthlyFeeService - Lỗi khi thêm phí nước cho căn hộ " + apartmentId + ": " + e.getMessage());
            }
            
            if (apartmentId == 56) {
                System.out.println("📍 PROCESSING APARTMENT 56 - END");
                System.out.println("=====================================");
            }
        }
    }
    
    @Override
    @Transactional
    public void generateFeeForMonth(String billingPeriod, Long apartmentId) {
        // Lấy chỉ số nước của căn hộ cụ thể trong tháng
        Optional<WaterMeterReading> readingOpt = waterMeterReadingRepository
            .findByApartmentIdAndReadingMonth(apartmentId.intValue(), billingPeriod);
        
        // Lấy cấu hình phí nước cho tháng
        YearMonth yearMonth = YearMonth.parse(billingPeriod);
        Optional<ServiceFeeConfig> config = serviceFeeConfigRepository
            .findByMonthAndYear(yearMonth.getMonthValue(), yearMonth.getYear());
        
        double waterFeePerM3 = config.map(ServiceFeeConfig::getWaterFeePerM3)
            .orElse(15000.0); // Giá mặc định 15000 VND/m3
        
        double waterFee = 0.0;
        String description;
        
        if (readingOpt.isPresent()) {
            WaterMeterReading reading = readingOpt.get();
            // Tính tiêu thụ nước
            BigDecimal consumption = reading.getConsumption();
            if (consumption.compareTo(BigDecimal.ZERO) > 0) {
                waterFee = consumption.doubleValue() * waterFeePerM3;
                description = String.format("Phí nước tháng %s (%.2f m³ x %.0f VND/m³)", 
                    billingPeriod, consumption, waterFeePerM3);
            } else {
                description = String.format("Phí nước tháng %s (0 m³ x %.0f VND/m³)", 
                    billingPeriod, waterFeePerM3);
            }
        } else {
            description = String.format("Phí nước tháng %s (0 m³ x %.0f VND/m³)", 
                billingPeriod, waterFeePerM3);
        }
        
        // Thêm vào hóa đơn (luôn thêm, có thể là 0)
        try {
            invoiceService.addInvoiceItem(
                apartmentId,
                billingPeriod,
                "WATER_FEE",
                description,
                BigDecimal.valueOf(waterFee)
            );
            System.out.println("DEBUG: Đã tạo phí nước cho căn hộ " + apartmentId + " tháng " + billingPeriod + " với số tiền " + waterFee + " VND");
        } catch (Exception e) {
            System.err.println("DEBUG: Lỗi khi tạo phí nước cho căn hộ " + apartmentId + " tháng " + billingPeriod + ": " + e.getMessage());
        }
    }
} 