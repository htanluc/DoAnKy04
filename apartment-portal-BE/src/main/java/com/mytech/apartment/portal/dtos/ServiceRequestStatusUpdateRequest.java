package com.mytech.apartment.portal.dtos;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
public class ServiceRequestStatusUpdateRequest {
    
    @NotBlank(message = "Trạng thái không được để trống")
    private String status; // OPEN, IN_PROGRESS, COMPLETED, CANCELLED
    
    private String resolutionNotes; // Ghi chú xử lý
    
    private Integer rating; // Đánh giá 1-5 (sau khi hoàn thành)
    
    @NotNull(message = "Thời gian hoàn thành không được để trống")
    private Boolean isCompleted; // true nếu hoàn thành
} 