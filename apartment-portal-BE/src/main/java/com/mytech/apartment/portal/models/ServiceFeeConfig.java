package com.mytech.apartment.portal.models;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "service_fee_config",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"month", "year"})
    }
)
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

    private Double serviceFeePerM2;    // Giá dịch vụ/m2
    private Double waterFeePerM3;      // Giá nước/m3
    
    // Phí gửi xe theo loại
    private Double motorcycleFee;      // Phí gửi xe máy/tháng
    private Double car4SeatsFee;       // Phí gửi ô tô 4 chỗ/tháng
    private Double car7SeatsFee;       // Phí gửi ô tô 7 chỗ/tháng

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