package com.mytech.apartment.portal.dtos;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class ResidentDto {
    private Long userId;
    private String fullName;
    private LocalDate dateOfBirth;
    private String idCardNumber;
    private String familyRelation;
    private Integer status;
    private List<EmergencyContactDto> emergencyContacts;
}
