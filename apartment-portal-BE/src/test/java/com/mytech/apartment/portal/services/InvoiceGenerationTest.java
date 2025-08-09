package com.mytech.apartment.portal.services;

import com.mytech.apartment.portal.models.Apartment;
import com.mytech.apartment.portal.models.Building;
import com.mytech.apartment.portal.models.Invoice;
import com.mytech.apartment.portal.models.InvoiceItem;
import com.mytech.apartment.portal.models.enums.ApartmentStatus;
import com.mytech.apartment.portal.repositories.ApartmentRepository;
import com.mytech.apartment.portal.repositories.BuildingRepository;
import com.mytech.apartment.portal.repositories.InvoiceRepository;
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
public class InvoiceGenerationTest {

    @Autowired
    private InvoiceService invoiceService;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private ApartmentRepository apartmentRepository;

    @Autowired
    private BuildingRepository buildingRepository;

    @Autowired
    private YearlyBillingService yearlyBillingService;

    @Test
    public void testBulkInvoiceGenerationWithDetails() {
        // Arrange
        String period = "2024-01";
        
        // Kiểm tra có căn hộ nào không
        List<Apartment> apartments = apartmentRepository.findAll();
        System.out.println("DEBUG: Số căn hộ trong database: " + apartments.size());
        
        if (apartments.isEmpty()) {
            System.out.println("DEBUG: Không có căn hộ nào, bỏ qua test");
            return;
        }
        
        // Act
        invoiceService.generateInvoicesForMonth(period);
        
        // Assert
        List<Invoice> invoices = invoiceRepository.findAll();
        System.out.println("DEBUG: Số hóa đơn được tạo: " + invoices.size());
        
        if (!invoices.isEmpty()) {
            for (Invoice invoice : invoices) {
                System.out.println("DEBUG: Hóa đơn ID: " + invoice.getId());
                System.out.println("DEBUG: Tổng tiền: " + invoice.getTotalAmount());
                System.out.println("DEBUG: Số lượng chi tiết: " + (invoice.getItems() != null ? invoice.getItems().size() : 0));
                
                // Kiểm tra hóa đơn có chi tiết không
                assertNotNull(invoice.getItems(), "Hóa đơn phải có danh sách items");
                assertFalse(invoice.getItems().isEmpty(), "Hóa đơn phải có ít nhất một chi tiết");
                
                // Kiểm tra từng chi tiết
                for (InvoiceItem item : invoice.getItems()) {
                    System.out.println("DEBUG: Chi tiết - Loại phí: " + item.getFeeType());
                    System.out.println("DEBUG: Chi tiết - Mô tả: " + item.getDescription());
                    System.out.println("DEBUG: Chi tiết - Số tiền: " + item.getAmount());
                    
                    assertNotNull(item.getFeeType(), "Loại phí không được null");
                    assertNotNull(item.getDescription(), "Mô tả không được null");
                    assertTrue(item.getAmount() > 0, "Số tiền phải lớn hơn 0");
                }
            }
        } else {
            System.out.println("DEBUG: Không có hóa đơn nào được tạo");
        }
    }

    @Test
    public void testAddInvoiceItemToExistingInvoice() {
        // Arrange
        String period = "2024-02";
        Long apartmentId = 1L; // Giả sử có căn hộ với ID = 1
        
        // Tạo hóa đơn cơ bản trước
        invoiceService.generateInvoicesForMonth(period);
        
        // Act - Thêm chi tiết hóa đơn
        invoiceService.addInvoiceItem(apartmentId, period, "ELECTRICITY", "Phí điện tháng 2", BigDecimal.valueOf(150000.0));
        
        // Assert
        Optional<Invoice> invoiceOpt = invoiceRepository.findByApartmentIdAndBillingPeriod(apartmentId, period);
        assertTrue(invoiceOpt.isPresent(), "Hóa đơn phải tồn tại");
        
        Invoice invoice = invoiceOpt.get();
        assertNotNull(invoice.getItems(), "Hóa đơn phải có danh sách items");
        assertFalse(invoice.getItems().isEmpty(), "Hóa đơn phải có chi tiết sau khi thêm");
        
        // Kiểm tra chi tiết điện vừa thêm
        boolean foundElectricityItem = invoice.getItems().stream()
            .anyMatch(item -> "ELECTRICITY".equals(item.getFeeType()) && 
                            "Phí điện tháng 2".equals(item.getDescription()));
        assertTrue(foundElectricityItem, "Phải tìm thấy chi tiết điện vừa thêm");
    }

