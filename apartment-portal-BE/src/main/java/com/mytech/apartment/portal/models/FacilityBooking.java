package com.mytech.apartment.portal.models;

import com.mytech.apartment.portal.models.enums.FacilityBookingStatus;
import com.mytech.apartment.portal.models.enums.PaymentStatus;
import com.mytech.apartment.portal.models.enums.PaymentMethod;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

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
    
    @Column(name = "start_time")
    private LocalDateTime bookingTime;
    
    @Column(name = "end_time")
    private LocalDateTime endTime;
    
    @Column(name = "duration")
    private Integer duration;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private FacilityBookingStatus status;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "number_of_people")
    private Integer numberOfPeople;
    
    @Column(name = "purpose")
    private String purpose;
    
    // QR Code fields
    @Column(name = "qr_code")
    private String qrCode;
    
    @Column(name = "qr_expires_at")
    private LocalDateTime qrExpiresAt;
    
    @Column(name = "checked_in_count")
    private Integer checkedInCount = 0;
    
    @Column(name = "max_checkins")
    private Integer maxCheckins;
    
    @Column(name = "checkin_window_minutes")
    private Integer checkinWindowMinutes = 30; // Cửa sổ check-in trước giờ booking
    
    // One-to-many relationship với check-in records
    @OneToMany(mappedBy = "facilityBooking", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<FacilityCheckIn> checkIns;
    
    // Payment fields
    @Column(name = "total_cost")
    private Double totalCost;
    
    @Column(name = "payment_status")
    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;
    
    @Column(name = "payment_method")
    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;
    
    @Column(name = "payment_date")
    private LocalDateTime paymentDate;
    
    @Column(name = "transaction_id")
    private String transactionId;
} 