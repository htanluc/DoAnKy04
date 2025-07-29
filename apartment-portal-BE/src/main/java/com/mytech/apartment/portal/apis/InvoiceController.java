// src/main/java/com/mytech/apartment/portal/apis/InvoiceController.java
package com.mytech.apartment.portal.apis;

import com.mytech.apartment.portal.dtos.InvoiceDto;
import com.mytech.apartment.portal.services.InvoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping
public class InvoiceController {

    @Autowired private InvoiceService invoiceService;

    @GetMapping("/api/invoices/by-apartments")
    public List<InvoiceDto> getByApartments(@RequestParam List<Long> aptIds) {
        return invoiceService.getInvoicesByApartmentIds(aptIds);
    }

    @GetMapping("/api/admin/invoices/by-apartments")
    public List<InvoiceDto> getByApartmentsAdmin(@RequestParam List<Long> aptIds) {
        return invoiceService.getInvoicesByApartmentIds(aptIds);
    }

    /**
     * [EN] Get invoices of current resident
     * [VI] Lấy hóa đơn của resident hiện tại
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
            return ResponseEntity.ok(invoices);
        } catch (Exception e) {
            return ResponseEntity.status(401).build();
        }
    }
}
