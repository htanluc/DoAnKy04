package com.mytech.apartment.portal.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import com.mytech.apartment.portal.dtos.ApartmentResidentDto;
import com.mytech.apartment.portal.models.ApartmentResident;

@Mapper(componentModel = "spring")
public interface ApartmentResidentMapper {

    @Mapping(target = "apartmentId", source = "apartment.id")
    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "apartmentUnitNumber", source = "apartment.unitNumber")
    @Mapping(target = "buildingName", expression = "java(getBuildingName(entity.getApartment().getBuildingId()))") // Map tên tòa nhà
    @Mapping(target = "userFullName", source = "user.fullName")
    @Mapping(target = "userEmail", source = "user.email")
    @Mapping(target = "userPhoneNumber", source = "user.phoneNumber")
    @Mapping(target = "relationTypeDisplayName", source = "relationType.displayName")
    ApartmentResidentDto toDto(ApartmentResident entity);
    
    // Helper method để lấy tên building
    default String getBuildingName(Long buildingId) {
        // Tạm thời trả về null, sẽ được xử lý trong service
        return null;
    }

    @Mapping(target = "apartment", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    ApartmentResident toEntity(ApartmentResidentDto dto);
} 