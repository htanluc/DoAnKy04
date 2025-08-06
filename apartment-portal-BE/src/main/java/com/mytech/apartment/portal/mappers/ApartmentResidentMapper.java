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
    @Mapping(target = "userFullName", source = "user.fullName")
    @Mapping(target = "userEmail", source = "user.email")
    @Mapping(target = "userPhoneNumber", source = "user.phoneNumber")
    @Mapping(target = "relationTypeDisplayName", source = "relationType.displayName")
    ApartmentResidentDto toDto(ApartmentResident entity);

    @Mapping(target = "apartment", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    ApartmentResident toEntity(ApartmentResidentDto dto);
} 