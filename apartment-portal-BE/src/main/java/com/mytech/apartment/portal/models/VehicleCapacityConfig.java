package com.mytech.apartment.portal.models;

import com.mytech.apartment.portal.models.enums.VehicleType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "vehicle_capacity_config")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleCapacityConfig {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "building_id", nullable = false)
    private Long buildingId;
    
    @Column(name = "max_cars", nullable = false)
    @Builder.Default
    private Integer maxCars = 0;
    
    @Column(name = "max_motorcycles", nullable = false)
    @Builder.Default
    private Integer maxMotorcycles = 0;
    
    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    /**
     * Lấy giới hạn tối đa cho loại xe cụ thể
     */
    public Integer getMaxCapacityForVehicleType(VehicleType vehicleType) {
        switch (vehicleType) {
            case CAR_4_SEATS:
            case CAR_7_SEATS:
            case ELECTRIC_CAR:
                return maxCars;
            case MOTORCYCLE:
            case ELECTRIC_MOTORCYCLE:
                return maxMotorcycles;
            default:
                return 0; // Không hỗ trợ loại xe khác
        }
    }
    
    /**
     * Kiểm tra xem có thể thêm xe mới không
     */
    public boolean canAddVehicle(VehicleType vehicleType, Integer currentCount) {
        Integer maxCapacity = getMaxCapacityForVehicleType(vehicleType);
        return maxCapacity > 0 && currentCount < maxCapacity;
    }
    
    /**
     * Lấy số lượng còn lại cho loại xe
     */
    public Integer getRemainingCapacity(VehicleType vehicleType, Integer currentCount) {
        Integer maxCapacity = getMaxCapacityForVehicleType(vehicleType);
        return Math.max(0, maxCapacity - currentCount);
    }
}
