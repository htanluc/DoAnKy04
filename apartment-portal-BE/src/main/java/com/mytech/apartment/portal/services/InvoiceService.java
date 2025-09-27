package com.mytech.apartment.portal.services;

// import com.mytech.apartment.portal.dtos.InvoiceCreateRequest;
import com.mytech.apartment.portal.dtos.InvoiceDto;
// import com.mytech.apartment.portal.dtos.InvoiceUpdateRequest;
import com.mytech.apartment.portal.mappers.InvoiceMapper;
import com.mytech.apartment.portal.models.Invoice;
import com.mytech.apartment.portal.models.InvoiceItem;
import com.mytech.apartment.portal.models.enums.InvoiceStatus;
import com.mytech.apartment.portal.models.ApartmentResident;
import com.mytech.apartment.portal.models.User;
import com.mytech.apartment.portal.repositories.InvoiceRepository;
import com.mytech.apartment.portal.repositories.ApartmentRepository;
import com.mytech.apartment.portal.repositories.ApartmentResidentRepository;
import com.mytech.apartment.portal.repositories.UserRepository;
// import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Optional;
import java.util.HashMap;
import java.util.Map;
// import java.util.Set;
import java.util.stream.Collectors;

@Service
public class InvoiceService {

    @Autowired private InvoiceRepository invoiceRepository;
    @Autowired private InvoiceMapper    invoiceMapper;
    @Autowired private ApartmentResidentRepository apartmentResidentRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ApartmentRepository apartmentRepository;
    @Autowired private EmailService emailService;
    @Autowired private com.mytech.apartment.portal.services.InvoicePdfService invoicePdfService;

    // ... (các method CRUD).

    /**
     * Sinh hóa đơn cơ bản cho tất cả căn hộ có cư dân trong kỳ (chưa gồm phí phát sinh).
     */
    public void generateInvoicesForMonth(String period) {
        YearMonth targetMonth = YearMonth.parse(period);

        // Lấy tất cả căn hộ có cư dân để tạo hóa đơn
        List<Long> apartmentIds = apartmentResidentRepository.findAll()
            .stream()
            .map(ApartmentResident::getApartmentId)
            .distinct()
            .collect(Collectors.toList());

        System.out.println("DEBUG: [InvoiceService.generateInvoicesForMonth] Tìm thấy " + apartmentIds.size() + " căn hộ có cư dân để tạo hóa đơn cho kỳ " + period);

        int createdCount = 0;
        int skippedCount = 0;

        for (Long apartmentId : apartmentIds) {
            // Kiểm tra xem đã có hóa đơn cho kỳ này chưa (bất kể status nào)
            Optional<Invoice> existing = invoiceRepository.findByApartmentIdAndBillingPeriod(apartmentId, period);
            if (existing.isPresent()) {
                Invoice existingInvoice = existing.get();
                System.out.println("DEBUG: [InvoiceService.generateInvoicesForMonth] Căn hộ " + apartmentId +
                    " đã có hóa đơn #" + existingInvoice.getId() + " cho kỳ " + period +
                    " với status " + existingInvoice.getStatus() + " - bỏ qua tạo mới");

                // Cảnh báo nếu hóa đơn đã có status khác UNPAID (có thể đã được thanh toán)
                if (existingInvoice.getStatus() != InvoiceStatus.UNPAID) {
                    System.out.println("WARNING: [InvoiceService.generateInvoicesForMonth] Căn hộ " + apartmentId +
                        " đã có hóa đơn kỳ " + period + " với status " + existingInvoice.getStatus() +
                        " - KHÔNG tạo hóa đơn trùng lặp!");
                }

                skippedCount++;
                continue;
            }

            System.out.println("DEBUG: [InvoiceService.generateInvoicesForMonth] Tạo hóa đơn mới cho căn hộ " + apartmentId + " kỳ " + period);

            Invoice invoice = new Invoice();
            invoice.setApartmentId(apartmentId);
            invoice.setBillingPeriod(period);
            invoice.setIssueDate(targetMonth.atDay(1));
            invoice.setDueDate(targetMonth.atDay(15));
            invoice.setStatus(InvoiceStatus.UNPAID);
            invoice.setTotalAmount(0.0);

            invoiceRepository.save(invoice);
            createdCount++;

            System.out.println("DEBUG: [InvoiceService.generateInvoicesForMonth] Đã tạo hóa đơn #" + invoice.getId() + " cho căn hộ " + apartmentId);
        }

        System.out.println("DEBUG: [InvoiceService.generateInvoicesForMonth] Hoàn thành tạo hóa đơn base cho kỳ " + period +
            " - Tạo mới: " + createdCount + ", Bỏ qua: " + skippedCount + " hóa đơn");
    }

