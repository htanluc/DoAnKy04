package com.mytech.apartment.portal.apis;

import com.mytech.apartment.portal.dtos.InvoiceCreateRequest;
import com.mytech.apartment.portal.dtos.InvoiceDto;
import com.mytech.apartment.portal.dtos.InvoiceUpdateRequest;
import com.mytech.apartment.portal.models.enums.ActivityActionType;
import com.mytech.apartment.portal.services.SmartActivityLogService;
import com.mytech.apartment.portal.services.InvoiceService;
import com.mytech.apartment.portal.services.MonthlyFeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final SmartActivityLogService smartActivityLogService;
    private final List<MonthlyFeeService> feeServices;

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
    public ResponseEntity<InvoiceDto> getInvoiceById(@PathVariable("id") Long id) {
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
    public ResponseEntity<InvoiceDto> updateInvoice(@PathVariable("id") Long id, @RequestBody InvoiceUpdateRequest request) {
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
    public ResponseEntity<Void> deleteInvoice(@PathVariable("id") Long id) {
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
            // Tạo hóa đơn cơ bản
            invoiceService.generateInvoicesForMonth(billingPeriod);

            // Chạy tất cả FeeService để thêm các khoản phí
            feeServices.forEach(svc -> svc.generateFeeForMonth(billingPeriod));

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", String.format("Đã tạo hóa đơn cho căn hộ %d tháng %s", apartmentId, billingPeriod));
            response.put("apartmentId", apartmentId);
            response.put("billingPeriod", billingPeriod);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi tạo hóa đơn: " + e.getMessage());

            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Tạo hóa đơn cho tất cả căn hộ
     */
    @PostMapping("/api/admin/invoices/generate-all")
    public ResponseEntity<Map<String, Object>> generateInvoicesForAllApartments(
            @RequestParam String billingPeriod) {
        try {
            // Tạo hóa đơn cơ bản cho tất cả căn hộ
            invoiceService.generateInvoicesForMonth(billingPeriod);

            // Chạy tất cả FeeService để thêm các khoản phí
            feeServices.forEach(svc -> svc.generateFeeForMonth(billingPeriod));

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", String.format("Đã tạo hóa đơn cho tất cả căn hộ tháng %s", billingPeriod));
            response.put("billingPeriod", billingPeriod);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi tạo hóa đơn: " + e.getMessage());

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
