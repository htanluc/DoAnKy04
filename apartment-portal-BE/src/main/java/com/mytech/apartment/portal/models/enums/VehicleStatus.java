package com.mytech.apartment.portal.models.enums;

import lombok.Getter;

@Getter
public enum VehicleStatus {
    PENDING("Chờ duyệt"),
    APPROVED("Đã duyệt"),
    REJECTED("Từ chối"),
    ACTIVE("Đang hoạt động"),
    INACTIVE("Không hoạt động"),
    EXPIRED("Hết hạn");

    private final String displayName;

    VehicleStatus(String displayName) {
        this.displayName = displayName;
    }
} 