package com.mytech.apartment.portal.dtos;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class ResidentCreateRequest {
    private String fullName;
    private LocalDate dateOfBirth;
    private String idCardNumber;
    private String familyRelation;
    private List<EmergencyContactDto> emergencyContacts;
} 