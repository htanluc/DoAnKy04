package com.mytech.apartment.portal.models.enums;

public enum RelationType {
    OWNER("OWNER", "Chủ sở hữu"),
    TENANT("TENANT", "Người thuê"),
    FAMILY_MEMBER("FAMILY_MEMBER", "Thành viên gia đình"),
    GUEST("GUEST", "Khách"),
    MANAGER("MANAGER", "Người quản lý"),
    CO_OWNER("CO_OWNER", "Đồng sở hữu");

    private final String value;
    private final String displayName;

    RelationType(String value, String displayName) {
        this.value = value;
        this.displayName = displayName;
    }

    public String getValue() {
        return value;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static RelationType fromValue(String value) {
        for (RelationType type : values()) {
            if (type.value.equals(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown RelationType: " + value);
    }
} 