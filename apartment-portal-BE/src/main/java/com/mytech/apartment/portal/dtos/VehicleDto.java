package com.mytech.apartment.portal.dtos;

import com.mytech.apartment.portal.models.enums.VehicleStatus;
import com.mytech.apartment.portal.models.enums.VehicleType;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class VehicleDto {
    private Long id;
    private String licensePlate;
    private VehicleType vehicleType;
    private String vehicleTypeDisplayName;
    private String brand;
    private String model;
    private String color;
    private String[] imageUrls;
    private VehicleStatus status;
    private String statusDisplayName;
    private BigDecimal monthlyFee;
    private String userFullName;
    private Long apartmentId;
    private String apartmentUnitNumber;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime registrationDate;
} 