package com.mytech.apartment.portal.dtos;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class LoginRequest {
    @NotBlank(message = "Số điện thoại không được để trống")
    private String phoneNumber;
    
    @NotBlank(message = "Mật khẩu không được để trống")
    private String password;
}
