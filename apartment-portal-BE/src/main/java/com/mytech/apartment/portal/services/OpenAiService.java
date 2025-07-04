package com.mytech.apartment.portal.services;

import com.mytech.apartment.portal.dtos.AiQaResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.util.HashMap;
import java.util.Map;
import java.util.List;

@SuppressWarnings({"unchecked", "rawtypes"})
@Service
public class OpenAiService {

    @Value("${openai.api.key:}")
    private String apiKey;

    @Value("${openai.api.url:https://api.openai.com/v1/chat/completions}")
    private String apiUrl;

    @Value("${openai.model:gpt-3.5-turbo}")
    private String model;

    private final RestTemplate restTemplate = new RestTemplate();

    public AiQaResponse processQuestion(String question, String context) {
        long startTime = System.currentTimeMillis();

        try {
            // Tạo prompt với context
            String prompt = buildPrompt(question, context);

            // Gọi OpenAI API
            String answer = callOpenAiApi(prompt);

            long responseTime = System.currentTimeMillis() - startTime;

            return new AiQaResponse(
                answer,
                (context != null && !context.trim().isEmpty()) ? "database" : "general",
                responseTime,
                "high"
            );

        } catch (Exception e) {
            long responseTime = System.currentTimeMillis() - startTime;
            return new AiQaResponse(
                "Xin lỗi, có lỗi xảy ra khi xử lý câu hỏi của bạn.",
                "error",
                responseTime,
                "low"
            );
        }
    }

    private String buildPrompt(String question, String context) {
        StringBuilder prompt = new StringBuilder();

        // System message
        prompt.append("Bạn là trợ lý AI của hệ thống quản lý tòa nhà chung cư. ");
        prompt.append("Bạn có thể trả lời các câu hỏi về quản lý tòa nhà, dịch vụ, quy định, v.v. ");
        prompt.append("Hãy trả lời ngắn gọn, chính xác và hữu ích.\n\n");

        // Context từ database nếu có
        if (context != null && !context.trim().isEmpty()) {
            prompt.append("Thông tin từ hệ thống:\n");
            prompt.append(context);
            prompt.append("\n\n");
        }

        // Câu hỏi của user
        prompt.append("Câu hỏi: ");
        prompt.append(question);
        prompt.append("\n\nTrả lời:");

        return prompt.toString();
    }

    private String callOpenAiApi(String prompt) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            // Fallback response nếu không có API key
            return "Tính năng AI đang được cấu hình. Vui lòng liên hệ admin để được hỗ trợ.";
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> message = new HashMap<>();
            message.put("role", "user");
            message.put("content", prompt);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", model);
            requestBody.put("messages", List.of(message));
            requestBody.put("max_tokens", 500);
            requestBody.put("temperature", 0.7);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(apiUrl, request, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                Object choicesObj = body.get("choices");
                if (choicesObj instanceof List) {
                    List<?> choices = (List<?>) choicesObj;
                    if (!choices.isEmpty() && choices.get(0) instanceof Map) {
                        Map<?, ?> choice = (Map<?, ?>) choices.get(0);
                        Object messageResponseObj = choice.get("message");
                        if (messageResponseObj instanceof Map) {
                            Map<?, ?> messageResponse = (Map<?, ?>) messageResponseObj;
                            Object contentObj = messageResponse.get("content");
                            if (contentObj instanceof String) {
                                return (String) contentObj;
                            }
                        }
                    }
                }
            }

            return "Không thể nhận được phản hồi từ AI. Vui lòng thử lại sau.";

        } catch (Exception e) {
            return "Có lỗi xảy ra khi kết nối với AI service: " + e.getMessage();
        }
    }

    // Method để test kết nối
    public boolean testConnection() {
        try {
            String testResponse = callOpenAiApi("Xin chào");
            return testResponse != null && !testResponse.contains("lỗi");
        } catch (Exception e) {
            return false;
        }
    }
} 