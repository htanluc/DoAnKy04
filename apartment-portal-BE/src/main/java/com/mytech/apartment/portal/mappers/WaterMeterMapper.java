package com.mytech.apartment.portal.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.mytech.apartment.portal.models.WaterMeterReading;
import com.mytech.apartment.portal.dtos.WaterMeterReadingDto;

@Mapper(componentModel = "spring")
public interface WaterMeterMapper {

    @Mapping(target = "consumption", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    WaterMeterReading toEntity(WaterMeterReadingDto dto);

    WaterMeterReadingDto toDto(WaterMeterReading entity);

    /**
     * Cập nhật entity từ DTO (dùng cho PUT)
     */
    @Mapping(target = "readingId", ignore = true)
    @Mapping(target = "consumption", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    void updateEntityFromDto(WaterMeterReadingDto dto, @MappingTarget WaterMeterReading entity);
}
