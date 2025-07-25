package com.mytech.apartment.portal.services;

import com.mytech.apartment.portal.models.AiQaHistory;
import com.mytech.apartment.portal.models.User;
import com.mytech.apartment.portal.dtos.AiQaHistoryDto;
import com.mytech.apartment.portal.dtos.AiQaHistorySummaryDto;
import com.mytech.apartment.portal.mappers.AiQaHistoryMapper;
import com.mytech.apartment.portal.repositories.AiQaHistoryRepository;
import com.mytech.apartment.portal.repositories.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;
import java.util.stream.Collectors;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.Optional;

@Service
public class AiQaHistoryService {
    private final AiQaHistoryRepository aiQaHistoryRepository;
    private final AiQaHistoryMapper aiQaHistoryMapper;
    
    @Autowired
    private UserRepository userRepository;

    public AiQaHistoryService(AiQaHistoryRepository aiQaHistoryRepository, AiQaHistoryMapper aiQaHistoryMapper) {
        this.aiQaHistoryRepository = aiQaHistoryRepository;
        this.aiQaHistoryMapper = aiQaHistoryMapper;
    }

    public List<AiQaHistoryDto> getAllHistory() {
        List<AiQaHistory> history = aiQaHistoryRepository.findAll();
        return history.stream()
                .map(aiQaHistoryMapper::toDto)
                .collect(Collectors.toList());
    }
    
    public AiQaHistoryDto getHistoryById(Long qaId) {
        AiQaHistory history = aiQaHistoryRepository.findById(qaId)
                .orElseThrow(() -> new RuntimeException("AI Q&A history not found with id: " + qaId));
        return aiQaHistoryMapper.toDto(history);
    }
    
    public List<AiQaHistoryDto> getHistoryByUserId(Long userId) {
        List<AiQaHistory> history = aiQaHistoryRepository.findByUserId(userId);
        return history.stream()
                .map(aiQaHistoryMapper::toDto)
                .collect(Collectors.toList());
    }
    
    public List<AiQaHistoryDto> getHistoryByFeedback(String feedback) {
        List<AiQaHistory> history = aiQaHistoryRepository.findByFeedback(feedback);
        return history.stream()
                .map(aiQaHistoryMapper::toDto)
                .collect(Collectors.toList());
    }

    public Long getUserIdByUsername(String username) {
        Optional<User> user = userRepository.findByUsername(username);
        if (user.isPresent()) {
            return user.get().getId();
        }
        // Thử tìm bằng phoneNumber nếu username không tìm thấy
        user = userRepository.findByPhoneNumber(username);
        if (user.isPresent()) {
            return user.get().getId();
        }
        throw new RuntimeException("User not found with username: " + username);
    }

    public void saveQaHistory(Long userId, String question, String answer, Long responseTime) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        AiQaHistory history = AiQaHistory.builder()
                .user(user)
                .question(question)
                .aiAnswer(answer)
                .askedAt(LocalDateTime.now())
                .responseTime(responseTime != null ? responseTime.intValue() : 0)
                .build();

        aiQaHistoryRepository.save(history);
    }

    public void updateFeedback(Long qaId, String feedback) {
        AiQaHistory history = aiQaHistoryRepository.findById(qaId)
                .orElseThrow(() -> new RuntimeException("AI Q&A history not found with id: " + qaId));
        
        history.setFeedback(feedback);
        aiQaHistoryRepository.save(history);
    }
    
    public AiQaHistorySummaryDto getAiQaHistorySummary() {
        List<AiQaHistory> allHistory = aiQaHistoryRepository.findAll();
        LocalDateTime now = LocalDateTime.now();
        
        AiQaHistorySummaryDto summary = new AiQaHistorySummaryDto();
        summary.setTotalQuestions((long) allHistory.size());
        
        // Count unique users
        long uniqueUsers = allHistory.stream()
                .map(history -> history.getUser().getId())
                .distinct()
                .count();
        summary.setUniqueUsers(uniqueUsers);
        
        // Calculate average response time
        double averageResponseTime = allHistory.stream()
                .filter(history -> history.getResponseTime() != null)
                .mapToInt(AiQaHistory::getResponseTime)
                .average()
                .orElse(0.0);
        summary.setAverageResponseTime(averageResponseTime);
        
        // Find most common feedback
        String mostCommonFeedback = allHistory.stream()
                .filter(history -> history.getFeedback() != null)
                .collect(Collectors.groupingBy(AiQaHistory::getFeedback, Collectors.counting()))
                .entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("N/A");
        summary.setMostCommonFeedback(mostCommonFeedback);
        
        // Find last question
        LocalDateTime lastQuestion = allHistory.stream()
                .map(AiQaHistory::getAskedAt)
                .max(LocalDateTime::compareTo)
                .orElse(null);
        summary.setLastQuestion(lastQuestion);
        
        // Count questions by time period
        long questionsToday = allHistory.stream()
                .filter(history -> history.getAskedAt().toLocalDate().equals(now.toLocalDate()))
                .count();
        summary.setQuestionsToday(questionsToday);
        
        long questionsThisWeek = allHistory.stream()
                .filter(history -> history.getAskedAt().isAfter(now.minus(7, ChronoUnit.DAYS)))
                .count();
        summary.setQuestionsThisWeek(questionsThisWeek);
        
        long questionsThisMonth = allHistory.stream()
                .filter(history -> history.getAskedAt().isAfter(now.minus(30, ChronoUnit.DAYS)))
                .count();
        summary.setQuestionsThisMonth(questionsThisMonth);
        
        // Count feedback types
        long positiveFeedback = allHistory.stream()
                .filter(history -> "positive".equalsIgnoreCase(history.getFeedback()))
                .count();
        summary.setPositiveFeedback(positiveFeedback);
        
        long negativeFeedback = allHistory.stream()
                .filter(history -> "negative".equalsIgnoreCase(history.getFeedback()))
                .count();
        summary.setNegativeFeedback(negativeFeedback);
        
        long neutralFeedback = allHistory.stream()
                .filter(history -> "neutral".equalsIgnoreCase(history.getFeedback()))
                .count();
        summary.setNeutralFeedback(neutralFeedback);
        
        return summary;
    }
} 