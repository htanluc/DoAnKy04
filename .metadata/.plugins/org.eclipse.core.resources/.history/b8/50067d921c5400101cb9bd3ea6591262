package com.mytech.apartment.portal.services;

import com.mytech.apartment.portal.dtos.FacilityBookingCreateRequest;
import com.mytech.apartment.portal.dtos.FacilityBookingDto;
import com.mytech.apartment.portal.mappers.FacilityBookingMapper;
import com.mytech.apartment.portal.models.Facility;
import com.mytech.apartment.portal.models.FacilityBooking;
import com.mytech.apartment.portal.models.User;
import com.mytech.apartment.portal.repositories.FacilityBookingRepository;
import com.mytech.apartment.portal.repositories.FacilityRepository;
import com.mytech.apartment.portal.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FacilityBookingService {
    @Autowired
    private FacilityBookingRepository facilityBookingRepository;

    @Autowired
    private FacilityRepository facilityRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FacilityBookingMapper facilityBookingMapper;

    public List<FacilityBookingDto> getAllFacilityBookings() {
        return facilityBookingRepository.findAll().stream()
                .map(facilityBookingMapper::toDto)
                .collect(Collectors.toList());
    }

    public Optional<FacilityBookingDto> getFacilityBookingById(Long id) {
        return facilityBookingRepository.findById(id).map(facilityBookingMapper::toDto);
    }

    public FacilityBookingDto createFacilityBooking(FacilityBookingCreateRequest request) {
        Facility facility = facilityRepository.findById(request.getFacilityId())
                .orElseThrow(() -> new RuntimeException("Facility not found with id " + request.getFacilityId()));

        User user = userRepository.findById(request.getResidentId())
                .orElseThrow(() -> new RuntimeException("User not found with id " + request.getResidentId()));

        // Calculate duration from start and end time
        long durationMinutes = java.time.Duration.between(request.getStartTime(), request.getEndTime()).toMinutes();

        FacilityBooking booking = new FacilityBooking();
        booking.setFacility(facility);
        booking.setUser(user);
        booking.setBookingTime(request.getStartTime());
        booking.setDuration((int) durationMinutes);
        booking.setStatus("PENDING");
        booking.setCreatedAt(LocalDateTime.now());

        FacilityBooking savedBooking = facilityBookingRepository.save(booking);
        return facilityBookingMapper.toDto(savedBooking);
    }

    public Optional<FacilityBookingDto> updateFacilityBooking(Long id, FacilityBookingCreateRequest request) {
        return facilityBookingRepository.findById(id).map(booking -> {
            if (request.getFacilityId() != null) {
                Facility facility = facilityRepository.findById(request.getFacilityId())
                        .orElseThrow(() -> new RuntimeException("Facility not found with id " + request.getFacilityId()));
                booking.setFacility(facility);
            }
            if (request.getStartTime() != null) {
                booking.setBookingTime(request.getStartTime());
            }
            if (request.getStartTime() != null && request.getEndTime() != null) {
                long durationMinutes = java.time.Duration.between(request.getStartTime(), request.getEndTime()).toMinutes();
                booking.setDuration((int) durationMinutes);
            }

            FacilityBooking updatedBooking = facilityBookingRepository.save(booking);
            return facilityBookingMapper.toDto(updatedBooking);
        });
    }

    public boolean deleteFacilityBooking(Long id) {
        if (facilityBookingRepository.existsById(id)) {
            facilityBookingRepository.deleteById(id);
            return true;
        } else {
            return false;
        }
    }
} 