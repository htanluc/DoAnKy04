package com.mytech.apartment.portal.services;

import com.mytech.apartment.portal.dtos.EventRegistrationDto;
import com.mytech.apartment.portal.dtos.EventRegistrationRequest;
import com.mytech.apartment.portal.mappers.EventRegistrationMapper;
import com.mytech.apartment.portal.models.Event;
import com.mytech.apartment.portal.models.EventRegistration;
import com.mytech.apartment.portal.repositories.EventRepository;
import com.mytech.apartment.portal.repositories.EventRegistrationRepository;
import com.mytech.apartment.portal.models.enums.EventRegistrationStatus;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class EventRegistrationService {

    @Autowired
    private EventRegistrationRepository registrationRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private EventRegistrationMapper registrationMapper;

    public List<EventRegistrationDto> getRegistrationsForEvent(Long eventId) {
        return registrationRepository.findByEventId(eventId).stream()
                .map(registrationMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<EventRegistrationDto> getRegistrationsByUserId(Long userId) {
        return registrationRepository.findByUserId(userId).stream()
                .map(registrationMapper::toDto)
                .collect(Collectors.toList());
    }

    public EventRegistrationDto getRegistrationByEventAndUser(Long eventId, Long userId) {
        Optional<EventRegistration> registration = registrationRepository.findByEventIdAndUserId(eventId, userId);
        return registration.map(registrationMapper::toDto).orElse(null);
    }

    public boolean verifyRegistrationOwnership(Long registrationId, Long userId) {
        Optional<EventRegistration> registration = registrationRepository.findById(registrationId);
        return registration.isPresent() && registration.get().getUser().getId().equals(userId);
    }

    @Transactional
    public EventRegistrationDto registerForEvent(EventRegistrationRequest request) {
        System.out.println("Service: Processing registration request: " + request);
        
        // Validate request
        if (request.getEventId() == null) {
            System.out.println("Service: Event ID is null");
            throw new RuntimeException("Event ID is required");
        }
        if (request.getUserId() == null) {
            System.out.println("Service: User ID is null");
            throw new RuntimeException("User ID is required");
        }
        
        System.out.println("Service: Looking for event with ID: " + request.getEventId());
        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new RuntimeException("Event not found with id " + request.getEventId()));
        System.out.println("Service: Found event: " + event.getTitle());

        // Check for existing REGISTERED registration
        System.out.println("Service: Checking for existing registration...");
        boolean alreadyRegistered = registrationRepository.existsByEventIdAndUserIdAndStatus(
            request.getEventId(), 
            request.getUserId(), 
            EventRegistrationStatus.REGISTERED
        );
        
        if (alreadyRegistered) {
            System.out.println("Service: User already registered for this event");
            throw new RuntimeException("User already registered for this event");
        }

        // Check if there's a CANCELLED registration that we can update
        List<EventRegistration> existingRegistrations = registrationRepository.findAllByEventIdAndUserId(
            request.getEventId(), 
            request.getUserId()
        );
        
        EventRegistration registration;
        if (!existingRegistrations.isEmpty()) {
            // Use the most recent registration and update it
            registration = existingRegistrations.stream()
                .max((r1, r2) -> r1.getRegisteredAt().compareTo(r2.getRegisteredAt()))
                .orElse(existingRegistrations.get(0));
            
            System.out.println("Service: Updating existing registration ID: " + registration.getId());
            registration.setStatus(EventRegistrationStatus.REGISTERED);
            registration.setRegisteredAt(LocalDateTime.now());
        } else {
            // Create new registration
            System.out.println("Service: Creating new registration...");
            registration = new EventRegistration();
            registration.setEvent(event);
            // We need to set the User entity, not just the ID
            // This will be handled by the controller/service that calls this method
            registration.setStatus(EventRegistrationStatus.REGISTERED);
        }

        EventRegistration savedRegistration = registrationRepository.save(registration);
        System.out.println("Service: Registration saved with ID: " + savedRegistration.getId());
        
        EventRegistrationDto dto = registrationMapper.toDto(savedRegistration);
        System.out.println("Service: Returning DTO: " + dto);
        return dto;
    }

    @Transactional
    public void cancelRegistration(Long registrationId) {
        EventRegistration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Registration not found with id " + registrationId));

        // DELETE the registration instead of just updating status
        registrationRepository.delete(registration);
    }

    @Transactional
    public boolean cancelRegistrationByEventAndUser(Long eventId, Long userId) {
        System.out.println("Service: Attempting to cancel registration for event ID: " + eventId + ", user ID: " + userId);
        
        // First check if event exists
        if (!eventRepository.existsById(eventId)) {
            System.out.println("Service: Event with ID " + eventId + " does not exist");
            return false;
        }
        
        // Find all registrations for this event and user
        List<EventRegistration> registrations = registrationRepository.findAllByEventIdAndUserId(eventId, userId);
        System.out.println("Service: Found " + registrations.size() + " registrations");
        
        if (registrations.isEmpty()) {
            System.out.println("Service: No registration found for event " + eventId + " and user " + userId);
            return false;
        }
        
        // If multiple registrations exist, find the most recent one with REGISTERED status
        EventRegistration registrationToCancel = null;
        for (EventRegistration reg : registrations) {
            System.out.println("Service: Registration ID " + reg.getId() + ", Status: " + reg.getStatus() + ", RegisteredAt: " + reg.getRegisteredAt());
            if (reg.getStatus() == EventRegistrationStatus.REGISTERED) {
                if (registrationToCancel == null || reg.getRegisteredAt().isAfter(registrationToCancel.getRegisteredAt())) {
                    registrationToCancel = reg;
                }
            }
        }
        
        if (registrationToCancel == null) {
            System.out.println("Service: No active registration found to cancel");
            return false;
        }
        
        System.out.println("Service: Deleting registration ID: " + registrationToCancel.getId());
        
        // DELETE the registration instead of just updating status
        registrationRepository.delete(registrationToCancel);
        
        System.out.println("Service: Registration deleted successfully");
        return true;
    }
} 