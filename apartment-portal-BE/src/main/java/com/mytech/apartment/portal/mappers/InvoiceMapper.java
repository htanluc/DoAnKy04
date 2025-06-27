package com.mytech.apartment.portal.mappers;

import com.mytech.apartment.portal.dtos.InvoiceDto;
import com.mytech.apartment.portal.models.Invoice;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class InvoiceMapper {

    @Autowired
    private InvoiceItemMapper invoiceItemMapper;

    public InvoiceDto toDto(Invoice entity) {
        if (entity == null) {
            return null;
        }
        InvoiceDto dto = new InvoiceDto();
        dto.setId(entity.getId());
        dto.setApartmentId(entity.getApartmentId());
        dto.setBillingPeriod(entity.getBillingPeriod());
        dto.setIssueDate(entity.getIssueDate());
        dto.setDueDate(entity.getDueDate());
        dto.setTotalAmount(entity.getTotalAmount());
        dto.setStatus(entity.getStatus());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        if (entity.getItems() != null) {
            dto.setItems(entity.getItems().stream()
                    .map(invoiceItemMapper::toDto)
                    .collect(Collectors.toSet()));
        }
        return dto;
    }
} 