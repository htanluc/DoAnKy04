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
        dto.setLocation(facility.getLocation());
        dto.setCapacity(facility.getCapacity());
        dto.setCapacityType(facility.getCapacityType());
        dto.setGroupSize(facility.getGroupSize());
        dto.setOtherDetails(facility.getOtherDetails());
        dto.setUsageFee(facility.getUsageFee());
        dto.setOpeningHours(facility.getOpeningHours());
        dto.setOpeningSchedule(facility.getOpeningSchedule());
        dto.setStatus("AVAILABLE");
        dto.setIsVisible(facility.getIsVisible());
        
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
        facility.setLocation(dto.getLocation());
        facility.setCapacity(dto.getCapacity());
        facility.setCapacityType(dto.getCapacityType());
        facility.setGroupSize(dto.getGroupSize());
        facility.setOtherDetails(dto.getOtherDetails());
        facility.setUsageFee(dto.getUsageFee());
        facility.setOpeningHours(dto.getOpeningHours());
        facility.setOpeningSchedule(dto.getOpeningSchedule());
        facility.setIsVisible(dto.getIsVisible());
        
        return facility;
    }
} 