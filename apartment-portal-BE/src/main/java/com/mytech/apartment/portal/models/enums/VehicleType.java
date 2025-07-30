package com.mytech.apartment.portal.models.enums;

import lombok.Getter;

import java.math.BigDecimal;

@Getter
public enum VehicleType {
    MOTORCYCLE("Xe máy", new BigDecimal("50000")),
    CAR("Ô tô", new BigDecimal("200000"));

    private final String displayName;
    private final BigDecimal monthlyFee;

    VehicleType(String displayName, BigDecimal monthlyFee) {
        this.displayName = displayName;
        this.monthlyFee = monthlyFee;
    }
} 