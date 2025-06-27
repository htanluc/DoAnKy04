package com.mytech.apartment.portal.repositories;

import com.mytech.apartment.portal.models.RecurringBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RecurringBookingRepository extends JpaRepository<RecurringBooking, Long> {
} 