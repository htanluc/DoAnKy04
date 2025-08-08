package com.mytech.apartment.portal.apis;

import com.mytech.apartment.portal.dtos.InvoiceCreateRequest;
import com.mytech.apartment.portal.dtos.InvoiceDto;
import com.mytech.apartment.portal.dtos.InvoiceUpdateRequest;
import com.mytech.apartment.portal.models.enums.ActivityActionType;
import com.mytech.apartment.portal.services.SmartActivityLogService;
import com.mytech.apartment.portal.services.InvoiceService;
import com.mytech.apartment.portal.services.MonthlyFeeService;
import com.mytech.apartment.portal.services.YearlyBillingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.time.LocalDate;
import com.mytech.apartment.portal.models.Invoice;
import com.mytech.apartment.portal.models.enums.InvoiceStatus;
import com.mytech.apartment.portal.repositories.InvoiceRepository;
import com.mytech.apartment.portal.models.ServiceFeeConfig;
import com.mytech.apartment.portal.repositories.ServiceFeeConfigRepository;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.stream.Collectors;
import com.mytech.apartment.portal.repositories.ApartmentRepository;
import java.util.HashSet;

@RestController
@RequestMapping
public class InvoiceController {

    @Autowired private InvoiceService invoiceService;
    
    @Autowired private List<MonthlyFeeService> feeServices;
    @Autowired private com.mytech.apartment.portal.repositories.WaterMeterReadingRepository waterMeterReadingRepository;

    @Autowired private InvoiceRepository invoiceRepository;

    @Autowired private ServiceFeeConfigRepository serviceFeeConfigRepository;
    
    @Autowired private YearlyBillingService yearlyBillingService;

    @Autowired private ApartmentRepository apartmentRepository;

    @Autowired private SmartActivityLogService smartActivityLogService;

    @GetMapping("/api/invoices/by-apartments")
    public List<InvoiceDto> getByApartments(@RequestParam List<Long> aptIds) {
        return invoiceService.getInvoicesByApartmentIds(aptIds);
    }

    @GetMapping("/api/admin/invoices/by-apartments")
    public List<InvoiceDto> getByApartmentsAdmin(@RequestParam List<Long> aptIds) {
        return invoiceService.getInvoicesByApartmentIds(aptIds);
    }

