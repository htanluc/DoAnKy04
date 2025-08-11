package com.mytech.apartment.portal.apis;

import com.mytech.apartment.portal.dtos.ApiResponse;
import com.mytech.apartment.portal.services.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")
public class TestWebSocketController {

    private final NotificationService notificationService;

    public TestWebSocketController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @PostMapping("/notifications/global")
    public ResponseEntity<ApiResponse<String>> sendGlobalNotification(@RequestParam String message) {
        notificationService.sendGlobalNotification(message);
        return ResponseEntity.ok(ApiResponse.success("Global notification sent", message));
    }

    @PostMapping("/notifications/user/{userId}")
    public ResponseEntity<ApiResponse<String>> sendUserNotification(
            @PathVariable("userId") Long userId,
            @RequestParam String message) {
        notificationService.sendUserNotification(userId, message);
        return ResponseEntity.ok(ApiResponse.success("User notification sent", message));
    }

    @PostMapping("/notifications/apartment/{apartmentId}")
    public ResponseEntity<ApiResponse<String>> sendApartmentNotification(
            @PathVariable("apartmentId") Long apartmentId,
            @RequestParam String message) {
        notificationService.sendApartmentNotification(apartmentId, message);
        return ResponseEntity.ok(ApiResponse.success("Apartment notification sent", message));
    }

    @PostMapping("/notifications/payment/{userId}")
    public ResponseEntity<ApiResponse<String>> sendPaymentNotification(
            @PathVariable("userId") Long userId,
            @RequestParam String message,
            @RequestParam String status) {
        notificationService.sendPaymentNotification(userId, message, status);
        return ResponseEntity.ok(ApiResponse.success("Payment notification sent", message));
    }
} 