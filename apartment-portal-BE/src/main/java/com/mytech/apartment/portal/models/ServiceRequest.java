package com.mytech.apartment.portal.models;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import com.mytech.apartment.portal.models.enums.ServiceRequestStatus;
import com.mytech.apartment.portal.models.enums.ServiceRequestPriority;

@Entity
@Table(name = "service_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    private String title; // <-- Thêm dòng này
    @ManyToOne
    @JoinColumn(name = "category")
    private ServiceCategory category;

    private String description;
    private String imageAttachment;
    private LocalDateTime submittedAt;

    @ManyToOne
    @JoinColumn(name = "assigned_to")
    private User assignedTo;

    private LocalDateTime assignedAt;

    @Enumerated(EnumType.ORDINAL)
    private ServiceRequestStatus status;

    @Enumerated(EnumType.ORDINAL)
    private ServiceRequestPriority priority;
    private String resolutionNotes;
    private LocalDateTime completedAt;
    private Integer rating;
} 