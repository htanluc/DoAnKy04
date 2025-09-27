package com.mytech.apartment.portal.apis;

import com.mytech.apartment.portal.dtos.FacilityBookingDto;
import com.mytech.apartment.portal.dtos.EventRegistrationDto;
import com.mytech.apartment.portal.services.FacilityBookingService;
import com.mytech.apartment.portal.services.EventRegistrationService;
import com.mytech.apartment.portal.services.ActivityLogService;
import com.mytech.apartment.portal.models.enums.ActivityActionType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

/**
 * StaffController - API cho nhân viên check-in tiện ích và sự kiện
 */
@RestController
@RequestMapping("/api/staff")
@PreAuthorize("hasRole('STAFF')")
public class StaffController {

    @Autowired
    private FacilityBookingService facilityBookingService;
    
    @Autowired
    private EventRegistrationService eventRegistrationService;
    
    @Autowired
    private ActivityLogService activityLogService;

    /**
     * [EN] Get all facility bookings for staff check-in
     * [VI] Lấy danh sách tất cả tiện ích để check-in
     */
    @GetMapping("/facility-bookings/checkin")
    public ResponseEntity<List<Map<String, Object>>> getFacilityBookingsForCheckIn() {
        try {
            List<FacilityBookingDto> bookings = facilityBookingService.getAllFacilityBookings();
            
            // Filter bookings that can be checked in (today's bookings, confirmed status, etc.)
            List<Map<String, Object>> checkinBookings = bookings.stream()
                .filter(booking -> {
                    // Add your business logic here for filtering
                    // For example: only confirmed bookings, within time window, etc.
                    return "CONFIRMED".equals(booking.getStatus()) || "ACTIVE".equals(booking.getStatus());
                })
                .map(this::convertFacilityBookingToMap)
                .toList();
                
            return ResponseEntity.ok(checkinBookings);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * [EN] Check-in to facility booking
     * [VI] Check-in vào tiện ích đã đặt
     */
    @PostMapping("/facility-bookings/{id}/checkin")
    public ResponseEntity<String> checkInFacility(@PathVariable("id") Long bookingId) {
        try {
            // Get booking and validate
            var bookingOpt = facilityBookingService.getFacilityBookingById(bookingId);
            if (bookingOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            FacilityBookingDto booking = bookingOpt.get();
            
            // For now, simply increment check-in count (you can add more complex logic)
            // This is a simplified implementation
            
            // Log activity: Check-in facility
            activityLogService.logActivityForCurrentUser(
                ActivityActionType.FACILITY_CHECKIN,
                "Staff check-in tiện ích: %s (#%d)", 
                booking.getFacilityName(),
                booking.getId()
            );
            
            return ResponseEntity.ok("Check-in thành công vào " + booking.getFacilityName());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * [EN] Get all event registrations for staff check-in
     * [VI] Lấy danh sách tất cả đăng ký sự kiện để check-in
     */
    @GetMapping("/event-registrations/checkin")
    public ResponseEntity<List<Map<String, Object>>> getEventRegistrationsForCheckIn() {
        try {
            System.out.println("[StaffController] Getting event registrations for check-in...");
            
            // Get all event registrations as DTOs
            List<EventRegistrationDto> registrations = eventRegistrationService.getAllEventRegistrationsAsDto();
            System.out.println("[StaffController] Found " + registrations.size() + " total registrations");
            
            // Filter registrations that can be checked in
            List<Map<String, Object>> checkinRegistrations = registrations.stream()
                .filter(registration -> {
                    boolean canCheckIn = "REGISTERED".equals(registration.getStatus()) && 
                                       !registration.getCheckedIn();
                    System.out.println("[StaffController] Registration " + registration.getId() + 
                                     " - Status: " + registration.getStatus() + 
                                     ", CheckedIn: " + registration.getCheckedIn() + 
                                     ", CanCheckIn: " + canCheckIn);
                    return canCheckIn;
                })
                .map(this::convertEventRegistrationToMap)
                .toList();
                
            System.out.println("[StaffController] Returning " + checkinRegistrations.size() + " check-in registrations");
            return ResponseEntity.ok(checkinRegistrations);
        } catch (Exception e) {
            System.err.println("[StaffController] Error getting event registrations: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(List.of(Map.of(
                "error", true,
                "message", "Lỗi server: " + e.getMessage()
            )));
        }
    }

    /**
     * [EN] Check-in to event registration
     * [VI] Check-in vào sự kiện đã đăng ký
     */
    @PostMapping("/event-registrations/{id}/checkin")
    public ResponseEntity<String> checkInEvent(@PathVariable("id") Long registrationId) {
        try {
            // Get registration and validate
            EventRegistrationDto registration = eventRegistrationService.getEventRegistrationById(registrationId);
            if (registration == null) {
                return ResponseEntity.notFound().build();
            }
            
            // Perform check-in
            boolean success = eventRegistrationService.checkInEvent(registrationId);
            if (!success) {
                return ResponseEntity.badRequest().body("Không thể check-in. Có thể đã được check-in hoặc không hợp lệ.");
            }
            
            // Log activity: Check-in event
            activityLogService.logActivityForCurrentUser(
                ActivityActionType.EVENT_CHECKIN,
                "Staff check-in sự kiện ID: %d (#%d)", 
                registration.getEventId(),
                registration.getId()
            );
            
            return ResponseEntity.ok("Check-in thành công vào sự kiện ID " + registration.getEventId());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Lỗi check-in: " + e.getMessage());
        }
    }

    /**
     * [EN] Process QR code scan result
     * [VI] Xử lý kết quả quét mã QR
     */
    @PostMapping("/qr/scan")
    public ResponseEntity<Map<String, Object>> processQRCode(@RequestBody Map<String, String> request) {
        try {
            String qrCode = request.get("qrCode");
            if (qrCode == null || qrCode.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "QR code không hợp lệ"
                ));
            }
            
            // Parse QR code to determine type and ID
            // QR code format could be: "FACILITY:123" or "EVENT:456"
            Map<String, Object> result = new HashMap<>();
            
            if (qrCode.startsWith("FACILITY:")) {
                Long bookingId = Long.parseLong(qrCode.substring(9));
                var bookingOpt = facilityBookingService.getFacilityBookingById(bookingId);
                if (bookingOpt.isPresent()) {
                    FacilityBookingDto booking = bookingOpt.get();
                    result.put("type", "facility");
                    result.put("bookingId", bookingId);
                    result.put("message", "Check-in thành công vào " + booking.getFacilityName());
                    result.put("success", true);
                    result.put("userName", booking.getUserName());
                    
                    // Log activity
                    activityLogService.logActivityForCurrentUser(
                        ActivityActionType.FACILITY_CHECKIN,
                        "Staff QR check-in tiện ích: %s (#%d)", 
                        booking.getFacilityName(),
                        bookingId
                    );
                } else {
                    result.put("success", false);
                    result.put("message", "Không tìm thấy booking tiện ích");
                }
            } else if (qrCode.startsWith("EVENT:")) {
                Long registrationId = Long.parseLong(qrCode.substring(6));
                EventRegistrationDto registration = eventRegistrationService.getEventRegistrationById(registrationId);
                if (registration != null) {
                    // Perform actual check-in
                    boolean checkInSuccess = eventRegistrationService.checkInEvent(registrationId);
                    if (checkInSuccess) {
                        result.put("type", "event");
                        result.put("registrationId", registrationId);
                        result.put("message", "Check-in thành công vào sự kiện ID " + registration.getEventId());
                        result.put("success", true);
                        result.put("userName", "User ID " + registration.getUserId());
                        
                        // Log activity
                        activityLogService.logActivityForCurrentUser(
                            ActivityActionType.EVENT_CHECKIN,
                            "Staff QR check-in sự kiện ID: %d (#%d)", 
                            registration.getEventId(),
                            registrationId
                        );
                    } else {
                        result.put("success", false);
                        result.put("message", "Không thể check-in. Có thể đã được check-in hoặc không hợp lệ.");
                    }
                } else {
                    result.put("success", false);
                    result.put("message", "Không tìm thấy đăng ký sự kiện");
                }
            } else {
                result.put("success", false);
                result.put("message", "Định dạng QR code không hỗ trợ");
            }
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Lỗi xử lý QR code: " + e.getMessage()
            ));
        }
    }

    private Map<String, Object> convertFacilityBookingToMap(FacilityBookingDto booking) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", booking.getId());
        map.put("facilityName", booking.getFacilityName());
        map.put("facilityDescription", "Facility ID: " + booking.getFacilityId()); // Use available data
        map.put("facilityLocation", "Location not available"); // Placeholder
        map.put("startTime", booking.getStartTime());
        map.put("endTime", booking.getEndTime());
        map.put("status", booking.getStatus());
        map.put("purpose", booking.getPurpose());
        map.put("numberOfPeople", booking.getNumberOfPeople());
        map.put("qrCode", booking.getQrCode());
        map.put("qrExpiresAt", booking.getQrExpiresAt());
        map.put("checkedInCount", booking.getCheckedInCount());
        map.put("maxCheckins", booking.getMaxCheckins());
        map.put("userName", booking.getUserName());
        map.put("userPhone", "Phone not available"); // Placeholder
        map.put("canCheckIn", true); // Add your business logic here
        return map;
    }

    private Map<String, Object> convertEventRegistrationToMap(EventRegistrationDto registration) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", registration.getId());
        map.put("eventTitle", "Event ID: " + registration.getEventId()); // Use available data
        map.put("eventDescription", "Event registration"); // Placeholder
        map.put("eventLocation", "Location not available"); // Placeholder
        map.put("startTime", registration.getRegisteredAt()); // Use registered time as placeholder
        map.put("endTime", registration.getQrExpiresAt()); // Use QR expiry as placeholder
        map.put("status", registration.getStatus());
        map.put("qrCode", registration.getQrCode());
        map.put("qrExpiresAt", registration.getQrExpiresAt());
        map.put("checkedIn", registration.getCheckedIn());
        map.put("checkedInAt", registration.getCheckedInAt());
        map.put("userName", "User ID: " + registration.getUserId()); // Use available data
        map.put("userPhone", "Phone not available"); // Placeholder
        map.put("canCheckIn", !registration.getCheckedIn()); // Can check-in if not already checked in
        return map;
    }
}
