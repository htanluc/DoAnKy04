package com.mytech.apartment.portal.apis;

import com.mytech.apartment.portal.dtos.InvoiceCreateRequest;
import com.mytech.apartment.portal.dtos.InvoiceDto;
import com.mytech.apartment.portal.dtos.InvoiceUpdateRequest;
import com.mytech.apartment.portal.models.enums.ActivityActionType;
import com.mytech.apartment.portal.services.SmartActivityLogService;
import com.mytech.apartment.portal.services.InvoiceService;
import com.mytech.apartment.portal.services.MonthlyFeeService;
import com.mytech.apartment.portal.services.EmailService;
import com.mytech.apartment.portal.repositories.ApartmentResidentRepository;
import com.mytech.apartment.portal.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
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
    private final EmailService emailService;
    private final ApartmentResidentRepository apartmentResidentRepository;
    private final UserRepository userRepository;
    private final com.mytech.apartment.portal.services.InvoicePdfService invoicePdfService;

    @GetMapping("/api/invoices/by-apartments")
    public List<InvoiceDto> getByApartments(@RequestParam List<Long> aptIds) {
        return invoiceService.getInvoicesByApartmentIds(aptIds);
    }

    @GetMapping("/api/admin/invoices/by-apartments")
    public List<InvoiceDto> getByApartmentsAdmin(@RequestParam List<Long> aptIds) {
        return invoiceService.getInvoicesByApartmentIds(aptIds);
    }

    /**
     * [EN] Send invoice email to apartment primary resident
     * [VI] Gửi email hóa đơn cho cư dân chính của căn hộ
     */
    @PostMapping("/api/admin/invoices/{id}/send-email")
    public ResponseEntity<Map<String, Object>> sendInvoiceEmail(@PathVariable("id") Long id) {
        try {
            var invoiceOpt = invoiceService.getInvoiceById(id);
            if (invoiceOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            var dto = invoiceOpt.get();
            Long apartmentId = dto.getApartmentId();

            // Lấy tất cả cư dân thuộc căn hộ
            var residents = apartmentResidentRepository.findByApartment_Id(apartmentId);
            var emails = residents.stream()
                    .map(link -> userRepository.findById(link.getUserId()))
                    .filter(java.util.Optional::isPresent)
                    .map(opt -> opt.get().getEmail())
                    .filter(e -> e != null && !e.isBlank())
                    .distinct()
                    .toList();

            if (emails.isEmpty()) {
                Map<String, Object> res = new HashMap<>();
                res.put("success", false);
                res.put("message", "Không tìm thấy email cư dân để gửi hóa đơn");
                return ResponseEntity.badRequest().body(res);
            }

            String subject = String.format("Hóa đơn căn hộ #%d - Kỳ %s", dto.getApartmentId(), dto.getBillingPeriod());
            String html = String.format(
                    "<h3>Hóa đơn kỳ %s</h3>" +
                    "<p>Căn hộ: %d</p>" +
                    "<p>Ngày phát hành: %s</p>" +
                    "<p>Đến hạn: %s</p>" +
                    "<p>Tổng tiền: %,.0f VND</p>",
                    dto.getBillingPeriod(), dto.getApartmentId(), dto.getIssueDate(), dto.getDueDate(), dto.getTotalAmount() == null ? 0.0 : dto.getTotalAmount());

            // Tạo PDF đính kèm
            byte[] pdfBytes = invoicePdfService.generateInvoicePdf(dto);

            // Gửi async, trả về ngay
            emails.forEach(email -> {
                try {
                    emailService.sendHtmlWithAttachment(email, subject, html, "invoice_" + id + ".pdf", pdfBytes);
                    smartActivityLogService.logSmartActivity(ActivityActionType.SEND_EMAIL, "Gửi email hóa đơn #%d tới %s", id, email);
                } catch (Exception ignore) {}
            });

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", String.format("Đang gửi email hóa đơn tới %d cư dân", emails.size()));
            response.put("recipients", emails);
            return ResponseEntity.accepted().body(response);
        } catch (Exception e) {
            Map<String, Object> res = new HashMap<>();
            res.put("success", false);
            res.put("message", "Lỗi gửi email: " + e.getMessage());
            return ResponseEntity.status(500).body(res);
        }
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
     * [EN] Get overdue invoices (admin only)
     * [VI] Lấy hóa đơn quá hạn (chỉ admin)
     */
    @GetMapping("/api/admin/invoices/overdue")
    public ResponseEntity<List<InvoiceDto>> getOverdueInvoices() {
        try {
            List<InvoiceDto> overdueInvoices = invoiceService.getOverdueInvoices();
            
            // Log admin activity (smart logging)
            smartActivityLogService.logSmartActivity(ActivityActionType.VIEW_INVOICE, 
                "Admin xem hóa đơn quá hạn (%d hóa đơn)", overdueInvoices.size());
            
            return ResponseEntity.ok(overdueInvoices);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * [EN] Update overdue invoice status (admin only)
     * [VI] Cập nhật trạng thái hóa đơn quá hạn (chỉ admin)
     */
    @PostMapping("/api/admin/invoices/update-overdue-status")
    public ResponseEntity<Map<String, Object>> updateOverdueStatus() {
        try {
            int updatedCount = invoiceService.updateOverdueStatus();
            
            // Log admin activity (smart logging)
            smartActivityLogService.logSmartActivity(ActivityActionType.UPDATE_INVOICE, 
                "Admin cập nhật trạng thái quá hạn cho %d hóa đơn", updatedCount);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("updatedCount", updatedCount);
            response.put("message", String.format("Đã cập nhật %d hóa đơn thành trạng thái quá hạn", updatedCount));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi cập nhật trạng thái quá hạn: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
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
    @GetMapping(value = "/api/invoices/{id}/download", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> downloadInvoice(@PathVariable("id") Long invoiceId) {
        try {
            var dtoOpt = invoiceService.getInvoiceById(invoiceId);
            if (dtoOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            var pdf = invoicePdfService.generateInvoicePdf(dtoOpt.get());
            smartActivityLogService.logSmartActivity(ActivityActionType.DOWNLOAD_INVOICE, "Tải hóa đơn #%d", invoiceId);
            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=invoice_" + invoiceId + ".pdf")
                    .body(pdf);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }


    /**
     * [EN] Send reminder emails for selected overdue invoices
     * [VI] Gửi email nhắc nhở cho các hóa đơn quá hạn đã chọn
     */
    @PostMapping("/api/admin/invoices/send-overdue-reminders")
    public ResponseEntity<Map<String, Object>> sendOverdueReminders(@RequestBody List<Long> invoiceIds) {
        try {
            if (invoiceIds == null || invoiceIds.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Vui lòng chọn ít nhất một hóa đơn để gửi nhắc nhở");
                return ResponseEntity.badRequest().body(response);
            }

            Map<String, Object> result = invoiceService.sendOverdueReminders(invoiceIds);
            
            // Log admin activity
            smartActivityLogService.logSmartActivity(ActivityActionType.SEND_EMAIL, 
                "Admin gửi email nhắc nhở cho %d hóa đơn quá hạn", invoiceIds.size());
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi gửi email nhắc nhở: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

}
