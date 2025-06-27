package com.mytech.apartment.portal.mappers;

import com.mytech.apartment.portal.dtos.ApartmentResidentDto;
import com.mytech.apartment.portal.models.ApartmentResident;
import com.mytech.apartment.portal.models.ApartmentResidentId;
import org.springframework.stereotype.Component;

@Component
public class ApartmentResidentMapper {

    public ApartmentResidentDto toDto(ApartmentResident entity) {
        if (entity == null) {
            return null;
        }
        ApartmentResidentDto dto = new ApartmentResidentDto();
        if (entity.getId() != null) {
            dto.setApartmentId(entity.getId().getApartmentId());
            dto.setUserId(entity.getId().getUserId());
        }
        dto.setRelationType(entity.getRelationType());
        dto.setMoveInDate(entity.getMoveInDate());
        dto.setMoveOutDate(entity.getMoveOutDate());
        return dto;
    }

    public ApartmentResident toEntity(ApartmentResidentDto dto) {
        if (dto == null) {
            return null;
        }
        ApartmentResident entity = new ApartmentResident();
        ApartmentResidentId id = new ApartmentResidentId(dto.getApartmentId(), dto.getUserId());
        entity.setId(id);
        entity.setRelationType(dto.getRelationType());
        entity.setMoveInDate(dto.getMoveInDate());
        entity.setMoveOutDate(dto.getMoveOutDate());
        return entity;
    }
} 