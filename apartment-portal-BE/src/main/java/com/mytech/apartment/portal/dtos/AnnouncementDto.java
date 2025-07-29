package com.mytech.apartment.portal.dtos;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AnnouncementDto {
    private Long id;
    private String title;
    private String content;
    private String type;
    private String targetAudience;
    private Long createdBy;
    private boolean isActive;
    private LocalDateTime createdAt;
    private boolean isRead; // Thêm trường này để biết user đã đọc chưa
} 