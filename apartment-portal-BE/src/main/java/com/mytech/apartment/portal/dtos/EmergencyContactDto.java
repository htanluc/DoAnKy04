package com.mytech.apartment.portal.dtos;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class EmergencyContactDto {
    private Long id;
    private Long userId;
    private String name;
    private String phone;
    private String relationship;
    private LocalDateTime createdAt;
} 