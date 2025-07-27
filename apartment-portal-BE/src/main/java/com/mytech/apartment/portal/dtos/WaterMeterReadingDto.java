package com.mytech.apartment.portal.dtos;

import lombok.Data;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;

@Data
public class WaterMeterReadingDto {

    private Long readingId;

    @NotNull
    private Integer apartmentId;

    @NotBlank
    // định dạng "yyyy-MM"
    @Pattern(regexp = "\\d{4}-\\d{2}")
    private String readingMonth;

    @NotNull
    @DecimalMin("0.00")
    private BigDecimal previousReading;

    @NotNull
    @DecimalMin("0.00")
    private BigDecimal currentReading;

    private BigDecimal consumption;

    // Mới: tên căn hộ
    private String apartmentName;
}