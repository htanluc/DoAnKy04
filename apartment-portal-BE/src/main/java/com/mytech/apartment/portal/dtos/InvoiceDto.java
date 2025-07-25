package com.mytech.apartment.portal.dtos;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

@Data
public class InvoiceDto {
    private Long id;
    private Long apartmentId;
    private String billingPeriod;
    private LocalDate issueDate;
    private LocalDate dueDate;
    private Double totalAmount;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Set<InvoiceItemDto> items;
}
