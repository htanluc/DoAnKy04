package com.mytech.apartment.portal.mappers;

import com.mytech.apartment.portal.dtos.BuildingCreateRequest;
import com.mytech.apartment.portal.dtos.BuildingDto;
import com.mytech.apartment.portal.dtos.BuildingUpdateRequest;
import com.mytech.apartment.portal.models.Building;
import org.springframework.stereotype.Component;

@Component
public class BuildingMapper {

    public BuildingDto toDto(Building entity) {
        if (entity == null) {
            return null;
        }
        BuildingDto dto = new BuildingDto();
        dto.setId(entity.getId());
        dto.setBuildingName(entity.getBuildingName());
        dto.setAddress(entity.getAddress());
        dto.setFloors(entity.getFloors());
        dto.setDescription(entity.getDescription());
        return dto;
    }

    public Building toEntity(BuildingCreateRequest request) {
        if (request == null) {
            return null;
        }
        Building entity = new Building();
        entity.setBuildingName(request.getBuildingName());
        entity.setAddress(request.getAddress());
        entity.setFloors(request.getFloors());
        entity.setDescription(request.getDescription());
        return entity;
    }

    public void updateEntityFromRequest(Building entity, BuildingUpdateRequest request) {
        if (entity == null || request == null) {
            return;
        }
        if (request.getBuildingName() != null) {
            entity.setBuildingName(request.getBuildingName());
        }
        if (request.getAddress() != null) {
            entity.setAddress(request.getAddress());
        }
        if (request.getFloors() != null) {
            entity.setFloors(request.getFloors());
        }
        if (request.getDescription() != null) {
            entity.setDescription(request.getDescription());
        }
    }
} 