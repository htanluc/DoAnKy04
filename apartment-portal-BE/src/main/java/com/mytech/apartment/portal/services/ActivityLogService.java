package com.mytech.apartment.portal.services;

import com.mytech.apartment.portal.models.ActivityLog;
import com.mytech.apartment.portal.dtos.ActivityLogDto;
import com.mytech.apartment.portal.dtos.ActivityLogSummaryDto;
import com.mytech.apartment.portal.mappers.ActivityLogMapper;
import com.mytech.apartment.portal.repositories.ActivityLogRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Map;

@Service
public class ActivityLogService {
    private final ActivityLogRepository activityLogRepository;
    private final ActivityLogMapper activityLogMapper;

    public ActivityLogService(ActivityLogRepository activityLogRepository, ActivityLogMapper activityLogMapper) {
        this.activityLogRepository = activityLogRepository;
        this.activityLogMapper = activityLogMapper;
    }

    public List<ActivityLogDto> getAllLogs() {
        List<ActivityLog> logs = activityLogRepository.findAll();
        return logs.stream()
                .map(activityLogMapper::toDto)
                .collect(Collectors.toList());
    }
    
    public ActivityLogDto getLogById(Long logId) {
        ActivityLog log = activityLogRepository.findById(logId)
                .orElseThrow(() -> new RuntimeException("Activity log not found with id: " + logId));
        return activityLogMapper.toDto(log);
    }
    
    public List<ActivityLogDto> getLogsByUserId(Long userId) {
        List<ActivityLog> logs = activityLogRepository.findByUserId(userId);
        return logs.stream()
                .map(activityLogMapper::toDto)
                .collect(Collectors.toList());
    }
    
    public List<ActivityLogDto> getLogsByActionType(String actionType) {
        List<ActivityLog> logs = activityLogRepository.findByActionType(actionType);
        return logs.stream()
                .map(activityLogMapper::toDto)
                .collect(Collectors.toList());
    }
    
    public ActivityLogSummaryDto getActivityLogSummary() {
        List<ActivityLog> allLogs = activityLogRepository.findAll();
        LocalDateTime now = LocalDateTime.now();
        
        ActivityLogSummaryDto summary = new ActivityLogSummaryDto();
        summary.setTotalLogs((long) allLogs.size());
        
        // Count unique users
        long uniqueUsers = allLogs.stream()
                .map(log -> log.getUser().getId())
                .distinct()
                .count();
        summary.setUniqueUsers(uniqueUsers);
        
        // Find most common action
        String mostCommonAction = allLogs.stream()
                .collect(Collectors.groupingBy(ActivityLog::getActionType, Collectors.counting()))
                .entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("N/A");
        summary.setMostCommonAction(mostCommonAction);
        
        // Find last activity
        LocalDateTime lastActivity = allLogs.stream()
                .map(ActivityLog::getTimestamp)
                .max(LocalDateTime::compareTo)
                .orElse(null);
        summary.setLastActivity(lastActivity);
        
        // Count logs by time period
        long logsToday = allLogs.stream()
                .filter(log -> log.getTimestamp().toLocalDate().equals(now.toLocalDate()))
                .count();
        summary.setLogsToday(logsToday);
        
        long logsThisWeek = allLogs.stream()
                .filter(log -> log.getTimestamp().isAfter(now.minus(7, ChronoUnit.DAYS)))
                .count();
        summary.setLogsThisWeek(logsThisWeek);
        
        long logsThisMonth = allLogs.stream()
                .filter(log -> log.getTimestamp().isAfter(now.minus(30, ChronoUnit.DAYS)))
                .count();
        summary.setLogsThisMonth(logsThisMonth);
        
        return summary;
    }
} 