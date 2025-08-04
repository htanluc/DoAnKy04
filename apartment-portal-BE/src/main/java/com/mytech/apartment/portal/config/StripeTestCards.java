package com.mytech.apartment.portal.config;

import org.springframework.stereotype.Component;

/**
 * Helper class chứa thông tin thẻ test của Stripe
 * Sử dụng cho development và testing
 */
@Component
public class StripeTestCards {
    
    /**
     * Thẻ Visa thành công
     */
    public static final String VISA_SUCCESS = "4242424242424242";
    
    /**
     * Thẻ Visa thất bại
     */
    public static final String VISA_DECLINED = "4000000000000002";
    
    /**
     * Thẻ Mastercard thành công
     */
    public static final String MASTERCARD_SUCCESS = "5555555555554444";
    
    /**
     * Thẻ Mastercard thất bại
     */
    public static final String MASTERCARD_DECLINED = "5105105105105100";
    
    /**
     * Thẻ American Express thành công
     */
    public static final String AMEX_SUCCESS = "378282246310005";
    
    /**
     * Thẻ cần xác thực 3D Secure
     */
    public static final String CARD_REQUIRES_AUTHENTICATION = "4000002500003155";
    
    /**
     * Thẻ cần xác thực bằng SMS
     */
    public static final String CARD_REQUIRES_ACTION = "4000008400001629";
    
    /**
     * Thông tin thẻ test mặc định
     */
    public static final String DEFAULT_EXPIRY = "12/34";
    public static final String DEFAULT_CVC = "123";
    public static final String DEFAULT_ZIP = "12345";
    
    /**
     * Lấy danh sách thẻ test
     */
    public static String[] getTestCards() {
        return new String[]{
            VISA_SUCCESS,
            VISA_DECLINED,
            MASTERCARD_SUCCESS,
            MASTERCARD_DECLINED,
            AMEX_SUCCESS,
            CARD_REQUIRES_AUTHENTICATION,
            CARD_REQUIRES_ACTION
        };
    }
    
    /**
     * Lấy thông tin thẻ test
     */
    public static String getCardInfo(String cardNumber) {
        switch (cardNumber) {
            case VISA_SUCCESS:
                return "Visa thành công - 4242424242424242";
            case VISA_DECLINED:
                return "Visa thất bại - 4000000000000002";
            case MASTERCARD_SUCCESS:
                return "Mastercard thành công - 5555555555554444";
            case MASTERCARD_DECLINED:
                return "Mastercard thất bại - 5105105105105100";
            case AMEX_SUCCESS:
                return "American Express thành công - 378282246310005";
            case CARD_REQUIRES_AUTHENTICATION:
                return "Thẻ cần xác thực 3D Secure - 4000002500003155";
            case CARD_REQUIRES_ACTION:
                return "Thẻ cần xác thực SMS - 4000008400001629";
            default:
                return "Thẻ không xác định";
        }
    }
} 