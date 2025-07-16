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
import com.mytech.apartment.portal.models.enums.FacilityBookingStatus;
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
        // Validate dữ liệu đầu vào
        if (request.getFacilityId() == null || request.getBookingTime() == null || request.getDuration() == null || request.getResidentId() == null) {
            throw new RuntimeException("Thiếu thông tin đặt chỗ");
        }
        Facility facility = facilityRepository.findById(request.getFacilityId())
                .orElseThrow(() -> new RuntimeException("Facility not found with id " + request.getFacilityId()));

        User user = userRepository.findById(request.getResidentId())
                .orElseThrow(() -> new RuntimeException("User not found with id " + request.getResidentId()));

        // Validate số người không vượt quá sức chứa
        if (request.getNumberOfPeople() != null && request.getNumberOfPeople() > facility.getCapacity()) {
            throw new RuntimeException("Số người vượt quá sức chứa của tiện ích");
        }
        // Validate thời lượng hợp lệ
        if (request.getDuration() <= 0) {
            throw new RuntimeException("Thời lượng đặt chỗ không hợp lệ");
        }

        FacilityBooking booking = new FacilityBooking();
        booking.setFacility(facility);
        booking.setUser(user);
        booking.setBookingTime(request.getBookingTime());
        booking.setDuration(request.getDuration());
        booking.setStatus(FacilityBookingStatus.PENDING);
        booking.setCreatedAt(LocalDateTime.now());
        booking.setNumberOfPeople(request.getNumberOfPeople());
        booking.setPurpose(request.getPurpose());

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

    public List<FacilityBookingDto> getFacilityBookingsByUserId(Long userId) {
        return facilityBookingRepository.findByUserId(userId).stream()
            .map(facilityBookingMapper::toDto)
            .collect(Collectors.toList());
    }
} 