    /**
     * Thêm một dòng phí vào hóa đơn đã tồn tại.
     */
    public void addInvoiceItem(Long apartmentId,
                               String period,
                               String feeType,
                               String description,
                               BigDecimal amount) {
        Optional<Invoice> invoiceOpt = invoiceRepository
            .findByApartmentIdAndBillingPeriod(apartmentId, period);
        
        if (invoiceOpt.isEmpty()) {
            System.out.println("DEBUG: Bỏ qua thêm item cho căn hộ " + apartmentId + " - chưa có hóa đơn cho kỳ " + period);
            return;
        }
        
        Invoice invoice = invoiceOpt.get();

        // Đảm bảo tập items không null và kiểm tra idempotent
        if (invoice.getItems() == null) {
            invoice.setItems(new HashSet<>());
        } else if (invoice.getItems().stream().anyMatch(
                it -> feeType.equals(it.getFeeType()) && description.equals(it.getDescription()))) {
            return;
        }

        InvoiceItem item = new InvoiceItem();
        item.setFeeType(feeType);               // setter đúng field feeType
        item.setDescription(description);
        item.setAmount(amount.doubleValue());
        item.setInvoice(invoice);

        invoice.getItems().add(item);
        // Không cập nhật totalAmount ở đây - sẽ được tính lại sau khi thêm tất cả items
        invoiceRepository.save(invoice);
    }

