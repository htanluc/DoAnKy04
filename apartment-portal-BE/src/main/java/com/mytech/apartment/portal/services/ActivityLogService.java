package com.mytech.apartment.portal.services;
import com.mytech.apartment.portal.models.ActivityLog;
import com.mytech.apartment.portal.models.User;
import com.mytech.apartment.portal.models.enums.ActivityActionType;
import com.mytech.apartment.portal.repositories.ActivityLogRepository;
import com.mytech.apartment.portal.repositories.UserRepository;
import com.mytech.apartment.portal.dtos.ActivityLogDto;
import com.mytech.apartment.portal.mappers.ActivityLogMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;
    private final UserRepository userRepository;
    private final ActivityLogMapper activityLogMapper;

    /**
     * Log activity for current authenticated user
     */
    public void logActivityForCurrentUser(ActivityActionType actionType, String description, Object... args) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            log.debug("Authentication: {}", authentication);
            
            if (authentication != null && authentication.isAuthenticated() &&
                !"anonymousUser".equals(authentication.getName())) {

                String username = authentication.getName();
                log.debug("Username from authentication: {}", username);
                
                // Try to find user by username first, then by phone number
                System.out.println("ActivityLogService: Looking for user with identifier: " + username);
                User user = userRepository.findByUsername(username).orElse(null);
                if (user == null) {
                    System.out.println("ActivityLogService: User not found by username, trying phone number");
                    // If not found by username, try by phone number
                    user = userRepository.findByPhoneNumber(username).orElse(null);
                    if (user != null) {
                        System.out.println("ActivityLogService: User found by phone number: " + user.getUsername());
                        log.debug("User found by phone number: {}", user.getUsername());
                    } else {
                        System.out.println("ActivityLogService: User not found by phone number either");
                        log.debug("User found by phone number: null");
                    }
                } else {
                    System.out.println("ActivityLogService: User found by username: " + user.getUsername());
                    log.debug("User found by username: {}", user.getUsername());
                }
                
                if (user != null) {
                    logActivity(user, actionType, String.format(description, args));
                } else {
                    log.warn("User not found for username: {}", username);
                }
            } else {
                log.warn("Authentication not valid: {}", authentication);
            }
        } catch (Exception e) {
            log.error("Error logging activity: {}", e.getMessage(), e);
        }
    }

    /**
     * Log activity for specific user
     */
    public void logActivity(User user, ActivityActionType actionType, String description) {
        try {
            log.debug("Logging activity for user: {}, action: {}, description: {}", 
                     user.getUsername(), actionType, description);
            
            HttpServletRequest request = getCurrentRequest();
            String ipAddress = getClientIpAddress(request);
            String userAgent = request != null ? request.getHeader("User-Agent") : null;

            ActivityLog activityLog = ActivityLog.builder()
                    .user(user)
                    .actionType(actionType)
                    .description(description)
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    .createdAt(LocalDateTime.now())
                    .build();

            log.debug("ActivityLog object created: {}", activityLog);
            ActivityLog savedLog = activityLogRepository.save(activityLog);
            log.info("Activity logged successfully: {} - {} - {} (ID: {})", 
                    user.getUsername(), actionType, description, savedLog.getId());

        } catch (Exception e) {
            log.error("Error logging activity for user {}: {}", user != null ? user.getUsername() : "null", e.getMessage(), e);
        }
    }

    /**
     * Log activity with additional data
     */
    public void logActivityWithData(User user, ActivityActionType actionType, String description,
                                   String resourceType, Long resourceId, Map<String, Object> additionalData) {
        try {
            HttpServletRequest request = getCurrentRequest();
            String ipAddress = getClientIpAddress(request);
            String userAgent = request != null ? request.getHeader("User-Agent") : null;

            ActivityLog activityLog = ActivityLog.builder()
                    .user(user)
                    .actionType(actionType)
                    .description(description)
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    .resourceType(resourceType)
                    .resourceId(resourceId)
                    .additionalData(convertMapToJson(additionalData))
                    .createdAt(LocalDateTime.now())
                    .build();

            activityLogRepository.save(activityLog);
            log.debug("Activity logged with data: {} - {} - {}", user.getUsername(), actionType, description);

        } catch (Exception e) {
            log.error("Error logging activity with data for user {}: {}", user != null ? user.getUsername() : "null", e.getMessage(), e);
        }
    }

    /**
     * Get activity logs for user
     */
    public Page<ActivityLog> getUserActivityLogs(Long userId, Pageable pageable) {
        return activityLogRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    /**
     * Get activity logs by action type
     */
    public Page<ActivityLog> getActivityLogsByType(ActivityActionType actionType, Pageable pageable) {
        return activityLogRepository.findByActionTypeOrderByCreatedAtDesc(actionType, pageable);
    }

    /**
     * Get activity logs by date range
     */
    public Page<ActivityLog> getActivityLogsByDateRange(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        return activityLogRepository.findByDateRange(startDate, endDate, pageable);
    }

    /**
     * Get recent activities for user
     */
    public List<ActivityLog> getRecentUserActivities(Long userId) {
        return activityLogRepository.findTop10ByUserIdOrderByCreatedAtDesc(userId);
    }

    /**
     * Get recent activities for user as DTOs
     */
    public List<ActivityLogDto> getRecentActivitiesForUser(Long userId, int limit) {
        List<ActivityLog> activities = activityLogRepository.findTop10ByUserIdOrderByCreatedAtDesc(userId);
        return activities.stream()
                .limit(limit)
                .map(activityLogMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Get all activity logs as DTOs
     */
    public List<ActivityLogDto> getAllActivityLogs() {
        List<ActivityLog> activities = activityLogRepository.findAll();
        return activities.stream()
                .map(activityLogMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Get activity logs by user ID as DTOs
     */
    public List<ActivityLogDto> getActivityLogsByUserId(Long userId) {
        List<ActivityLog> activities = activityLogRepository.findTop10ByUserIdOrderByCreatedAtDesc(userId);
        return activities.stream()
                .map(activityLogMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Get activity logs by username as DTOs
     */
    public List<ActivityLogDto> getActivityLogsByUsername(String username) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return List.of();
        }
        List<ActivityLog> activities = activityLogRepository.findTop10ByUserIdOrderByCreatedAtDesc(user.getId());
        return activities.stream()
                .map(activityLogMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Get activity statistics for user
     */
    public Map<ActivityActionType, Long> getUserActivityStatistics(Long userId) {
        List<Object[]> statistics = activityLogRepository.getActivityStatisticsByUser(userId);
        Map<ActivityActionType, Long> result = new java.util.HashMap<>();

        for (Object[] stat : statistics) {
            ActivityActionType actionType = (ActivityActionType) stat[0];
            Long count = (Long) stat[1];
            result.put(actionType, count);
        }

        return result;
    }

    /**
     * Count activities by user and action type
     */
    public long countUserActivitiesByType(Long userId, ActivityActionType actionType) {
        return activityLogRepository.countByUserIdAndActionType(userId, actionType);
    }

    /**
     * Get user activity logs with pagination and filtering
     */
    public Page<ActivityLogDto> getUserActivityLogsPaginated(Long userId, ActivityActionType actionType, 
                                                           LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        Page<ActivityLog> logs;
        
        if (actionType != null && startDate != null && endDate != null) {
            logs = activityLogRepository.findByUserIdAndActionTypeAndDateRange(userId, actionType, startDate, endDate, pageable);
        } else if (actionType != null) {
            logs = activityLogRepository.findByUserIdAndActionTypeOrderByCreatedAtDesc(userId, actionType, pageable);
        } else if (startDate != null && endDate != null) {
            logs = activityLogRepository.findByUserIdAndDateRange(userId, startDate, endDate, pageable);
        } else {
            logs = activityLogRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        }
        
        return logs.map(activityLogMapper::toDto);
    }

    /**
     * Get all activity logs with pagination and filtering (admin)
     */
    public Page<ActivityLogDto> getAllActivityLogsPaginated(Long userId, ActivityActionType actionType, 
                                                           LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        Page<ActivityLog> logs;
        
        if (userId != null && actionType != null && startDate != null && endDate != null) {
            logs = activityLogRepository.findByUserIdAndActionTypeAndDateRange(userId, actionType, startDate, endDate, pageable);
        } else if (userId != null && actionType != null) {
            logs = activityLogRepository.findByUserIdAndActionTypeOrderByCreatedAtDesc(userId, actionType, pageable);
        } else if (userId != null && startDate != null && endDate != null) {
            logs = activityLogRepository.findByUserIdAndDateRange(userId, startDate, endDate, pageable);
        } else if (actionType != null && startDate != null && endDate != null) {
            logs = activityLogRepository.findByActionTypeAndDateRange(actionType, startDate, endDate, pageable);
        } else if (userId != null) {
            logs = activityLogRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        } else if (actionType != null) {
            logs = activityLogRepository.findByActionTypeOrderByCreatedAtDesc(actionType, pageable);
        } else if (startDate != null && endDate != null) {
            logs = activityLogRepository.findByDateRange(startDate, endDate, pageable);
        } else {
            logs = activityLogRepository.findAll(pageable);
        }
        
        return logs.map(activityLogMapper::toDto);
    }

    /**
     * Export user activity logs to CSV
     */
    public String exportUserActivityLogs(Long userId, ActivityActionType actionType, 
                                       LocalDateTime startDate, LocalDateTime endDate) {
        List<ActivityLog> logs;
        
        if (actionType != null && startDate != null && endDate != null) {
            logs = activityLogRepository.findByUserIdAndActionTypeAndDateRangeList(userId, actionType, startDate, endDate);
        } else if (actionType != null) {
            logs = activityLogRepository.findByUserIdAndActionTypeOrderByCreatedAtDesc(userId, actionType, PageRequest.of(0, Integer.MAX_VALUE)).getContent();
        } else if (startDate != null && endDate != null) {
            logs = activityLogRepository.findByUserIdAndDateRangeList(userId, startDate, endDate);
        } else {
            logs = activityLogRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(0, Integer.MAX_VALUE)).getContent();
        }
        
        return convertToCSV(logs);
    }

    /**
     * Get system-wide activity statistics
     */
    public Map<String, Object> getSystemActivityStatistics() {
        Map<String, Object> statistics = new java.util.HashMap<>();
        
        // Total activities
        long totalActivities = activityLogRepository.count();
        statistics.put("totalActivities", totalActivities);
        
        // Activities by type
        List<Object[]> activitiesByType = activityLogRepository.getSystemActivityStatistics();
        Map<String, Long> activitiesByTypeMap = new java.util.HashMap<>();
        for (Object[] stat : activitiesByType) {
            ActivityActionType actionType = (ActivityActionType) stat[0];
            Long count = (Long) stat[1];
            activitiesByTypeMap.put(actionType.getDisplayName(), count);
        }
        statistics.put("activitiesByType", activitiesByTypeMap);
        
        // Recent activities (last 7 days)
        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
        long recentActivities = activityLogRepository.countByCreatedAtAfter(weekAgo);
        statistics.put("recentActivities", recentActivities);
        
        // Top active users
        List<Object[]> topUsers = activityLogRepository.getTopActiveUsers(10);
        List<Map<String, Object>> topUsersList = new java.util.ArrayList<>();
        for (Object[] userStat : topUsers) {
            Map<String, Object> userData = new java.util.HashMap<>();
            userData.put("userId", userStat[0]);
            userData.put("username", userStat[1]);
            userData.put("activityCount", userStat[2]);
            topUsersList.add(userData);
        }
        statistics.put("topActiveUsers", topUsersList);
        
        return statistics;
    }

    // Helper methods
    private HttpServletRequest getCurrentRequest() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            return attributes != null ? attributes.getRequest() : null;
        } catch (Exception e) {
            return null;
        }
    }

    private String getClientIpAddress(HttpServletRequest request) {
        if (request == null) return null;

        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
            return xForwardedFor.split(",")[0];
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty() && !"unknown".equalsIgnoreCase(xRealIp)) {
            return xRealIp;
        }

        return request.getRemoteAddr();
    }

    private String convertMapToJson(Map<String, Object> data) {
        if (data == null || data.isEmpty()) return null;

        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            return mapper.writeValueAsString(data);
        } catch (Exception e) {
            log.error("Error converting map to JSON: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Convert activity logs to CSV format
     */
    private String convertToCSV(List<ActivityLog> logs) {
        StringBuilder csv = new StringBuilder();
        csv.append("Thời gian,Loại hoạt động,Mô tả,Người dùng,IP\n");
        
        for (ActivityLog log : logs) {
            csv.append(String.format("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"\n",
                    log.getCreatedAt(),
                    log.getActionType() != null ? log.getActionType().getDisplayName() : "Unknown",
                    log.getDescription() != null ? log.getDescription().replace("\"", "\"\"") : "",
                    log.getUser() != null ? log.getUser().getUsername() : "",
                    log.getIpAddress() != null ? log.getIpAddress() : ""
            ));
        }
        
        return csv.toString();
    }
} 