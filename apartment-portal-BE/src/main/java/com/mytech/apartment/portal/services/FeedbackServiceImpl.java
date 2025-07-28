package com.mytech.apartment.portal.services;

import com.mytech.apartment.portal.dtos.FeedbackDto;
import com.mytech.apartment.portal.dtos.FeedbackCreateRequest;
import com.mytech.apartment.portal.mappers.FeedbackMapper;
import com.mytech.apartment.portal.models.Feedback;
import com.mytech.apartment.portal.models.FeedbackCategory;
import com.mytech.apartment.portal.models.User;
import com.mytech.apartment.portal.models.enums.FeedbackStatus;
import com.mytech.apartment.portal.repositories.FeedbackRepository;
import com.mytech.apartment.portal.repositories.FeedbackCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FeedbackServiceImpl implements FeedbackService {
    @Autowired
    private FeedbackRepository feedbackRepository;
    @Autowired
    private FeedbackCategoryRepository feedbackCategoryRepository;
    @Autowired
    private FeedbackMapper feedbackMapper;

    // TODO: Inject UserService để lấy user từ context thực tế

    @Override
    public FeedbackDto createFeedback(FeedbackCreateRequest request) {
        Feedback feedback = new Feedback();
        // Giả lập lấy user (nên lấy từ context thực tế)
        User user = new User();
        user.setId(request.getResidentId());
        feedback.setUser(user);
        FeedbackCategory category = feedbackCategoryRepository.findById(request.getCategoryId()).orElse(null);
        feedback.setCategory(category);
        feedback.setContent(request.getContent());
        feedback.setStatus(FeedbackStatus.PENDING);
        feedback.setSubmittedAt(LocalDateTime.now());
        Feedback saved = feedbackRepository.save(feedback);
        return feedbackMapper.toDto(saved);
    }

    @Override
    public List<FeedbackDto> getMyFeedbacks() {
        // TODO: Lấy userId từ context (hiện tại hardcode)
        Long userId = 1L;
        List<Feedback> list = feedbackRepository.findByUser_Id(userId);
        return list.stream().map(feedbackMapper::toDto).collect(Collectors.toList());
    }

    @Override
    public List<FeedbackDto> getAllFeedbacks(FeedbackStatus status, String category, Long userId) {
        List<Feedback> list = feedbackRepository.findAll();
        return list.stream()
                .filter(f -> status == null || f.getStatus() == status)
                .filter(f -> category == null || (f.getCategory() != null && f.getCategory().getCategoryCode().equalsIgnoreCase(category)))
                .filter(f -> userId == null || (f.getUser() != null && f.getUser().getId().equals(userId)))
                .map(feedbackMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public FeedbackDto getFeedbackById(Long id) {
        Optional<Feedback> feedback = feedbackRepository.findById(id);
        return feedback.map(feedbackMapper::toDto).orElse(null);
    }

    @Override
    public FeedbackDto updateFeedbackStatus(Long id, FeedbackStatus status) {
        Optional<Feedback> feedbackOpt = feedbackRepository.findById(id);
        if (feedbackOpt.isPresent()) {
            Feedback feedback = feedbackOpt.get();
            feedback.setStatus(status);
            Feedback saved = feedbackRepository.save(feedback);
            return feedbackMapper.toDto(saved);
        }
        return null;
    }

    @Override
    public FeedbackDto respondFeedback(Long id, String response) {
        Optional<Feedback> feedbackOpt = feedbackRepository.findById(id);
        if (feedbackOpt.isPresent()) {
            Feedback feedback = feedbackOpt.get();
            feedback.setResponse(response);
            feedback.setRespondedAt(LocalDateTime.now());
            feedback.setStatus(FeedbackStatus.RESPONDED);
            Feedback saved = feedbackRepository.save(feedback);
            return feedbackMapper.toDto(saved);
        }
        return null;
    }
} 