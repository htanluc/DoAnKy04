package com.mytech.apartment.portal.mappers;

import com.mytech.apartment.portal.dtos.FacilityDto;
import com.mytech.apartment.portal.models.Facility;
import org.springframework.stereotype.Component;

@Component
public class FacilityMapper {

    public FacilityDto toDto(Facility facility) {
        if (facility == null) {
            return null;
        }

        FacilityDto dto = new FacilityDto();
        dto.setId(facility.getId());
        dto.setName(facility.getName());
        dto.setDescription(facility.getDescription());
        dto.setCapacity(facility.getCapacity());
        dto.setOtherDetails(facility.getOtherDetails());
        dto.setUsageFee(facility.getUsageFee());
        
        return dto;
    }

    public Facility toEntity(FacilityDto dto) {
        if (dto == null) {
            return null;
        }

        Facility facility = new Facility();
        facility.setId(dto.getId());
        facility.setName(dto.getName());
        facility.setDescription(dto.getDescription());
        facility.setCapacity(dto.getCapacity());
        facility.setOtherDetails(dto.getOtherDetails());
        facility.setUsageFee(dto.getUsageFee());
        
        return facility;
    }
} 