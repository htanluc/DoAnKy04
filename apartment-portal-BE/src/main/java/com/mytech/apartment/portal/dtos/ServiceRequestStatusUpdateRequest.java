package com.mytech.apartment.portal.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ServiceRequestStatusUpdateRequest {
    @NotBlank(message = "Status không được để trống")
    private String status;

    // Nếu front-end muốn gửi thêm ghi chú xử lý
    private String resolutionNotes;

    // Nếu front-end muốn gửi đánh giá luôn (nếu có)
    private Integer rating;

    // Nếu front-end muốn đánh dấu hoàn thành
    private boolean completed;
}
