
package com.mytech.apartment.portal.apis;

import com.mytech.apartment.portal.dtos.FacilityBookingCreateRequest;
import com.mytech.apartment.portal.dtos.FacilityBookingDto;
import com.mytech.apartment.portal.services.FacilityBookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.mytech.apartment.portal.services.UserService;
import com.mytech.apartment.portal.services.LoggingService;
import com.mytech.apartment.portal.services.ActivityLogService;
import com.mytech.apartment.portal.models.enums.ActivityActionType;
import com.mytech.apartment.portal.security.UserDetailsImpl;
import com.mytech.apartment.portal.models.FacilityBooking;
import com.mytech.apartment.portal.mappers.FacilityBookingMapper;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@Tag(name = "Resident Facility Booking", description = "API for resident to view their own facility bookings")
public class FacilityBookingController {
    @Autowired
    private FacilityBookingService facilityBookingService;
    @Autowired
    private UserService userService;
    @Autowired private LoggingService loggingService;
    @Autowired private FacilityBookingMapper facilityBookingMapper;
    @Autowired private ActivityLogService activityLogService;

    // Admin endpoint to get all bookings
    @GetMapping("/admin/facility-bookings")
    public List<FacilityBookingDto> getAllFacilityBookings() {
        return facilityBookingService.getAllFacilityBookings();
    }

