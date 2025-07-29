package com.mytech.apartment.portal.apis;

import com.mytech.apartment.portal.dtos.EventRegistrationDto;
import com.mytech.apartment.portal.dtos.EventRegistrationRequest;
import com.mytech.apartment.portal.services.EventRegistrationService;
import com.mytech.apartment.portal.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api") // Root path for event registrations
public class EventRegistrationController {
    @Autowired
    private EventRegistrationService eventRegistrationService;
    
    @Autowired
    private UserService userService;

    // Endpoint for a resident to register for an event
    @PostMapping("/event-registrations/register")
    public ResponseEntity<EventRegistrationDto> registerForEvent(@Valid @RequestBody EventRegistrationRequest request) {
        try {
            System.out.println("Received registration request: " + request);
            
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                System.out.println("Authentication failed: no auth or not authenticated");
                return ResponseEntity.status(401).build();
            }
            
            String username = auth.getName();
            System.out.println("Authenticated username: " + username);
            
            Long userId = userService.getUserIdByPhoneNumber(username);
            if (userId == null) {
                System.out.println("User not found for phone number: " + username);
                return ResponseEntity.status(401).build();
            }
            
            System.out.println("Found user ID: " + userId);
            
            // Set residentId from authenticated user
            request.setResidentId(userId);
            System.out.println("Final request: " + request);
            
            EventRegistrationDto registration = eventRegistrationService.registerForEvent(request);
            System.out.println("Registration successful: " + registration);
            return ResponseEntity.ok(registration);
        } catch (RuntimeException e) {
            // Log the error for debugging
            System.err.println("Event registration error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(null);
        } catch (Exception e) {
            // Log unexpected errors
            System.err.println("Unexpected error in event registration: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(null);
        }
    }

    // Endpoint for a resident to cancel their registration by event ID
    @DeleteMapping("/event-registrations/cancel/{eventId}")
    public ResponseEntity<Void> cancelRegistrationByEventId(@PathVariable("eventId") Long eventId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                return ResponseEntity.status(401).build();
            }
            
            String username = auth.getName();
            Long userId = userService.getUserIdByPhoneNumber(username);
            if (userId == null) {
                return ResponseEntity.status(401).build();
            }
            
            // Cancel registration by event ID and user ID
            boolean success = eventRegistrationService.cancelRegistrationByEventAndUser(eventId, userId);
            if (success) {
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Endpoint for a resident to cancel their registration by registration ID
    @DeleteMapping("/event-registrations/{registrationId}/cancel")
    public ResponseEntity<Void> cancelRegistration(@PathVariable("registrationId") Long registrationId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                return ResponseEntity.status(401).build();
            }
            
            String username = auth.getName();
            Long userId = userService.getUserIdByPhoneNumber(username);
            if (userId == null) {
                return ResponseEntity.status(401).build();
            }
            
            // Verify the registration belongs to the current user
            boolean belongsToUser = eventRegistrationService.verifyRegistrationOwnership(registrationId, userId);
            if (!belongsToUser) {
                return ResponseEntity.status(403).build();
            }
            
            eventRegistrationService.cancelRegistration(registrationId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Endpoint to get user's registrations
    @GetMapping("/event-registrations/my")
    public ResponseEntity<List<EventRegistrationDto>> getMyRegistrations() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                return ResponseEntity.status(401).build();
            }
            
            String username = auth.getName();
            Long userId = userService.getUserIdByPhoneNumber(username);
            if (userId == null) {
                return ResponseEntity.status(401).build();
            }
            
            List<EventRegistrationDto> registrations = eventRegistrationService.getRegistrationsByUserId(userId);
            return ResponseEntity.ok(registrations);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Endpoint to check if user is registered for a specific event
    @GetMapping("/event-registrations/check/{eventId}")
    public ResponseEntity<EventRegistrationDto> checkRegistration(@PathVariable("eventId") Long eventId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                return ResponseEntity.status(401).build();
            }
            
            String username = auth.getName();
            Long userId = userService.getUserIdByPhoneNumber(username);
            if (userId == null) {
                return ResponseEntity.status(401).build();
            }
            
            EventRegistrationDto registration = eventRegistrationService.getRegistrationByEventAndUser(eventId, userId);
            return ResponseEntity.ok(registration);
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