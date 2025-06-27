package com.mytech.apartment.portal.models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "apartment_invitations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApartmentInvitation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(name = "apartment_id", nullable = false)
    private Long apartmentId;

    @Column(nullable = false)
    private boolean used;

    @Column(name = "used_by_user_id")
    private Long usedByUserId;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;
}
