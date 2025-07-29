package com.mytech.apartment.portal.dtos;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.Set;

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
    private String dateOfBirth; // Ngày sinh của user
    private String idCardNumber; // Số CMND/CCCD của user
    private String familyRelation; // Quan hệ họ hàng của user
    private String address; // Địa chỉ của user
    private String emergencyContactName; // Tên người liên hệ khẩn cấp
    private String emergencyContactPhone; // Số điện thoại người liên hệ khẩn cấp   
}
