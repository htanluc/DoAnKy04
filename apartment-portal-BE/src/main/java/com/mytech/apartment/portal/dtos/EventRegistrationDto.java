package com.mytech.apartment.portal.dtos;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class EventRegistrationDto {
    private Long id;
    private Long eventId;
    private Long residentId;
    private LocalDateTime registeredAt;
    private String status;
} 