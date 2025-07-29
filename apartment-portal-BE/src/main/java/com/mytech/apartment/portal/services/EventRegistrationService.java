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
        return registrationRepository.findByResidentId(userId).stream()
                .map(registrationMapper::toDto)
                .collect(Collectors.toList());
    }

    public EventRegistrationDto getRegistrationByEventAndUser(Long eventId, Long userId) {
        Optional<EventRegistration> registration = registrationRepository.findByEventIdAndResidentId(eventId, userId);
        return registration.map(registrationMapper::toDto).orElse(null);
    }

    public boolean verifyRegistrationOwnership(Long registrationId, Long userId) {
        Optional<EventRegistration> registration = registrationRepository.findById(registrationId);
        return registration.isPresent() && registration.get().getResidentId().equals(userId);
    }

    @Transactional
    public EventRegistrationDto registerForEvent(EventRegistrationRequest request) {
        System.out.println("Service: Processing registration request: " + request);
        
        // Validate request
        if (request.getEventId() == null) {
            System.out.println("Service: Event ID is null");
            throw new RuntimeException("Event ID is required");
        }
        if (request.getResidentId() == null) {
            System.out.println("Service: Resident ID is null");
            throw new RuntimeException("Resident ID is required");
        }
        
        System.out.println("Service: Looking for event with ID: " + request.getEventId());
        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new RuntimeException("Event not found with id " + request.getEventId()));
        System.out.println("Service: Found event: " + event.getTitle());

        // Check for duplicate registration using repository method
        System.out.println("Service: Checking for existing registration...");
        boolean alreadyRegistered = registrationRepository.existsByEventIdAndResidentIdAndStatus(
            request.getEventId(), 
            request.getResidentId(), 
            EventRegistrationStatus.REGISTERED
        );
        
        if (alreadyRegistered) {
            System.out.println("Service: User already registered for this event");
            throw new RuntimeException("User already registered for this event");
        }

        System.out.println("Service: Creating new registration...");
        EventRegistration registration = new EventRegistration();
        registration.setEvent(event);
        registration.setResidentId(request.getResidentId());
        registration.setStatus(EventRegistrationStatus.REGISTERED);

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

        registration.setStatus(EventRegistrationStatus.CANCELLED);
        registrationRepository.save(registration);
    }

    @Transactional
    public boolean cancelRegistrationByEventAndUser(Long eventId, Long userId) {
        Optional<EventRegistration> registration = registrationRepository.findByEventIdAndResidentId(eventId, userId);
        
        if (registration.isPresent() && registration.get().getStatus() == EventRegistrationStatus.REGISTERED) {
            EventRegistration reg = registration.get();
            reg.setStatus(EventRegistrationStatus.CANCELLED);
            registrationRepository.save(reg);
            return true;
        }
        
        return false;
    }
} 