package com.mytech.apartment.portal.models;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "water_meter_readings")
@Data
public class WaterMeterReading {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "apartment_id", nullable = false)
    private Long apartmentId;

    @Column(name = "reading_date", nullable = false)
    private LocalDate readingDate;

    @Column(name = "meter_reading", nullable = false, precision = 10, scale = 2)
    private BigDecimal meterReading;

    @Column(name = "consumption", precision = 10, scale = 2)
    private BigDecimal consumption;

    @Column(name = "unit_price", precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "total_amount", precision = 15, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "recorded_by", nullable = false)
    private Long recordedBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    /**
     * Set createdAt khi insert hoặc update.
     */
    @PrePersist
    @PreUpdate
    public void setCreatedAt() {
        // Luôn cập nhật thời gian khi có thay đổi để admin biết thời điểm ghi cuối cùng
        this.createdAt = LocalDateTime.now();
    }
}
