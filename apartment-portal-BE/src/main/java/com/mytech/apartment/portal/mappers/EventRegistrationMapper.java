package com.mytech.apartment.portal.mappers;

import com.mytech.apartment.portal.dtos.EventRegistrationDto;
import com.mytech.apartment.portal.models.EventRegistration;
import org.springframework.stereotype.Component;

@Component
public class EventRegistrationMapper {

    public EventRegistrationDto toDto(EventRegistration entity) {
        if (entity == null) {
            return null;
        }
        EventRegistrationDto dto = new EventRegistrationDto();
        dto.setId(entity.getId());
        if (entity.getEvent() != null) {
            dto.setEventId(entity.getEvent().getId());
        }
        if (entity.getUser() != null) {
            dto.setUserId(entity.getUser().getId());
        }
        dto.setRegisteredAt(entity.getRegisteredAt());
        dto.setStatus(entity.getStatus() != null ? entity.getStatus().name() : null);
        dto.setQrCode(entity.getQrCode());
        dto.setQrExpiresAt(entity.getQrExpiresAt());
        dto.setCheckedIn(entity.getCheckedIn());
        dto.setCheckedInAt(entity.getCheckedInAt());
        return dto;
    }
} 