package com.mytech.apartment.portal.dtos;

import lombok.Data;

@Data
public class EventDto {
    private Long id;
    private String title;
    private String description;
    private String startTime; // Format: "2025-07-21T11:00:00"
    private String endTime;   // Format: "2025-07-21T13:00:00"
    private String location;
    private String createdAt;
    private int participantCount; // Số người tham gia
    private boolean isRegistered; // User hiện tại đã đăng ký chưa
    private boolean isEnded; // Sự kiện đã kết thúc chưa
} 