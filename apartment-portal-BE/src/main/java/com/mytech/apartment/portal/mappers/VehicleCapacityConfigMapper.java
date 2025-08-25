package com.mytech.apartment.portal.mappers;

import com.mytech.apartment.portal.dtos.VehicleCapacityConfigDto;
import com.mytech.apartment.portal.dtos.VehicleCapacityConfigRequest;
import com.mytech.apartment.portal.models.VehicleCapacityConfig;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface VehicleCapacityConfigMapper {
    
    @Mapping(target = "currentCars", ignore = true)
    @Mapping(target = "currentMotorcycles", ignore = true)
    @Mapping(target = "remainingCars", ignore = true)
    @Mapping(target = "remainingMotorcycles", ignore = true)
    VehicleCapacityConfigDto toDto(VehicleCapacityConfig entity);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    VehicleCapacityConfig toEntity(VehicleCapacityConfigRequest dto);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    VehicleCapacityConfig toEntity(VehicleCapacityConfigDto dto);
}
