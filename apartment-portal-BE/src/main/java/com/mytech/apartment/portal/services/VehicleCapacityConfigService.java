package com.mytech.apartment.portal.services;

import com.mytech.apartment.portal.dtos.VehicleCapacityConfigDto;
import com.mytech.apartment.portal.dtos.VehicleCapacityConfigRequest;
import com.mytech.apartment.portal.mappers.VehicleCapacityConfigMapper;
import com.mytech.apartment.portal.models.VehicleCapacityConfig;
import com.mytech.apartment.portal.models.enums.VehicleType;
import com.mytech.apartment.portal.repositories.VehicleCapacityConfigRepository;
import com.mytech.apartment.portal.repositories.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class VehicleCapacityConfigService {
    
    private final VehicleCapacityConfigRepository vehicleCapacityConfigRepository;
    private final VehicleRepository vehicleRepository;
    private final VehicleCapacityConfigMapper mapper;
    
    /**
     * Tạo cấu hình giới hạn xe mới
     */
    public VehicleCapacityConfigDto createConfig(VehicleCapacityConfigRequest request) {
        // Kiểm tra xem building đã có cấu hình chưa
        if (vehicleCapacityConfigRepository.existsByBuildingId(request.getBuildingId())) {
            throw new RuntimeException("Tòa nhà này đã có cấu hình giới hạn xe");
        }
        
        VehicleCapacityConfig config = mapper.toEntity(request);
        VehicleCapacityConfig savedConfig = vehicleCapacityConfigRepository.save(config);
        return mapper.toDto(savedConfig);
    }
    
    /**
     * Cập nhật cấu hình giới hạn xe
     */
    public VehicleCapacityConfigDto updateConfig(Long id, VehicleCapacityConfigRequest request) {
        VehicleCapacityConfig config = vehicleCapacityConfigRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cấu hình giới hạn xe"));
        
        // Cập nhật thông tin
        config.setMaxCars(request.getMaxCars());
        config.setMaxMotorcycles(request.getMaxMotorcycles());
        config.setIsActive(request.getIsActive());
        
        VehicleCapacityConfig updatedConfig = vehicleCapacityConfigRepository.save(config);
        return mapper.toDto(updatedConfig);
    }
    
    /**
     * Lấy cấu hình giới hạn xe theo ID
     */
    public VehicleCapacityConfigDto getConfigById(Long id) {
        VehicleCapacityConfig config = vehicleCapacityConfigRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cấu hình giới hạn xe"));
        
        VehicleCapacityConfigDto dto = mapper.toDto(config);
        populateCurrentVehicleCounts(dto, config.getBuildingId());
        return dto;
    }
    
    /**
     * Lấy cấu hình giới hạn xe theo building ID
     */
    public VehicleCapacityConfigDto getConfigByBuildingId(Long buildingId) {
        VehicleCapacityConfig config = vehicleCapacityConfigRepository.findByBuildingIdAndIsActiveTrue(buildingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cấu hình giới hạn xe cho tòa nhà này"));
        
        VehicleCapacityConfigDto dto = mapper.toDto(config);
        populateCurrentVehicleCounts(dto, buildingId);
        return dto;
    }
    
    /**
     * Lấy tất cả cấu hình giới hạn xe
     */
    public List<VehicleCapacityConfigDto> getAllConfigs() {
        List<VehicleCapacityConfig> configs = vehicleCapacityConfigRepository.findAll();
        return configs.stream()
                .map(config -> {
                    VehicleCapacityConfigDto dto = mapper.toDto(config);
                    populateCurrentVehicleCounts(dto, config.getBuildingId());
                    return dto;
                })
                .collect(Collectors.toList());
    }
    
    /**
     * Xóa cấu hình giới hạn xe
     */
    public void deleteConfig(Long id) {
        if (!vehicleCapacityConfigRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy cấu hình giới hạn xe");
        }
        vehicleCapacityConfigRepository.deleteById(id);
    }
    
    /**
     * Toggle trạng thái kích hoạt của cấu hình giới hạn xe
     */
    public VehicleCapacityConfigDto toggleStatus(Long id) {
        VehicleCapacityConfig config = vehicleCapacityConfigRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cấu hình giới hạn xe"));
        
        // Toggle trạng thái
        config.setIsActive(!config.getIsActive());
        
        VehicleCapacityConfig updatedConfig = vehicleCapacityConfigRepository.save(config);
        VehicleCapacityConfigDto dto = mapper.toDto(updatedConfig);
        populateCurrentVehicleCounts(dto, updatedConfig.getBuildingId());
        return dto;
    }
    
    /**
     * Kiểm tra xem có thể thêm xe mới không
     */
    public boolean canAddVehicle(Long buildingId, VehicleType vehicleType) {
        Optional<VehicleCapacityConfig> configOpt = vehicleCapacityConfigRepository.findByBuildingIdAndIsActiveTrue(buildingId);
        if (configOpt.isEmpty()) {
            // Nếu không có cấu hình, cho phép đăng ký
            return true;
        }
        
        VehicleCapacityConfig config = configOpt.get();
        Long currentCount = getCurrentVehicleCount(buildingId, vehicleType);
        return config.canAddVehicle(vehicleType, currentCount.intValue());
    }
    
    /**
     * Lấy số lượng xe hiện tại theo loại và building
     */
    private Long getCurrentVehicleCount(Long buildingId, VehicleType vehicleType) {
        return vehicleRepository.countApprovedByBuildingAndVehicleType(buildingId, vehicleType);
    }
    
    /**
     * Populate thông tin số lượng xe hiện tại
     */
    private void populateCurrentVehicleCounts(VehicleCapacityConfigDto dto, Long buildingId) {
        dto.setCurrentCars(getCurrentVehicleCount(buildingId, VehicleType.CAR_4_SEATS).intValue() + 
                          getCurrentVehicleCount(buildingId, VehicleType.CAR_7_SEATS).intValue() +
                          getCurrentVehicleCount(buildingId, VehicleType.ELECTRIC_CAR).intValue());
        dto.setCurrentMotorcycles(getCurrentVehicleCount(buildingId, VehicleType.MOTORCYCLE).intValue() +
                                 getCurrentVehicleCount(buildingId, VehicleType.ELECTRIC_MOTORCYCLE).intValue());
        
        // Tính toán số lượng còn lại
        dto.setRemainingCars(Math.max(0, dto.getMaxCars() - dto.getCurrentCars()));
        dto.setRemainingMotorcycles(Math.max(0, dto.getMaxMotorcycles() - dto.getCurrentMotorcycles()));
    }
}
