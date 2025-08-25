package com.mytech.apartment.portal.apis;

import com.mytech.apartment.portal.dtos.VehicleCapacityConfigDto;
import com.mytech.apartment.portal.dtos.VehicleCapacityConfigRequest;
import com.mytech.apartment.portal.services.VehicleCapacityConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/vehicle-capacity-config")
@RequiredArgsConstructor
public class VehicleCapacityConfigController {
    
    private final VehicleCapacityConfigService vehicleCapacityConfigService;
    
    /**
     * Tạo cấu hình giới hạn xe mới
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<VehicleCapacityConfigDto> createConfig(@Valid @RequestBody VehicleCapacityConfigRequest request) {
        try {
            VehicleCapacityConfigDto config = vehicleCapacityConfigService.createConfig(request);
            return ResponseEntity.ok(config);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Cập nhật cấu hình giới hạn xe
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<VehicleCapacityConfigDto> updateConfig(
            @PathVariable Long id,
            @Valid @RequestBody VehicleCapacityConfigRequest request) {
        try {
            VehicleCapacityConfigDto config = vehicleCapacityConfigService.updateConfig(id, request);
            return ResponseEntity.ok(config);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Lấy cấu hình giới hạn xe theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<VehicleCapacityConfigDto> getConfigById(@PathVariable Long id) {
        try {
            VehicleCapacityConfigDto config = vehicleCapacityConfigService.getConfigById(id);
            return ResponseEntity.ok(config);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Lấy cấu hình giới hạn xe theo building ID
     */
    @GetMapping("/building/{buildingId}")
    public ResponseEntity<VehicleCapacityConfigDto> getConfigByBuildingId(@PathVariable Long buildingId) {
        try {
            VehicleCapacityConfigDto config = vehicleCapacityConfigService.getConfigByBuildingId(buildingId);
            return ResponseEntity.ok(config);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Lấy tất cả cấu hình giới hạn xe
     */
    @GetMapping
    public ResponseEntity<List<VehicleCapacityConfigDto>> getAllConfigs() {
        try {
            List<VehicleCapacityConfigDto> configs = vehicleCapacityConfigService.getAllConfigs();
            return ResponseEntity.ok(configs);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Xóa cấu hình giới hạn xe
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<Void> deleteConfig(@PathVariable Long id) {
        try {
            vehicleCapacityConfigService.deleteConfig(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Kiểm tra xem có thể thêm xe mới không
     */
    @GetMapping("/check-capacity")
    public ResponseEntity<Boolean> checkCapacity(
            @RequestParam Long buildingId,
            @RequestParam String vehicleType) {
        try {
            boolean canAdd = vehicleCapacityConfigService.canAddVehicle(buildingId, 
                com.mytech.apartment.portal.models.enums.VehicleType.valueOf(vehicleType));
            return ResponseEntity.ok(canAdd);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Toggle trạng thái kích hoạt của cấu hình giới hạn xe
     */
    @PatchMapping("/{id}/toggle-status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<VehicleCapacityConfigDto> toggleStatus(@PathVariable Long id) {
        try {
            VehicleCapacityConfigDto config = vehicleCapacityConfigService.toggleStatus(id);
            return ResponseEntity.ok(config);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
