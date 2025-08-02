package com.mytech.apartment.portal.dtos;

import lombok.Data;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.Set;
import java.util.List;

@Data
public class UserDto {
    private Long id;
    private String username;
    private String phoneNumber;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Set<String> roles;
    private String lockReason;
    private String email;
    private String avatarUrl; // Link ảnh đại diện user
    private String fullName; // Tên đầy đủ của user
    private LocalDate dateOfBirth; // Ngày sinh của user
    private String idCardNumber; // Số CMND/CCCD của user
    private List<EmergencyContactDto> emergencyContacts; // Danh sách liên hệ khẩn cấp
}
