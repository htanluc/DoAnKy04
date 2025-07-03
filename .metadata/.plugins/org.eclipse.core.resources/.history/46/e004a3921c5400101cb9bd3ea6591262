package com.mytech.apartment.portal.mappers;

import com.mytech.apartment.portal.dtos.FeedbackDto;
import com.mytech.apartment.portal.models.Feedback;
import org.springframework.stereotype.Component;

@Component
public class FeedbackMapper {

    public FeedbackDto toDto(Feedback feedback) {
        if (feedback == null) {
            return null;
        }

        return new FeedbackDto(
            feedback.getId(),
            feedback.getUser() != null ? feedback.getUser().getId() : null,
            feedback.getUser() != null ? feedback.getUser().getUsername() : null,
            feedback.getCategory() != null ? feedback.getCategory().getCategoryCode() : null,
            feedback.getCategory() != null ? feedback.getCategory().getCategoryName() : null,
            null, // title field doesn't exist in entity
            feedback.getContent(),
            null, // rating field doesn't exist in entity
            feedback.getStatus(),
            feedback.getResponse(),
            feedback.getSubmittedAt(),
            feedback.getRespondedAt()
        );
    }

    public Feedback toEntity(FeedbackDto dto) {
        if (dto == null) {
            return null;
        }

        Feedback feedback = new Feedback();
        feedback.setId(dto.getId());
        feedback.setContent(dto.getContent());
        feedback.setStatus(dto.getStatus());
        feedback.setResponse(dto.getResponse());
        feedback.setSubmittedAt(dto.getCreatedAt());
        feedback.setRespondedAt(dto.getUpdatedAt());
        
        return feedback;
    }
} 