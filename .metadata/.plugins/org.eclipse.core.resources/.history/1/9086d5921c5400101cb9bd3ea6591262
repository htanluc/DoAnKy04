package com.mytech.apartment.portal.mappers;

import com.mytech.apartment.portal.models.AiQaHistory;
import com.mytech.apartment.portal.dtos.AiQaHistoryDto;
import org.springframework.stereotype.Component;

@Component
public class AiQaHistoryMapper {
    
    public AiQaHistoryDto toDto(AiQaHistory entity) {
        if (entity == null) {
            return null;
        }
        
        AiQaHistoryDto dto = new AiQaHistoryDto();
        dto.setQaId(entity.getQaId());
        dto.setUserId(entity.getUser() != null ? entity.getUser().getId() : null);
        dto.setQuestion(entity.getQuestion());
        dto.setAiAnswer(entity.getAiAnswer());
        dto.setAskedAt(entity.getAskedAt());
        dto.setResponseTime(entity.getResponseTime());
        dto.setFeedback(entity.getFeedback());
        
        return dto;
    }
    
    public AiQaHistory toEntity(AiQaHistoryDto dto) {
        if (dto == null) {
            return null;
        }
        
        AiQaHistory entity = new AiQaHistory();
        entity.setQaId(dto.getQaId());
        entity.setQuestion(dto.getQuestion());
        entity.setAiAnswer(dto.getAiAnswer());
        entity.setAskedAt(dto.getAskedAt());
        entity.setResponseTime(dto.getResponseTime());
        entity.setFeedback(dto.getFeedback());
        
        return entity;
    }
} 