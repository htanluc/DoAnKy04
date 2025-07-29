package com.mytech.apartment.portal.repositories;

import com.mytech.apartment.portal.models.FacilityBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface FacilityBookingRepository extends JpaRepository<FacilityBooking, Long> {
    List<FacilityBooking> findByUserId(Long userId);
    
    /**
     * Find booking by QR code
     */
    Optional<FacilityBooking> findByQrCode(String qrCode);
    
    /**
     * Find bookings by facility ID and booking time range
     */
    List<FacilityBooking> findByFacilityIdAndBookingTimeBetween(Long facilityId, LocalDateTime start, LocalDateTime end);
} 