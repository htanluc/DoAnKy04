// src/main/java/com/mytech/apartment/portal/apis/InvoiceController.java
package com.mytech.apartment.portal.apis;

import com.mytech.apartment.portal.dtos.InvoiceDto;
import com.mytech.apartment.portal.services.InvoiceService;
import org.springframework.beans.factory.annotation.Autowired;
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
}
