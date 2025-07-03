package com.mytech.apartment.portal.dtos;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

@Data
public class OtpVerificationRequest {
    
    @NotBlank(message = "Email hoặc số điện thoại không được để trống")
    private String emailOrPhone;
    
    @NotBlank(message = "Mã OTP không được để trống")
    @Pattern(regexp = "^[0-9]{6}$", message = "Mã OTP phải có 6 chữ số")
    private String otp;
} 