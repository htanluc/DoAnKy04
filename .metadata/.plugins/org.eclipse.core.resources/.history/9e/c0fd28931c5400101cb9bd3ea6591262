package com.mytech.apartment.portal.dtos;

import lombok.Data;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;

@Data
public class ServiceRequestAssignmentRequest {
    
    @NotNull(message = "ID nhân viên được gán không được để trống")
    private Long assignedToUserId;
    
    @NotBlank(message = "Loại dịch vụ không được để trống")
    private String serviceCategory; // Lau dọn, Sửa chữa, An ninh
    
    @NotNull(message = "Mức độ ưu tiên không được để trống")
    private Integer priority; // 1-5 (1: thấp nhất, 5: cao nhất)
    
    private String adminNotes; // Ghi chú của admin
} 