package com.mytech.apartment.portal.apis;

import com.mytech.apartment.portal.dtos.EventCreateRequest;
import com.mytech.apartment.portal.dtos.EventDto;
import com.mytech.apartment.portal.dtos.EventUpdateRequest;
import com.mytech.apartment.portal.services.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class EventController {
    @Autowired
    private EventService eventService;

    /**
     * Get all events (Resident FE)
     */
    @GetMapping("/api/events")
    public List<EventDto> getAllEventsForResident() {
        return eventService.getAllEvents();
    }

    /**
     * Get event by ID (Resident FE)
     */
    @GetMapping("/api/events/{id}")
    public ResponseEntity<EventDto> getEventByIdForResident(@PathVariable("id") Long id) {
        return eventService.getEventById(id)
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
        return eventService.createEvent(request);
    }

    /**
     * Update event by ID (Admin only)
     */
    @PutMapping("/api/admin/events/{id}")
    public ResponseEntity<EventDto> updateEvent(@PathVariable("id") Long id, @RequestBody EventUpdateRequest request) {
        try {
            EventDto updatedEvent = eventService.updateEvent(id, request);
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
        return ResponseEntity.noContent().build();
    }
} 