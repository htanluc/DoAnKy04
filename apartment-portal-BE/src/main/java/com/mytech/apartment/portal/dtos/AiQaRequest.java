package com.mytech.apartment.portal.dtos;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class AiQaRequest {
    
    @NotBlank(message = "Câu hỏi không được để trống")
    private String question;
    
    private String context; // Ngữ cảnh bổ sung (tùy chọn)
} 