package com.mytech.apartment.portal.services;

import com.mytech.apartment.portal.dtos.EventRegistrationDto;
import com.mytech.apartment.portal.dtos.EventRegistrationRequest;
import com.mytech.apartment.portal.mappers.EventRegistrationMapper;
import com.mytech.apartment.portal.models.Event;
import com.mytech.apartment.portal.models.EventRegistration;
import com.mytech.apartment.portal.repositories.EventRepository;
import com.mytech.apartment.portal.repositories.EventRegistrationRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
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
        // This is not efficient for large data, consider a specific query
        return registrationRepository.findAll().stream()
                .filter(reg -> reg.getEvent().getId().equals(eventId))
                .map(registrationMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public EventRegistrationDto registerForEvent(EventRegistrationRequest request) {
        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new RuntimeException("Event not found with id " + request.getEventId()));

        // Check for duplicate registration if needed

        EventRegistration registration = new EventRegistration();
        registration.setEvent(event);
        registration.setResidentId(request.getResidentId());
        registration.setStatus("REGISTERED");

        EventRegistration savedRegistration = registrationRepository.save(registration);
        return registrationMapper.toDto(savedRegistration);
    }

    @Transactional
    public void cancelRegistration(Long registrationId) {
        EventRegistration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Registration not found with id " + registrationId));

        registration.setStatus("CANCELLED");
        registrationRepository.save(registration);
    }
} 