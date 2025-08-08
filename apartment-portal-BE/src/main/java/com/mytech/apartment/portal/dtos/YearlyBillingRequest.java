package com.mytech.apartment.portal.dtos;

import lombok.Data;
import java.time.LocalDate;

@Data
public class YearlyBillingRequest {
    private int year = LocalDate.now().getYear(); // Mặc định là năm hiện tại
    private Long apartmentId; // Optional, nếu null thì tạo cho tất cả căn hộ
    
    // Phí dịch vụ và nước
    private double serviceFeePerM2 = 5000.0;
    private double waterFeePerM3 = 15000.0;
    
    // Phí gửi xe theo loại
    private double motorcycleFee = 50000.0;      // Phí gửi xe máy/tháng
    private double car4SeatsFee = 200000.0;      // Phí gửi ô tô 4 chỗ/tháng
    private double car7SeatsFee = 250000.0;      // Phí gửi ô tô 7 chỗ/tháng
} 