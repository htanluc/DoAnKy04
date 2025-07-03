package com.mytech.apartment.portal.dtos;

import com.mytech.apartment.portal.models.Role;
import lombok.Data;

import java.util.List;
import java.util.stream.Collectors;

@Data
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String username;
    private String email;
    private String phoneNumber;
    private List<String> roles;
    private String status;
    private String refreshToken;

    public JwtResponse(String token, String type, Long id, String username, String email, String phoneNumber, List<String> roles, String status, String refreshToken) {
        this.token = token;
        this.type = type;
        this.id = id;
        this.username = username;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.roles = roles;
        this.status = status;
        this.refreshToken = refreshToken;
    }

    public JwtResponse() {}

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }

    public void setRolesFromUser(List<Role> userRoles) {
        this.roles = userRoles.stream()
            .map(Role::getName)
            .collect(Collectors.toList());
    }
}
