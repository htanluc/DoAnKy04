package com.mytech.apartment.portal.apis;

import com.mytech.apartment.portal.dtos.AiQaRequest;
import com.mytech.apartment.portal.dtos.AiQaResponse;
import com.mytech.apartment.portal.services.OpenAiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@Tag(name = "AI Diagnostics", description = "Endpoints for testing OpenAI connectivity and QA")
public class OpenAiController {

    private final OpenAiService openAiService;

    public OpenAiController(OpenAiService openAiService) {
        this.openAiService = openAiService;
    }

    @GetMapping("/ping")
    @Operation(summary = "Ping OpenAI", description = "Check connection and configuration")
    public ResponseEntity<Map<String, Object>> ping() {
        return ResponseEntity.ok(openAiService.diagnostics());
    }

    @PostMapping("/test")
    @Operation(summary = "Test QA", description = "Send a sample question to OpenAI for quick test")
    public ResponseEntity<AiQaResponse> test(@Valid @RequestBody(required = false) AiQaRequest body) {
        String question = body != null && body.getQuestion() != null ? body.getQuestion() : "Xin chào, bạn là ai?";
        AiQaResponse res = openAiService.processQuestion(question, body != null ? body.getContext() : null);
        return ResponseEntity.ok(res);
    }
}


