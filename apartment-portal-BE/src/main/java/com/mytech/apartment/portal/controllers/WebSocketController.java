package com.mytech.apartment.portal.controllers;
import lombok.Data;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;

@Controller
public class WebSocketController {

    @MessageMapping("/send-message")
    @SendTo("/topic/messages")
    public ChatMessage handleMessage(ChatMessage message) {
        message.setTimestamp(LocalDateTime.now());
        return message;
    }

    // Chat theo yêu cầu hỗ trợ cụ thể
    @MessageMapping("/support-requests/{id}/chat")
    @SendTo("/topic/support-requests/{id}/chat")
    public ChatMessage handleRequestChat(@DestinationVariable("id") Long id, ChatMessage message) {
        message.setTimestamp(LocalDateTime.now());
        return message;
    }

    @MessageMapping("/join-apartment")
    @SendTo("/topic/apartment/{apartmentId}/users")
    public UserJoinMessage handleJoinApartment(UserJoinMessage message) {
        message.setTimestamp(LocalDateTime.now());
        return message;
    }

    @MessageMapping("/leave-apartment")
    @SendTo("/topic/apartment/{apartmentId}/users")
    public UserLeaveMessage handleLeaveApartment(UserLeaveMessage message) {
        message.setTimestamp(LocalDateTime.now());
        return message;
    }

    @Data
    public static class ChatMessage {
        private String content;
        private String sender;
        private LocalDateTime timestamp;
    }

    @Data
    public static class UserJoinMessage {
        private Long userId;
        private String username;
        private Long apartmentId;
        private LocalDateTime timestamp;
    }

    @Data
    public static class UserLeaveMessage {
        private Long userId;
        private String username;
        private Long apartmentId;
        private LocalDateTime timestamp;
    }
} 