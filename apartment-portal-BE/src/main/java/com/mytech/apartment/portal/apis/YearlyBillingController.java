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
// import java.util.List;
// import java.util.Optional;
// import java.util.ArrayList;
// import com.mytech.apartment.portal.models.Invoice;
// import com.mytech.apartment.portal.models.InvoiceItem;
// import com.mytech.apartment.portal.models.WaterMeterReading;
// import com.mytech.apartment.portal.repositories.WaterMeterReadingRepository;

@RestController
@RequestMapping("/api/admin/yearly-billing")
public class YearlyBillingController {

    @Autowired
    private YearlyBillingService yearlyBillingService;
    
    @Autowired
    private InvoiceRepository invoiceRepository;
    
    // @Autowired
    // private WaterMeterReadingRepository waterMeterReadingRepository;
    
    // Rate limiting map - track last request time per endpoint
    private final Map<String, LocalDateTime> lastRequestTime = new ConcurrentHashMap<>();
    private static final long MIN_REQUEST_INTERVAL_MS = 500; // Increased to 500ms to avoid too many rate limits

    /**
     * Tạo biểu phí 1 năm cho tất cả căn hộ hoặc một căn hộ cụ thể (chỉ tạo cấu hình, không tạo hóa đơn)
     */
    @PostMapping("/generate")
    public ResponseEntity<Map<String, Object>> generateYearlyInvoices(@RequestBody YearlyBillingRequest request) {
        // Rate limiting check
        String endpoint = "generate";
        if (!checkRateLimit(endpoint)) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Quá nhiều request. Vui lòng thử lại sau 100ms.");
            return ResponseEntity.status(429).body(response);
        }
        
        try {
            // Chỉ tạo cấu hình phí dịch vụ cho năm (KHÔNG tạo hóa đơn)
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
            if (request.getApartmentId() != null) {
                response.put("message", String.format("Đã tạo biểu phí cấu hình năm %d cho căn hộ %d", 
                    request.getYear(), request.getApartmentId()));
                response.put("apartmentId", request.getApartmentId());
            } else {
                response.put("message", String.format("Đã tạo biểu phí cấu hình năm %d cho tất cả căn hộ", request.getYear()));
            }
            response.put("year", request.getYear());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi tạo biểu phí: " + e.getMessage());
            
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
            // Ghi chú: Không còn tự động cập nhật biểu phí khi tạo hóa đơn
            // Biểu phí cần được cập nhật qua endpoint riêng trước đó nếu muốn thay đổi

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
     * Tạo hóa đơn cho tất cả căn hộ trong một tháng cụ thể
     */
    @PostMapping("/generate-month/{year}/{month}")
    public ResponseEntity<Map<String, Object>> generateInvoicesForMonth(
            @PathVariable("year") int year,
            @PathVariable("month") int month,
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
            // Ghi chú: Không tự động cập nhật biểu phí khi tạo hóa đơn
            // Nếu cần thay đổi, hãy gọi endpoint cập nhật cấu hình trước khi tạo hóa đơn

            // Tạo hóa đơn cho tất cả căn hộ trong tháng này
            yearlyBillingService.generateInvoicesForMonth(year, month);
            
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
     * Tạo biểu phí cho năm hiện tại (chỉ tạo cấu hình, không tạo hóa đơn)
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
            // Chỉ tạo cấu hình phí dịch vụ cho năm hiện tại (KHÔNG tạo hóa đơn)
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
            if (request.getApartmentId() != null) {
                response.put("message", String.format("Đã tạo biểu phí cấu hình năm %d cho căn hộ %d", 
                    request.getYear(), request.getApartmentId()));
                response.put("apartmentId", request.getApartmentId());
            } else {
                response.put("message", String.format("Đã tạo biểu phí cấu hình năm %d cho tất cả căn hộ", request.getYear()));
            }
            response.put("year", request.getYear());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi tạo biểu phí: " + e.getMessage());
            
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
     * Cập nhật cấu hình phí cho một tháng cụ thể
     */
    @PutMapping("/config/{year}/{month}")
    public ResponseEntity<Map<String, Object>> updateFeeConfig(
            @PathVariable("year") int year,
            @PathVariable("month") int month,
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
            @PathVariable("year") int year,
            @PathVariable("month") int month) {
        
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
    public ResponseEntity<Map<String, Object>> getYearlyFeeConfig(@PathVariable("year") int year) {
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