    @Test
    public void testCreateInvoiceWithDetails() {
        // Arrange
        String period = "2024-03";
        
        // Tạo building và apartment cho test
        Building building = Building.builder()
            .id(999L)
            .build();
        buildingRepository.save(building);
        
        Apartment apartment = Apartment.builder()
            .id(999L)
            .area(80.0)
            .status(ApartmentStatus.OCCUPIED)
            .buildingId(999L)
            .build();
        apartmentRepository.save(apartment);
        
        // Act
        invoiceService.generateInvoicesForMonth(period);
        
        // Assert
        Optional<Invoice> invoiceOpt = invoiceRepository.findByApartmentIdAndBillingPeriod(999L, period);
        assertTrue(invoiceOpt.isPresent(), "Hóa đơn phải được tạo");
        
        Invoice invoice = invoiceOpt.get();
        System.out.println("DEBUG: Hóa đơn được tạo với tổng tiền: " + invoice.getTotalAmount());
        System.out.println("DEBUG: Số chi tiết: " + (invoice.getItems() != null ? invoice.getItems().size() : 0));
        
        // Kiểm tra có chi tiết hóa đơn
        assertNotNull(invoice.getItems(), "Hóa đơn phải có danh sách items");
        assertFalse(invoice.getItems().isEmpty(), "Hóa đơn phải có ít nhất một chi tiết");
        
        // Kiểm tra chi tiết phí dịch vụ
        boolean foundServiceFee = invoice.getItems().stream()
            .anyMatch(item -> "SERVICE_FEE".equals(item.getFeeType()));
        assertTrue(foundServiceFee, "Phải có chi tiết phí dịch vụ");
        
        // Kiểm tra tổng tiền được tính đúng
        double expectedServiceFee = 80.0 * 5000.0; // 80m² * 5000 VND/m²
        assertEquals(expectedServiceFee, invoice.getTotalAmount(), 0.01, "Tổng tiền phải đúng");
    }

    @Test
    public void testYearlyBillingServiceWithDetails() {
        // Arrange
        int year = 2024;
        int month = 8;
        
        // Tạo building và apartment cho test
        Building building = Building.builder()
            .id(888L)
            .build();
        buildingRepository.save(building);
        
        Apartment apartment = Apartment.builder()
            .id(888L)
            .area(70.0)
            .status(ApartmentStatus.OCCUPIED)
            .buildingId(888L)
            .build();
        apartmentRepository.save(apartment);
        
        // Act
        yearlyBillingService.generateInvoicesForMonth(year, month);
        
        // Assert
        String billingPeriod = String.format("%04d-%02d", year, month);
        Optional<Invoice> invoiceOpt = invoiceRepository.findByApartmentIdAndBillingPeriod(888L, billingPeriod);
        assertTrue(invoiceOpt.isPresent(), "Hóa đơn phải được tạo");
        
        Invoice invoice = invoiceOpt.get();
        System.out.println("DEBUG: Hóa đơn được tạo với tổng tiền: " + invoice.getTotalAmount());
        System.out.println("DEBUG: Số chi tiết: " + (invoice.getItems() != null ? invoice.getItems().size() : 0));
        
        // In ra từng chi tiết
        if (invoice.getItems() != null) {
            for (InvoiceItem item : invoice.getItems()) {
                System.out.println("DEBUG: Chi tiết - " + item.getFeeType() + ": " + item.getAmount() + " - " + item.getDescription());
            }
        }
        
        // Kiểm tra có chi tiết hóa đơn
        assertNotNull(invoice.getItems(), "Hóa đơn phải có danh sách items");
        assertFalse(invoice.getItems().isEmpty(), "Hóa đơn phải có ít nhất một chi tiết");
        
        // Kiểm tra chi tiết phí dịch vụ
        boolean foundServiceFee = invoice.getItems().stream()
            .anyMatch(item -> "SERVICE_FEE".equals(item.getFeeType()));
        assertTrue(foundServiceFee, "Phải có chi tiết phí dịch vụ");
        
        // Kiểm tra tổng tiền được tính đúng
        double expectedServiceFee = 70.0 * 5000.0; // 70m² * 5000 VND/m²
        assertEquals(expectedServiceFee, invoice.getTotalAmount(), 0.01, "Tổng tiền phải đúng");
    }
} 