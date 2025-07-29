package com.mytech.apartment.portal.models.enums;

import lombok.Getter;

import java.math.BigDecimal;

@Getter
public enum VehicleType {
    MOTORCYCLE("Xe máy", new BigDecimal("50000")),
    CAR("Ô tô", new BigDecimal("200000")),
    TRUCK("Xe tải", new BigDecimal("300000")),
    VAN("Xe van", new BigDecimal("250000")),
    ELECTRIC_MOTORCYCLE("Xe máy điện", new BigDecimal("40000")),
    ELECTRIC_CAR("Ô tô điện", new BigDecimal("150000")),
    BICYCLE("Xe đạp", new BigDecimal("20000")),
    ELECTRIC_BICYCLE("Xe đạp điện", new BigDecimal("30000"));

    private final String displayName;
    private final BigDecimal monthlyFee;

    VehicleType(String displayName, BigDecimal monthlyFee) {
        this.displayName = displayName;
        this.monthlyFee = monthlyFee;
    }
} 