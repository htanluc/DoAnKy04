package com.mytech.apartment.portal.dtos;

import lombok.Data;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class WaterMeterReadingDto {

    private Long id;

    @NotNull
    private Long apartmentId;

    @NotNull
    private LocalDate readingDate;

    // Thêm trường readingMonth để tương thích với frontend
    private String readingMonth;

    @NotNull
    @DecimalMin("0.00")
    private BigDecimal meterReading;

    // Thêm trường previousReading và currentReading để tương thích với frontend
    private BigDecimal previousReading;
    private BigDecimal currentReading;

    private BigDecimal consumption;

    private BigDecimal unitPrice;

    private BigDecimal totalAmount;

    @NotNull
    private Long recordedBy;

    // Mới: tên căn hộ
    private String apartmentName;
}