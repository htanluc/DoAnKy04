package com.mytech.apartment.portal.mappers;

import com.mytech.apartment.portal.dtos.WaterMeterReadingDto;
import com.mytech.apartment.portal.models.WaterMeterReading;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-07-25T15:06:51+0700",
    comments = "version: 1.6.2, compiler: Eclipse JDT (IDE) 3.42.50.v20250628-1110, environment: Java 21.0.7 (Eclipse Adoptium)"
)
@Component
public class WaterMeterMapperImpl implements WaterMeterMapper {

    @Override
    public WaterMeterReading toEntity(WaterMeterReadingDto dto) {
        if ( dto == null ) {
            return null;
        }

        WaterMeterReading waterMeterReading = new WaterMeterReading();

        waterMeterReading.setApartmentId( dto.getApartmentId() );
        waterMeterReading.setCurrentReading( dto.getCurrentReading() );
        waterMeterReading.setPreviousReading( dto.getPreviousReading() );
        waterMeterReading.setReadingId( dto.getReadingId() );
        waterMeterReading.setReadingMonth( dto.getReadingMonth() );

        return waterMeterReading;
    }

    @Override
    public WaterMeterReadingDto toDto(WaterMeterReading entity) {
        if ( entity == null ) {
            return null;
        }

        WaterMeterReadingDto waterMeterReadingDto = new WaterMeterReadingDto();

        waterMeterReadingDto.setApartmentId( entity.getApartmentId() );
        waterMeterReadingDto.setConsumption( entity.getConsumption() );
        waterMeterReadingDto.setCurrentReading( entity.getCurrentReading() );
        waterMeterReadingDto.setPreviousReading( entity.getPreviousReading() );
        waterMeterReadingDto.setReadingId( entity.getReadingId() );
        waterMeterReadingDto.setReadingMonth( entity.getReadingMonth() );

        return waterMeterReadingDto;
    }

    @Override
    public void updateEntityFromDto(WaterMeterReadingDto dto, WaterMeterReading entity) {
        if ( dto == null ) {
            return;
        }

        entity.setApartmentId( dto.getApartmentId() );
        entity.setCurrentReading( dto.getCurrentReading() );
        entity.setPreviousReading( dto.getPreviousReading() );
        entity.setReadingMonth( dto.getReadingMonth() );
    }
}
