package com.mytech.apartment.portal.apis;

import com.mytech.apartment.portal.dtos.AnnouncementCreateRequest;
import com.mytech.apartment.portal.dtos.AnnouncementDto;
import com.mytech.apartment.portal.dtos.AnnouncementUpdateRequest;
import com.mytech.apartment.portal.services.AnnouncementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class AnnouncementController {
    @Autowired
    private AnnouncementService announcementService;

    /**
     * Get all announcements (Resident FE)
     */
    @GetMapping("/api/announcements")
    public List<AnnouncementDto> getAllAnnouncementsForResident() {
        return announcementService.getAllAnnouncements();
    }

    /**
     * Get announcement by ID (Resident FE)
     */
    @GetMapping("/api/announcements/{id}")
    public ResponseEntity<AnnouncementDto> getAnnouncementByIdForResident(@PathVariable("id") Long id) {
        return announcementService.getAnnouncementById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
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