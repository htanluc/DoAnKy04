package com.mytech.apartment.portal.services;

import java.util.Map;

/**
 * Interface cho tất cả các cổng thanh toán
 */
public interface PaymentGateway {
    
    /**
     * Tạo thanh toán
     * @param orderId ID đơn hàng
     * @param amount Số tiền
     * @param orderInfo Thông tin đơn hàng
     * @return Map chứa thông tin thanh toán
     */
    Map<String, Object> createPayment(String orderId, Long amount, String orderInfo);
    
    /**
     * Xác thực callback
     * @param params Tham số từ callback
     * @return true nếu hợp lệ
     */
    boolean verifyCallback(Map<String, String> params);
    
    /**
     * Kiểm tra trạng thái thanh toán
     * @param orderId ID đơn hàng
     * @return Map chứa trạng thái
     */
    Map<String, Object> checkPaymentStatus(String orderId);
    
    /**
     * Lấy tên cổng thanh toán
     * @return Tên cổng thanh toán
     */
    String getGatewayName();
} 