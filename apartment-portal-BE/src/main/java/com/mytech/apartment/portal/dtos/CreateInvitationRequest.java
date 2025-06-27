package com.mytech.apartment.portal.dtos;

import lombok.Data;

@Data
public class CreateInvitationRequest {
    private Long apartmentId;
    private Long validityInHours;
} 