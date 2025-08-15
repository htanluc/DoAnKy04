package com.mytech.apartment.portal.dtos;

import lombok.Data;
import java.util.Set;
import java.time.LocalDate;

@Data
public class UserCreateRequest {
    private String username;
    private String phoneNumber;
    private String password;
    private String email;
    private String fullName;
    private String idCardNumber;
    private LocalDate dateOfBirth;
    private Set<String> roles;
} 