package com.mytech.apartment.portal.mappers;

import com.mytech.apartment.portal.dtos.AnnouncementCreateRequest;
import com.mytech.apartment.portal.dtos.AnnouncementDto;
import com.mytech.apartment.portal.dtos.AnnouncementUpdateRequest;
import com.mytech.apartment.portal.models.Announcement;
import org.springframework.stereotype.Component;

@Component
public class AnnouncementMapper {

    public AnnouncementDto toDto(Announcement entity) {
        return toDto(entity, false); // Default to unread
    }

    public AnnouncementDto toDto(Announcement entity, boolean isRead) {
        if (entity == null) {
            return null;
        }
        AnnouncementDto dto = new AnnouncementDto();
        dto.setId(entity.getId());
        dto.setTitle(entity.getTitle());
        dto.setContent(entity.getContent());
        dto.setType(entity.getType());
        dto.setTargetAudience(entity.getTargetAudience());
        dto.setCreatedBy(entity.getCreatedBy());
        dto.setActive(entity.isActive());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setRead(isRead);
        return dto;
    }

    public Announcement toEntity(AnnouncementCreateRequest request, Long createdBy) {
        if (request == null) {
            return null;
        }
        Announcement entity = new Announcement();
        entity.setTitle(request.getTitle());
        entity.setContent(request.getContent());
        entity.setType(request.getType());
        entity.setTargetAudience(request.getTargetAudience());
        entity.setActive(request.isActive());
        entity.setCreatedBy(createdBy);
        return entity;
    }

    public void updateEntityFromRequest(Announcement entity, AnnouncementUpdateRequest request) {
        if (entity == null || request == null) {
            return;
        }
        entity.setTitle(request.getTitle());
        entity.setContent(request.getContent());
        entity.setType(request.getType());
        entity.setTargetAudience(request.getTargetAudience());
        entity.setActive(request.isActive());
    }
} 