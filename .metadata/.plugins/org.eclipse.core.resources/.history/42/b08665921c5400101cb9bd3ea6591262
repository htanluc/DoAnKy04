package com.mytech.apartment.portal.dtos;

import lombok.Data;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;

@Data
public class PaymentGatewayRequest {
    
    @NotNull(message = "ID hóa đơn không được để trống")
    private Long invoiceId;
    
    @NotBlank(message = "Phương thức thanh toán không được để trống")
    private String paymentMethod; // MOMO, VNPAY, BANK_TRANSFER, CREDIT_CARD
    
    @NotNull(message = "Số tiền không được để trống")
    private Double amount;
    
    private String description; // Mô tả giao dịch
    
    private String returnUrl; // URL callback sau khi thanh toán
} 