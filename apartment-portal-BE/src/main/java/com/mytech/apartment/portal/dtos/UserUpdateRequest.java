package com.mytech.apartment.portal.dtos;

import lombok.Data;
import java.time.LocalDate;
import java.util.Set;
import java.util.List;

@Data
public class UserUpdateRequest {
    private String username;
    private String phoneNumber;
    private String status;
    private Set<String> roles;
    private String avatarUrl;
    private String fullName;
    private LocalDate dateOfBirth;
    private String idCardNumber;
    private List<EmergencyContactDto> emergencyContacts;
} 