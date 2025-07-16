package com.mytech.apartment.portal.apis;

import com.mytech.apartment.portal.models.Invoice;
import com.mytech.apartment.portal.models.enums.InvoiceStatus;
import com.mytech.apartment.portal.repositories.ApartmentResidentRepository;
import com.mytech.apartment.portal.repositories.InvoiceRepository;
import com.mytech.apartment.portal.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    @Autowired
    private ApartmentResidentRepository apartmentResidentRepository;
    @Autowired
    private InvoiceRepository invoiceRepository;

    @GetMapping("/stats")
    public ResponseEntity<?> getDashboardStats(Authentication authentication) {
        Long userId = ((UserDetailsImpl) authentication.getPrincipal()).getId();
        // Lấy danh sách apartmentId mà user này liên kết
        List<Long> apartmentIds = apartmentResidentRepository.findByIdUserId(userId)
                .stream().map(link -> link.getId().getApartmentId()).collect(Collectors.toList());
        List<Invoice> invoices = apartmentIds.isEmpty() ? List.of() : invoiceRepository.findByApartmentIdIn(apartmentIds);
        int totalInvoices = invoices.size();
        int pendingInvoices = (int) invoices.stream().filter(i -> i.getStatus() == InvoiceStatus.UNPAID).count();
        int overdueInvoices = (int) invoices.stream().filter(i -> i.getStatus() == InvoiceStatus.OVERDUE).count();
        double totalAmount = invoices.stream().mapToDouble(Invoice::getTotalAmount).sum();
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalInvoices", totalInvoices);
        stats.put("pendingInvoices", pendingInvoices);
        stats.put("overdueInvoices", overdueInvoices);
        stats.put("totalAmount", totalAmount);
        // Có thể bổ sung các trường khác nếu cần
        return ResponseEntity.ok(stats);
    }
} 