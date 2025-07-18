package com.mytech.apartment.portal.mappers;

import com.mytech.apartment.portal.dtos.InvoiceItemDto;
import com.mytech.apartment.portal.models.InvoiceItem;
import org.springframework.stereotype.Component;

@Component
public class InvoiceItemMapper {

    public InvoiceItemDto toDto(InvoiceItem entity) {
        if (entity == null) {
            return null;
        }
        InvoiceItemDto dto = new InvoiceItemDto();
        dto.setId(entity.getId());
        dto.setFeeType(entity.getFeeType());
        dto.setDescription(entity.getDescription());
        dto.setAmount(entity.getAmount());
        return dto;
    }

    public InvoiceItem toEntity(InvoiceItemDto dto) {
        if (dto == null) {
            return null;
        }
        InvoiceItem entity = new InvoiceItem();
        // ID is not set from DTO
        entity.setFeeType(dto.getFeeType());
        entity.setDescription(dto.getDescription());
        entity.setAmount(dto.getAmount());
        return entity;
    }
} 