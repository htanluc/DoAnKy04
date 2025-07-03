package com.mytech.apartment.portal.mappers;

import com.mytech.apartment.portal.models.ActivityLog;
import com.mytech.apartment.portal.dtos.ActivityLogDto;
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
        dto.setDescription(entity.getDescription());
        dto.setTimestamp(entity.getTimestamp());
        
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