package com.mytech.apartment.portal.dtos;

import lombok.Data;
import java.time.LocalDate;

@Data
public class InvoiceUpdateRequest {
    private LocalDate dueDate;
    private String status;
} 