package com.mytech.apartment.portal.mappers;

import com.mytech.apartment.portal.dtos.ApartmentInvitationDto;
import com.mytech.apartment.portal.models.ApartmentInvitation;
import org.springframework.stereotype.Component;

@Component
public class ApartmentInvitationMapper {

    public ApartmentInvitationDto toDto(ApartmentInvitation entity) {
        if (entity == null) {
            return null;
        }
        ApartmentInvitationDto dto = new ApartmentInvitationDto();
        dto.setId(entity.getId());
        dto.setCode(entity.getCode());
        dto.setApartmentId(entity.getApartmentId());
        dto.setUsed(entity.isUsed());
        dto.setUsedByUserId(entity.getUsedByUserId());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setExpiresAt(entity.getExpiresAt());
        return dto;
    }

    public ApartmentInvitation toEntity(ApartmentInvitationDto dto) {
        if (dto == null) {
            return null;
        }
        ApartmentInvitation entity = new ApartmentInvitation();
        entity.setId(dto.getId());
        entity.setCode(dto.getCode());
        entity.setApartmentId(dto.getApartmentId());
        entity.setUsed(dto.isUsed());
        entity.setUsedByUserId(dto.getUsedByUserId());
        entity.setCreatedAt(dto.getCreatedAt());
        entity.setExpiresAt(dto.getExpiresAt());
        return entity;
    }
} 