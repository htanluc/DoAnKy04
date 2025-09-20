package com.mytech.apartment.portal.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChatMessage {
    @NotBlank(message = "Vai trò không được để trống")
    @Pattern(regexp = "system|user|assistant", flags = Pattern.Flag.CASE_INSENSITIVE,
            message = "Vai trò phải là system, user, hoặc assistant")
    private String role;

    @NotBlank(message = "Nội dung không được để trống")
    private String content;
}



