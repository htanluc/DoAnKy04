package com.mytech.apartment.portal.apis;

import com.mytech.apartment.portal.models.*;
import com.mytech.apartment.portal.repositories.*;
import com.mytech.apartment.portal.models.enums.*;
import com.mytech.apartment.portal.services.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class SimpleInvoiceTest {

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private ApartmentRepository apartmentRepository;

    @Autowired
    private ServiceFeeConfigRepository serviceFeeConfigRepository;

    @Autowired
    private WaterMeterReadingRepository waterMeterReadingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private ApartmentResidentRepository apartmentResidentRepository;

    @Autowired
    private InvoiceService invoiceService;

    @Autowired
    private List<MonthlyFeeService> feeServices;

    @Test
    void testGenerateInvoiceWithDetails() {
        // Arrange - Tạo dữ liệu test
        Long apartmentId = setupTestData();

        // Act - Tạo hóa đơn và chi tiết
        String billingPeriod = "2024-01";
        
        // 1. Tạo hóa đơn cơ bản
        invoiceService.generateInvoicesForMonth(billingPeriod);
        
        // 2. Chạy các MonthlyFeeService để tạo chi tiết
        feeServices.forEach(svc -> {
            try {
                svc.generateFeeForMonth(billingPeriod);
                System.out.println("DEBUG: Đã chạy " + svc.getClass().getSimpleName());
            } catch (Exception e) {
                System.err.println("DEBUG: Lỗi khi chạy " + svc.getClass().getSimpleName() + ": " + e.getMessage());
            }
        });

        // Assert - Kiểm tra kết quả
        Optional<Invoice> invoiceOpt = invoiceRepository.findByApartmentIdAndBillingPeriod(apartmentId, billingPeriod);
        assertTrue(invoiceOpt.isPresent(), "Phải có hóa đơn được tạo");

        Invoice invoice = invoiceOpt.get();
        assertNotNull(invoice.getItems(), "Hóa đơn phải có danh sách items");
        assertTrue(invoice.getItems().size() > 0, "Hóa đơn phải có ít nhất 1 item");
        assertTrue(invoice.getTotalAmount() > 0.01, "Tổng tiền phải lớn hơn 0.01");

        // Kiểm tra các loại phí
        boolean hasServiceFee = invoice.getItems().stream()
            .anyMatch(item -> "SERVICE_FEE".equals(item.getFeeType()));
        boolean hasWaterFee = invoice.getItems().stream()
            .anyMatch(item -> "WATER_FEE".equals(item.getFeeType()));

        assertTrue(hasServiceFee, "Phải có phí dịch vụ");
        assertTrue(hasWaterFee, "Phải có phí nước");

        // In thông tin chi tiết
        System.out.println("=== CHI TIẾT HÓA ĐƠN ===");
        System.out.println("Hóa đơn ID: " + invoice.getId());
        System.out.println("Căn hộ ID: " + invoice.getApartmentId());
        System.out.println("Kỳ thanh toán: " + invoice.getBillingPeriod());
        System.out.println("Tổng tiền: " + invoice.getTotalAmount());
        System.out.println("Số lượng items: " + invoice.getItems().size());
        
        for (InvoiceItem item : invoice.getItems()) {
            System.out.println("- " + item.getFeeType() + ": " + item.getAmount() + " VND");
            System.out.println("  Mô tả: " + item.getDescription());
        }
    }

    private Long setupTestData() {
        // Tạo căn hộ test
        Apartment apartment = Apartment.builder()
            .buildingId(1L)
            .floorNumber(1)
            .unitNumber("A1-01")
            .area(80.0)
            .status(ApartmentStatus.OCCUPIED)
            .build();
        apartment = apartmentRepository.save(apartment);

        // Tạo user test
        User user = User.builder()
            .username("testuser")
            .email("test@example.com")
            .phoneNumber("0901234567")
            .status(UserStatus.ACTIVE)
            .build();
        user = userRepository.save(user);

        // Tạo apartment resident
        ApartmentResidentId residentId = new ApartmentResidentId();
        residentId.setApartmentId(apartment.getId());
        residentId.setUserId(user.getId());
        ApartmentResident apartmentResident = new ApartmentResident();
        apartmentResident.setId(residentId);
        apartmentResidentRepository.save(apartmentResident);

        // Tạo water meter reading
        WaterMeterReading waterReading = new WaterMeterReading();
        waterReading.setApartmentId(apartment.getId().intValue());
        waterReading.setReadingMonth("2024-01");
        waterReading.setPreviousReading(BigDecimal.valueOf(100.0));
        waterReading.setCurrentReading(BigDecimal.valueOf(110.5));
        waterReading.setConsumption(BigDecimal.valueOf(10.5));
        waterMeterReadingRepository.save(waterReading);

        // Tạo service fee config
        ServiceFeeConfig config = ServiceFeeConfig.builder()
            .month(1)
            .year(2024)
            .serviceFeePerM2(5000.0)
            .waterFeePerM3(15000.0)
            .motorcycleFee(50000.0)
            .car4SeatsFee(200000.0)
            .car7SeatsFee(250000.0)
            .build();
        serviceFeeConfigRepository.save(config);

        return apartment.getId();
    }
} 