package com.mytech.apartment.portal.services;

import com.mytech.apartment.portal.models.Apartment;
import com.mytech.apartment.portal.models.ServiceFeeConfig;
import com.mytech.apartment.portal.repositories.ApartmentRepository;
import com.mytech.apartment.portal.repositories.ServiceFeeConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;

@Service
public class ServiceFeeMonthlyFeeService implements MonthlyFeeService {

    @Autowired
    private ApartmentRepository apartmentRepository;

    @Autowired
    private ServiceFeeConfigRepository serviceFeeConfigRepository;

    @Autowired
    private InvoiceService invoiceService;

    @Override
    @Transactional
    public void generateFeeForMonth(String billingPeriod) {
        // Lấy tất cả căn hộ
        List<Apartment> apartments = apartmentRepository.findAll();
        
        // Lấy cấu hình phí dịch vụ cho tháng
        YearMonth yearMonth = YearMonth.parse(billingPeriod);
        Optional<ServiceFeeConfig> config = serviceFeeConfigRepository
            .findByMonthAndYear(yearMonth.getMonthValue(), yearMonth.getYear());
        
        double serviceFeePerM2 = config.map(ServiceFeeConfig::getServiceFeePerM2)
            .orElse(5000.0); // Giá mặc định 5000 VND/m2
        
        System.out.println("DEBUG: ServiceFeeMonthlyFeeService - Tìm thấy " + apartments.size() + " căn hộ");
        System.out.println("DEBUG: ServiceFeeMonthlyFeeService - Phí dịch vụ: " + serviceFeePerM2 + " VND/m²");
        
        for (Apartment apartment : apartments) {
            // Tính phí dịch vụ dựa trên diện tích
            double area = apartment.getArea();
            double serviceFee = area * serviceFeePerM2;
            
            System.out.println("DEBUG: ServiceFeeMonthlyFeeService - Căn hộ " + apartment.getId() + 
                " diện tích " + area + " m², phí " + serviceFee + " VND");
            
            // Thêm vào hóa đơn
            try {
                invoiceService.addInvoiceItem(
                    apartment.getId(),
                    billingPeriod,
                    "SERVICE_FEE",
                    String.format("Phí dịch vụ tháng %s (%.1f m² x %.0f VND/m²)", 
                        billingPeriod, area, serviceFeePerM2),
                    BigDecimal.valueOf(serviceFee)
                );
                System.out.println("DEBUG: ServiceFeeMonthlyFeeService - Đã thêm phí dịch vụ cho căn hộ " + apartment.getId());
            } catch (Exception e) {
                System.err.println("DEBUG: ServiceFeeMonthlyFeeService - Lỗi khi thêm phí dịch vụ cho căn hộ " + apartment.getId() + ": " + e.getMessage());
            }
        }
    }
    
    @Override
    @Transactional
    public void generateFeeForMonth(String billingPeriod, Long apartmentId) {
        // Lấy căn hộ cụ thể
        Optional<Apartment> apartmentOpt = apartmentRepository.findById(apartmentId);
        if (apartmentOpt.isEmpty()) {
            System.out.println("DEBUG: Không tìm thấy căn hộ " + apartmentId);
            return;
        }
        
        Apartment apartment = apartmentOpt.get();
        
        // Lấy cấu hình phí dịch vụ cho tháng
        YearMonth yearMonth = YearMonth.parse(billingPeriod);
        Optional<ServiceFeeConfig> config = serviceFeeConfigRepository
            .findByMonthAndYear(yearMonth.getMonthValue(), yearMonth.getYear());
        
        double serviceFeePerM2 = config.map(ServiceFeeConfig::getServiceFeePerM2)
            .orElse(5000.0); // Giá mặc định 5000 VND/m2
        
        // Tính phí dịch vụ dựa trên diện tích
        double area = apartment.getArea();
        double serviceFee = area * serviceFeePerM2;
        
        // Thêm vào hóa đơn
        invoiceService.addInvoiceItem(
            apartment.getId(),
            billingPeriod,
            "SERVICE_FEE",
            String.format("Phí dịch vụ tháng %s (%.1f m² x %.0f VND/m²)", 
                billingPeriod, area, serviceFeePerM2),
            BigDecimal.valueOf(serviceFee)
        );
        
        System.out.println("DEBUG: Đã tạo phí dịch vụ cho căn hộ " + apartmentId + " tháng " + billingPeriod);
    }
} 