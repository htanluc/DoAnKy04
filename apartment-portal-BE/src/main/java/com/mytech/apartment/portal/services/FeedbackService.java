package com.mytech.apartment.portal.services;

import com.mytech.apartment.portal.dtos.FeedbackDto;
import com.mytech.apartment.portal.dtos.FeedbackCreateRequest;
import com.mytech.apartment.portal.models.enums.FeedbackStatus;
import java.util.List;

public interface FeedbackService {
    FeedbackDto createFeedback(FeedbackCreateRequest request);
    List<FeedbackDto> getMyFeedbacks();
    List<FeedbackDto> getAllFeedbacks(FeedbackStatus status, String category, Long userId);
    FeedbackDto getFeedbackById(Long id);
    FeedbackDto updateFeedbackStatus(Long id, FeedbackStatus status);
    FeedbackDto respondFeedback(Long id, String response);
} 