    /**
     * Gửi email hóa đơn (đính kèm PDF) cho tất cả cư dân của một căn hộ trong kỳ.
     */
    public void sendInvoiceEmailsForApartmentPeriod(Long apartmentId, String period) {
        System.out.println("DEBUG: [InvoiceService] Bắt đầu gửi email cho căn hộ " + apartmentId + " kỳ " + period);
        
        Optional<Invoice> invoiceOpt = invoiceRepository.findByApartmentIdAndBillingPeriod(apartmentId, period);
        if (invoiceOpt.isEmpty()) {
            System.out.println("DEBUG: [InvoiceService] Không tìm thấy hóa đơn cho căn hộ " + apartmentId + " kỳ " + period);
            return;
        }

        InvoiceDto invoice = invoiceMapper.toDto(invoiceOpt.get());
        System.out.println("DEBUG: [InvoiceService] Tìm thấy hóa đơn #" + invoice.getId() + " cho căn hộ " + apartmentId);

        // Lấy email các cư dân thuộc căn hộ
        var residents = apartmentResidentRepository.findByApartment_Id(apartmentId);
        System.out.println("DEBUG: [InvoiceService] Tìm thấy " + residents.size() + " cư dân cho căn hộ " + apartmentId);
        
        // Debug chi tiết từng cư dân
        for (ApartmentResident resident : residents) {
            System.out.println("DEBUG: [InvoiceService] Cư dân - ApartmentId: " + resident.getApartmentId() + 
                ", UserId: " + resident.getUserId() + 
                ", RelationType: " + resident.getRelationType());
        }
        
        var emails = residents.stream()
                .map(link -> {
                    System.out.println("DEBUG: [InvoiceService] Đang tìm user với ID: " + link.getUserId());
                    var userOpt = userRepository.findById(link.getUserId());
                    if (userOpt.isPresent()) {
                        System.out.println("DEBUG: [InvoiceService] Tìm thấy user: " + userOpt.get().getEmail());
                        return userOpt;
                    } else {
                        System.out.println("DEBUG: [InvoiceService] Không tìm thấy user với ID: " + link.getUserId());
                        return Optional.<User>empty();
                    }
                })
                .filter(java.util.Optional::isPresent)
                .map(opt -> opt.get().getEmail())
                .filter(e -> e != null && !e.isBlank())
                .distinct()
                .toList();

        System.out.println("DEBUG: [InvoiceService] Tìm thấy " + emails.size() + " email hợp lệ: " + emails);
        
        if (emails.isEmpty()) {
            System.out.println("WARNING: [InvoiceService] Không có email nào cho căn hộ " + apartmentId + " - bỏ qua gửi email");
            return;
        }

        // Lấy thông tin căn hộ để hiển thị tên thực tế
        String apartmentInfo = "#" + invoice.getApartmentId();
        var apartmentOpt = apartmentRepository.findById(invoice.getApartmentId());
        if (apartmentOpt.isPresent()) {
            var apartment = apartmentOpt.get();
            apartmentInfo = apartment.getUnitNumber() + " (ID: #" + invoice.getApartmentId() + ")";
        }

        String subject = String.format("Hóa đơn căn hộ %s - Kỳ %s", apartmentInfo, invoice.getBillingPeriod());
        String html = String.format(
                "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>" +
                "<h2 style='color:#1976d2'>Hóa đơn kỳ %s</h2>" +
                "<p><b>Căn hộ:</b> %s</p>" +
                "<p><b>Ngày phát hành:</b> %s</p>" +
                "<p><b>Đến hạn:</b> %s</p>" +
                "<p><b>Tổng tiền:</b> <span style='color:#d32f2f'>%,.0f VND</span></p>" +
                "<p>Vui lòng xem file PDF đính kèm để biết chi tiết.</p>" +
                "<p>Trân trọng,<br/>Ban quản lý tòa nhà</p>" +
                "</div>",
                invoice.getBillingPeriod(), apartmentInfo, invoice.getIssueDate(), invoice.getDueDate(),
                invoice.getTotalAmount() == null ? 0.0 : invoice.getTotalAmount());

        System.out.println("DEBUG: [InvoiceService] Tạo PDF cho hóa đơn #" + invoice.getId());
        byte[] pdfBytes = invoicePdfService.generateInvoicePdf(invoice);
        System.out.println("DEBUG: [InvoiceService] PDF được tạo thành công, kích thước: " + pdfBytes.length + " bytes");

        for (String email : emails) {
            try {
                System.out.println("DEBUG: [InvoiceService] ===== BẮT ĐẦU GỬI EMAIL TỚI: " + email + " =====");
                System.out.println("DEBUG: [InvoiceService] Subject: " + subject);
                System.out.println("DEBUG: [InvoiceService] PDF size: " + pdfBytes.length + " bytes");
                emailService.sendHtmlWithAttachmentSync(email, subject, html, "invoice_" + invoice.getId() + ".pdf", pdfBytes);
                System.out.println("DEBUG: [InvoiceService] ===== GỬI EMAIL THÀNH CÔNG TỚI: " + email + " =====");
            } catch (Exception e) {
                System.out.println("ERROR: [InvoiceService] ===== LỖI GỬI EMAIL TỚI: " + email + " =====");
                System.out.println("ERROR: [InvoiceService] Chi tiết lỗi: " + e.getMessage());
                e.printStackTrace();
            }
        }
    }
    public void notifyResidents(String period) {
        // TODO: implement gửi email/SMS
    }

    public InvoiceDto generateInvoice(Invoice invoice) {
        return invoiceMapper.toDto(invoiceRepository.save(invoice));
    }

