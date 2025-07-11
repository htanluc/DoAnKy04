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
@RequestMapping("/api/admin/events")
public class EventController {
    @Autowired
    private EventService eventService;

    /**
     * Get all events
     * Lấy danh sách tất cả sự kiện
     */
    @GetMapping
    public List<EventDto> getAllEvents() {
        return eventService.getAllEvents();
    }

    /**
     * Get event by ID
     * Lấy sự kiện theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<EventDto> getEventById(@PathVariable("id") Long id) {
        return eventService.getEventById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create new event
     * Tạo mới sự kiện
     */
    @PostMapping
    public EventDto createEvent(@RequestBody EventCreateRequest request) {
        return eventService.createEvent(request);
    }

    /**
     * Update event by ID
     * Cập nhật sự kiện theo ID
     */
    @PutMapping("/{id}")
    public ResponseEntity<EventDto> updateEvent(@PathVariable("id") Long id, @RequestBody EventUpdateRequest request) {
        try {
            EventDto updatedEvent = eventService.updateEvent(id, request);
            return ResponseEntity.ok(updatedEvent);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Delete event by ID
     * Xóa sự kiện theo ID
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable("id") Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }
} 