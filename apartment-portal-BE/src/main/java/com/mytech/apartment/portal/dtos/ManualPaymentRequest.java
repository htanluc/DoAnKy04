package com.mytech.apartment.portal.dtos;

import lombok.Data;

@Data
public class ManualPaymentRequest {
    private Long invoiceId;
    private Long paidByUserId;
    private Double amount;
    private String method; // CASH, BANK...
    private String referenceCode;
} 