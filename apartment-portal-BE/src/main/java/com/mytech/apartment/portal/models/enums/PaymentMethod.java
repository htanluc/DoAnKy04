package com.mytech.apartment.portal.models.enums;

public enum PaymentMethod {
    CASH("Tiền mặt"),
    BANK_TRANSFER("Chuyển khoản ngân hàng"),
    VNPAY("VNPay"),
    VISA("Thẻ Visa"),
    FREE("Miễn phí");

    private final String displayName;

    PaymentMethod(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
} 