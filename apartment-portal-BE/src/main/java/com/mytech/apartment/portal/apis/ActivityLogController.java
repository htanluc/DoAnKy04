package com.mytech.apartment.portal.apis;

import com.mytech.apartment.portal.dtos.ActivityLogDto;
import com.mytech.apartment.portal.services.ActivityLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ActivityLogController {
    
    @Autowired
    private ActivityLogService activityLogService;

    /**
     * Get activity logs for current user (Resident FE)
     */
    @GetMapping("/activity-logs")
    public ResponseEntity<List<ActivityLogDto>> getMyActivityLogs() {
        try {
            System.out.println("ActivityLogController: getMyActivityLogs called");
            
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                System.out.println("ActivityLogController: Authentication failed - no auth or not authenticated");
                return ResponseEntity.status(401).build();
            }
            
            String username = auth.getName();
            System.out.println("ActivityLogController: Authenticated username: " + username);
            
            List<ActivityLogDto> logs = activityLogService.getMyActivityLogs(username);
            System.out.println("ActivityLogController: Returning " + logs.size() + " activity logs for user: " + username);
            
            return ResponseEntity.ok(logs);
        } catch (Exception e) {
            System.err.println("ActivityLogController: Error in getMyActivityLogs: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(401).build();
        }
    }

    /**
     * Get all activity logs (Admin FE)
     */
    @GetMapping("/admin/activity-logs")
    public List<ActivityLogDto> getAllActivityLogs() {
        return activityLogService.getAllActivityLogs();
    }

    /**
     * Get activity logs by user ID (Admin FE)
     */
    @GetMapping("/admin/activity-logs/user/{userId}")
    public ResponseEntity<List<ActivityLogDto>> getActivityLogsByUserId(@PathVariable Long userId) {
        List<ActivityLogDto> logs = activityLogService.getActivityLogsByUserId(userId);
        return ResponseEntity.ok(logs);
    }
} 