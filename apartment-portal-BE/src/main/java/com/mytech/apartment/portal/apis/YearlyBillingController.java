package com.mytech.apartment.portal.apis;

import com.mytech.apartment.portal.dtos.YearlyBillingRequest;
import com.mytech.apartment.portal.services.YearlyBillingService;
import com.mytech.apartment.portal.repositories.InvoiceRepository;
import com.mytech.apartment.portal.models.enums.InvoiceStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.ArrayList;
import com.mytech.apartment.portal.models.Invoice;
import com.mytech.apartment.portal.models.InvoiceItem;
import com.mytech.apartment.portal.models.WaterMeterReading;
import com.mytech.apartment.portal.repositories.WaterMeterReadingRepository;

@RestController
@RequestMapping("/api/admin/yearly-billing")
public class YearlyBillingController {

    @Autowired
    private YearlyBillingService yearlyBillingService;
    
    @Autowired
    private InvoiceRepository invoiceRepository;
    
    @Autowired
    private WaterMeterReadingRepository waterMeterReadingRepository;
    
    // Rate limiting map - track last request time per endpoint
    private final Map<String, LocalDateTime> lastRequestTime = new ConcurrentHashMap<>();
    private static final long MIN_REQUEST_INTERVAL_MS = 500; // Increased to 500ms to avoid too many rate limits





    /**
     * Tạo hóa đơn cho tất cả căn hộ trong một tháng cụ thể
     */
    @PostMapping("/generate-month/{year}/{month}")
    public ResponseEntity<Map<String, Object>> generateInvoicesForMonth(
            @PathVariable int year,
            @PathVariable int month,
            @RequestBody YearlyBillingRequest request) {
        
        // Rate limiting check
        String endpoint = "generate-month-" + year + "-" + month;
        if (!checkRateLimit(endpoint)) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Quá nhiều request. Vui lòng thử lại sau 100ms.");
            return ResponseEntity.status(429).body(response);
        }
        
