package com.mytech.apartment.portal.models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import com.mytech.apartment.portal.models.enums.EventRegistrationStatus;

@Entity
@Table(name = "event_registrations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventRegistration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @CreationTimestamp
    @Column(name = "registered_at", updatable = false)
    private LocalDateTime registeredAt;

    @Column(nullable = false)
    private EventRegistrationStatus status; // REGISTERED, CANCELLED...
    
    @Column(name = "qr_code")
    private String qrCode;
    
    @Column(name = "qr_expires_at")
    private LocalDateTime qrExpiresAt;
    
    @Column(name = "checked_in", nullable = false)
    private Boolean checkedIn = false;
    
    @Column(name = "checked_in_at")
    private LocalDateTime checkedInAt;
}