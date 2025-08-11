package com.mytech.apartment.portal.apis;

import com.mytech.apartment.portal.dtos.FeedbackDto;
import com.mytech.apartment.portal.dtos.FeedbackCreateRequest;
import com.mytech.apartment.portal.services.FeedbackService;
import com.mytech.apartment.portal.models.enums.FeedbackStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
public class FeedbackController {
    @Autowired
    private FeedbackService feedbackService;

    // Cư dân gửi phản hồi
    @PostMapping("/feedbacks")
    public ResponseEntity<FeedbackDto> createFeedback(@RequestBody FeedbackCreateRequest request) {
        FeedbackDto feedback = feedbackService.createFeedback(request);
        return ResponseEntity.ok(feedback);
    }

    // Cư dân xem phản hồi của mình
    @GetMapping("/feedbacks/my")
    public ResponseEntity<List<FeedbackDto>> getMyFeedbacks() {
        List<FeedbackDto> feedbacks = feedbackService.getMyFeedbacks();
        return ResponseEntity.ok(feedbacks);
    }

    // Admin xem tất cả phản hồi (có thể lọc)
    @GetMapping("/admin/feedbacks")
    public ResponseEntity<List<FeedbackDto>> getAllFeedbacks(
            @RequestParam(name = "status", required = false) FeedbackStatus status,
            @RequestParam(name = "category", required = false) String category,
            @RequestParam(name = "userId", required = false) Long userId
    ) {
        List<FeedbackDto> feedbacks = feedbackService.getAllFeedbacks(status, category, userId);
        return ResponseEntity.ok(feedbacks);
    }

    // Admin xem chi tiết phản hồi
    @GetMapping("/admin/feedbacks/{id}")
    public ResponseEntity<FeedbackDto> getFeedbackById(@PathVariable("id") Long id) {
        FeedbackDto feedback = feedbackService.getFeedbackById(id);
        return ResponseEntity.ok(feedback);
    }

    // Admin cập nhật trạng thái phản hồi
    @PutMapping("/admin/feedbacks/{id}/status")
    public ResponseEntity<FeedbackDto> updateFeedbackStatus(@PathVariable("id") Long id, @RequestParam FeedbackStatus status) {
        FeedbackDto feedback = feedbackService.updateFeedbackStatus(id, status);
        return ResponseEntity.ok(feedback);
    }

    // Admin trả lời phản hồi
    @PutMapping("/admin/feedbacks/{id}/response")
    public ResponseEntity<FeedbackDto> respondFeedback(@PathVariable("id") Long id, @RequestParam String response) {
        FeedbackDto feedback = feedbackService.respondFeedback(id, response);
        return ResponseEntity.ok(feedback);
    }
} 