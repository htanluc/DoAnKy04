package com.mytech.apartment.portal.services;

import com.mytech.apartment.portal.dtos.InvoiceCreateRequest;
import com.mytech.apartment.portal.dtos.InvoiceDto;
import com.mytech.apartment.portal.dtos.InvoiceUpdateRequest;
import com.mytech.apartment.portal.mappers.InvoiceItemMapper;
import com.mytech.apartment.portal.mappers.InvoiceMapper;
import com.mytech.apartment.portal.models.Invoice;
import com.mytech.apartment.portal.models.InvoiceItem;
import com.mytech.apartment.portal.repositories.InvoiceRepository;
import com.mytech.apartment.portal.models.enums.InvoiceStatus;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class InvoiceService {

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private InvoiceMapper invoiceMapper;

    @Autowired
    private InvoiceItemMapper invoiceItemMapper;

    public List<InvoiceDto> getAllInvoices() {
        return invoiceRepository.findAll().stream()
                .map(invoiceMapper::toDto)
                .collect(Collectors.toList());
    }

    public Optional<InvoiceDto> getInvoiceById(Long id) {
        return invoiceRepository.findById(id).map(invoiceMapper::toDto);
    }

    @Transactional
    public InvoiceDto createInvoice(InvoiceCreateRequest request) {
        Invoice invoice = new Invoice();
        invoice.setApartmentId(request.getApartmentId());
        invoice.setBillingPeriod(request.getBillingPeriod());
        invoice.setIssueDate(request.getIssueDate());
        invoice.setDueDate(request.getDueDate());
        invoice.setStatus(InvoiceStatus.UNPAID); // Default status

        Set<InvoiceItem> items = request.getItems().stream()
                .map(itemDto -> {
                    InvoiceItem item = invoiceItemMapper.toEntity(itemDto);
                    item.setInvoice(invoice); // Set the back-reference
                    return item;
                })
                .collect(Collectors.toSet());
        invoice.setItems(items);

        double totalAmount = items.stream().mapToDouble(InvoiceItem::getAmount).sum();
        invoice.setTotalAmount(totalAmount);

        Invoice savedInvoice = invoiceRepository.save(invoice);
        return invoiceMapper.toDto(savedInvoice);
    }

    @Transactional
    public InvoiceDto updateInvoice(Long id, InvoiceUpdateRequest request) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found with id " + id));

        if (request.getDueDate() != null) {
            invoice.setDueDate(request.getDueDate());
        }
        if (request.getStatus() != null) {
            invoice.setStatus(InvoiceStatus.valueOf(request.getStatus()));
        }

        Invoice updatedInvoice = invoiceRepository.save(invoice);
        return invoiceMapper.toDto(updatedInvoice);
    }

    public void deleteInvoice(Long id) {
        invoiceRepository.deleteById(id);
    }

    // Hàm phát hành hóa đơn (generate)
    public Invoice generateInvoice(Invoice invoice) {
        // Logic phát hành hóa đơn có thể mở rộng ở đây
        return invoiceRepository.save(invoice);
    }

    public List<InvoiceDto> getInvoicesByApartmentIds(List<Long> apartmentIds) {
        return invoiceRepository.findByApartmentIdIn(apartmentIds).stream()
            .map(invoiceMapper::toDto)
            .collect(Collectors.toList());
    }
} 