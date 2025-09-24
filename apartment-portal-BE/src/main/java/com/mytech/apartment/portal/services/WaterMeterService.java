// src/main/java/com/mytech/apartment/portal/services/WaterMeterService.java
package com.mytech.apartment.portal.services;

import com.mytech.apartment.portal.dtos.WaterMeterReadingDto;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface WaterMeterService {
    WaterMeterReadingDto addReading(WaterMeterReadingDto dto);
    List<WaterMeterReadingDto> getAllReadings();
    Optional<WaterMeterReadingDto> getReadingById(Long id);
    void deleteReading(Long id);
    WaterMeterReadingDto updateReading(Long id, WaterMeterReadingDto dto);
    WaterMeterReadingDto patchReading(Long id, Map<String,Object> updates);

    // Lấy chỉ số nước theo tháng cụ thể
    List<WaterMeterReadingDto> getReadingsByMonth(String month);

    // Lấy chỉ số nước mới nhất cho mỗi căn hộ (tối ưu cho dashboard)
    List<WaterMeterReadingDto> getLatestReadings();

    // Lấy chỉ số nước theo ID căn hộ
    List<WaterMeterReadingDto> getWaterMetersByApartmentId(Long apartmentId);

    // nếu scheduler cần:
    void generateHistory(String period);

    // STAFF helpers
    Map<String, Object> lookupByApartmentCode(String apartmentCode);
    WaterMeterReadingDto createFromApartmentCode(String apartmentCode, java.math.BigDecimal currentReading, java.time.LocalDate readingDate);
    
    // Create sample data for testing
    void createSampleReadings();
}
