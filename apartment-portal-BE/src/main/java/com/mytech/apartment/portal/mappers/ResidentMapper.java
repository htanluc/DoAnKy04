package com.mytech.apartment.portal.mappers;

import com.mytech.apartment.portal.dtos.ResidentCreateRequest;
import com.mytech.apartment.portal.dtos.ResidentDto;
import com.mytech.apartment.portal.dtos.ResidentUpdateRequest;
import com.mytech.apartment.portal.models.Resident;
import org.springframework.stereotype.Component;

@Component
public class ResidentMapper {

    public ResidentDto toDto(Resident entity) {
        if (entity == null) {
            return null;
        }
        ResidentDto dto = new ResidentDto();
        dto.setId(entity.getId());
        dto.setUserId(entity.getUserId());
        dto.setFullName(entity.getFullName());
        dto.setDateOfBirth(entity.getDateOfBirth());
        dto.setIdCardNumber(entity.getIdCardNumber());
        dto.setFamilyRelation(entity.getFamilyRelation());
        return dto;
    }

    public Resident toEntity(ResidentCreateRequest request) {
        if (request == null) {
            return null;
        }
        Resident entity = new Resident();
        entity.setFullName(request.getFullName());
        entity.setDateOfBirth(request.getDateOfBirth());
        entity.setIdCardNumber(request.getIdCardNumber());
        entity.setFamilyRelation(request.getFamilyRelation());
        return entity;
    }

    public void updateEntityFromRequest(Resident entity, ResidentUpdateRequest request) {
        if (entity == null || request == null) {
            return;
        }
        if (request.getFullName() != null) {
            entity.setFullName(request.getFullName());
        }
        if (request.getDateOfBirth() != null) {
            entity.setDateOfBirth(request.getDateOfBirth());
        }
        if (request.getIdCardNumber() != null) {
            entity.setIdCardNumber(request.getIdCardNumber());
        }
        if (request.getFamilyRelation() != null) {
            entity.setFamilyRelation(request.getFamilyRelation());
        }
    }
}