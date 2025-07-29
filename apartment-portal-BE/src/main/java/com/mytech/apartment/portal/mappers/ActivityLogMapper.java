package com.mytech.apartment.portal.mappers;

import com.mytech.apartment.portal.models.ActivityLog;
import com.mytech.apartment.portal.dtos.ActivityLogDto;
import com.mytech.apartment.portal.models.enums.ActivityActionType;
import org.springframework.stereotype.Component;

@Component
public class ActivityLogMapper {
    
    public ActivityLogDto toDto(ActivityLog entity) {
        if (entity == null) {
            return null;
        }
        
        ActivityLogDto dto = new ActivityLogDto();
        dto.setLogId(entity.getLogId());
        dto.setUserId(entity.getUser() != null ? entity.getUser().getId() : null);
        dto.setActionType(entity.getActionType());
        
        // Set display name for action type
        try {
            ActivityActionType actionType = ActivityActionType.fromCode(entity.getActionType());
            dto.setActionTypeDisplayName(actionType.getDisplayName());
        } catch (IllegalArgumentException e) {
            dto.setActionTypeDisplayName(entity.getActionType()); // Fallback to code
        }
        
        dto.setDescription(entity.getDescription());
        dto.setTimestamp(entity.getTimestamp());
        
        // Set user information
        if (entity.getUser() != null) {
            dto.setUsername(entity.getUser().getUsername());
            dto.setUserFullName(entity.getUser().getUsername()); // Default to username, can be enhanced later
        }
        
        return dto;
    }
    
    public ActivityLog toEntity(ActivityLogDto dto) {
        if (dto == null) {
            return null;
        }
        
        ActivityLog entity = new ActivityLog();
        entity.setLogId(dto.getLogId());
        entity.setActionType(dto.getActionType());
        entity.setDescription(dto.getDescription());
        entity.setTimestamp(dto.getTimestamp());
        
        return entity;
    }
} 