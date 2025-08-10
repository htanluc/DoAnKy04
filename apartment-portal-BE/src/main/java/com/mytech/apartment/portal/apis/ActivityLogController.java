package com.mytech.apartment.portal.apis;

import com.mytech.apartment.portal.dtos.ActivityLogDto;
import com.mytech.apartment.portal.dtos.ApiResponse;
import com.mytech.apartment.portal.models.enums.ActivityActionType;
import com.mytech.apartment.portal.services.ActivityLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/activity-logs")
@Tag(name = "Activity Logs", description = "API for managing and viewing activity logs")
@RequiredArgsConstructor
public class ActivityLogController {

    private final ActivityLogService activityLogService;

    /**
     * Get current user's activity logs with pagination
     */
    @Operation(summary = "Get current user's activity logs", description = "Get paginated activity logs for the authenticated user")
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<Page<ActivityLogDto>>> getMyActivityLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) ActivityActionType actionType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
            }

            // Get user ID from authentication
            Long userId = getCurrentUserId();
            if (userId == null) {
                return ResponseEntity.status(401).body(ApiResponse.error("User not found"));
            }

            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
            Page<ActivityLogDto> logs = activityLogService.getUserActivityLogsPaginated(userId, actionType, startDate, endDate, pageable);
            
            return ResponseEntity.ok(ApiResponse.success("Lấy nhật ký hoạt động thành công", logs));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Lỗi khi lấy nhật ký hoạt động: " + e.getMessage()));
        }
    }

    /**
     * Get recent activities for current user (for dashboard)
     */
    @Operation(summary = "Get recent activities", description = "Get recent activity logs for dashboard display")
    @GetMapping("/my/recent")
    public ResponseEntity<ApiResponse<List<ActivityLogDto>>> getMyRecentActivities(
            @RequestParam(defaultValue = "10") int limit) {
        
        try {
            Long userId = getCurrentUserId();
            if (userId == null) {
                return ResponseEntity.status(401).body(ApiResponse.error("User not found"));
            }

            List<ActivityLogDto> logs = activityLogService.getRecentActivitiesForUser(userId, limit);
            return ResponseEntity.ok(ApiResponse.success("Lấy hoạt động gần đây thành công", logs));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Lỗi khi lấy hoạt động gần đây: " + e.getMessage()));
        }
    }

    /**
     * Get activity statistics for current user
     */
    @Operation(summary = "Get activity statistics", description = "Get activity statistics for the current user")
    @GetMapping("/my/statistics")
    public ResponseEntity<ApiResponse<Map<ActivityActionType, Long>>> getMyActivityStatistics() {
        
        try {
            Long userId = getCurrentUserId();
            if (userId == null) {
                return ResponseEntity.status(401).body(ApiResponse.error("User not found"));
            }

            Map<ActivityActionType, Long> statistics = activityLogService.getUserActivityStatistics(userId);
            return ResponseEntity.ok(ApiResponse.success("Lấy thống kê hoạt động thành công", statistics));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Lỗi khi lấy thống kê hoạt động: " + e.getMessage()));
        }
    }

    /**
     * Export activity logs for current user
     */
    @Operation(summary = "Export activity logs", description = "Export activity logs to CSV format")
    @GetMapping("/my/export")
    public ResponseEntity<String> exportMyActivityLogs(
            @RequestParam(required = false) ActivityActionType actionType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        try {
            Long userId = getCurrentUserId();
            if (userId == null) {
                return ResponseEntity.status(401).build();
            }

            String csvContent = activityLogService.exportUserActivityLogs(userId, actionType, startDate, endDate);
            
            return ResponseEntity.ok()
                    .header("Content-Type", "text/csv")
                    .header("Content-Disposition", "attachment; filename=\"activity-logs.csv\"")
                    .body(csvContent);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Admin endpoints
    /**
     * Get all activity logs (admin only)
     */
    @Operation(summary = "Get all activity logs", description = "Get all activity logs with pagination (admin only)")
    @GetMapping("/admin/all")
    public ResponseEntity<ApiResponse<Page<ActivityLogDto>>> getAllActivityLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) ActivityActionType actionType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
            Page<ActivityLogDto> logs = activityLogService.getAllActivityLogsPaginated(userId, actionType, startDate, endDate, pageable);
            
            return ResponseEntity.ok(ApiResponse.success("Lấy tất cả nhật ký hoạt động thành công", logs));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Lỗi khi lấy nhật ký hoạt động: " + e.getMessage()));
        }
    }

    /**
     * Get activity logs by user ID (admin only)
     */
    @Operation(summary = "Get activity logs by user ID", description = "Get activity logs for a specific user (admin only)")
    @GetMapping("/admin/user/{userId}")
    public ResponseEntity<ApiResponse<List<ActivityLogDto>>> getActivityLogsByUserId(@PathVariable("userId") Long userId) {
        
        try {
            List<ActivityLogDto> logs = activityLogService.getActivityLogsByUserId(userId);
            return ResponseEntity.ok(ApiResponse.success("Lấy nhật ký hoạt động của người dùng thành công", logs));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Lỗi khi lấy nhật ký hoạt động: " + e.getMessage()));
        }
    }

    /**
     * Get system-wide activity statistics (admin only)
     */
    @Operation(summary = "Get system activity statistics", description = "Get system-wide activity statistics (admin only)")
    @GetMapping("/admin/statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSystemActivityStatistics() {
        
        try {
            Map<String, Object> statistics = activityLogService.getSystemActivityStatistics();
            return ResponseEntity.ok(ApiResponse.success("Lấy thống kê hệ thống thành công", statistics));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Lỗi khi lấy thống kê hệ thống: " + e.getMessage()));
        }
    }

    // Helper method to get current user ID
    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            // Assuming UserDetailsImpl has getId() method
            if (auth.getPrincipal() instanceof com.mytech.apartment.portal.security.UserDetailsImpl) {
                com.mytech.apartment.portal.security.UserDetailsImpl userDetails = 
                    (com.mytech.apartment.portal.security.UserDetailsImpl) auth.getPrincipal();
                return userDetails.getId();
            }
        }
        return null;
    }
} 