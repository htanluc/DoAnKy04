package com.mytech.apartment.portal.services;

import com.mytech.apartment.portal.models.ActivityLog;
import com.mytech.apartment.portal.models.User;
import com.mytech.apartment.portal.models.enums.ActivityActionType;
import com.mytech.apartment.portal.repositories.ActivityLogRepository;
import com.mytech.apartment.portal.repositories.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class SmartActivityLogService {

    private final ActivityLogRepository activityLogRepository;
    private final UserRepository userRepository;
    
    // Cache để tránh log trùng lặp trong thời gian ngắn
    private final Map<String, LocalDateTime> lastActionCache = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
    
    // Thời gian tối thiểu giữa các log cùng loại (5 phút)
    private static final int MIN_INTERVAL_MINUTES = 5;
    
    // Các action cần log ngay lập tức (không cache)
    private static final ActivityActionType[] IMMEDIATE_ACTIONS = {
        ActivityActionType.LOGIN,
        ActivityActionType.LOGOUT,
        ActivityActionType.PASSWORD_CHANGE,
        ActivityActionType.CREATE_USER,
        ActivityActionType.PAY_INVOICE,
        ActivityActionType.CREATE_SERVICE_REQUEST,
        ActivityActionType.CREATE_FACILITY_BOOKING,
        ActivityActionType.REGISTER_VEHICLE,
        ActivityActionType.MARK_ANNOUNCEMENT_READ,
        ActivityActionType.REGISTER_EVENT,
        ActivityActionType.CANCEL_EVENT_REGISTRATION
    };

    /**
     * Log activity thông minh - chỉ log những hành động quan trọng
     */
    public void logSmartActivity(ActivityActionType actionType, String description, Object... args) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null || !authentication.isAuthenticated() ||
                "anonymousUser".equals(authentication.getName())) {
                return;
            }

            String username = authentication.getName();
            User user = findUser(username);
            
            if (user == null) {
                log.warn("User not found for username: {}", username);
                return;
            }

            // Kiểm tra xem có cần log ngay không
            if (shouldLogImmediately(actionType, user.getId(), description)) {
                logActivity(user, actionType, String.format(description, args));
            }
            
        } catch (Exception e) {
            log.error("Error in smart logging: {}", e.getMessage(), e);
        }
    }

    /**
     * Log activity cho user cụ thể
     */
    public void logSmartActivity(User user, ActivityActionType actionType, String description, Object... args) {
        if (user == null) return;
        
        if (shouldLogImmediately(actionType, user.getId(), description)) {
            logActivity(user, actionType, String.format(description, args));
        }
    }

    /**
     * Kiểm tra xem có nên log ngay lập tức không
     */
    private boolean shouldLogImmediately(ActivityActionType actionType, Long userId, String description) {
        // Các action quan trọng luôn được log ngay
        for (ActivityActionType immediateAction : IMMEDIATE_ACTIONS) {
            if (actionType == immediateAction) {
                return true;
            }
        }

        // Tạo key để cache
        String cacheKey = userId + ":" + actionType.name() + ":" + description;
        LocalDateTime lastAction = lastActionCache.get(cacheKey);
        LocalDateTime now = LocalDateTime.now();

        // Nếu chưa có action này hoặc đã quá thời gian tối thiểu
        if (lastAction == null || 
            lastAction.plusMinutes(MIN_INTERVAL_MINUTES).isBefore(now)) {
            
            lastActionCache.put(cacheKey, now);
            return true;
        }

        return false;
    }

    /**
     * Log activity với thông tin chi tiết
     */
    private void logActivity(User user, ActivityActionType actionType, String description) {
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
                    .createdAt(LocalDateTime.now())
                    .build();

            activityLogRepository.save(activityLog);
            log.info("Smart activity logged: {} - {} - {}", 
                    user.getUsername(), actionType, description);

        } catch (Exception e) {
            log.error("Error logging activity for user {}: {}", 
                    user != null ? user.getUsername() : "null", e.getMessage(), e);
        }
    }

    /**
     * Tìm user theo username hoặc phone number
     */
    private User findUser(String username) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            user = userRepository.findByPhoneNumber(username).orElse(null);
        }
        return user;
    }

    /**
     * Lấy request hiện tại
     */
    private HttpServletRequest getCurrentRequest() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            return attributes != null ? attributes.getRequest() : null;
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Lấy IP address của client
     */
    private String getClientIpAddress(HttpServletRequest request) {
        if (request == null) return null;
        
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty() && !"unknown".equalsIgnoreCase(xRealIp)) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }

    /**
     * Dọn dẹp cache định kỳ
     */
    public void startCacheCleanup() {
        scheduler.scheduleAtFixedRate(() -> {
            try {
                LocalDateTime cutoff = LocalDateTime.now().minusMinutes(MIN_INTERVAL_MINUTES);
                lastActionCache.entrySet().removeIf(entry -> entry.getValue().isBefore(cutoff));
                log.debug("Cache cleanup completed. Current cache size: {}", lastActionCache.size());
            } catch (Exception e) {
                log.error("Error during cache cleanup: {}", e.getMessage());
            }
        }, 10, 10, TimeUnit.MINUTES);
    }

    /**
     * Dừng scheduler khi shutdown
     */
    public void shutdown() {
        if (scheduler != null && !scheduler.isShutdown()) {
            scheduler.shutdown();
        }
    }
} 