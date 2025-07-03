package com.mytech.apartment.portal.services;

import com.mytech.apartment.portal.models.RecurringBooking;
import com.mytech.apartment.portal.repositories.RecurringBookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RecurringBookingService {
    @Autowired
    private RecurringBookingRepository recurringBookingRepository;

    public List<RecurringBooking> getAllRecurringBookings() {
        return recurringBookingRepository.findAll();
    }

    public Optional<RecurringBooking> getRecurringBookingById(Long id) {
        return recurringBookingRepository.findById(id);
    }

    public RecurringBooking createRecurringBooking(RecurringBooking recurringBooking) {
        return recurringBookingRepository.save(recurringBooking);
    }

    public RecurringBooking updateRecurringBooking(Long id, RecurringBooking recurringBooking) {
        recurringBooking.setId(id);
        return recurringBookingRepository.save(recurringBooking);
    }

    public void deleteRecurringBooking(Long id) {
        recurringBookingRepository.deleteById(id);
    }
} 