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
        List<ActivityLogDto> logs = activityLogService.getAllLogs();
        return ResponseEntity.ok(logs);
    }
    
    /**
     * [EN] Get activity log by ID
     * [VI] Lấy nhật ký hoạt động theo ID
     */
    @GetMapping("/activity-logs/{logId}")
    public ResponseEntity<ActivityLogDto> getActivityLogById(@PathVariable("logId") Long logId) {
        ActivityLogDto log = activityLogService.getLogById(logId);
        return ResponseEntity.ok(log);
    }
    
    /**
     * [EN] Get activity logs by user ID
     * [VI] Lấy nhật ký hoạt động theo ID người dùng
     */
    @GetMapping("/activity-logs/user/{userId}")
    public ResponseEntity<List<ActivityLogDto>> getActivityLogsByUserId(@PathVariable("userId") Long userId) {
        List<ActivityLogDto> logs = activityLogService.getLogsByUserId(userId);
        return ResponseEntity.ok(logs);
    }
    
    /**
     * [EN] Get activity logs by action type
     * [VI] Lấy nhật ký hoạt động theo loại hành động
     */
    @GetMapping("/activity-logs/action/{actionType}")
    public ResponseEntity<List<ActivityLogDto>> getActivityLogsByActionType(@PathVariable("actionType") String actionType) {
        List<ActivityLogDto> logs = activityLogService.getLogsByActionType(actionType);
        return ResponseEntity.ok(logs);
    }
} 