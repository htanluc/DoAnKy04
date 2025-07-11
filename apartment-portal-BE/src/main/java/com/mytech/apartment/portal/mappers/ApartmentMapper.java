package com.mytech.apartment.portal.mappers;

import com.mytech.apartment.portal.dtos.ApartmentCreateRequest;
import com.mytech.apartment.portal.dtos.ApartmentDto;
import com.mytech.apartment.portal.dtos.ApartmentUpdateRequest;
import com.mytech.apartment.portal.models.Apartment;
import com.mytech.apartment.portal.models.enums.ApartmentStatus;
import org.springframework.stereotype.Component;

@Component
public class ApartmentMapper {

    public ApartmentDto toDto(Apartment entity) {
        if (entity == null) {
            return null;
        }
        ApartmentDto dto = new ApartmentDto();
        dto.setId(entity.getId());
        dto.setBuildingId(entity.getBuildingId());
        dto.setFloorNumber(entity.getFloorNumber());
        dto.setUnitNumber(entity.getUnitNumber());
        dto.setArea(entity.getArea());
        dto.setStatus(entity.getStatus() != null ? entity.getStatus().name() : null);
        return dto;
    }

    public Apartment toEntity(ApartmentCreateRequest request) {
        if (request == null) {
            return null;
        }
        Apartment entity = new Apartment();
        entity.setBuildingId(request.getBuildingId());
        entity.setFloorNumber(request.getFloorNumber());
        entity.setUnitNumber(request.getUnitNumber());
        entity.setArea(request.getArea());
        entity.setStatus(request.getStatus() != null ? ApartmentStatus.valueOf(request.getStatus()) : null); // Or a default status
        return entity;
    }

    public void updateEntityFromRequest(Apartment entity, ApartmentUpdateRequest request) {
        if (entity == null || request == null) {
            return;
        }
        if (request.getBuildingId() != null) {
            entity.setBuildingId(request.getBuildingId());
        }
        if (request.getFloorNumber() != null) {
            entity.setFloorNumber(request.getFloorNumber());
        }
        if (request.getUnitNumber() != null) {
            entity.setUnitNumber(request.getUnitNumber());
        }
        if (request.getArea() != null) {
            entity.setArea(request.getArea());
        }
        if (request.getStatus() != null) {
            entity.setStatus(ApartmentStatus.valueOf(request.getStatus()));
        }
    }
} 