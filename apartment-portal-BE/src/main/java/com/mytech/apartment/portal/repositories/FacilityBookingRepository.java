package com.mytech.apartment.portal.repositories;

import com.mytech.apartment.portal.models.FacilityBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FacilityBookingRepository extends JpaRepository<FacilityBooking, Long> {
    // Có thể bổ sung các phương thức custom nếu cần
} 