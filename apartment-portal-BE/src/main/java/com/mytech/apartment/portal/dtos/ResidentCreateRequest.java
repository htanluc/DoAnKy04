package com.mytech.apartment.portal.dtos;

import lombok.Data;
import java.time.LocalDate;

@Data
public class ResidentCreateRequest {
    private String fullName;
    private LocalDate dateOfBirth;
    private String idCardNumber;
    private String familyRelation;
} 