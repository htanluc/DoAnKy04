package com.mytech.apartment.portal.apis;

import com.mytech.apartment.portal.dtos.InvoiceCreateRequest;
import com.mytech.apartment.portal.dtos.InvoiceDto;
import com.mytech.apartment.portal.dtos.InvoiceUpdateRequest;
import com.mytech.apartment.portal.services.InvoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.mytech.apartment.portal.services.ApartmentService;
import java.util.stream.Collectors;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@Tag(name = "Resident Invoice", description = "API for resident to view their own invoices")
public class InvoiceController {
    @Autowired
    private InvoiceService invoiceService;
    @Autowired
    private ApartmentService apartmentService;

    /**
     * Get all invoices
     * Lấy danh sách tất cả hóa đơn
     */
    @GetMapping
    public List<InvoiceDto> getAllInvoices() {
        return invoiceService.getAllInvoices();
    }

    /**
     * Get invoice by ID
     * Lấy thông tin hóa đơn theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<InvoiceDto> getInvoiceById(@PathVariable("id") Long id) {
        return invoiceService.getInvoiceById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create new invoice
     * Tạo mới hóa đơn
     */
    @PostMapping
    public InvoiceDto createInvoice(@RequestBody InvoiceCreateRequest request) {
        return invoiceService.createInvoice(request);
    }

    /**
     * Update invoice by ID
     * Cập nhật hóa đơn theo ID
     */
    @PutMapping("/{id}")
    public ResponseEntity<InvoiceDto> updateInvoice(@PathVariable("id") Long id, @RequestBody InvoiceUpdateRequest request) {
        try {
            InvoiceDto updatedInvoice = invoiceService.updateInvoice(id, request);
            return ResponseEntity.ok(updatedInvoice);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Delete invoice by ID
     * Xóa hóa đơn theo ID
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInvoice(@PathVariable("id") Long id) {
        invoiceService.deleteInvoice(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * [EN] Get invoices of current resident
     * [VI] Lấy danh sách hóa đơn của resident hiện tại
     */
    @Operation(summary = "Get invoices of current resident", description = "Get list of invoices for apartments linked to the currently authenticated resident")
    @GetMapping("/my")
    public ResponseEntity<List<InvoiceDto>> getMyInvoices() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        Long userId = null;
        try {
            userId = apartmentService.getUserIdByPhoneNumber(username);
        } catch (Exception e) {
            return ResponseEntity.status(401).build();
        }
        if (userId == null) return ResponseEntity.status(401).build();
        // Lấy danh sách apartmentId của resident
        var apartments = apartmentService.getApartmentsOfResident(userId);
        var apartmentIds = apartments.stream().map(a -> a.getId()).collect(Collectors.toList());
        List<InvoiceDto> invoices = invoiceService.getInvoicesByApartmentIds(apartmentIds);
        return ResponseEntity.ok(invoices);
    }
} 