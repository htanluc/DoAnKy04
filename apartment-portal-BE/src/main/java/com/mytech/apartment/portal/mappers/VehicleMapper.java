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
    @Mapping(target = "userFullName", source = ".", qualifiedByName = "getUserFullName")
    @Mapping(target = "apartmentId", source = "apartment.id")
    @Mapping(target = "apartmentUnitNumber", source = ".", qualifiedByName = "getApartmentUnitNumber")
    @Mapping(target = "registrationDate", source = "createdAt")
    @Mapping(target = "imageUrls", source = "imageUrls", qualifiedByName = "stringToArray")
    VehicleDto toDto(Vehicle entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", constant = "PENDING")
    @Mapping(target = "monthlyFee", source = "vehicleType", qualifiedByName = "calculateMonthlyFee")
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "apartment", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "imageUrls", source = "imageUrls", qualifiedByName = "arrayToString")
    Vehicle toEntity(VehicleCreateRequest dto);

    @Named("calculateMonthlyFee")
    default java.math.BigDecimal calculateMonthlyFee(VehicleType vehicleType) {
        return vehicleType != null ? vehicleType.getMonthlyFee() : java.math.BigDecimal.ZERO;
    }

    @Named("stringToArray")
    default String[] stringToArray(String jsonString) {
        if (jsonString == null || jsonString.trim().isEmpty()) {
            return new String[0];
        }
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(jsonString, String[].class);
        } catch (JsonProcessingException e) {
            return new String[0];
        }
    }

    @Named("arrayToString")
    default String arrayToString(String[] array) {
        if (array == null || array.length == 0) {
            return "[]";
        }
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.writeValueAsString(array);
        } catch (JsonProcessingException e) {
            return "[]";
        }
    }

    @Named("getUserFullName")
    default String getUserFullName(Vehicle vehicle) {
        if (vehicle == null || vehicle.getUser() == null) {
            return "Không rõ";
        }
        String fullName = vehicle.getUser().getFullName();
        return fullName != null && !fullName.trim().isEmpty() ? fullName : "Không rõ";
    }

    @Named("getApartmentUnitNumber")
    default String getApartmentUnitNumber(Vehicle vehicle) {
        if (vehicle == null || vehicle.getApartment() == null) {
            return "Không rõ";
        }
        String unitNumber = vehicle.getApartment().getUnitNumber();
        return unitNumber != null && !unitNumber.trim().isEmpty() ? unitNumber : "Không rõ";
    }
} 