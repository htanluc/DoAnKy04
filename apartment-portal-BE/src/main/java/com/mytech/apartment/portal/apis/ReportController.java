package com.mytech.apartment.portal.apis;

import java.util.List;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import com.mytech.apartment.portal.dtos.ActivityLogDto;
import com.mytech.apartment.portal.services.ActivityLogService;

@RestController
@RequestMapping("/api/admin/reports")
public class ReportController {
    private final ActivityLogService activityLogService;

    public ReportController(ActivityLogService activityLogService) {
        this.activityLogService = activityLogService;
    }

    /**
     * [EN] Get all activity logs
     * [VI] Lấy toàn bộ nhật ký hoạt động
     */
    @GetMapping("/activity-logs")
    public ResponseEntity<List<ActivityLogDto>> getAllActivityLogs() {
        List<ActivityLogDto> logs = activityLogService.getAllActivityLogs();
        return ResponseEntity.ok(logs);
    }
    
    /**
     * [EN] Get activity logs by user ID
     * [VI] Lấy nhật ký hoạt động theo ID người dùng
     */
    @GetMapping("/activity-logs/user/{userId}")
    public ResponseEntity<List<ActivityLogDto>> getActivityLogsByUserId(@PathVariable("userId") Long userId) {
        List<ActivityLogDto> logs = activityLogService.getActivityLogsByUserId(userId);
        return ResponseEntity.ok(logs);
    }
    
    /**
     * [EN] Get activity logs by username
     * [VI] Lấy nhật ký hoạt động theo username
     */
    @GetMapping("/activity-logs/username/{username}")
    public ResponseEntity<List<ActivityLogDto>> getActivityLogsByUsername(@PathVariable("username") String username) {
        List<ActivityLogDto> logs = activityLogService.getActivityLogsByUsername(username);
        return ResponseEntity.ok(logs);
    }
} 