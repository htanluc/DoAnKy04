package com.mytech.apartment.portal.dtos;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class EventRegistrationRequest {
    @NotNull(message = "Event ID is required")
    private Long eventId;
    
    private Long userId; // This will be set by the controller from authenticated user
} 