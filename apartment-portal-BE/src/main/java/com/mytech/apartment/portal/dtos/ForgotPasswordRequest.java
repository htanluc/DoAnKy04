package com.mytech.apartment.portal.dtos;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class ForgotPasswordRequest {
    
    @NotBlank(message = "Email hoặc số điện thoại không được để trống")
    private String emailOrPhone;
} 