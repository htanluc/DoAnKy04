package com.mytech.apartment.portal.services;

import com.mytech.apartment.portal.models.ActivityLog;
import com.mytech.apartment.portal.models.User;
import com.mytech.apartment.portal.repositories.ActivityLogRepository;
import com.mytech.apartment.portal.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class LoggingService {

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Log facility booking activity
     */
    public void logFacilityBooking(Long userId, String facilityName, String bookingTime) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return; // Skip logging if user not found
        }

        ActivityLog activityLog = ActivityLog.builder()
                .user(userOpt.get())
                .actionType("FACILITY_BOOKING")
                .description("Đặt tiện ích: " + facilityName + " - Thời gian: " + bookingTime)
                .timestamp(LocalDateTime.now())
                .build();

        activityLogRepository.save(activityLog);
    }

    /**
     * Log general activity
     */
    public void logActivity(Long userId, String actionType, String description) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return; // Skip logging if user not found
        }

        ActivityLog activityLog = ActivityLog.builder()
                .user(userOpt.get())
                .actionType(actionType)
                .description(description)
                .timestamp(LocalDateTime.now())
                .build();

        activityLogRepository.save(activityLog);
    }
} 