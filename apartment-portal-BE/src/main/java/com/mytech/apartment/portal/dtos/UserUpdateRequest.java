package com.mytech.apartment.portal.dtos;

import lombok.Data;
import java.util.Set;

@Data
public class UserUpdateRequest {
    private String username;
    private String phoneNumber;
    private String status;
    private Set<String> roles;
    private String avatarUrl;
    private String fullName;
    private String dateOfBirth;
    private String idCardNumber;
    private String familyRelation;
    private String address;
    private String emergencyContactName;
    private String emergencyContactPhone;
} 