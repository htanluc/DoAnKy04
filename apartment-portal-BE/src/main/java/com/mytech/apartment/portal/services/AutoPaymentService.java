package com.mytech.apartment.portal.services;

import com.mytech.apartment.portal.dtos.AutoPaymentSetupRequest;
import com.mytech.apartment.portal.models.User;
import com.mytech.apartment.portal.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.HashMap;
import java.util.Map;

@Service
public class AutoPaymentService {

    @Autowired
    private UserRepository userRepository;



    // Trong thực tế, bạn sẽ lưu cài đặt vào database
    // Ở đây tôi sử dụng Map để demo
    private final Map<Long, AutoPaymentSetupRequest> autoPaymentSettings = new HashMap<>();

    public void setupAutoPayment(AutoPaymentSetupRequest request) {
        try {
            // Lấy user hiện tại
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Validate request
            if (request.getPaymentDay() < 1 || request.getPaymentDay() > 31) {
                throw new RuntimeException("Payment day must be between 1 and 31");
            }

            if (request.getMaxAmount() <= 0) {
                throw new RuntimeException("Max amount must be greater than 0");
            }

            // Lưu cài đặt
            autoPaymentSettings.put(user.getId(), request);

        } catch (Exception e) {
            throw new RuntimeException("Failed to setup auto payment: " + e.getMessage());
        }
    }

    public AutoPaymentSetupRequest getAutoPaymentSettings() {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            AutoPaymentSetupRequest settings = autoPaymentSettings.get(user.getId());
            if (settings == null) {
                throw new RuntimeException("Auto payment not configured");
            }

            return settings;

        } catch (Exception e) {
            throw new RuntimeException("Failed to get auto payment settings: " + e.getMessage());
        }
    }

    public void cancelAutoPayment() {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            autoPaymentSettings.remove(user.getId());

        } catch (Exception e) {
            throw new RuntimeException("Failed to cancel auto payment: " + e.getMessage());
        }
    }

    // Method này sẽ được gọi bởi scheduler để thực hiện thanh toán tự động
    public void processAutoPayments() {
        // Lấy danh sách hóa đơn cần thanh toán tự động
        // Kiểm tra ngày thanh toán và hạn mức
        // Thực hiện thanh toán nếu thỏa mãn điều kiện
        
        autoPaymentSettings.forEach((userId, settings) -> {
            try {
                // Kiểm tra xem có phải ngày thanh toán không
                if (isPaymentDay(settings.getPaymentDay())) {
                    // Lấy hóa đơn chưa thanh toán của user
                    // Thực hiện thanh toán tự động
                    processAutoPaymentForUser(userId, settings);
                }
            } catch (Exception e) {
                // Log lỗi nhưng không dừng quá trình
                System.err.println("Auto payment failed for user " + userId + ": " + e.getMessage());
            }
        });
    }

    private boolean isPaymentDay(int paymentDay) {
        // Kiểm tra xem hôm nay có phải ngày thanh toán không
        int today = java.time.LocalDate.now().getDayOfMonth();
        return today == paymentDay;
    }

    private void processAutoPaymentForUser(Long userId, AutoPaymentSetupRequest settings) {
        // Trong thực tế, bạn sẽ:
        // 1. Lấy danh sách hóa đơn chưa thanh toán của user
        // 2. Kiểm tra tổng số tiền có vượt quá hạn mức không
        // 3. Thực hiện thanh toán tự động
        
        System.out.println("Processing auto payment for user " + userId + 
                          " with method " + settings.getPaymentMethod() + 
                          " and max amount " + settings.getMaxAmount());
    }

    // Method để test
    public boolean isAutoPaymentEnabled(Long userId) {
        return autoPaymentSettings.containsKey(userId);
    }
} 