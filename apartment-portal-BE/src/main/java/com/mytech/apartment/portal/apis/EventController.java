package com.mytech.apartment.portal.apis;

import com.mytech.apartment.portal.dtos.EventCreateRequest;
import com.mytech.apartment.portal.dtos.EventDto;
import com.mytech.apartment.portal.dtos.EventUpdateRequest;
import com.mytech.apartment.portal.services.EventService;
import com.mytech.apartment.portal.services.ActivityLogService;
import com.mytech.apartment.portal.models.enums.ActivityActionType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class EventController {
    @Autowired
    private EventService eventService;
    @Autowired
    private ActivityLogService activityLogService;

    /**
     * Get all events (Resident FE) - with registration status
     */
    @GetMapping("/api/events")
    public List<EventDto> getAllEventsForResident() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return eventService.getAllEvents();
        }
        
        String username = auth.getName();
        return eventService.getAllEventsForUser(username);
    }

    /**
     * Get event by ID (Resident FE) - with registration status
     */
    @GetMapping("/api/events/{id}")
    public ResponseEntity<EventDto> getEventByIdForResident(@PathVariable("id") Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return eventService.getEventById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        }
        
        String username = auth.getName();
        return eventService.getEventByIdForUser(id, username)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get all events (Admin FE)
     */
    @GetMapping("/api/admin/events")
    public List<EventDto> getAllEvents() {
        return eventService.getAllEvents();
    }

    /**
     * Get event by ID (Admin FE)
     */
    @GetMapping("/api/admin/events/{id}")
    public ResponseEntity<EventDto> getEventById(@PathVariable("id") Long id) {
        return eventService.getEventById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create new event (Admin only)
     */
    @PostMapping("/api/admin/events")
    public EventDto createEvent(@RequestBody EventCreateRequest request) {
        EventDto createdEvent = eventService.createEvent(request);
        activityLogService.logActivityForCurrentUser(
            ActivityActionType.CREATE_EVENT,
            "Tạo sự kiện mới: %s",
            createdEvent.getTitle()
        );
        return createdEvent;
    }

    /**
     * Update event by ID (Admin only)
     */
    @PutMapping("/api/admin/events/{id}")
    public ResponseEntity<EventDto> updateEvent(@PathVariable("id") Long id, @RequestBody EventUpdateRequest request) {
        try {
            EventDto updatedEvent = eventService.updateEvent(id, request);
            activityLogService.logActivityForCurrentUser(
                ActivityActionType.UPDATE_EVENT,
                "Cập nhật sự kiện: %s",
                updatedEvent.getTitle()
            );
            return ResponseEntity.ok(updatedEvent);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Delete event by ID (Admin only)
     */
    @DeleteMapping("/api/admin/events/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable("id") Long id) {
        eventService.deleteEvent(id);
        activityLogService.logActivityForCurrentUser(
            ActivityActionType.DELETE_EVENT,
            "Xóa sự kiện: #%d",
            id
        );
        return ResponseEntity.noContent().build();
    }
} 