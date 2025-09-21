package com.mytech.apartment.portal.dtos;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class EventRegistrationDto {
    private Long id;
    private Long eventId;
    private Long userId;
    private LocalDateTime registeredAt;
    private String status;
    private String qrCode;
    private LocalDateTime qrExpiresAt;
    private Boolean checkedIn;
    private LocalDateTime checkedInAt;
} 