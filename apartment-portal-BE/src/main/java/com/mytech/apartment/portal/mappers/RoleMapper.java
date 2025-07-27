package com.mytech.apartment.portal.mappers;

import com.mytech.apartment.portal.dtos.RoleDto;
import com.mytech.apartment.portal.models.Role;
import org.springframework.stereotype.Component;

@Component
public class RoleMapper {
    public RoleDto toDto(Role role) {
        if (role == null) return null;
        return new RoleDto(role.getId(), role.getName(), role.getDescription());
    }
} 