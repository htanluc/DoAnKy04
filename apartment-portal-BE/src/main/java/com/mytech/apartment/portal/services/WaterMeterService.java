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

    // nếu scheduler cần:
    void generateHistory(String period);
}
