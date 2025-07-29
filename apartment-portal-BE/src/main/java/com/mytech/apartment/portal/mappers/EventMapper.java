package com.mytech.apartment.portal.mappers;

import com.mytech.apartment.portal.dtos.EventCreateRequest;
import com.mytech.apartment.portal.dtos.EventDto;
import com.mytech.apartment.portal.dtos.EventUpdateRequest;
import com.mytech.apartment.portal.models.Event;
import org.springframework.stereotype.Component;
import java.time.format.DateTimeFormatter;
import java.time.ZoneId;

@Component
public class EventMapper {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static final ZoneId VIETNAM_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    public EventDto toDto(Event entity) {
        if (entity == null) {
            return null;
        }
        EventDto dto = new EventDto();
        dto.setId(entity.getId());
        dto.setTitle(entity.getTitle());
        dto.setDescription(entity.getDescription());
        
        // Convert LocalDateTime to ZonedDateTime with Vietnam timezone
        dto.setStartTime(entity.getStartTime() != null ? 
            entity.getStartTime().atZone(VIETNAM_ZONE).format(FORMATTER) : null);
        dto.setEndTime(entity.getEndTime() != null ? 
            entity.getEndTime().atZone(VIETNAM_ZONE).format(FORMATTER) : null);
        dto.setLocation(entity.getLocation());
        dto.setCreatedAt(entity.getCreatedAt() != null ? 
            entity.getCreatedAt().atZone(VIETNAM_ZONE).format(FORMATTER) : null);
        return dto;
    }

    public EventDto toDto(Event entity, int participantCount, boolean isRegistered, boolean isEnded) {
        if (entity == null) {
            return null;
        }
        EventDto dto = toDto(entity);
        dto.setParticipantCount(participantCount);
        dto.setRegistered(isRegistered);
        dto.setEnded(isEnded);
        return dto;
    }

    public Event toEntity(EventCreateRequest request) {
        if (request == null) {
            return null;
        }
        Event entity = new Event();
        entity.setTitle(request.getTitle());
        entity.setDescription(request.getDescription());
        entity.setStartTime(request.getStartTime());
        entity.setEndTime(request.getEndTime());
        entity.setLocation(request.getLocation());
        return entity;
    }

    public void updateEntityFromRequest(Event entity, EventUpdateRequest request) {
        if (entity == null || request == null) {
            return;
        }
        entity.setTitle(request.getTitle());
        entity.setDescription(request.getDescription());
        entity.setStartTime(request.getStartTime());
        entity.setEndTime(request.getEndTime());
        entity.setLocation(request.getLocation());
    }
} 