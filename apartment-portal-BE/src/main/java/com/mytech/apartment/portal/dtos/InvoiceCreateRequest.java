package com.mytech.apartment.portal.dtos;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class InvoiceCreateRequest {
    private Long apartmentId;
    private String billingPeriod;
    private LocalDate issueDate;
    private LocalDate dueDate;
    private List<InvoiceItemDto> items;
} 