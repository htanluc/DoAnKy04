package com.mytech.apartment.portal.dtos;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AiQaHistorySummaryDto {
    private Long totalQuestions;
    private Long uniqueUsers;
    private Double averageResponseTime;
    private String mostCommonFeedback;
    private LocalDateTime lastQuestion;
    private Long questionsToday;
    private Long questionsThisWeek;
    private Long questionsThisMonth;
    private Long positiveFeedback;
    private Long negativeFeedback;
    private Long neutralFeedback;
} 