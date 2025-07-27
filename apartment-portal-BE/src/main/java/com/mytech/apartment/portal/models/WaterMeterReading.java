package com.mytech.apartment.portal.models;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "water_meter_readings",
    uniqueConstraints = @UniqueConstraint(columnNames = {"apartment_id", "reading_month"})
)
@Data
public class WaterMeterReading {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long readingId;

    @Column(name = "apartment_id", nullable = false)
    private Integer apartmentId;

    @Column(name = "reading_month", length = 7, nullable = false)
    private String readingMonth; // "yyyy-MM"

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal previousReading;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal currentReading;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal consumption;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    /**
     * Tính consumption và set createdAt khi insert hoặc update.
     */
    @PrePersist
    @PreUpdate
    public void calculateConsumption() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        this.consumption = currentReading.subtract(previousReading);
    }
}
