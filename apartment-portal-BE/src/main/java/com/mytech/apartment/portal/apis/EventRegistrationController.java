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
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;
import com.mytech.apartment.portal.models.Event;
import com.mytech.apartment.portal.models.EventRegistration;
import com.mytech.apartment.portal.repositories.EventRepository;
import com.mytech.apartment.portal.repositories.EventRegistrationRepository;
import java.util.Optional;
import com.mytech.apartment.portal.models.enums.EventRegistrationStatus;
import com.mytech.apartment.portal.repositories.ResidentRepository;
import com.mytech.apartment.portal.models.Resident;
import java.util.ArrayList;

@RestController
@RequestMapping("/api") // Root path for event registrations
public class EventRegistrationController {
    @Autowired
    private EventRegistrationService eventRegistrationService;
    
    @Autowired
    private UserService userService;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private EventRegistrationRepository registrationRepository;

    @Autowired
    private ResidentRepository residentRepository;

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
                return ResponseEntity.status(401).body(null);
            }
            
            System.out.println("Found user ID: " + userId);
            
            // Get resident ID from user ID
            Resident resident = residentRepository.findByUserId(userId);
            if (resident == null) {
                System.out.println("Resident not found for user ID: " + userId);
                return ResponseEntity.status(401).body(null);
            }
            
            Long residentId = resident.getUserId(); // In Resident model, userId is the primary key
            System.out.println("Found resident ID: " + residentId);
            
            // Set residentId from authenticated user
            request.setResidentId(residentId);
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
    public ResponseEntity<?> cancelRegistrationByEventId(@PathVariable("eventId") Long eventId) {
        try {
            System.out.println("Cancel registration request for event ID: " + eventId);
            
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                System.out.println("Authentication failed: no auth or not authenticated");
                return ResponseEntity.status(401).body(Map.of("error", "Authentication failed"));
            }
            
            String username = auth.getName();
            System.out.println("Authenticated username: " + username);
            
            Long userId = userService.getUserIdByPhoneNumber(username);
            if (userId == null) {
                System.out.println("User not found for phone number: " + username);
                return ResponseEntity.status(401).body(Map.of("error", "User not found"));
            }
            
            System.out.println("Found user ID: " + userId + " for event ID: " + eventId);
            
            // Get resident ID from user ID
            Resident resident = residentRepository.findByUserId(userId);
            if (resident == null) {
                System.out.println("Resident not found for user ID: " + userId);
                return ResponseEntity.status(401).body(Map.of("error", "Resident not found"));
            }
            
            Long residentId = resident.getUserId(); // In Resident model, userId is the primary key
            System.out.println("Found resident ID: " + residentId + " for event ID: " + eventId);
            
            // Check if event exists
            if (!eventRepository.existsById(eventId)) {
                System.out.println("Event with ID " + eventId + " does not exist");
                return ResponseEntity.status(404).body(Map.of("error", "Event not found"));
            }
            
            // Check if user has registration for this event
            Optional<EventRegistration> registration = registrationRepository.findByEventIdAndResidentId(eventId, residentId);
            if (!registration.isPresent()) {
                System.out.println("No registration found for event ID: " + eventId + " and resident ID: " + residentId);
                return ResponseEntity.status(404).body(Map.of("error", "Registration not found"));
            }
            
            EventRegistration reg = registration.get();
            System.out.println("Found registration ID: " + reg.getId() + ", Status: " + reg.getStatus());
            
            if (reg.getStatus() != EventRegistrationStatus.REGISTERED) {
                System.out.println("Registration is not in REGISTERED status: " + reg.getStatus());
                return ResponseEntity.status(400).body(Map.of("error", "Registration is not in REGISTERED status"));
            }
            
            // Cancel registration by event ID and resident ID
            boolean success = eventRegistrationService.cancelRegistrationByEventAndUser(eventId, residentId);
            System.out.println("Cancel registration result: " + success);
            
            if (success) {
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.status(500).body(Map.of("error", "Failed to cancel registration"));
            }
        } catch (Exception e) {
            System.err.println("Error in cancelRegistrationByEventId: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
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

    // Test endpoint to check user and registration
    @GetMapping("/test/user-registration/{eventId}")
    public ResponseEntity<Map<String, Object>> testUserRegistration(@PathVariable("eventId") Long eventId) {
        try {
            Map<String, Object> result = new HashMap<>();
            
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                result.put("authenticated", false);
                return ResponseEntity.ok(result);
            }
            
            String username = auth.getName();
            result.put("authenticated", true);
            result.put("username", username);
            
            Long userId = userService.getUserIdByPhoneNumber(username);
            result.put("userId", userId);
            
            if (userId != null) {
                // Get resident ID from user ID
                Resident resident = residentRepository.findByUserId(userId);
                result.put("residentFound", resident != null);
                
                if (resident != null) {
                    Long residentId = resident.getUserId(); // Primary key of Resident
                    result.put("residentId", residentId);
                    
                    // Check if event exists
                    boolean eventExists = eventRepository.existsById(eventId);
                    result.put("eventExists", eventExists);
                    
                    if (eventExists) {
                        // Get registration for this resident and event
                        Optional<EventRegistration> registration = registrationRepository.findByEventIdAndResidentId(eventId, residentId);
                        result.put("hasRegistration", registration.isPresent());
                        
                        if (registration.isPresent()) {
                            EventRegistration reg = registration.get();
                            result.put("registrationId", reg.getId());
                            result.put("registrationStatus", reg.getStatus());
                            result.put("registrationResidentId", reg.getResidentId());
                        }
                        
                        // Get all registrations for this event
                        List<EventRegistration> allRegistrations = registrationRepository.findByEventId(eventId);
                        result.put("totalRegistrationsForEvent", allRegistrations.size());
                        result.put("registrations", allRegistrations.stream().map(r -> Map.of(
                            "id", r.getId(),
                            "residentId", r.getResidentId(),
                            "status", r.getStatus(),
                            "registeredAt", r.getRegisteredAt()
                        )).collect(Collectors.toList()));
                        
                        // Get all registrations for this resident
                        List<EventRegistration> residentRegistrations = registrationRepository.findByResidentId(residentId);
                        result.put("totalRegistrationsForResident", residentRegistrations.size());
                        result.put("residentRegistrations", residentRegistrations.stream().map(r -> Map.of(
                            "id", r.getId(),
                            "eventId", r.getEvent().getId(),
                            "status", r.getStatus(),
                            "registeredAt", r.getRegisteredAt()
                        )).collect(Collectors.toList()));
                    }
                }
            }
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // Cleanup endpoint to fix duplicate registrations
    @PostMapping("/test/cleanup-duplicates/{eventId}")
    public ResponseEntity<Map<String, Object>> cleanupDuplicateRegistrations(@PathVariable("eventId") Long eventId) {
        try {
            Map<String, Object> result = new HashMap<>();
            
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("error", "Authentication failed"));
            }
            
            String username = auth.getName();
            Long userId = userService.getUserIdByPhoneNumber(username);
            if (userId == null) {
                return ResponseEntity.status(401).body(Map.of("error", "User not found"));
            }
            
            Resident resident = residentRepository.findByUserId(userId);
            if (resident == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Resident not found"));
            }
            
            Long residentId = resident.getUserId();
            result.put("userId", userId);
            result.put("residentId", residentId);
            result.put("eventId", eventId);
            
            // Find all registrations for this event and resident
            List<EventRegistration> registrations = registrationRepository.findAllByEventIdAndResidentId(eventId, residentId);
            result.put("totalRegistrationsFound", registrations.size());
            
            if (registrations.size() > 1) {
                result.put("hasDuplicates", true);
                
                // Keep the most recent REGISTERED registration, cancel others
                EventRegistration keepRegistration = null;
                List<Long> cancelledIds = new ArrayList<>();
                
                for (EventRegistration reg : registrations) {
                    if (reg.getStatus() == EventRegistrationStatus.REGISTERED) {
                        if (keepRegistration == null || reg.getRegisteredAt().isAfter(keepRegistration.getRegisteredAt())) {
                            keepRegistration = reg;
                        }
                    }
                }
                
                if (keepRegistration != null) {
                    result.put("keepingRegistrationId", keepRegistration.getId());
                    
                    // Cancel all other registrations
                    for (EventRegistration reg : registrations) {
                        if (!reg.getId().equals(keepRegistration.getId())) {
                            reg.setStatus(EventRegistrationStatus.CANCELLED);
                            registrationRepository.save(reg);
                            cancelledIds.add(reg.getId());
                        }
                    }
                    
                    result.put("cancelledRegistrationIds", cancelledIds);
                    result.put("cleanupSuccessful", true);
                } else {
                    result.put("cleanupSuccessful", false);
                    result.put("error", "No REGISTERED registration found to keep");
                }
            } else {
                result.put("hasDuplicates", false);
                result.put("cleanupSuccessful", true);
            }
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
} 