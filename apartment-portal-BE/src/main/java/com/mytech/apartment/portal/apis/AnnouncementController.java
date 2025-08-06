package com.mytech.apartment.portal.apis;

import com.mytech.apartment.portal.dtos.AnnouncementCreateRequest;
import com.mytech.apartment.portal.dtos.AnnouncementDto;
import com.mytech.apartment.portal.dtos.AnnouncementUpdateRequest;
import com.mytech.apartment.portal.services.AnnouncementService;
import com.mytech.apartment.portal.services.SmartActivityLogService;
import com.mytech.apartment.portal.models.enums.ActivityActionType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class AnnouncementController {
    @Autowired
    private AnnouncementService announcementService;
    
    @Autowired
    private SmartActivityLogService smartActivityLogService;

    /**
     * Get all announcements (Resident FE) - with read status
     */
    @GetMapping("/api/announcements")
    public List<AnnouncementDto> getAllAnnouncementsForResident() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return announcementService.getAllAnnouncements();
        }
        
        String username = auth.getName();
        List<AnnouncementDto> announcements = announcementService.getAllAnnouncementsForUser(username);
        
        // Log activity: View announcements (smart logging - chỉ log khi thực sự xem)
        smartActivityLogService.logSmartActivity(
            ActivityActionType.VIEW_ANNOUNCEMENT, 
            "Xem danh sách thông báo (%d thông báo)", 
            announcements.size()
        );
        
        return announcements;
    }

    /**
     * Get announcement by ID (Resident FE) - with read status
     */
    @GetMapping("/api/announcements/{id}")
    public ResponseEntity<AnnouncementDto> getAnnouncementByIdForResident(@PathVariable("id") Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return announcementService.getAnnouncementById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        }
        
        String username = auth.getName();
        ResponseEntity<AnnouncementDto> response = announcementService.getAnnouncementByIdForUser(id, username)
                .map(announcement -> {
                    // Log activity: View specific announcement (smart logging)
                    smartActivityLogService.logSmartActivity(
                        ActivityActionType.VIEW_ANNOUNCEMENT, 
                        "Xem chi tiết thông báo: %s (#%d)", 
                        announcement.getTitle(),
                        announcement.getId()
                    );
                    return ResponseEntity.ok(announcement);
                })
                .orElse(ResponseEntity.notFound().build());
        
        return response;
    }

    /**
     * Mark announcement as read (Resident FE)
     */
    @PutMapping("/api/announcements/{id}/read")
    public ResponseEntity<?> markAnnouncementAsRead(@PathVariable("id") Long id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                return ResponseEntity.status(401).build();
            }
            
            String username = auth.getName();
            boolean success = announcementService.markAsRead(id, username);
            if (success) {
                // Log activity: Mark announcement as read (luôn log vì đây là hành động quan trọng)
                smartActivityLogService.logSmartActivity(
                    ActivityActionType.MARK_ANNOUNCEMENT_READ, 
                    "Đánh dấu thông báo #%d đã đọc", 
                    id
                );
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.badRequest().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(401).build();
        }
    }

    /**
     * Get unread announcement count (Resident FE)
     */
    @GetMapping("/api/announcements/unread-count")
    public ResponseEntity<Long> getUnreadCount() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                return ResponseEntity.ok(0L);
            }
            
            String username = auth.getName();
            Long count = announcementService.getUnreadCount(username);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.ok(0L);
        }
    }

    /**
     * Get all announcements (Admin FE)
     */
    @GetMapping("/api/admin/announcements")
    public List<AnnouncementDto> getAllAnnouncements() {
        return announcementService.getAllAnnouncements();
    }

    /**
     * Get announcement by ID (Admin FE)
     */
    @GetMapping("/api/admin/announcements/{id}")
    public ResponseEntity<AnnouncementDto> getAnnouncementById(@PathVariable("id") Long id) {
        return announcementService.getAnnouncementById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create new announcement (Admin only)
     */
    @PostMapping("/api/admin/announcements")
    public AnnouncementDto createAnnouncement(@RequestBody AnnouncementCreateRequest request) {
        // In a real app, get this from the security context
        Long createdBy = 1L;
        return announcementService.createAnnouncement(request, createdBy);
    }

    /**
     * Update announcement by ID (Admin only)
     */
    @PutMapping("/api/admin/announcements/{id}")
    public ResponseEntity<AnnouncementDto> updateAnnouncement(@PathVariable("id") Long id, @RequestBody AnnouncementUpdateRequest request) {
        try {
            AnnouncementDto updatedAnnouncement = announcementService.updateAnnouncement(id, request);
            return ResponseEntity.ok(updatedAnnouncement);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Delete announcement by ID (Admin only)
     */
    @DeleteMapping("/api/admin/announcements/{id}")
    public ResponseEntity<Void> deleteAnnouncement(@PathVariable("id") Long id) {
        announcementService.deleteAnnouncement(id);
        return ResponseEntity.noContent().build();
    }
} 