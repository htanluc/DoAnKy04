package com.mytech.apartment.portal.models.enums;

public enum PaymentMethod {
    CASH("Tiền mặt"),
    BANK_TRANSFER("Chuyển khoản ngân hàng"),
    MOMO("Ví MoMo"),
    VNPAY("VNPay"),
    ZALOPAY("ZaloPay"),
    PAYPAL("PayPal"),
    VISA("Thẻ Visa"),
    MASTERCARD("Thẻ Mastercard"),
    JCB("Thẻ JCB"),
    AMEX("Thẻ American Express");

    private final String displayName;

    PaymentMethod(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
} 