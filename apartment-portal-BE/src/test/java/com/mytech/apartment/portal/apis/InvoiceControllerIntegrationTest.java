package com.mytech.apartment.portal.apis;

import com.mytech.apartment.portal.models.*;
import com.mytech.apartment.portal.repositories.*;
import com.mytech.apartment.portal.models.enums.*;
import com.mytech.apartment.portal.services.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class InvoiceControllerIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private InvoiceItemRepository invoiceItemRepository;

    @Autowired
    private ApartmentRepository apartmentRepository;

    @Autowired
    private ServiceFeeConfigRepository serviceFeeConfigRepository;

    @Autowired
    private WaterMeterReadingRepository waterMeterReadingRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ApartmentResidentRepository apartmentResidentRepository;

    @Autowired
    private InvoiceService invoiceService;

    @Autowired
    private List<MonthlyFeeService> feeServices;

    private MockMvc mockMvc;

    @Test
    void testGenerateInvoicesForMonth() throws Exception {
        // Arrange
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();

        // Tạo dữ liệu test
        setupTestData();

        // Act & Assert
        mockMvc.perform(post("/api/admin/invoices/generate-month")
                .param("year", "2024")
                .param("month", "1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Đã tạo hóa đơn cho tất cả căn hộ tháng 1/2024"))
                .andExpect(jsonPath("$.feeServicesCount").exists());

        // Kiểm tra hóa đơn được tạo
        List<Invoice> invoices = invoiceRepository.findAll();
        assertFalse(invoices.isEmpty(), "Phải có ít nhất 1 hóa đơn được tạo");

        // Kiểm tra chi tiết hóa đơn
        for (Invoice invoice : invoices) {
            if (invoice.getBillingPeriod().equals("2024-01")) {
                assertNotNull(invoice.getItems(), "Hóa đơn phải có danh sách items");
                assertTrue(invoice.getItems().size() > 0, "Hóa đơn phải có ít nhất 1 item");
                assertTrue(invoice.getTotalAmount() > 0.01, "Tổng tiền phải lớn hơn 0.01");
                
                // Kiểm tra các loại phí
                boolean hasServiceFee = invoice.getItems().stream()
                    .anyMatch(item -> "SERVICE_FEE".equals(item.getFeeType()));
                boolean hasWaterFee = invoice.getItems().stream()
                    .anyMatch(item -> "WATER_FEE".equals(item.getFeeType()));
                boolean hasVehicleFee = invoice.getItems().stream()
                    .anyMatch(item -> "VEHICLE_FEE".equals(item.getFeeType()));

                assertTrue(hasServiceFee, "Phải có phí dịch vụ");
                assertTrue(hasWaterFee, "Phải có phí nước");
                // Vehicle fee có thể không có nếu không có xe
            }
        }
    }

    @Test
    void testGenerateInvoiceForSpecificApartment() throws Exception {
        // Arrange
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();

        // Tạo dữ liệu test
        Long apartmentId = setupTestDataForSpecificApartment();

        // Act & Assert
        mockMvc.perform(post("/api/admin/invoices/generate")
                .param("apartmentId", apartmentId.toString())
                .param("billingPeriod", "2024-01")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.apartmentId").value(apartmentId))
                .andExpect(jsonPath("$.billingPeriod").value("2024-01"));

        // Kiểm tra hóa đơn được tạo cho căn hộ cụ thể
        Optional<Invoice> invoiceOpt = invoiceRepository.findByApartmentIdAndBillingPeriod(apartmentId, "2024-01");
        assertTrue(invoiceOpt.isPresent(), "Phải có hóa đơn cho căn hộ cụ thể");

        Invoice invoice = invoiceOpt.get();
        assertNotNull(invoice.getItems(), "Hóa đơn phải có danh sách items");
        assertTrue(invoice.getItems().size() > 0, "Hóa đơn phải có ít nhất 1 item");
        assertTrue(invoice.getTotalAmount() > 0.01, "Tổng tiền phải lớn hơn 0.01");
    }

    @Test
    void testRecalculateFeesForMonth() throws Exception {
        // Arrange
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();

        // Tạo dữ liệu test và hóa đơn ban đầu
        setupTestData();
        invoiceService.generateInvoicesForMonth("2024-01");

        // Act & Assert
        mockMvc.perform(post("/api/admin/invoices/recalculate-fees")
                .param("billingPeriod", "2024-01")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.billingPeriod").value("2024-01"));

        // Kiểm tra phí được tính lại
        List<Invoice> invoices = invoiceRepository.findAll();
        for (Invoice invoice : invoices) {
            if ("2024-01".equals(invoice.getBillingPeriod())) {
                assertNotNull(invoice.getItems(), "Hóa đơn phải có danh sách items sau khi tính lại");
                assertTrue(invoice.getTotalAmount() > 0.01, "Tổng tiền phải lớn hơn 0.01 sau khi tính lại");
            }
        }
    }

    @Test
    void testTestFeeGeneration() throws Exception {
        // Arrange
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();

        // Tạo dữ liệu test
        Long apartmentId = setupTestDataForSpecificApartment();

        // Act & Assert
        mockMvc.perform(get("/api/admin/invoices/test-fee-generation")
                .param("billingPeriod", "2024-01")
                .param("apartmentId", apartmentId.toString())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.feeServicesCount").exists())
                .andExpect(jsonPath("$.apartmentCount").exists())
                .andExpect(jsonPath("$.hasServiceFeeConfig").exists());
    }

    private void setupTestData() {
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

        // Tạo vehicle
        Vehicle vehicle = Vehicle.builder()
            .user(user)
            .vehicleType(VehicleType.MOTORCYCLE)
            .licensePlate("51A-12345")
            .monthlyFee(BigDecimal.valueOf(50000.0))
            .build();
        vehicleRepository.save(vehicle);

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
    }

    private Long setupTestDataForSpecificApartment() {
        // Tạo căn hộ test
        Apartment apartment = Apartment.builder()
            .buildingId(1L)
            .floorNumber(2)
            .unitNumber("A2-01")
            .area(75.0)
            .status(ApartmentStatus.OCCUPIED)
            .build();
        apartment = apartmentRepository.save(apartment);

        // Tạo user test
        User user = User.builder()
            .username("testuser2")
            .email("test2@example.com")
            .phoneNumber("0901234568")
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
        waterReading.setPreviousReading(BigDecimal.valueOf(50.0));
        waterReading.setCurrentReading(BigDecimal.valueOf(55.5));
        waterReading.setConsumption(BigDecimal.valueOf(5.5));
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