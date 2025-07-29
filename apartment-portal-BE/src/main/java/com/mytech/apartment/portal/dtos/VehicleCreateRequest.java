package com.mytech.apartment.portal.dtos;

import com.mytech.apartment.portal.models.enums.VehicleType;
import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
public class VehicleCreateRequest {
    @NotBlank(message = "Biển số xe không được để trống")
    private String licensePlate;

    @NotNull(message = "Loại phương tiện không được để trống")
    private VehicleType vehicleType;

    private String[] imageUrls;

    private String brand;

    private String model;

    private String color;
} 