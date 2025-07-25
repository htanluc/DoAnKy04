package com.mytech.apartment.portal.apis;

import java.util.List;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;

import com.mytech.apartment.portal.dtos.*;
import com.mytech.apartment.portal.services.AiQaHistoryService;
import com.mytech.apartment.portal.services.OpenAiService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/ai")
@Tag(name = "AI Q&A", description = "Endpoints for AI-powered Q&A system")
public class AiQaHistoryController {
    private final AiQaHistoryService aiQaHistoryService;
    private final OpenAiService openAiService;

    public AiQaHistoryController(AiQaHistoryService aiQaHistoryService, OpenAiService openAiService) {
        this.aiQaHistoryService = aiQaHistoryService;
        this.openAiService = openAiService;
    }

    /**
     * [EN] Send question to AI and get answer
     * [VI] Gửi câu hỏi cho AI và nhận câu trả lời
     */
    @Operation(summary = "Ask AI question", description = "Send question to AI and get intelligent answer")
    @PostMapping("/qa")
    public ResponseEntity<AiQaResponse> askAiQuestion(@Valid @RequestBody AiQaRequest request) {
        try {
            // Lấy user ID từ security context
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            Long userId = aiQaHistoryService.getUserIdByUsername(username);
            
            // Gửi câu hỏi đến AI service
            AiQaResponse response = openAiService.processQuestion(request.getQuestion(), request.getContext());
            
            // Lưu lịch sử
            aiQaHistoryService.saveQaHistory(userId, request.getQuestion(), response.getAnswer(), response.getResponseTime());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new AiQaResponse(
                "Xin lỗi, tôi không thể trả lời câu hỏi này ngay lúc này. Vui lòng thử lại sau.",
                "error",
                0L,
                "low"
            ));
        }
    }

    /**
     * [EN] Get all AI Q&A history (Admin only)
     * [VI] Lấy toàn bộ lịch sử hỏi đáp AI (chỉ Admin)
     */
    @Operation(summary = "Get all AI Q&A history", description = "Admin only - Get complete AI Q&A history")
    @GetMapping("/admin/history")
    public ResponseEntity<List<AiQaHistoryDto>> getAllAiQaHistory() {
        List<AiQaHistoryDto> history = aiQaHistoryService.getAllHistory();
        return ResponseEntity.ok(history);
    }
    
    /**
     * [EN] Get AI Q&A history by ID
     * [VI] Lấy lịch sử hỏi đáp AI theo ID
     */
    @GetMapping("/admin/history/{qaId}")
    public ResponseEntity<AiQaHistoryDto> getAiQaHistoryById(@PathVariable Long qaId) {
        AiQaHistoryDto history = aiQaHistoryService.getHistoryById(qaId);
        return ResponseEntity.ok(history);
    }
    
    /**
     * [EN] Get AI Q&A history by user ID
     * [VI] Lấy lịch sử hỏi đáp AI theo ID người dùng
     */
    @GetMapping("/history/user/{userId}")
    public ResponseEntity<List<AiQaHistoryDto>> getAiQaHistoryByUserId(@PathVariable Long userId) {
        List<AiQaHistoryDto> history = aiQaHistoryService.getHistoryByUserId(userId);
        return ResponseEntity.ok(history);
    }
    
    /**
     * [EN] Get AI Q&A history by feedback
     * [VI] Lấy lịch sử hỏi đáp AI theo phản hồi
     */
    @GetMapping("/admin/history/feedback/{feedback}")
    public ResponseEntity<List<AiQaHistoryDto>> getAiQaHistoryByFeedback(@PathVariable String feedback) {
        List<AiQaHistoryDto> history = aiQaHistoryService.getHistoryByFeedback(feedback);
        return ResponseEntity.ok(history);
    }

    /**
     * [EN] Get user's own AI Q&A history
     * [VI] Lấy lịch sử hỏi đáp AI của chính mình
     */
    @GetMapping("/history/my")
    public ResponseEntity<List<AiQaHistoryDto>> getMyAiQaHistory() {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            Long userId = aiQaHistoryService.getUserIdByUsername(username);
            List<AiQaHistoryDto> history = aiQaHistoryService.getHistoryByUserId(userId);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * [EN] Provide feedback for AI answer
     * [VI] Đánh giá câu trả lời của AI
     */
    @PostMapping("/history/{qaId}/feedback")
    public ResponseEntity<ApiResponse<String>> provideFeedback(
            @PathVariable Long qaId,
            @RequestParam String feedback) {
        try {
            aiQaHistoryService.updateFeedback(qaId, feedback);
            return ResponseEntity.ok(ApiResponse.success("Cảm ơn bạn đã đánh giá!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
} 