package com.mytech.apartment.portal.dtos;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ApartmentInvitationDto {
    private Long id;
    private String code;
    private Long apartmentId;
    private boolean used;
    private Long usedByUserId;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
} 