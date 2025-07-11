package com.mytech.apartment.portal.dtos;

import lombok.Data;

@Data
public class AnnouncementUpdateRequest {
    private String title;
    private String content;
    private String type;
    private String targetAudience;
    private boolean isActive;
} 