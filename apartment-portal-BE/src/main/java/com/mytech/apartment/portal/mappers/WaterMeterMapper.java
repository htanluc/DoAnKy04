package com.mytech.apartment.portal.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;

import com.mytech.apartment.portal.models.WaterMeterReading;
import com.mytech.apartment.portal.dtos.WaterMeterReadingDto;

import java.time.format.DateTimeFormatter;

@Mapper(componentModel = "spring")
public interface WaterMeterMapper {

    @Mapping(target = "consumption", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "meterReading", source = "currentReading")
    @Mapping(target = "readingDate", source = "readingDate")
    WaterMeterReading toEntity(WaterMeterReadingDto dto);

    @Mapping(target = "readingMonth", source = "readingDate", qualifiedByName = "dateToMonth")
    @Mapping(target = "previousReading", ignore = true)
    @Mapping(target = "currentReading", source = "meterReading")
    @Mapping(target = "apartmentName", ignore = true)
    @Mapping(target = "recordedAt", source = "createdAt")
    @Mapping(target = "recordedByName", ignore = true)
    WaterMeterReadingDto toDto(WaterMeterReading entity);

    /**
     * Cập nhật entity từ DTO (dùng cho PUT)
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "consumption", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "readingDate", ignore = true)
    @Mapping(target = "meterReading", source = "currentReading")
    void updateEntityFromDto(WaterMeterReadingDto dto, @MappingTarget WaterMeterReading entity);

    @Named("dateToMonth")
    default String dateToMonth(java.time.LocalDate date) {
        if (date == null) return null;
        return date.format(DateTimeFormatter.ofPattern("yyyy-MM"));
    }
}
