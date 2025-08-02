package com.mytech.apartment.portal.mappers;

import com.mytech.apartment.portal.dtos.UserCreateRequest;
import com.mytech.apartment.portal.dtos.UserDto;
import com.mytech.apartment.portal.dtos.UserUpdateRequest;
import com.mytech.apartment.portal.dtos.EmergencyContactDto;
import com.mytech.apartment.portal.models.User;
import com.mytech.apartment.portal.models.enums.UserStatus;
import org.springframework.stereotype.Component;
import java.util.stream.Collectors;



@Component
public class UserMapper {

    public UserDto toDto(User user) {
        if (user == null) {
            return null;
        }
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setStatus(user.getStatus() != null ? user.getStatus().name() : null);
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        dto.setLockReason(user.getLockReason());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setDateOfBirth(user.getDateOfBirth());
        dto.setIdCardNumber(user.getIdCardNumber());
        
        // Map roles sang DTO
        if (user.getRoles() != null) {
            dto.setRoles(user.getRoles().stream().map(role -> role.getName()).collect(Collectors.toSet()));
        }
        dto.setAvatarUrl(user.getAvatarUrl()); // map avatarUrl
        
        // Map emergencyContacts
        if (user.getEmergencyContacts() != null) {
            dto.setEmergencyContacts(user.getEmergencyContacts().stream()
                .map(this::toEmergencyContactDto)
                .collect(Collectors.toList()));
        }
        
        return dto;
    }

    private EmergencyContactDto toEmergencyContactDto(com.mytech.apartment.portal.models.EmergencyContact contact) {
        if (contact == null) {
            return null;
        }
        EmergencyContactDto dto = new EmergencyContactDto();
        dto.setId(contact.getId());
        dto.setName(contact.getName());
        dto.setPhone(contact.getPhone());
        dto.setRelationship(contact.getRelationship());
        dto.setCreatedAt(contact.getCreatedAt());
        return dto;
    }

    public User toEntity(UserCreateRequest request) {
        if (request == null) {
            return null;
        }
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPasswordHash(request.getPassword());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setEmail(request.getEmail());
        user.setStatus(UserStatus.INACTIVE); // Default status INACTIVE khi đăng ký
        return user;
    }

    public void updateUserFromRequest(User user, UserUpdateRequest request) {
        if (request == null || user == null) {
            return;
        }
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getStatus() != null) {
            user.setStatus(UserStatus.valueOf(request.getStatus()));
        }
        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getDateOfBirth() != null) {
            user.setDateOfBirth(request.getDateOfBirth());
        }
        if (request.getIdCardNumber() != null) {
            user.setIdCardNumber(request.getIdCardNumber());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }
        
        // Cập nhật emergencyContacts
        if (request.getEmergencyContacts() != null) {
            user.getEmergencyContacts().clear();
            for (EmergencyContactDto dto : request.getEmergencyContacts()) {
                com.mytech.apartment.portal.models.EmergencyContact contact = new com.mytech.apartment.portal.models.EmergencyContact();
                contact.setName(dto.getName());
                contact.setPhone(dto.getPhone());
                contact.setRelationship(dto.getRelationship());
                contact.setUser(user);
                user.getEmergencyContacts().add(contact);
            }
        }
    }
} 