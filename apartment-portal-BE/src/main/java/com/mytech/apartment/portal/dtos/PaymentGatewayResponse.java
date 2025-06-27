package com.mytech.apartment.portal.dtos;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentGatewayResponse {
    private String transactionId;
    private String paymentUrl; // URL để redirect user đến trang thanh toán
    private String status; // PENDING, SUCCESS, FAILED
    private String message;
    private String qrCode; // QR code cho thanh toán (nếu có)
} 