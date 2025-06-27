package com.mytech.apartment.portal.dtos;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AiQaHistoryDto {
    private Long qaId;
    private Long userId;
    private String question;
    private String aiAnswer;
    private LocalDateTime askedAt;
    private Integer responseTime;
    private String feedback;
} 