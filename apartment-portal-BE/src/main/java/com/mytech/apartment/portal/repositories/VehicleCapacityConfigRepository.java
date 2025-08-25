package com.mytech.apartment.portal.repositories;

import com.mytech.apartment.portal.models.VehicleCapacityConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleCapacityConfigRepository extends JpaRepository<VehicleCapacityConfig, Long> {
    
    /**
     * Tìm cấu hình giới hạn xe theo building ID
     */
    Optional<VehicleCapacityConfig> findByBuildingId(Long buildingId);
    
    /**
     * Tìm cấu hình giới hạn xe theo building ID và trạng thái active
     */
    Optional<VehicleCapacityConfig> findByBuildingIdAndIsActiveTrue(Long buildingId);
    
    /**
     * Tìm tất cả cấu hình giới hạn xe đang active
     */
    List<VehicleCapacityConfig> findByIsActiveTrue();
    
    /**
     * Kiểm tra xem building có cấu hình giới hạn xe không
     */
    boolean existsByBuildingId(Long buildingId);
    
    /**
     * Đếm số lượng xe hiện tại theo loại xe và building
     */
    @Query("SELECT COUNT(v) FROM Vehicle v " +
           "JOIN v.apartment a " +
           "WHERE a.buildingId = :buildingId " +
           "AND v.vehicleType = :vehicleType " +
           "AND v.status = 'APPROVED'")
    Long countVehiclesByBuildingAndType(@Param("buildingId") Long buildingId, 
                                       @Param("vehicleType") String vehicleType);
}
