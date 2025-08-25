package com.mytech.apartment.portal.dtos;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleCapacityConfigDto {
    
    private Long id;
    private Long buildingId;
    private Integer maxCars;
    private Integer maxMotorcycles;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Thông tin số lượng xe hiện tại
    private Integer currentCars;
    private Integer currentMotorcycles;
    
    // Thông tin số lượng còn lại
    private Integer remainingCars;
    private Integer remainingMotorcycles;
}
