package com.mytech.apartment.portal.mappers;

import org.springframework.stereotype.Component;

import com.mytech.apartment.portal.dtos.PaymentDto;
import com.mytech.apartment.portal.models.Payment;

@Component
public class PaymentMapper {

    public PaymentDto toDto(Payment entity) {
        if (entity == null) {
            return null;
        }
        PaymentDto dto = new PaymentDto();
        dto.setId(entity.getId());
        if (entity.getInvoice() != null) {
            dto.setInvoiceId(entity.getInvoice().getId());
        }
        dto.setPaidByUserId(entity.getPaidByUserId());
        dto.setPaymentDate(entity.getPaymentDate());
        dto.setAmount(entity.getAmount());
        dto.setMethod(entity.getMethod() != null ? entity.getMethod().name() : null);
        dto.setStatus(entity.getStatus() != null ? entity.getStatus().name() : null);
        dto.setReferenceCode(entity.getReferenceCode());
        return dto;
    }
} 