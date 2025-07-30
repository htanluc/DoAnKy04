package com.mytech.apartment.portal.services;

import lombok.Data;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    public NotificationService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void sendGlobalNotification(String message) {
        NotificationDto notification = new NotificationDto();
        notification.setMessage(message);
        notification.setTimestamp(LocalDateTime.now());
        notification.setType("GLOBAL");
        
        messagingTemplate.convertAndSend("/topic/notifications", notification);
    }

    public void sendUserNotification(Long userId, String message) {
        NotificationDto notification = new NotificationDto();
        notification.setMessage(message);
        notification.setTimestamp(LocalDateTime.now());
        notification.setType("USER");
        
        messagingTemplate.convertAndSendToUser(
            userId.toString(), 
            "/queue/notifications", 
            notification
        );
    }

    public void sendApartmentNotification(Long apartmentId, String message) {
        NotificationDto notification = new NotificationDto();
        notification.setMessage(message);
        notification.setTimestamp(LocalDateTime.now());
        notification.setType("APARTMENT");
        
        messagingTemplate.convertAndSend("/topic/apartment/" + apartmentId + "/notifications", notification);
    }

    public void sendPaymentNotification(Long userId, String message, String status) {
        PaymentNotificationDto notification = new PaymentNotificationDto();
        notification.setMessage(message);
        notification.setTimestamp(LocalDateTime.now());
        notification.setType("PAYMENT");
        notification.setStatus(status);
        
        messagingTemplate.convertAndSendToUser(
            userId.toString(), 
            "/queue/payment-notifications", 
            notification
        );
    }

    @Data
    public static class NotificationDto {
        private String message;
        private LocalDateTime timestamp;
        private String type;
    }

    @Data
    public static class PaymentNotificationDto {
        private String message;
        private LocalDateTime timestamp;
        private String type;
        private String status;
    }
} 