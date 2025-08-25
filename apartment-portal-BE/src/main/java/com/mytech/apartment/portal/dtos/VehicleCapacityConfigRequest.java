package com.mytech.apartment.portal.dtos;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleCapacityConfigRequest {
    
    @NotNull(message = "buildingId không được để trống")
    private Long buildingId;
    
    @Min(value = 0, message = "Số lượng xe tối đa không được âm")
    @Builder.Default
    private Integer maxCars = 0;
    
    @Min(value = 0, message = "Số lượng xe tối đa không được âm")
    @Builder.Default
    private Integer maxMotorcycles = 0;
    
    @Builder.Default
    private Boolean isActive = true;
}
