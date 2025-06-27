package com.mytech.apartment.portal.apis;

import com.mytech.apartment.portal.dtos.EventRegistrationDto;
import com.mytech.apartment.portal.dtos.EventRegistrationRequest;
import com.mytech.apartment.portal.services.EventRegistrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api") // Root path for event registrations
public class EventRegistrationController {
    @Autowired
    private EventRegistrationService eventRegistrationService;

    // Endpoint for a resident to register for an event
    @PostMapping("/event-registrations/register")
    public ResponseEntity<EventRegistrationDto> registerForEvent(@RequestBody EventRegistrationRequest request) {
        try {
            EventRegistrationDto registration = eventRegistrationService.registerForEvent(request);
            return ResponseEntity.ok(registration);
        } catch (RuntimeException e) {
            // More specific exception handling would be better
            return ResponseEntity.badRequest().body(null);
        }
    }

    // Endpoint for a resident to cancel their registration
    @DeleteMapping("/event-registrations/{registrationId}/cancel")
    public ResponseEntity<Void> cancelRegistration(@PathVariable("registrationId") Long registrationId) {
        try {
            eventRegistrationService.cancelRegistration(registrationId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Admin endpoint to get all registrations for a specific event
    @GetMapping("/admin/events/{eventId}/registrations")
    public ResponseEntity<List<EventRegistrationDto>> getRegistrationsForEvent(@PathVariable("eventId") Long eventId) {
        try {
            List<EventRegistrationDto> registrations = eventRegistrationService.getRegistrationsForEvent(eventId);
            return ResponseEntity.ok(registrations);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
} 