    public List<InvoiceDto> getInvoicesByApartmentIds(List<Long> apartmentIds) {
        return invoiceRepository.findByApartmentIdIn(apartmentIds).stream()
                .map(invoiceMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * [EN] Get invoices by username (phone number)
     * [VI] Lấy hóa đơn theo username (số điện thoại)
     */
    public List<InvoiceDto> getInvoicesByUsername(String username) {
        // Tìm user theo username (phone number)
        var userOpt = userRepository.findByPhoneNumber(username);
        if (userOpt.isEmpty()) {
            return List.of();
        }
        
        Long userId = userOpt.get().getId();
        
        // Lấy danh sách căn hộ của user
        List<Long> apartmentIds = apartmentResidentRepository
            .findByUser_Id(userId)
            .stream()
            .map(link -> link.getApartmentId())
            .collect(Collectors.toList());
        
        if (apartmentIds.isEmpty()) {
            return List.of();
        }
        
        // Lấy hóa đơn theo apartmentIds
        return getInvoicesByApartmentIds(apartmentIds);
    }

    /**
     * [EN] Get all invoices (admin only)
     * [VI] Lấy tất cả hóa đơn (chỉ admin)
     */
    public List<InvoiceDto> getAllInvoices() {
        return invoiceRepository.findAll().stream()
                .map(invoiceMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * [EN] Get invoice by ID
     * [VI] Lấy hóa đơn theo ID
     */
    public Optional<InvoiceDto> getInvoiceById(Long id) {
        return invoiceRepository.findById(id)
                .map(invoiceMapper::toDto);
    }

    /**
     * [EN] Get latest invoice by apartment ID
     * [VI] Lấy hóa đơn mới nhất theo ID căn hộ
     */
    public Optional<InvoiceDto> getLatestInvoiceByApartmentId(Long apartmentId) {
        return invoiceRepository.findTopByApartmentIdOrderByBillingPeriodDesc(apartmentId)
                .map(invoiceMapper::toDto);
    }

    /**
     * [EN] Get invoices by apartment ID
     * [VI] Lấy tất cả hóa đơn theo ID căn hộ
     */
    public List<InvoiceDto> getInvoicesByApartmentId(Long apartmentId) {
        return invoiceRepository.findByApartmentIdOrderByBillingPeriodDesc(apartmentId).stream()
                .map(invoiceMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * [EN] Get overdue invoices
     * [VI] Lấy danh sách hóa đơn quá hạn
     */
    public List<InvoiceDto> getOverdueInvoices() {
        LocalDate today = LocalDate.now();
        return invoiceRepository.findByDueDateBeforeAndStatus(today, InvoiceStatus.UNPAID).stream()
                .map(invoiceMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * [EN] Send reminder emails for overdue invoices
     * [VI] Gửi email nhắc nhở cho các hóa đơn quá hạn
     */
    public Map<String, Object> sendOverdueReminders(List<Long> invoiceIds) {
        Map<String, Object> result = new HashMap<>();
        int successCount = 0;
        int failCount = 0;
        List<String> failedInvoices = new java.util.ArrayList<>();

        for (Long invoiceId : invoiceIds) {
            try {
                Optional<InvoiceDto> invoiceOpt = getInvoiceById(invoiceId);
                if (invoiceOpt.isEmpty()) {
                    failCount++;
                    failedInvoices.add("Hóa đơn #" + invoiceId + " không tồn tại");
                    continue;
                }

                InvoiceDto invoice = invoiceOpt.get();
                
                // Kiểm tra hóa đơn có quá hạn không
                if (invoice.getDueDate().isAfter(LocalDate.now())) {
                    failCount++;
                    failedInvoices.add("Hóa đơn #" + invoiceId + " chưa đến hạn thanh toán");
                    continue;
                }

                // Lấy email của cư dân căn hộ
                var residents = apartmentResidentRepository.findByApartment_Id(invoice.getApartmentId());
                var emails = residents.stream()
                        .map(link -> userRepository.findById(link.getUserId()))
                        .filter(Optional::isPresent)
                        .map(opt -> opt.get().getEmail())
                        .filter(e -> e != null && !e.isBlank())
                        .distinct()
                        .toList();

                if (emails.isEmpty()) {
                    failCount++;
                    failedInvoices.add("Hóa đơn #" + invoiceId + " không có email cư dân");
                    continue;
                }

                // Lấy thông tin căn hộ để hiển thị tên thực tế
                String apartmentInfo = "#" + invoice.getApartmentId();
                var aptOpt = apartmentRepository.findById(invoice.getApartmentId());
                if (aptOpt.isPresent()) {
                    var apt = aptOpt.get();
                    apartmentInfo = apt.getUnitNumber() + " (ID: #" + invoice.getApartmentId() + ")";
                }

                // Tạo nội dung email nhắc nhở
                String subject = String.format("NHẮC NHỞ THANH TOÁN - Hóa đơn căn hộ %s - Kỳ %s",
                    apartmentInfo, invoice.getBillingPeriod());

                String html = String.format(
                    "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>" +
                    "<h2 style='color: #d32f2f;'>⚠️ NHẮC NHỞ THANH TOÁN HÓA ĐƠN</h2>" +
                    "<div style='background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;'>" +
                    "<p style='margin: 0; color: #856404;'><strong>Hóa đơn của bạn đã quá hạn thanh toán!</strong></p>" +
                    "</div>" +
                    "<div style='background-color: #f8f9fa; padding: 20px; border-radius: 5px;'>" +
                    "<h3>Thông tin hóa đơn:</h3>" +
                    "<p><strong>Căn hộ:</strong> %s</p>" +
                    "<p><strong>Kỳ thanh toán:</strong> %s</p>" +
                    "<p><strong>Ngày phát hành:</strong> %s</p>" +
                    "<p><strong>Hạn thanh toán:</strong> %s</p>" +
                    "<p><strong>Tổng tiền:</strong> <span style='color: #d32f2f; font-size: 18px; font-weight: bold;'>%,.0f VND</span></p>" +
                    "</div>" +
                    "<div style='background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;'>" +
                    "<p style='margin: 0; color: #1565c0;'><strong>Vui lòng thanh toán sớm để tránh phí phạt và gián đoạn dịch vụ.</strong></p>" +
                    "</div>" +
                    "<p>Trân trọng,<br/>Ban quản lý tòa nhà</p>" +
                    "</div>",
                    apartmentInfo, invoice.getBillingPeriod(),
                    invoice.getIssueDate(), invoice.getDueDate(),
                    invoice.getTotalAmount() == null ? 0.0 : invoice.getTotalAmount());

                // Tạo PDF đính kèm
                byte[] pdfBytes = invoicePdfService.generateInvoicePdf(invoice);

                // Gửi email cho tất cả cư dân
                for (String email : emails) {
                    try {
                        emailService.sendHtmlWithAttachmentSync(email, subject, html, 
                            "invoice_reminder_" + invoiceId + ".pdf", pdfBytes);
                    } catch (Exception e) {
                        // Log lỗi nhưng không dừng quá trình
                        System.err.println("Lỗi gửi email cho " + email + ": " + e.getMessage());
                    }
                }

                successCount++;

            } catch (Exception e) {
                failCount++;
                failedInvoices.add("Hóa đơn #" + invoiceId + ": " + e.getMessage());
            }
        }

        result.put("success", true);
        result.put("totalProcessed", invoiceIds.size());
        result.put("successCount", successCount);
        result.put("failCount", failCount);
        result.put("failedInvoices", failedInvoices);
        result.put("message", String.format("Đã gửi nhắc nhở cho %d/%d hóa đơn", successCount, invoiceIds.size()));

        return result;
    }

    /**
     * [EN] Update invoice status to overdue
     * [VI] Cập nhật trạng thái hóa đơn thành quá hạn
     */
    public int updateOverdueStatus() {
        LocalDate today = LocalDate.now();
        List<Invoice> overdueInvoices = invoiceRepository.findByDueDateBeforeAndStatus(today, InvoiceStatus.UNPAID);
        
        for (Invoice invoice : overdueInvoices) {
            invoice.setStatus(InvoiceStatus.OVERDUE);
            invoiceRepository.save(invoice);
        }
        
        return overdueInvoices.size();
    }
    
    /**
     * Kiểm tra xem có invoice cho căn hộ và kỳ thanh toán cụ thể không
     */
    public boolean hasInvoiceForPeriod(Long apartmentId, String billingPeriod) {
        return invoiceRepository.findByApartmentIdAndBillingPeriod(apartmentId, billingPeriod).isPresent();
    }

    /**
     * [EN] Debug apartment residents data
     * [VI] Debug dữ liệu cư dân căn hộ
     */
    public Map<String, Object> debugApartmentResidents(Long apartmentId) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // Lấy tất cả cư dân của căn hộ
            var residents = apartmentResidentRepository.findByApartment_Id(apartmentId);
            
            List<Map<String, Object>> residentDetails = new ArrayList<>();
            
            for (ApartmentResident resident : residents) {
                Map<String, Object> detail = new HashMap<>();
                detail.put("apartmentId", resident.getApartmentId());
                detail.put("userId", resident.getUserId());
                detail.put("relationType", resident.getRelationType());
                detail.put("isPrimaryResident", resident.getIsPrimaryResident());
                
                // Lấy thông tin user
                var userOpt = userRepository.findById(resident.getUserId());
                if (userOpt.isPresent()) {
                    User user = userOpt.get();
                    detail.put("userEmail", user.getEmail());
                    detail.put("userFullName", user.getFullName());
                    detail.put("userPhoneNumber", user.getPhoneNumber());
                } else {
                    detail.put("userEmail", "USER NOT FOUND");
                    detail.put("userFullName", "USER NOT FOUND");
                    detail.put("userPhoneNumber", "USER NOT FOUND");
                }
                
                residentDetails.add(detail);
            }
            
            result.put("success", true);
            result.put("apartmentId", apartmentId);
            result.put("totalResidents", residents.size());
            result.put("residents", residentDetails);
            
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "Lỗi khi debug cư dân: " + e.getMessage());
        }
        
        return result;
    }

    /**
     * [EN] Check existing invoices for a specific period
     * [VI] Kiểm tra hóa đơn hiện có cho một kỳ cụ thể
     */
    public Map<String, Object> checkInvoicesForPeriod(String period) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // Lấy tất cả hóa đơn cho kỳ này
            List<Invoice> invoices = invoiceRepository.findByBillingPeriod(period);
            
            if (invoices.isEmpty()) {
                result.put("success", true);
                result.put("message", "Không có hóa đơn nào cho kỳ " + period);
                result.put("totalInvoices", 0);
                result.put("invoices", new ArrayList<>());
                return result;
            }
            
            // Phân loại theo status
            Map<String, Long> statusCount = new HashMap<>();
            List<Map<String, Object>> invoiceDetails = new ArrayList<>();
            
            for (Invoice invoice : invoices) {
                String status = invoice.getStatus().toString();
                statusCount.put(status, statusCount.getOrDefault(status, 0L) + 1);
                
                Map<String, Object> detail = new HashMap<>();
                detail.put("id", invoice.getId());
                detail.put("apartmentId", invoice.getApartmentId());
                detail.put("status", status);
                detail.put("totalAmount", invoice.getTotalAmount());
                detail.put("createdAt", invoice.getCreatedAt());
                invoiceDetails.add(detail);
            }
            
            result.put("success", true);
            result.put("message", "Tìm thấy " + invoices.size() + " hóa đơn cho kỳ " + period);
            result.put("totalInvoices", invoices.size());
            result.put("statusCount", statusCount);
            result.put("invoices", invoiceDetails);
            
            // Cảnh báo nếu có hóa đơn đã thanh toán
            if (statusCount.containsKey("PAID") || statusCount.containsKey("PARTIAL")) {
                result.put("warning", "Có hóa đơn đã thanh toán - không nên tạo hóa đơn mới!");
            }
            
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "Lỗi khi kiểm tra hóa đơn: " + e.getMessage());
        }
        
        return result;
    }

    /**
     * [EN] Fix invoice total amount by recalculating from items
     * [VI] Sửa tổng tiền hóa đơn bằng cách tính lại từ các khoản phí chi tiết
     */
    public Map<String, Object> fixInvoiceTotalAmount(Long invoiceId) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            Optional<Invoice> invoiceOpt = invoiceRepository.findById(invoiceId);
            if (invoiceOpt.isEmpty()) {
                result.put("success", false);
                result.put("message", "Không tìm thấy hóa đơn #" + invoiceId);
                return result;
            }

            Invoice invoice = invoiceOpt.get();
            double oldTotal = invoice.getTotalAmount();
            
            // Tính tổng từ các khoản phí chi tiết
            double newTotal = 0.0;
            if (invoice.getItems() != null && !invoice.getItems().isEmpty()) {
                newTotal = invoice.getItems().stream()
                    .mapToDouble(InvoiceItem::getAmount)
                    .sum();
            }
            
            // Cập nhật tổng tiền
            invoice.setTotalAmount(newTotal);
            invoiceRepository.save(invoice);
            
            result.put("success", true);
            result.put("invoiceId", invoiceId);
            result.put("oldTotal", oldTotal);
            result.put("newTotal", newTotal);
            result.put("difference", newTotal - oldTotal);
            result.put("message", String.format("Đã sửa hóa đơn #%d: %,.0f VND → %,.0f VND (chênh lệch: %,.0f VND)", 
                invoiceId, oldTotal, newTotal, newTotal - oldTotal));
            
            System.out.println("DEBUG: [InvoiceService.fixInvoiceTotalAmount] Đã sửa hóa đơn #" + invoiceId + 
                " từ " + oldTotal + " thành " + newTotal);
                
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "Lỗi khi sửa hóa đơn #" + invoiceId + ": " + e.getMessage());
            System.err.println("ERROR: [InvoiceService.fixInvoiceTotalAmount] " + e.getMessage());
            e.printStackTrace();
        }
        
