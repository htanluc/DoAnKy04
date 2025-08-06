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

    @NotNull
    @DecimalMin("0.00")
    private BigDecimal meterReading;

    private BigDecimal consumption;

    private BigDecimal unitPrice;

    private BigDecimal totalAmount;

    @NotNull
    private Long recordedBy;

    // Mới: tên căn hộ
    private String apartmentName;
}