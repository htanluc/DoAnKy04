package com.mytech.apartment.portal.models;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "service_fee_config")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceFeeConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer month; // Tháng áp dụng
    private Integer year;  // Năm áp dụng

    private Double parkingFee;         // Giá gửi xe/tháng
    private Double serviceFeePerM2;    // Giá dịch vụ/m2
    private Double waterFeePerM3;      // Giá nước/m3

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
} 