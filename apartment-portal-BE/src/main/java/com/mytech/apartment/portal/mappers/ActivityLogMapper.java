package com.mytech.apartment.portal.mappers;

import com.mytech.apartment.portal.dtos.ActivityLogDto;
import com.mytech.apartment.portal.models.ActivityLog;
import com.mytech.apartment.portal.models.enums.ActivityActionType;
import org.springframework.stereotype.Component;

@Component
public class ActivityLogMapper {

    public ActivityLogDto toDto(ActivityLog entity) {
        if (entity == null) {
            return null;
        }
        
        ActivityLogDto dto = new ActivityLogDto();
        dto.setLogId(entity.getId());
        dto.setUserId(entity.getUser() != null ? entity.getUser().getId() : null);
        dto.setActionType(entity.getActionType() != null ? entity.getActionType().name() : null);
        
        // Set display name for action type
        try {
            if (entity.getActionType() != null) {
                dto.setActionTypeDisplayName(entity.getActionType().getDisplayName());
            } else {
                dto.setActionTypeDisplayName("Unknown");
            }
        } catch (Exception e) {
            dto.setActionTypeDisplayName(entity.getActionType() != null ? entity.getActionType().name() : "Unknown");
        }
        
        dto.setDescription(entity.getDescription());
        dto.setTimestamp(entity.getCreatedAt());
        
        // Set user information
        if (entity.getUser() != null) {
            dto.setUsername(entity.getUser().getUsername());
            dto.setUserFullName(entity.getUser().getFullName());
        }
        
        return dto;
    }

    public ActivityLog toEntity(ActivityLogDto dto) {
        if (dto == null) {
            return null;
        }
        
        ActivityLog entity = new ActivityLog();
        entity.setId(dto.getLogId());
        
        if (dto.getActionType() != null) {
            try {
                entity.setActionType(ActivityActionType.valueOf(dto.getActionType()));
            } catch (IllegalArgumentException e) {
                // Handle invalid action type
                entity.setActionType(null);
            }
        }
        
        entity.setDescription(dto.getDescription());
        entity.setCreatedAt(dto.getTimestamp());
        
        return entity;
    }
} 