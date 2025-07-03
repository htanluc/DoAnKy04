package com.mytech.apartment.portal.models;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "recurring_bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecurringBooking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "facility_id")
    private Facility facility;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String pattern;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDateTime createdAt;
} 