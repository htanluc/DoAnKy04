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

    // Admin endpoint to get all bookings
    @GetMapping("/admin/facility-bookings")
    public List<FacilityBookingDto> getAllFacilityBookings() {
        return facilityBookingService.getAllFacilityBookings();
    }

    // User endpoint to book a facility
    @PostMapping("/facility-bookings")
    public ResponseEntity<FacilityBookingDto> createFacilityBooking(@RequestBody FacilityBookingCreateRequest request) {
        try {
            FacilityBookingDto booking = facilityBookingService.createFacilityBooking(request);
            return ResponseEntity.ok(booking);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
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
        return updatedBooking.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // User endpoint to cancel their booking
    @DeleteMapping("/facility-bookings/{id}")
    public ResponseEntity<Void> deleteFacilityBooking(@PathVariable("id") Long id) {
        boolean deleted = facilityBookingService.deleteFacilityBooking(id);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    /**
     * [EN] Get facility bookings of current resident
     * [VI] Lấy lịch sử đặt tiện ích của resident hiện tại
     */
    @Operation(summary = "Get facility bookings of current resident", description = "Get list of facility bookings for the currently authenticated resident")
    @GetMapping("/facility-bookings/my")
    public ResponseEntity<List<FacilityBookingDto>> getMyFacilityBookings() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        Long userId = null;
        try {
            userId = userService.getUserIdByUsername(username);
        } catch (Exception e) {
            return ResponseEntity.status(401).build();
        }
        if (userId == null) return ResponseEntity.status(401).build();
        List<FacilityBookingDto> bookings = facilityBookingService.getFacilityBookingsByUserId(userId);
        return ResponseEntity.ok(bookings);
    }
} 