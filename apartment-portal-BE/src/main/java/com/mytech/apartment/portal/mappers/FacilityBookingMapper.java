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

        FacilityBookingDto dto = new FacilityBookingDto(
            booking.getId(),
            booking.getFacility() != null ? booking.getFacility().getId() : null,
            booking.getFacility() != null ? booking.getFacility().getName() : null,
            booking.getUser() != null ? booking.getUser().getId() : null,
            booking.getUser() != null ? booking.getUser().getUsername() : null,
            startTime,
            endTime,
            booking.getStatus() != null ? booking.getStatus().name() : null,
            booking.getPurpose(),
            booking.getCreatedAt()
        );
        // Tính giá tiền: usageFee * số giờ * số lượng người
        double usageFee = (booking.getFacility() != null && booking.getFacility().getUsageFee() != null) ? booking.getFacility().getUsageFee() : 0.0;
        int durationMinutes = booking.getDuration() != null ? booking.getDuration() : 0;
        int numberOfPeople = booking.getNumberOfPeople() != null ? booking.getNumberOfPeople() : 1;
        double hours = durationMinutes / 60.0;
        dto.setTotalCost(usageFee * hours * numberOfPeople);
        dto.setNumberOfPeople(numberOfPeople);
        
        // Set QR code fields
        dto.setQrCode(booking.getQrCode());
        dto.setQrExpiresAt(booking.getQrExpiresAt());
        dto.setCheckedInCount(booking.getCheckedInCount());
        dto.setMaxCheckins(booking.getMaxCheckins());
        
        return dto;
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

    public FacilityBooking toEntity(com.mytech.apartment.portal.dtos.FacilityBookingCreateRequest req) {
        if (req == null) return null;
        FacilityBooking booking = new FacilityBooking();
        
        // Parse bookingTime from String to LocalDateTime
        if (req.getBookingTime() != null) {
            try {
                LocalDateTime bookingTime = LocalDateTime.parse(req.getBookingTime());
                booking.setBookingTime(bookingTime);
            } catch (Exception e) {
                throw new RuntimeException("Invalid booking time format. Expected: yyyy-MM-ddTHH:mm:ss");
            }
        }
        
        booking.setDuration(req.getDuration());
        booking.setNumberOfPeople(req.getNumberOfPeople());
        booking.setPurpose(req.getPurpose());
        // Các trường khác như facility, user sẽ được set ở service/controller nếu cần
        return booking;
    }
} 