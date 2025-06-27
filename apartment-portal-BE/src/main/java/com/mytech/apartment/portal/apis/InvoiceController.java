package com.mytech.apartment.portal.apis;

import com.mytech.apartment.portal.dtos.InvoiceCreateRequest;
import com.mytech.apartment.portal.dtos.InvoiceDto;
import com.mytech.apartment.portal.dtos.InvoiceUpdateRequest;
import com.mytech.apartment.portal.services.InvoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/invoices")
public class InvoiceController {
    @Autowired
    private InvoiceService invoiceService;

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
} 