        return result;
    }

    /**
     * [EN] Fix all invoices total amount by recalculating from items
     * [VI] Sửa tổng tiền tất cả hóa đơn bằng cách tính lại từ các khoản phí chi tiết
     */
    public Map<String, Object> fixAllInvoicesTotalAmount() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            List<Invoice> allInvoices = invoiceRepository.findAll();
            int totalInvoices = allInvoices.size();
            int fixedCount = 0;
            int skippedCount = 0;
            double totalDifference = 0.0;
            List<Map<String, Object>> fixedInvoices = new java.util.ArrayList<>();
            
            System.out.println("DEBUG: [InvoiceService.fixAllInvoicesTotalAmount] Bắt đầu sửa " + totalInvoices + " hóa đơn");
            
            for (Invoice invoice : allInvoices) {
                try {
                    double oldTotal = invoice.getTotalAmount();
                    
                    // Tính tổng từ các khoản phí chi tiết
                    double newTotal = 0.0;
                    if (invoice.getItems() != null && !invoice.getItems().isEmpty()) {
                        newTotal = invoice.getItems().stream()
                            .mapToDouble(InvoiceItem::getAmount)
                            .sum();
                    }
                    
                    // Chỉ cập nhật nếu có sự khác biệt
                    if (Math.abs(newTotal - oldTotal) > 0.01) {
                        invoice.setTotalAmount(newTotal);
                        invoiceRepository.save(invoice);
                        
                        double difference = newTotal - oldTotal;
                        totalDifference += difference;
                        fixedCount++;
                        
                        Map<String, Object> fixedInvoice = new HashMap<>();
                        fixedInvoice.put("invoiceId", invoice.getId());
                        fixedInvoice.put("apartmentId", invoice.getApartmentId());
                        fixedInvoice.put("billingPeriod", invoice.getBillingPeriod());
                        fixedInvoice.put("oldTotal", oldTotal);
                        fixedInvoice.put("newTotal", newTotal);
                        fixedInvoice.put("difference", difference);
                        fixedInvoices.add(fixedInvoice);
                        
                        System.out.println("DEBUG: [InvoiceService.fixAllInvoicesTotalAmount] Đã sửa hóa đơn #" + invoice.getId() + 
                            " từ " + oldTotal + " thành " + newTotal + " (chênh lệch: " + difference + ")");
                    } else {
                        skippedCount++;
                    }
                    
                } catch (Exception e) {
                    System.err.println("ERROR: [InvoiceService.fixAllInvoicesTotalAmount] Lỗi sửa hóa đơn #" + invoice.getId() + ": " + e.getMessage());
                }
            }
            
            result.put("success", true);
            result.put("totalInvoices", totalInvoices);
            result.put("fixedCount", fixedCount);
            result.put("skippedCount", skippedCount);
            result.put("totalDifference", totalDifference);
            result.put("fixedInvoices", fixedInvoices);
            result.put("message", String.format("Đã sửa %d/%d hóa đơn. Tổng chênh lệch: %,.0f VND", 
                fixedCount, totalInvoices, totalDifference));
            
            System.out.println("DEBUG: [InvoiceService.fixAllInvoicesTotalAmount] Hoàn thành: " + fixedCount + " hóa đơn được sửa, " + 
                skippedCount + " hóa đơn không cần sửa");
                
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "Lỗi khi sửa tất cả hóa đơn: " + e.getMessage());
            System.err.println("ERROR: [InvoiceService.fixAllInvoicesTotalAmount] " + e.getMessage());
            e.printStackTrace();
        }
        
        return result;
    }
}
