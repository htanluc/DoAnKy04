package com.mytech.apartment.portal.dtos;

import lombok.Data;
import java.util.Set;

@Data
public class UserCreateRequest {
    private String username;
    private String phoneNumber;
    private String password;
    private String email;
    private Set<String> roles;
} 