    /**
     * [EN] Get all invoices (admin only)
     * [VI] Lấy tất cả hóa đơn (chỉ admin)
     */
    @GetMapping("/api/admin/invoices")
    public ResponseEntity<List<InvoiceDto>> getAllInvoices() {
        try {
            List<InvoiceDto> invoices = invoiceService.getAllInvoices();
            
            // Log admin activity (smart logging)
            smartActivityLogService.logSmartActivity(ActivityActionType.VIEW_INVOICE, 
                "Admin xem tất cả hóa đơn (%d hóa đơn)", invoices.size());
            
            return ResponseEntity.ok(invoices);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * [EN] Get invoice by ID (admin only)
     * [VI] Lấy hóa đơn theo ID (chỉ admin)
     */
    @GetMapping("/api/admin/invoices/{id}")
    public ResponseEntity<InvoiceDto> getInvoiceById(@PathVariable Long id) {
        try {
            return invoiceService.getInvoiceById(id)
                    .map(invoice -> {
                        // Log admin activity (smart logging)
                        smartActivityLogService.logSmartActivity(ActivityActionType.VIEW_INVOICE, 
                            "Admin xem hóa đơn #%d", id);
                        return ResponseEntity.ok(invoice);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * [EN] Get invoice items by invoice ID (admin only)
     * [VI] Lấy chi tiết các khoản phí của hóa đơn theo ID (chỉ admin)
     */
    @GetMapping("/api/admin/invoices/{id}/items")
    public ResponseEntity<Map<String, Object>> getInvoiceItems(@PathVariable Long id) {
        try {
            Optional<InvoiceDto> invoiceOpt = invoiceService.getInvoiceById(id);
            if (invoiceOpt.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Không tìm thấy hóa đơn với ID: " + id);
                return ResponseEntity.notFound().build();
            }
            
            InvoiceDto invoice = invoiceOpt.get();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("invoiceId", invoice.getId());
            response.put("apartmentId", invoice.getApartmentId());
            response.put("billingPeriod", invoice.getBillingPeriod());
            response.put("totalAmount", invoice.getTotalAmount());
            response.put("status", invoice.getStatus());
            response.put("items", invoice.getItems());
            response.put("itemCount", invoice.getItems() != null ? invoice.getItems().size() : 0);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi lấy chi tiết hóa đơn: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * [EN] Create new invoice (admin only)
     * [VI] Tạo hóa đơn mới (chỉ admin)
     */
    @PostMapping("/api/admin/invoices")
    public ResponseEntity<InvoiceDto> createInvoice(@RequestBody InvoiceCreateRequest request) {
        try {
            // TODO: Implement create invoice logic
            // Log admin activity (smart logging)
            smartActivityLogService.logSmartActivity(ActivityActionType.CREATE_INVOICE, 
                "Admin tạo hóa đơn mới cho căn hộ %d", request.getApartmentId());
            
            return ResponseEntity.status(501).build(); // Not implemented yet
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * [EN] Update invoice (admin only)
     * [VI] Cập nhật hóa đơn (chỉ admin)
     */
    @PutMapping("/api/admin/invoices/{id}")
    public ResponseEntity<InvoiceDto> updateInvoice(@PathVariable Long id, @RequestBody InvoiceUpdateRequest request) {
        try {
            // TODO: Implement update invoice logic
            // Log admin activity (smart logging)
            smartActivityLogService.logSmartActivity(ActivityActionType.UPDATE_INVOICE, 
                "Admin cập nhật hóa đơn #%d", id);
            
            return ResponseEntity.status(501).build(); // Not implemented yet
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * [EN] Delete invoice (admin only)
     * [VI] Xóa hóa đơn (chỉ admin)
     */
    @DeleteMapping("/api/admin/invoices/{id}")
    public ResponseEntity<Void> deleteInvoice(@PathVariable Long id) {
        try {
            // TODO: Implement delete invoice logic
            // Log admin activity (smart logging)
            smartActivityLogService.logSmartActivity(ActivityActionType.DELETE_INVOICE, 
                "Admin xóa hóa đơn #%d", id);
            
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * [EN] Get current user's invoices
     * [VI] Lấy hóa đơn của người dùng hiện tại
     */
    @GetMapping("/api/invoices/my")
    public ResponseEntity<List<InvoiceDto>> getMyInvoices() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                return ResponseEntity.status(401).build();
            }

            String username = auth.getName();
            List<InvoiceDto> invoices = invoiceService.getInvoicesByUsername(username);
            
            // Removed automatic logging to reduce excessive logs
            // Only log when user actually performs an action, not when page loads
            
            return ResponseEntity.ok(invoices);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Tạo hóa đơn cho một căn hộ cụ thể
     */
    @PostMapping("/api/admin/invoices/generate")
    public ResponseEntity<Map<String, Object>> generateInvoiceForApartment(
            @RequestParam Long apartmentId,
            @RequestParam String billingPeriod) {
        try {
            System.out.println("DEBUG: Bắt đầu tạo hóa đơn cho căn hộ " + apartmentId + " tháng " + billingPeriod);
            
            // Kiểm tra xem hóa đơn đã tồn tại chưa
            Optional<Invoice> existingInvoice = invoiceRepository.findByApartmentIdAndBillingPeriod(apartmentId, billingPeriod);
            if (existingInvoice.isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", String.format("Hóa đơn cho căn hộ %d tháng %s đã tồn tại", apartmentId, billingPeriod));
                return ResponseEntity.badRequest().body(response);
            }
            
            // 1. Tạo hóa đơn cho căn hộ cụ thể
            Invoice inv = new Invoice();
            inv.setApartmentId(apartmentId);
            inv.setBillingPeriod(billingPeriod);
            inv.setIssueDate(LocalDate.now());
            inv.setDueDate(LocalDate.now().plusDays(15));
            inv.setStatus(InvoiceStatus.UNPAID);
            inv.setTotalAmount(0.01); // Đặt giá trị nhỏ > 0 để tránh vi phạm constraint
            invoiceRepository.save(inv);
            System.out.println("DEBUG: Đã tạo hóa đơn cơ bản cho căn hộ " + apartmentId);
            
            // 2. Tạo cấu hình phí dịch vụ cho tháng này nếu chưa có
            YearMonth yearMonth = YearMonth.parse(billingPeriod);
            int month = yearMonth.getMonthValue();
            int year = yearMonth.getYear();
            
            Optional<ServiceFeeConfig> existingConfig = serviceFeeConfigRepository.findByMonthAndYear(month, year);
            if (existingConfig.isEmpty()) {
                System.out.println("DEBUG: Tạo cấu hình phí dịch vụ cho tháng " + month + "/" + year);
                ServiceFeeConfig config = ServiceFeeConfig.builder()
                    .month(month)
                    .year(year)
                    .serviceFeePerM2(5000.0)  // 5000 VND/m²
                    .waterFeePerM3(15000.0)   // 15000 VND/m³
                    .motorcycleFee(50000.0)   // 50000 VND/tháng
                    .car4SeatsFee(200000.0)   // 200000 VND/tháng
                    .car7SeatsFee(250000.0)   // 250000 VND/tháng
                    .build();
                serviceFeeConfigRepository.save(config);
            }
            
            // 3. Chạy tất cả FeeService để thêm các khoản phí CHO CĂN HỘ CỤ THỂ
            System.out.println("DEBUG: Chạy các MonthlyFeeService để thêm chi tiết phí cho căn hộ " + apartmentId);
            feeServices.forEach(svc -> {
                try {
                    svc.generateFeeForMonth(billingPeriod, apartmentId);
                    System.out.println("DEBUG: Đã chạy " + svc.getClass().getSimpleName() + " cho căn hộ " + apartmentId);
                } catch (Exception e) {
                    System.err.println("DEBUG: Lỗi khi chạy " + svc.getClass().getSimpleName() + " cho căn hộ " + apartmentId + ": " + e.getMessage());
                }
            });
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", String.format("Đã tạo hóa đơn cho căn hộ %d tháng %s", apartmentId, billingPeriod));
            response.put("apartmentId", apartmentId);
            response.put("billingPeriod", billingPeriod);
            response.put("note", "Hóa đơn đã được tạo với đầy đủ chi tiết các khoản phí");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi tạo hóa đơn: " + e.getMessage());

            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Tạo hóa đơn cho tất cả căn hộ trong tháng chỉ định
     */
    @PostMapping("/api/admin/invoices/generate-month")
    public ResponseEntity<Map<String, Object>> generateInvoicesForMonth(
            @RequestParam Integer year,
            @RequestParam Integer month) {
        try {
            // Validate tháng năm
            if (year < 2020 || year > 2030) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Năm phải từ 2020 đến 2030");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (month < 1 || month > 12) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Tháng phải từ 1 đến 12");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Tạo billingPeriod từ year và month
            String billingPeriod = String.format("%04d-%02d", year, month);
            System.out.println("DEBUG: Bắt đầu tạo hóa đơn cho tháng " + billingPeriod);
            
            // 1. Tạo hóa đơn cơ bản cho tất cả căn hộ CHỈ trong tháng này
            invoiceService.generateInvoicesForMonth(billingPeriod);
            
            // 2. Tạo cấu hình phí dịch vụ cho tháng này nếu chưa có
            Optional<ServiceFeeConfig> existingConfig = serviceFeeConfigRepository.findByMonthAndYear(month, year);
            if (existingConfig.isEmpty()) {
                System.out.println("DEBUG: Tạo cấu hình phí dịch vụ cho tháng " + month + "/" + year);
                ServiceFeeConfig config = ServiceFeeConfig.builder()
                    .month(month)
                    .year(year)
                    .serviceFeePerM2(5000.0)  // 5000 VND/m²
                    .waterFeePerM3(15000.0)   // 15000 VND/m³
                    .motorcycleFee(50000.0)   // 50000 VND/tháng
                    .car4SeatsFee(200000.0)   // 200000 VND/tháng
                    .car7SeatsFee(250000.0)   // 250000 VND/tháng
                    .build();
                serviceFeeConfigRepository.save(config);
            }
            
            // 3. Log danh sách các MonthlyFeeService được inject
            System.out.println("DEBUG: Số lượng MonthlyFeeService được inject: " + feeServices.size());
            if (feeServices.isEmpty()) {
                System.err.println("DEBUG: KHÔNG CÓ MonthlyFeeService nào được inject!");
            } else {
                System.out.println("DEBUG: Danh sách các MonthlyFeeService:");
                feeServices.forEach(svc -> {
                    System.out.println(" - " + svc.getClass().getName());
                });
            }

            // 4. Chạy từng service và log chi tiết
            feeServices.forEach(svc -> {
                try {
                    System.out.println("DEBUG: Đang chạy service: " + svc.getClass().getName());
                    svc.generateFeeForMonth(billingPeriod);
                    System.out.println("DEBUG: Đã chạy xong service: " + svc.getClass().getName());
                } catch (Exception e) {
                    System.err.println("DEBUG: Lỗi khi chạy " + svc.getClass().getName() + ": " + e.getMessage());
                    e.printStackTrace();
                }
            });
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", String.format("Đã tạo hóa đơn cho tất cả căn hộ tháng %d/%d", month, year));
            response.put("year", year);
            response.put("month", month);
            response.put("billingPeriod", billingPeriod);
            response.put("note", "Hóa đơn đã được tạo với đầy đủ chi tiết các khoản phí CHỈ cho tháng được chỉ định");
            response.put("feeServicesCount", feeServices.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi tạo hóa đơn: " + e.getMessage());

            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Debug: Manually generate water meter fee for specific apartment
     * Tạo phí nước thủ công cho căn hộ cụ thể để debug
     */
    @PostMapping("/api/admin/invoices/debug-water-fee")
    public ResponseEntity<Map<String, Object>> debugWaterFee(
            @RequestParam Long apartmentId,
            @RequestParam String billingPeriod) {
        try {
            System.out.println("DEBUG: Manual water fee generation for apartment " + apartmentId + " period " + billingPeriod);
            
            // Find WaterMeterMonthlyFeeService and run it for specific apartment
            Optional<com.mytech.apartment.portal.services.MonthlyFeeService> waterFeeService = feeServices.stream()
                .filter(service -> service.getClass().getSimpleName().equals("WaterMeterMonthlyFeeService"))
                .findFirst();
            
            if (waterFeeService.isPresent()) {
                System.out.println("DEBUG: Found WaterMeterMonthlyFeeService, running for apartment " + apartmentId);
                waterFeeService.get().generateFeeForMonth(billingPeriod, apartmentId);
                
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Đã tạo phí nước thủ công cho căn hộ " + apartmentId + " tháng " + billingPeriod);
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Không tìm thấy WaterMeterMonthlyFeeService");
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi tạo phí nước: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * DEBUG: Test water billing without authentication
     */
    @PostMapping("/test/debug-water-billing")
    public ResponseEntity<Map<String, Object>> testWaterBilling(
            @RequestParam(defaultValue = "56") Long apartmentId,
            @RequestParam(defaultValue = "2025-08") String billingPeriod) {
        try {
            Map<String, Object> response = new HashMap<>();
            System.out.println("=== DEBUG WATER BILLING START ===");
            System.out.println("Apartment ID: " + apartmentId);
            System.out.println("Billing Period: " + billingPeriod);
            
            // 1. Check if water meter reading exists
            Optional<com.mytech.apartment.portal.models.WaterMeterReading> reading = 
                waterMeterReadingRepository.findByApartmentIdAndReadingMonth(apartmentId.intValue(), billingPeriod);
            
            if (reading.isPresent()) {
                com.mytech.apartment.portal.models.WaterMeterReading r = reading.get();
                System.out.println("Found water meter reading:");
                System.out.println("- Previous: " + r.getPreviousReading());
                System.out.println("- Current: " + r.getCurrentReading());
                System.out.println("- Consumption: " + r.getConsumption());
                
                response.put("waterMeterExists", true);
                response.put("previousReading", r.getPreviousReading());
                response.put("currentReading", r.getCurrentReading());
                response.put("consumption", r.getConsumption());
            } else {
                System.out.println("NO water meter reading found!");
                response.put("waterMeterExists", false);
            }
            
            // 2. Check existing invoice
            Optional<com.mytech.apartment.portal.models.Invoice> invoice = 
                invoiceRepository.findByApartmentIdAndBillingPeriod(apartmentId, billingPeriod);
            
            if (invoice.isPresent()) {
                com.mytech.apartment.portal.models.Invoice inv = invoice.get();
                System.out.println("Found existing invoice:");
                System.out.println("- Total Amount: " + inv.getTotalAmount());
                System.out.println("- Items count: " + inv.getItems().size());
                
                inv.getItems().forEach(item -> {
                    System.out.println("  * " + item.getFeeType() + ": " + item.getAmount() + " - " + item.getDescription());
                });
                
                response.put("invoiceExists", true);
                response.put("totalAmount", inv.getTotalAmount());
                response.put("itemsCount", inv.getItems().size());
                
                boolean hasWaterFee = inv.getItems().stream()
                    .anyMatch(item -> "WATER_FEE".equals(item.getFeeType()));
                response.put("hasWaterFee", hasWaterFee);
                System.out.println("Has water fee: " + hasWaterFee);
            } else {
                System.out.println("NO invoice found!");
                response.put("invoiceExists", false);
            }
            
            // 3. Test WaterMeterMonthlyFeeService
            System.out.println("Testing WaterMeterMonthlyFeeService...");
            Optional<com.mytech.apartment.portal.services.MonthlyFeeService> waterFeeService = feeServices.stream()
                .filter(service -> service.getClass().getSimpleName().equals("WaterMeterMonthlyFeeService"))
                .findFirst();
            
            if (waterFeeService.isPresent()) {
                System.out.println("Found WaterMeterMonthlyFeeService, running manual generation...");
                waterFeeService.get().generateFeeForMonth(billingPeriod, apartmentId);
                response.put("waterServiceExecuted", true);
            } else {
                System.out.println("WaterMeterMonthlyFeeService NOT FOUND!");
                response.put("waterServiceExecuted", false);
                response.put("availableServices", feeServices.stream()
                    .map(svc -> svc.getClass().getSimpleName())
                    .collect(java.util.stream.Collectors.toList()));
            }
            
            System.out.println("=== DEBUG WATER BILLING END ===");
            
            response.put("success", true);
            response.put("message", "Debug completed - check console logs");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("ERROR in debug: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Chạy lại tính phí cho một tháng cụ thể (không tạo hóa đơn mới)
     */
    @PostMapping("/api/admin/invoices/recalculate-fees")
    public ResponseEntity<Map<String, Object>> recalculateFeesForMonth(
            @RequestParam String billingPeriod) {
        try {
            // Chỉ chạy các FeeService để tính lại phí
            feeServices.forEach(svc -> svc.generateFeeForMonth(billingPeriod));

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", String.format("Đã tính lại phí cho tháng %s", billingPeriod));
            response.put("billingPeriod", billingPeriod);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi tính lại phí: " + e.getMessage());

            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Test API để kiểm tra việc tạo chi tiết hóa đơn
     */
    @GetMapping("/api/admin/invoices/test-fee-generation")
    public ResponseEntity<Map<String, Object>> testFeeGeneration(
            @RequestParam String billingPeriod,
            @RequestParam(required = false) Long apartmentId) {
        try {
            Map<String, Object> response = new HashMap<>();
            
            // Kiểm tra số lượng MonthlyFeeService
            response.put("feeServicesCount", feeServices.size());
            
            List<String> serviceNames = new ArrayList<>();
            feeServices.forEach(svc -> {
                serviceNames.add(svc.getClass().getSimpleName());
            });
            response.put("serviceNames", serviceNames);
            
            // Kiểm tra dữ liệu căn hộ
            List<Long> apartmentIds = apartmentRepository.findAll().stream()
                .map(apartment -> apartment.getId())
                .collect(Collectors.toList());
            response.put("apartmentCount", apartmentIds.size());
            response.put("apartmentIds", apartmentIds);
            
            // Kiểm tra cấu hình phí dịch vụ
            YearMonth yearMonth = YearMonth.parse(billingPeriod);
            Optional<ServiceFeeConfig> config = serviceFeeConfigRepository
                .findByMonthAndYear(yearMonth.getMonthValue(), yearMonth.getYear());
            response.put("hasServiceFeeConfig", config.isPresent());
            if (config.isPresent()) {
                response.put("serviceFeeConfig", config.get());
            }
            
            // Kiểm tra hóa đơn đã tồn tại
            if (apartmentId != null) {
                Optional<Invoice> existingInvoice = invoiceRepository.findByApartmentIdAndBillingPeriod(apartmentId, billingPeriod);
                response.put("hasInvoice", existingInvoice.isPresent());
                if (existingInvoice.isPresent()) {
                    response.put("invoiceId", existingInvoice.get().getId());
                    response.put("invoiceItemsCount", existingInvoice.get().getItems() != null ? existingInvoice.get().getItems().size() : 0);
                }
            }
            
            response.put("success", true);
            response.put("billingPeriod", billingPeriod);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi test: " + e.getMessage());
            response.put("error", e.toString());
            
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Test endpoint để kiểm tra việc tạo hóa đơn với tất cả các item (bao gồm số tiền = 0)
     */
    @PostMapping("/test/create-invoice-with-all-items")
    public ResponseEntity<Map<String, Object>> testCreateInvoiceWithAllItems(
            @RequestParam(defaultValue = "1") Long apartmentId,
            @RequestParam(defaultValue = "2025-01") String billingPeriod) {
        try {
            System.out.println("=== TEST: Tạo hóa đơn với tất cả các item ===");
            System.out.println("Apartment ID: " + apartmentId);
            System.out.println("Billing Period: " + billingPeriod);
            
            // 0. Xóa hóa đơn cũ nếu có
            Optional<Invoice> existingInvoice = invoiceRepository.findByApartmentIdAndBillingPeriod(apartmentId, billingPeriod);
            if (existingInvoice.isPresent()) {
                System.out.println("🗑️ Xóa hóa đơn cũ với ID: " + existingInvoice.get().getId());
                invoiceRepository.delete(existingInvoice.get());
            }
            
            // 1. Tạo hóa đơn cơ bản
            Invoice inv = new Invoice();
            inv.setApartmentId(apartmentId);
            inv.setBillingPeriod(billingPeriod);
            inv.setIssueDate(LocalDate.now());
            inv.setDueDate(LocalDate.now().plusDays(15));
            inv.setStatus(InvoiceStatus.UNPAID);
            inv.setTotalAmount(0.0);
            inv.setItems(new HashSet<>());
            invoiceRepository.save(inv);
            
            System.out.println("✅ Đã tạo hóa đơn cơ bản với ID: " + inv.getId());
            
            // 2. Chạy tất cả các service để thêm items
            System.out.println("🔄 Đang chạy các service tính phí...");
            feeServices.forEach(svc -> {
                try {
                    System.out.println("📋 Chạy service: " + svc.getClass().getSimpleName());
                    svc.generateFeeForMonth(billingPeriod, apartmentId);
                    System.out.println("✅ Hoàn thành: " + svc.getClass().getSimpleName());
                } catch (Exception e) {
                    System.err.println("❌ Lỗi khi chạy " + svc.getClass().getSimpleName() + ": " + e.getMessage());
                    e.printStackTrace();
                }
            });
            
            // 3. Lấy hóa đơn đã tạo để kiểm tra
            Optional<Invoice> createdInvoice = invoiceRepository.findByApartmentIdAndBillingPeriod(apartmentId, billingPeriod);
            if (createdInvoice.isPresent()) {
                Invoice invoice = createdInvoice.get();
                System.out.println("📊 Thông tin hóa đơn:");
                System.out.println("   - ID: " + invoice.getId());
                System.out.println("   - Tổng tiền: " + invoice.getTotalAmount());
                System.out.println("   - Số lượng items: " + (invoice.getItems() != null ? invoice.getItems().size() : 0));
                
                if (invoice.getItems() != null) {
                    System.out.println("📋 Chi tiết các items:");
                    invoice.getItems().forEach(item -> {
                        System.out.println("   - " + item.getFeeType() + ": " + item.getAmount() + " VND - " + item.getDescription());
                    });
                }
                
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Đã tạo hóa đơn thành công với tất cả các item");
                response.put("invoiceId", invoice.getId());
                response.put("totalAmount", invoice.getTotalAmount());
                response.put("itemCount", invoice.getItems() != null ? invoice.getItems().size() : 0);
                response.put("items", invoice.getItems());
                
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Không tìm thấy hóa đơn sau khi tạo");
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi tạo hóa đơn: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * [EN] Download invoice PDF
     * [VI] Tải hóa đơn PDF
     */
    @GetMapping("/api/invoices/{id}/download")
    public ResponseEntity<String> downloadInvoice(@PathVariable("id") Long invoiceId) {
        try {
            // TODO: Implement PDF generation
            // Log download activity (smart logging)
            smartActivityLogService.logSmartActivity(ActivityActionType.DOWNLOAD_INVOICE, 
                "Tải hóa đơn #%d", invoiceId);
            
            return ResponseEntity.ok("PDF content would be here");
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}
