package com.mytech.apartment.portal.mappers;

import com.mytech.apartment.portal.dtos.VehicleCreateRequest;
import com.mytech.apartment.portal.dtos.VehicleDto;
import com.mytech.apartment.portal.models.Vehicle;
import com.mytech.apartment.portal.models.enums.VehicleType;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface VehicleMapper {

    @Mapping(target = "vehicleTypeDisplayName", source = "vehicleType.displayName")
    @Mapping(target = "statusDisplayName", source = "status.displayName")
    @Mapping(target = "userFullName", ignore = true)
    @Mapping(target = "residentFullName", source = "resident.fullName")
    @Mapping(target = "imageUrls", source = "imageUrls", qualifiedByName = "stringToArray")
    VehicleDto toDto(Vehicle entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", constant = "PENDING")
    @Mapping(target = "monthlyFee", source = "vehicleType", qualifiedByName = "calculateMonthlyFee")
    @Mapping(target = "resident", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "imageUrls", source = "imageUrls", qualifiedByName = "arrayToString")
    Vehicle toEntity(VehicleCreateRequest dto);

    @Named("calculateMonthlyFee")
    default java.math.BigDecimal calculateMonthlyFee(VehicleType vehicleType) {
        return vehicleType != null ? vehicleType.getMonthlyFee() : java.math.BigDecimal.ZERO;
    }

    @Named("stringToArray")
    default String[] stringToArray(String imageUrls) {
        if (imageUrls == null || imageUrls.trim().isEmpty()) {
            return new String[0];
        }
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(imageUrls, String[].class);
        } catch (JsonProcessingException e) {
            return new String[0];
        }
    }

    @Named("arrayToString")
    default String arrayToString(String[] imageUrls) {
        if (imageUrls == null || imageUrls.length == 0) {
            return null;
        }
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.writeValueAsString(imageUrls);
        } catch (JsonProcessingException e) {
            return null;
        }
    }
} 