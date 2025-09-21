package com.mytech.apartment.portal.services;

import com.mytech.apartment.portal.dtos.EventCreateRequest;
import com.mytech.apartment.portal.dtos.EventDto;
import com.mytech.apartment.portal.dtos.EventUpdateRequest;
import com.mytech.apartment.portal.mappers.EventMapper;
import com.mytech.apartment.portal.models.Event;
import com.mytech.apartment.portal.models.EventRegistration;
import com.mytech.apartment.portal.repositories.EventRepository;
import com.mytech.apartment.portal.repositories.EventRegistrationRepository;
import com.mytech.apartment.portal.models.enums.EventRegistrationStatus;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private EventMapper eventMapper;

    @Autowired
    private EventRegistrationRepository eventRegistrationRepository;

    @Autowired
    private UserService userService;

    public List<EventDto> getAllEvents() {
        return eventRepository.findAll().stream()
                .map(eventMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<EventDto> getAllEvents(Long userId) {
        List<Event> all = eventRepository.findAll();
        LocalDateTime now = LocalDateTime.now();
        return all.stream().map(event -> {
            int participantCount = eventRegistrationRepository.countByEventIdAndStatus(event.getId(), EventRegistrationStatus.REGISTERED);
            boolean isRegistered = false;
            String qrCode = null;
            String qrExpiresAt = null;
            Boolean checkedIn = null;
            String checkedInAt = null;
            
            if (userId != null) {
                isRegistered = eventRegistrationRepository.existsByEventIdAndUserIdAndStatus(event.getId(), userId, EventRegistrationStatus.REGISTERED);
                
                // Lấy thông tin QR code và check-in nếu đã đăng ký
                if (isRegistered) {
                    Optional<EventRegistration> registration = eventRegistrationRepository.findByEventIdAndUserId(event.getId(), userId);
                    if (registration.isPresent()) {
                        EventRegistration reg = registration.get();
                        qrCode = reg.getQrCode();
                        qrExpiresAt = reg.getQrExpiresAt() != null ? reg.getQrExpiresAt().toString() : null;
                        checkedIn = reg.getCheckedIn();
                        checkedInAt = reg.getCheckedInAt() != null ? reg.getCheckedInAt().toString() : null;
                    }
                }
            }
            
            // Kiểm tra sự kiện đã kết thúc chưa
            boolean isEnded = event.getEndTime() != null && now.isAfter(event.getEndTime());
            
            EventDto dto = eventMapper.toDto(event, participantCount, isRegistered, isEnded);
            dto.setQrCode(qrCode);
            dto.setQrExpiresAt(qrExpiresAt);
            dto.setCheckedIn(checkedIn);
            dto.setCheckedInAt(checkedInAt);
            
            return dto;
        }).collect(java.util.stream.Collectors.toList());
    }

    public Optional<EventDto> getEventById(Long id) {
        return eventRepository.findById(id).map(eventMapper::toDto);
    }

    @Transactional
    public EventDto createEvent(EventCreateRequest request) {
        Event event = eventMapper.toEntity(request);
        Event savedEvent = eventRepository.save(event);
        return eventMapper.toDto(savedEvent);
    }

    @Transactional
    public EventDto updateEvent(Long id, EventUpdateRequest request) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found with id " + id));

        eventMapper.updateEntityFromRequest(event, request);
        Event updatedEvent = eventRepository.save(event);
        return eventMapper.toDto(updatedEvent);
    }

    public void deleteEvent(Long id) {
        // Consider deleting registrations as well or handle constraints
        eventRepository.deleteById(id);
    }

    /**
     * Get all events for a specific user with registration status
     */
    public List<EventDto> getAllEventsForUser(String username) {
        Long userId = userService.getUserIdByPhoneNumber(username);
        return getAllEvents(userId);
    }

    /**
     * Get event by ID for a specific user with registration status
     */
    public Optional<EventDto> getEventByIdForUser(Long id, String username) {
        Long userId = userService.getUserIdByPhoneNumber(username);
        if (userId == null) {
            return getEventById(id);
        }
        
        LocalDateTime now = LocalDateTime.now();
        return eventRepository.findById(id).map(event -> {
            int participantCount = eventRegistrationRepository.countByEventIdAndStatus(event.getId(), EventRegistrationStatus.REGISTERED);
            boolean isRegistered = eventRegistrationRepository.existsByEventIdAndUserIdAndStatus(event.getId(), userId, EventRegistrationStatus.REGISTERED);
            
            String qrCode = null;
            String qrExpiresAt = null;
            Boolean checkedIn = null;
            String checkedInAt = null;
            
            // Lấy thông tin QR code và check-in nếu đã đăng ký
            if (isRegistered) {
                Optional<EventRegistration> registration = eventRegistrationRepository.findByEventIdAndUserId(event.getId(), userId);
                if (registration.isPresent()) {
                    EventRegistration reg = registration.get();
                    qrCode = reg.getQrCode();
                    qrExpiresAt = reg.getQrExpiresAt() != null ? reg.getQrExpiresAt().toString() : null;
                    checkedIn = reg.getCheckedIn();
                    checkedInAt = reg.getCheckedInAt() != null ? reg.getCheckedInAt().toString() : null;
                }
            }
            
            // Kiểm tra sự kiện đã kết thúc chưa
            boolean isEnded = event.getEndTime() != null && now.isAfter(event.getEndTime());
            
            EventDto dto = eventMapper.toDto(event, participantCount, isRegistered, isEnded);
            dto.setQrCode(qrCode);
            dto.setQrExpiresAt(qrExpiresAt);
            dto.setCheckedIn(checkedIn);
            dto.setCheckedInAt(checkedInAt);
            
            return dto;
        });
    }
} 