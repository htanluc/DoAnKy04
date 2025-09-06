package com.mytech.apartment.portal.dtos;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;

@Data
public class ServiceRequestStatusUpdateRequest {
    
    @NotBlank(message = "Trạng thái không được để trống")
    private String status; // OPEN, IN_PROGRESS, COMPLETED, CANCELLED
    
    private String resolutionNotes; // Ghi chú xử lý
    
    @Min(value = 1, message = "Rating must be between 1 and 5")
    @Max(value = 5, message = "Rating must be between 1 and 5")
    private Integer rating; // Đánh giá 1-5 (sau khi hoàn thành)
    
    private Boolean isCompleted; // true nếu hoàn thành
} 