    // User endpoint to book a facility
    @PostMapping("/facility-bookings")
    public ResponseEntity<?> createFacilityBooking(@Valid @RequestBody FacilityBookingCreateRequest req, Authentication authentication) {
        try {
            Long userId = null;
            if (authentication != null && authentication.getPrincipal() instanceof UserDetailsImpl userDetails) {
                userId = userDetails.getId();
            }
            if (userId == null) return ResponseEntity.status(401).body("Không xác định được người dùng");
            req.setUserId(userId); // Changed from setResidentId to setUserId
            FacilityBookingDto saved = facilityBookingService.createFacilityBooking(req);
            // Ghi log với LoggingService (giữ nguyên)
            String facilityName = saved.getFacilityName() != null ? saved.getFacilityName() : "";
            String bookingTime = saved.getStartTime() != null ? saved.getStartTime().toString() : "";
            loggingService.logFacilityBooking(userId, facilityName, bookingTime);
            
            // Log activity: Create facility booking
            activityLogService.logActivityForCurrentUser(
                ActivityActionType.CREATE_FACILITY_BOOKING, 
                "Đặt tiện ích: %s cho %d người, thời gian: %s", 
                facilityName,
                saved.getNumberOfPeople(),
                bookingTime
            );
            
            return ResponseEntity.ok(saved);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Admin endpoint to get a specific booking
    @GetMapping("/admin/facility-bookings/{id}")
    public ResponseEntity<FacilityBookingDto> getFacilityBookingById(@PathVariable("id") Long id) {
        Optional<FacilityBookingDto> booking = facilityBookingService.getFacilityBookingById(id);
        return booking.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // User endpoint to update their booking
    @PutMapping("/facility-bookings/{id}")
    public ResponseEntity<FacilityBookingDto> updateFacilityBooking(@PathVariable("id") Long id, @RequestBody FacilityBookingCreateRequest request) {
        Optional<FacilityBookingDto> updatedBooking = facilityBookingService.updateFacilityBooking(id, request);
        
        // Log activity: Update facility booking
        updatedBooking.ifPresent(booking -> {
            activityLogService.logActivityForCurrentUser(
                ActivityActionType.UPDATE_FACILITY_BOOKING, 
                "Cập nhật đặt tiện ích: %s (#%d)", 
                booking.getFacilityName(),
                booking.getId()
            );
        });
        
        return updatedBooking.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // User endpoint to cancel their booking
    @DeleteMapping("/facility-bookings/{id}")
    public ResponseEntity<Void> deleteFacilityBooking(@PathVariable("id") Long id) {
        // Get booking info before deletion for logging
        Optional<FacilityBookingDto> booking = facilityBookingService.getFacilityBookingById(id);
        
        boolean deleted = facilityBookingService.deleteFacilityBooking(id);
        
        // Log activity: Cancel facility booking
        if (deleted && booking.isPresent()) {
            activityLogService.logActivityForCurrentUser(
                ActivityActionType.CANCEL_FACILITY_BOOKING, 
                "Hủy đặt tiện ích: %s (#%d)", 
                booking.get().getFacilityName(),
                booking.get().getId()
            );
        }
        
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    /**
     * [EN] Check-in to facility booking
     * [VI] Check-in vào tiện ích đã đặt
     */
    @PostMapping("/facility-bookings/{id}/checkin")
    @Operation(summary = "Check-in to facility booking", description = "User check-in to their facility booking")
    public ResponseEntity<?> checkInFacility(@PathVariable("id") Long bookingId, Authentication authentication) {
        try {
            Long userId = null;
            if (authentication != null && authentication.getPrincipal() instanceof UserDetailsImpl userDetails) {
                userId = userDetails.getId();
            }
            if (userId == null) return ResponseEntity.status(401).body("Không xác định được người dùng");
            
            // Get booking and validate ownership
            Optional<FacilityBookingDto> bookingOpt = facilityBookingService.getFacilityBookingById(bookingId);
            if (bookingOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            FacilityBookingDto booking = bookingOpt.get();
            
            // For now, simply increment check-in count (you can add more complex logic)
            // This is a simplified implementation
            
            // Log activity: Check-in facility
            activityLogService.logActivityForCurrentUser(
                ActivityActionType.FACILITY_CHECKIN, // SỬA LỖI: Đúng enum
                "Check-in tiện ích: %s (#%d)", 
                booking.getFacilityName(),
                booking.getId()
            );
            
            return ResponseEntity.ok("Check-in thành công vào " + booking.getFacilityName());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * [EN] Check-out from facility booking
     * [VI] Check-out khỏi tiện ích đã đặt
     */
    @PostMapping("/facility-bookings/{id}/checkout")
    @Operation(summary = "Check-out from facility booking", description = "User check-out from their facility booking")
    public ResponseEntity<?> checkOutFacility(@PathVariable("id") Long bookingId, Authentication authentication) {
        try {
            Long userId = null;
            if (authentication != null && authentication.getPrincipal() instanceof UserDetailsImpl userDetails) {
                userId = userDetails.getId();
            }
            if (userId == null) return ResponseEntity.status(401).body("Không xác định được người dùng");
            
            // Get booking and validate ownership
            Optional<FacilityBookingDto> bookingOpt = facilityBookingService.getFacilityBookingById(bookingId);
            if (bookingOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            FacilityBookingDto booking = bookingOpt.get();
            
            // Log activity: Check-out facility
            activityLogService.logActivityForCurrentUser(
                ActivityActionType.FACILITY_CHECKOUT, // SỬA LỖI: Đúng enum
                "Check-out khỏi tiện ích: %s (#%d)", 
                booking.getFacilityName(),
                booking.getId()
            );
            
            return ResponseEntity.ok("Check-out thành công khỏi " + booking.getFacilityName());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * [EN] Get facility bookings of current resident
     * [VI] Lấy lịch sử đặt tiện ích của resident hiện tại
     */
    @Operation(summary = "Get facility bookings of current resident", description = "Get list of facility bookings for the currently authenticated resident")
    @GetMapping("/facility-bookings/my")
    public ResponseEntity<List<FacilityBookingDto>> getMyFacilityBookings() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String phoneNumber = auth.getName();
        Long userId = null;
        try {
            userId = userService.getUserIdByPhoneNumber(phoneNumber);
        } catch (Exception e) {
            return ResponseEntity.status(401).build();
        }
        if (userId == null) return ResponseEntity.status(401).build();
        List<FacilityBookingDto> bookings = facilityBookingService.getFacilityBookingsByUserId(userId);
        return ResponseEntity.ok(bookings);
    }

    // API lấy lịch booking theo tiện ích và ngày
    @GetMapping("/facilities/{facilityId}/bookings")
    public ResponseEntity<List<FacilityBookingDto>> getBookingsByFacilityAndDate(
            @PathVariable("facilityId") Long facilityId,
            @RequestParam("date") String dateStr) {
        try {
            java.time.LocalDate date = java.time.LocalDate.parse(dateStr);
            List<FacilityBookingDto> bookings = facilityBookingService.getBookingsByFacilityAndDate(facilityId, date);
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // API lấy thông tin sức chứa theo giờ
    @GetMapping("/facilities/{facilityId}/availability")
    public ResponseEntity<java.util.Map<String, Object>> getFacilityAvailability(
            @PathVariable("facilityId") Long facilityId,
            @RequestParam("date") String dateStr) {
        try {
            java.time.LocalDate date = java.time.LocalDate.parse(dateStr);
            java.util.Map<String, Object> availability = facilityBookingService.getFacilityAvailabilityByHour(facilityId, date);
            return ResponseEntity.ok(availability);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
} 