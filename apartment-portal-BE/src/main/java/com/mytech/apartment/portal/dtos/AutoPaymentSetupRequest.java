package com.mytech.apartment.portal.dtos;

import lombok.Data;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Min;

@Data
public class AutoPaymentSetupRequest {
    
    @NotBlank(message = "Phương thức thanh toán không được để trống")
    private String paymentMethod; // MOMO, VNPAY, BANK_TRANSFER
    
    @NotNull(message = "Ngày thanh toán không được để trống")
    @Min(value = 1, message = "Ngày thanh toán phải từ 1-31")
    private Integer paymentDay; // Ngày trong tháng để thanh toán tự động
    
    @NotNull(message = "Hạn mức thanh toán không được để trống")
    @Min(value = 1, message = "Hạn mức phải lớn hơn 0")
    private Double maxAmount; // Hạn mức tối đa cho mỗi lần thanh toán
    
    private String accountNumber; // Số tài khoản/thẻ (nếu cần)
    
    private String accountName; // Tên chủ tài khoản
    
    private Boolean isActive; // Bật/tắt thanh toán tự động
} 