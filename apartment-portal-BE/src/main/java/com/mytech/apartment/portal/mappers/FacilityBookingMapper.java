package com.mytech.apartment.portal.mappers;

import com.mytech.apartment.portal.dtos.FacilityBookingDto;
import com.mytech.apartment.portal.models.FacilityBooking;
import com.mytech.apartment.portal.models.enums.FacilityBookingStatus;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class FacilityBookingMapper {

    public FacilityBookingDto toDto(FacilityBooking booking) {
        if (booking == null) {
            return null;
        }

        LocalDateTime startTime = booking.getBookingTime();
        LocalDateTime endTime = startTime != null && booking.getDuration() != null ? 
            startTime.plusMinutes(booking.getDuration()) : null;

        return new FacilityBookingDto(
            booking.getId(),
            booking.getFacility() != null ? booking.getFacility().getId() : null,
            booking.getFacility() != null ? booking.getFacility().getName() : null,
            booking.getUser() != null ? booking.getUser().getId() : null,
            booking.getUser() != null ? booking.getUser().getUsername() : null,
            startTime,
            endTime,
            booking.getStatus() != null ? booking.getStatus().name() : null,
            null, // purpose field doesn't exist in entity
            booking.getCreatedAt()
        );
    }

    public FacilityBooking toEntity(FacilityBookingDto dto) {
        if (dto == null) {
            return null;
        }

        FacilityBooking booking = new FacilityBooking();
        booking.setId(dto.getId());
        booking.setBookingTime(dto.getStartTime());
        
        // Calculate duration from start and end time
        if (dto.getStartTime() != null && dto.getEndTime() != null) {
            long durationMinutes = java.time.Duration.between(dto.getStartTime(), dto.getEndTime()).toMinutes();
            booking.setDuration((int) durationMinutes);
        }
        
        booking.setStatus(dto.getStatus() != null ? FacilityBookingStatus.valueOf(dto.getStatus()) : null);
        booking.setCreatedAt(dto.getCreatedAt());
        
        return booking;
    }
} 