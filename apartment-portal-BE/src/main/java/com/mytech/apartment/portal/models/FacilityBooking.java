package com.mytech.apartment.portal.models;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import com.mytech.apartment.portal.models.enums.FacilityBookingStatus;

@Entity
@Table(name = "facility_bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FacilityBooking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "facility_id")
    private Facility facility;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private LocalDateTime bookingTime;
    private Integer duration;
    private FacilityBookingStatus status;
    private Integer numberOfPeople;
    private String purpose;

    @ManyToOne
    @JoinColumn(name = "approved_by")
    private User approvedBy;

    private LocalDateTime approvedAt;
    private LocalDateTime createdAt;
} 