        try {
            System.out.println("DEBUG: Bắt đầu tạo hóa đơn cho tháng " + month + "/" + year);
            System.out.println("DEBUG: Sử dụng YearlyBillingService.generateInvoicesForMonth()");
            
            // Tạo cấu hình phí cho tháng này nếu chưa có
            yearlyBillingService.updateFeeConfig(month, year, 
                request.getServiceFeePerM2(), 
                request.getWaterFeePerM3(), 
                request.getMotorcycleFee(),
                request.getCar4SeatsFee(), 
                request.getCar7SeatsFee());
            
            // Tạo hóa đơn cho tất cả căn hộ trong tháng này
            System.out.println("DEBUG: Gọi yearlyBillingService.generateInvoicesForMonth(" + year + ", " + month + ")");
            yearlyBillingService.generateInvoicesForMonth(year, month);
            System.out.println("DEBUG: Hoàn thành yearlyBillingService.generateInvoicesForMonth()");
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", String.format("Đã tạo hóa đơn cho tất cả căn hộ tháng %d/%d", month, year));
            response.put("year", year);
            response.put("month", month);
            response.put("note", "Hóa đơn đã được tạo cho tất cả căn hộ trong tháng này");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi tạo hóa đơn: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Tạo hóa đơn đồng loạt cho tất cả căn hộ trong một tháng (cải tiến)
     */
    @PostMapping("/generate-monthly-invoices")
    public ResponseEntity<Map<String, Object>> generateMonthlyInvoicesForAllApartments(
            @RequestBody YearlyBillingRequest request) {
        
        // Rate limiting check
        String endpoint = "generate-monthly-invoices";
        if (!checkRateLimit(endpoint)) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Quá nhiều request. Vui lòng thử lại sau 500ms.");
            return ResponseEntity.status(429).body(response);
        }
        
        try {
            int year = request.getYear();
            int month = request.getMonth();
            
            System.out.println("DEBUG: Bắt đầu tạo hóa đơn đồng loạt cho tháng " + month + "/" + year);
            
            // Tạo cấu hình phí cho tháng này nếu chưa có
            yearlyBillingService.updateFeeConfig(month, year, 
                request.getServiceFeePerM2(), 
                request.getWaterFeePerM3(), 
                request.getMotorcycleFee(),
                request.getCar4SeatsFee(), 
                request.getCar7SeatsFee());
            
            // Tạo hóa đơn đồng loạt cho tất cả căn hộ trong tháng này
            yearlyBillingService.generateMonthlyInvoicesForAllApartments(year, month);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", String.format("Đã tạo hóa đơn đồng loạt cho tất cả căn hộ tháng %d/%d", month, year));
            response.put("year", year);
            response.put("month", month);
            response.put("note", "Hóa đơn đã được tạo với tính toán tổng tiền chính xác từ các items");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi tạo hóa đơn đồng loạt: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Kiểm tra và sửa lỗi tổng tiền hóa đơn cho một tháng
     */
    @PostMapping("/validate-fix-totals")
    public ResponseEntity<Map<String, Object>> validateAndFixInvoiceTotals(
            @RequestBody YearlyBillingRequest request) {
        
        // Rate limiting check
        String endpoint = "validate-fix-totals";
        if (!checkRateLimit(endpoint)) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Quá nhiều request. Vui lòng thử lại sau 500ms.");
            return ResponseEntity.status(429).body(response);
        }
        
        try {
            int year = request.getYear();
            int month = request.getMonth();
            
            System.out.println("DEBUG: Bắt đầu kiểm tra và sửa lỗi tổng tiền hóa đơn cho tháng " + month + "/" + year);
            
            // Kiểm tra và sửa lỗi tổng tiền hóa đơn
            yearlyBillingService.validateAndFixInvoiceTotals(year, month);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", String.format("Đã kiểm tra và sửa lỗi tổng tiền hóa đơn cho tháng %d/%d", month, year));
            response.put("year", year);
            response.put("month", month);
            response.put("note", "Tổng tiền hóa đơn đã được tính lại từ các items");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi kiểm tra và sửa lỗi tổng tiền: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Cập nhật tổng tiền cho tất cả hóa đơn trong một kỳ thanh toán
     */
    @PostMapping("/update-invoice-totals")
    public ResponseEntity<Map<String, Object>> updateAllInvoiceTotalsForPeriod(
            @RequestBody Map<String, String> request) {
        
        // Rate limiting check
        String endpoint = "update-invoice-totals";
        if (!checkRateLimit(endpoint)) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Quá nhiều request. Vui lòng thử lại sau 500ms.");
            return ResponseEntity.status(429).body(response);
        }
        
        try {
            String billingPeriod = request.get("billingPeriod");
            
            if (billingPeriod == null || billingPeriod.trim().isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Billing period không được để trống");
                return ResponseEntity.badRequest().body(response);
            }
            
            System.out.println("DEBUG: Bắt đầu cập nhật tổng tiền hóa đơn cho kỳ " + billingPeriod);
            
            // Cập nhật tổng tiền cho tất cả hóa đơn trong kỳ
            yearlyBillingService.updateAllInvoiceTotalsForPeriod(billingPeriod);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đã cập nhật tổng tiền hóa đơn cho kỳ " + billingPeriod);
            response.put("billingPeriod", billingPeriod);
            response.put("note", "Tổng tiền đã được tính lại từ các items");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi cập nhật tổng tiền hóa đơn: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Tạo biểu phí cấu hình cho 1 năm (chỉ tạo cấu hình, không tạo hóa đơn)
     */
    @PostMapping("/fee-config")
    public ResponseEntity<Map<String, Object>> createYearlyFeeConfig(@RequestBody YearlyBillingRequest request) {
        // Rate limiting check
        String endpoint = "fee-config";
        if (!checkRateLimit(endpoint)) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Quá nhiều request. Vui lòng thử lại sau 100ms.");
            return ResponseEntity.status(429).body(response);
        }
        
        try {
            yearlyBillingService.createYearlyFeeConfig(
                request.getYear(), 
                request.getServiceFeePerM2(), 
                request.getWaterFeePerM3(), 
                request.getMotorcycleFee(),
                request.getCar4SeatsFee(),
                request.getCar7SeatsFee()
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", String.format("Đã tạo biểu phí cấu hình cho năm %d", request.getYear()));
            response.put("year", request.getYear());
            response.put("serviceFeePerM2", request.getServiceFeePerM2());
            response.put("waterFeePerM3", request.getWaterFeePerM3());
            response.put("motorcycleFee", request.getMotorcycleFee());
            response.put("car4SeatsFee", request.getCar4SeatsFee());
            response.put("car7SeatsFee", request.getCar7SeatsFee());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi tạo biểu phí: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Tạo biểu phí cấu hình cho năm hiện tại (chỉ tạo cấu hình, không tạo hóa đơn)
     */
    @PostMapping("/generate-current-year")
    public ResponseEntity<Map<String, Object>> generateCurrentYearInvoices(@RequestBody YearlyBillingRequest request) {
        // Rate limiting check
        String endpoint = "generate-current-year";
        if (!checkRateLimit(endpoint)) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Quá nhiều request. Vui lòng thử lại sau 100ms.");
            return ResponseEntity.status(429).body(response);
        }
        
        try {
            // Tạo cấu hình phí dịch vụ cho năm hiện tại
            yearlyBillingService.createYearlyFeeConfig(
                request.getYear(),
                request.getServiceFeePerM2(),
                request.getWaterFeePerM3(),
                request.getMotorcycleFee(),
                request.getCar4SeatsFee(),
                request.getCar7SeatsFee()
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", String.format("Đã tạo biểu phí cấu hình cho năm %d", request.getYear()));
            response.put("year", request.getYear());
            response.put("serviceFeePerM2", request.getServiceFeePerM2());
            response.put("waterFeePerM3", request.getWaterFeePerM3());
            response.put("motorcycleFee", request.getMotorcycleFee());
            response.put("car4SeatsFee", request.getCar4SeatsFee());
            response.put("car7SeatsFee", request.getCar7SeatsFee());
            response.put("note", "Chỉ tạo cấu hình phí, không tạo hóa đơn");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi tạo biểu phí: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Cập nhật cấu hình phí cho một tháng cụ thể
     */
    @PutMapping("/config/{year}/{month}")
    public ResponseEntity<Map<String, Object>> updateFeeConfig(
            @PathVariable int year,
            @PathVariable int month,
            @RequestParam double serviceFeePerM2,
            @RequestParam double waterFeePerM3,
            @RequestParam double motorcycleFee,
            @RequestParam double car4SeatsFee,
            @RequestParam double car7SeatsFee) {
        // Rate limiting check
        String endpoint = "update-config-" + year + "-" + month;
        if (!checkRateLimit(endpoint)) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Quá nhiều request. Vui lòng thử lại sau 100ms.");
            return ResponseEntity.status(429).body(response);
        }
        
        try {
            yearlyBillingService.updateFeeConfig(month, year, serviceFeePerM2, waterFeePerM3, motorcycleFee, car4SeatsFee, car7SeatsFee);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", String.format("Đã cập nhật cấu hình phí tháng %d/%d", month, year));
            response.put("year", year);
            response.put("month", month);
            response.put("serviceFeePerM2", serviceFeePerM2);
            response.put("waterFeePerM3", waterFeePerM3);
            response.put("motorcycleFee", motorcycleFee);
            response.put("car4SeatsFee", car4SeatsFee);
            response.put("car7SeatsFee", car7SeatsFee);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi cập nhật cấu hình: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Lấy cấu hình phí cho một tháng cụ thể
     */
    @GetMapping("/config/{year}/{month}")
    public ResponseEntity<Map<String, Object>> getFeeConfig(
            @PathVariable int year,
            @PathVariable int month) {
        
        // Rate limiting check
        String endpoint = "get-config-" + year + "-" + month;
        if (!checkRateLimit(endpoint)) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Quá nhiều request. Vui lòng thử lại sau 100ms.");
            return ResponseEntity.status(429).body(response);
        }
        
        // Thêm logging để debug
        System.out.println("DEBUG: getFeeConfig called for year=" + year + ", month=" + month + " at " + LocalDateTime.now());
        
        try {
            var config = yearlyBillingService.getFeeConfig(month, year);
            
            Map<String, Object> response = new HashMap<>();
            if (config.isPresent()) {
                response.put("success", true);
                response.put("config", config.get());
            } else {
                response.put("success", false);
                response.put("message", String.format("Không tìm thấy cấu hình phí tháng %d/%d", month, year));
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi lấy cấu hình: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Lấy tất cả cấu hình phí cho một năm
     */
    @GetMapping("/config/{year}")
    public ResponseEntity<Map<String, Object>> getYearlyFeeConfig(@PathVariable int year) {
        // Rate limiting check
        String endpoint = "get-yearly-config-" + year;
        if (!checkRateLimit(endpoint)) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Quá nhiều request. Vui lòng thử lại sau 100ms.");
            return ResponseEntity.status(429).body(response);
        }
        
        try {
            var configs = yearlyBillingService.getYearlyFeeConfig(year);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("configs", configs);
            response.put("year", year);
            response.put("count", configs.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi lấy cấu hình: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Clear cache (for debugging purposes)
     */
    @PostMapping("/clear-cache")
    public ResponseEntity<Map<String, Object>> clearCache() {
        try {
            yearlyBillingService.clearCache();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đã xóa cache thành công");
            response.put("timestamp", LocalDateTime.now().toString());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi xóa cache: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Get cache status (for debugging purposes)
     */
    @GetMapping("/cache-status")
    public ResponseEntity<Map<String, Object>> getCacheStatus() {
        try {
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Cache status retrieved");
            response.put("timestamp", LocalDateTime.now().toString());
            response.put("rateLimitMapSize", lastRequestTime.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi lấy trạng thái cache: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Xem thống kê hóa đơn đã tạo cho một năm
     */
    @GetMapping("/invoice-stats/{year}")
    public ResponseEntity<Map<String, Object>> getInvoiceStats(@PathVariable int year) {
        try {
            // Đếm tổng số hóa đơn trong năm
            long totalInvoices = invoiceRepository.countByBillingPeriodStartingWith(String.format("%04d-", year));
            
            // Đếm số hóa đơn theo trạng thái
            long unpaidInvoices = invoiceRepository.countByBillingPeriodStartingWithAndStatus(
                String.format("%04d-", year), InvoiceStatus.UNPAID);
            long paidInvoices = invoiceRepository.countByBillingPeriodStartingWithAndStatus(
                String.format("%04d-", year), InvoiceStatus.PAID);
            long overdueInvoices = invoiceRepository.countByBillingPeriodStartingWithAndStatus(
                String.format("%04d-", year), InvoiceStatus.OVERDUE);
            
            // Tính tổng tiền
            Double totalAmount = invoiceRepository.sumTotalAmountByBillingPeriodStartingWith(
                String.format("%04d-", year));
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("year", year);
            response.put("totalInvoices", totalInvoices);
            response.put("unpaidInvoices", unpaidInvoices);
            response.put("paidInvoices", paidInvoices);
            response.put("overdueInvoices", overdueInvoices);
            response.put("totalAmount", totalAmount != null ? totalAmount : 0.0);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi lấy thống kê: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Test endpoint để debug việc tạo hóa đơn (không cần authentication)
     */
    @PostMapping("/test/debug-generate-invoice")
    public ResponseEntity<Map<String, Object>> testDebugGenerateInvoice(
            @RequestParam(defaultValue = "51") Long apartmentId,
            @RequestParam(defaultValue = "8") Integer month,
            @RequestParam(defaultValue = "2025") Integer year) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            System.out.println("=== TEST DEBUG: Tạo hóa đơn cho căn hộ " + apartmentId + " tháng " + month + "/" + year + " ===");
            
            String billingPeriod = String.format("%04d-%02d", year, month);
            System.out.println("DEBUG: Billing period: " + billingPeriod);
            
            // Kiểm tra hóa đơn đã tồn tại
            Optional<Invoice> existingInvoice = invoiceRepository.findByApartmentIdAndBillingPeriod(apartmentId, billingPeriod);
            if (existingInvoice.isPresent()) {
                System.out.println("DEBUG: Hóa đơn đã tồn tại, xóa hóa đơn cũ");
                invoiceRepository.delete(existingInvoice.get());
            }
            
            // Tạo hóa đơn mới
            yearlyBillingService.createInvoiceForApartment(apartmentId, billingPeriod, year, month);
            
            // Kiểm tra hóa đơn đã tạo
            Optional<Invoice> newInvoice = invoiceRepository.findByApartmentIdAndBillingPeriod(apartmentId, billingPeriod);
            if (newInvoice.isPresent()) {
                Invoice invoice = newInvoice.get();
                System.out.println("DEBUG: Đã tạo hóa đơn ID: " + invoice.getId());
                System.out.println("DEBUG: Tổng tiền: " + invoice.getTotalAmount());
                System.out.println("DEBUG: Số lượng items: " + invoice.getItems().size());
                
                for (InvoiceItem item : invoice.getItems()) {
                    System.out.println("DEBUG: Item - " + item.getFeeType() + ": " + item.getAmount() + " - " + item.getDescription());
                }
                
                response.put("success", true);
                response.put("message", "Đã tạo hóa đơn thành công");
                response.put("invoiceId", invoice.getId());
                response.put("totalAmount", invoice.getTotalAmount());
                response.put("itemCount", invoice.getItems().size());
                
                List<Map<String, Object>> items = new ArrayList<>();
                for (InvoiceItem item : invoice.getItems()) {
                    Map<String, Object> itemMap = new HashMap<>();
                    itemMap.put("feeType", item.getFeeType());
                    itemMap.put("amount", item.getAmount());
                    itemMap.put("description", item.getDescription());
                    items.add(itemMap);
                }
                response.put("items", items);
                
            } else {
                System.out.println("DEBUG: Không tạo được hóa đơn");
                response.put("success", false);
                response.put("message", "Không tạo được hóa đơn");
            }
            
        } catch (Exception e) {
            System.err.println("ERROR: " + e.getMessage());
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Lỗi: " + e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Debug endpoint để kiểm tra dữ liệu chỉ số nước
     */
    @GetMapping("/test/debug-water-data")
    public ResponseEntity<Map<String, Object>> debugWaterData(
            @RequestParam(defaultValue = "51") Long apartmentId,
            @RequestParam(defaultValue = "8") Integer month,
            @RequestParam(defaultValue = "2025") Integer year) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            System.out.println("=== DEBUG WATER DATA FOR APARTMENT " + apartmentId + " ===");
            
            String targetMonth = String.format("%04d-%02d", year, month);
            System.out.println("DEBUG: Tìm chỉ số nước cho tháng: " + targetMonth);
            
            // 1. Kiểm tra chỉ số nước cho tháng cụ thể
            Optional<WaterMeterReading> reading = waterMeterReadingRepository.findByApartmentIdAndReadingMonth(
                apartmentId.intValue(), targetMonth);
            
            if (reading.isPresent()) {
                WaterMeterReading waterReading = reading.get();
                System.out.println("DEBUG: Tìm thấy chỉ số nước:");
                System.out.println("  - Reading ID: " + waterReading.getReadingId());
                System.out.println("  - Apartment ID: " + waterReading.getApartmentId());
                System.out.println("  - Reading Month: " + waterReading.getReadingMonth());
                System.out.println("  - Previous Reading: " + waterReading.getPreviousReading());
                System.out.println("  - Current Reading: " + waterReading.getCurrentReading());
                System.out.println("  - Consumption: " + waterReading.getConsumption());
                
                response.put("found", true);
                response.put("readingId", waterReading.getReadingId());
                response.put("readingMonth", waterReading.getReadingMonth());
                response.put("previousReading", waterReading.getPreviousReading());
                response.put("currentReading", waterReading.getCurrentReading());
                response.put("consumption", waterReading.getConsumption());
                
                // Tính phí nước
                double waterRate = 15000.0; // Giá mặc định
                double waterFee = waterReading.getConsumption().doubleValue() * waterRate;
                response.put("waterRate", waterRate);
                response.put("waterFee", waterFee);
                
            } else {
                System.out.println("DEBUG: KHÔNG TÌM THẤY chỉ số nước cho tháng " + targetMonth);
                response.put("found", false);
                response.put("targetMonth", targetMonth);
            }
            
            // 2. Kiểm tra tất cả chỉ số nước của căn hộ này
            List<WaterMeterReading> allReadings = waterMeterReadingRepository
                .findAllByApartmentIdOrderByReadingMonthDesc(apartmentId.intValue());
            
            System.out.println("DEBUG: Tất cả chỉ số nước của căn hộ " + apartmentId + " (" + allReadings.size() + " records):");
            List<Map<String, Object>> allReadingsList = new ArrayList<>();
            
            for (WaterMeterReading r : allReadings) {
                System.out.println("  - " + r.getReadingMonth() + ": " + r.getPreviousReading() + " -> " + r.getCurrentReading() + " (consumption: " + r.getConsumption() + ")");
                
                Map<String, Object> readingMap = new HashMap<>();
                readingMap.put("readingMonth", r.getReadingMonth());
                readingMap.put("previousReading", r.getPreviousReading());
                readingMap.put("currentReading", r.getCurrentReading());
                readingMap.put("consumption", r.getConsumption());
                allReadingsList.add(readingMap);
            }
            
            response.put("allReadings", allReadingsList);
            response.put("totalReadings", allReadings.size());
            
        } catch (Exception e) {
            System.err.println("ERROR: " + e.getMessage());
            e.printStackTrace();
            response.put("success", false);
            response.put("error", e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Tạo hóa đơn đồng loạt cho tất cả căn hộ trong một tháng với đầy đủ các loại phí
     * @param year Năm
     * @param month Tháng (1-12)
     * @return Response với thống kê kết quả
     */
    @PostMapping("/api/admin/yearly-billing/generate-month-complete")
    public ResponseEntity<Map<String, Object>> generateCompleteMonthlyInvoices(
            @RequestParam Integer year,
            @RequestParam Integer month) {
        
        // Rate limiting check
        String endpoint = "generate-month-complete-" + year + "-" + month;
        if (!checkRateLimit(endpoint)) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Quá nhiều request. Vui lòng thử lại sau 100ms.");
            return ResponseEntity.status(429).body(response);
        }
        
        try {
            System.out.println("DEBUG: Bắt đầu tạo hóa đơn đồng loạt đầy đủ cho tháng " + month + "/" + year);
            
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
            
            // Tạo cấu hình phí cho tháng này nếu chưa có
            yearlyBillingService.updateFeeConfig(month, year, 
                5000.0,   // serviceFeePerM2
                15000.0,  // waterFeePerM3
                50000.0,  // motorcycleFee
                200000.0, // car4SeatsFee
                250000.0  // car7SeatsFee
            );
            
            // Tạo hóa đơn đồng loạt cho tất cả căn hộ với đầy đủ các loại phí
            yearlyBillingService.generateMonthlyInvoicesForAllApartments(year, month);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", String.format("Đã tạo hóa đơn đồng loạt đầy đủ cho tất cả căn hộ tháng %d/%d", month, year));
            response.put("year", year);
            response.put("month", month);
            response.put("note", "Hóa đơn đã được tạo với đầy đủ các loại phí: dịch vụ, nước, xe");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("ERROR: Lỗi khi tạo hóa đơn đồng loạt: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi tạo hóa đơn đồng loạt: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Rate limiting helper method
     */
    private boolean checkRateLimit(String endpoint) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime lastRequest = lastRequestTime.get(endpoint);
        
        if (lastRequest != null) {
            long timeDiff = java.time.Duration.between(lastRequest, now).toMillis();
            if (timeDiff < MIN_REQUEST_INTERVAL_MS) {
                System.out.println("DEBUG: Rate limit hit for endpoint: " + endpoint + " (time diff: " + timeDiff + "ms)");
                return false;
            }
        }
        
        lastRequestTime.put(endpoint, now);
        return true;
    }
} 
