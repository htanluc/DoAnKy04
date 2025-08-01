package com.mytech.apartment.portal.services;

import com.mytech.apartment.portal.dtos.ActivityLogDto;
import com.mytech.apartment.portal.mappers.ActivityLogMapper;
import com.mytech.apartment.portal.models.ActivityLog;
import com.mytech.apartment.portal.models.User;
import com.mytech.apartment.portal.models.enums.ActivityActionType;
import com.mytech.apartment.portal.repositories.ActivityLogRepository;
import com.mytech.apartment.portal.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ActivityLogService {

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private ActivityLogMapper activityLogMapper;
    
    @Autowired
    private UserRepository userRepository;

    public List<ActivityLogDto> getAllActivityLogs() {
        return activityLogRepository.findAll().stream()
                .map(activityLogMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<ActivityLogDto> getActivityLogsByUserId(Long userId) {
        return activityLogRepository.findRecentByUserIdOrderByTimestampDesc(userId).stream()
                .map(activityLogMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<ActivityLogDto> getRecentActivityLogsByUserId(Long userId, int limit) {
        return activityLogRepository.findRecentByUserIdOrderByTimestampDescLimit(userId, limit).stream()
                .map(activityLogMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<ActivityLogDto> getActivityLogsByUsername(String username) {
        Optional<User> userOpt = userRepository.findByPhoneNumber(username);
        if (userOpt.isEmpty()) {
            return List.of(); // Return empty list if user not found
        }
        
        Long userId = userOpt.get().getId();
        return getActivityLogsByUserId(userId);
    }

    /**
     * Get activity logs for current authenticated user
     */
    public List<ActivityLogDto> getMyActivityLogs(String username) {
        System.out.println("ActivityLogService: Getting activity logs for username: " + username);
        
        Optional<User> userOpt = userRepository.findByPhoneNumber(username);
        if (userOpt.isEmpty()) {
            System.out.println("ActivityLogService: User not found for username: " + username);
            return List.of(); // Return empty list if user not found
        }
        
        Long userId = userOpt.get().getId();
        System.out.println("ActivityLogService: Found user ID: " + userId + " for username: " + username);
        
        List<ActivityLogDto> logs = getActivityLogsByUserId(userId);
        System.out.println("ActivityLogService: Found " + logs.size() + " activity logs for user ID: " + userId);
        
        return logs;
    }

    public void logActivity(Long userId, String actionType, String description) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return; // Skip logging if user not found
        }
        
        ActivityLog activityLog = ActivityLog.builder()
                .user(userOpt.get())
                .actionType(actionType)
                .description(description)
                .timestamp(java.time.LocalDateTime.now())
                .build();
        
        activityLogRepository.save(activityLog);
    }

    /**
     * Log activity for current authenticated user
     */
    public void logActivityForCurrentUser(ActivityActionType actionType, String description) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            return; // Skip logging for unauthenticated users
        }
        
        Optional<User> userOpt = userRepository.findByPhoneNumber(auth.getName());
        if (userOpt.isEmpty()) {
            return; // Skip logging if user not found
        }
        
        logActivity(userOpt.get().getId(), actionType.getCode(), description);
    }

    /**
     * Log activity for current authenticated user with enum
     */
    public void logActivityForCurrentUser(ActivityActionType actionType, String description, Object... args) {
        String formattedDescription = String.format(description, args);
        logActivityForCurrentUser(actionType, formattedDescription);
    }

    /**
     * Log activity for specific user with enum
     */
    public void logActivity(Long userId, ActivityActionType actionType, String description) {
        logActivity(userId, actionType.getCode(), description);
    }

    /**
     * Log activity for specific user with enum and formatting
     */
    public void logActivity(Long userId, ActivityActionType actionType, String description, Object... args) {
        String formattedDescription = String.format(description, args);
        logActivity(userId, actionType, formattedDescription);
    }
} 