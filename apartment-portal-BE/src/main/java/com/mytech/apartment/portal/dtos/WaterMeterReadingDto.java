package com.mytech.apartment.portal.dtos;

import lombok.Data;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class WaterMeterReadingDto {

    private Long id;

    @NotNull
    private Long apartmentId;

    // Không bắt buộc: sẽ suy ra từ readingMonth nếu không truyền
    private LocalDate readingDate;

    // Thêm trường readingMonth để tương thích với frontend
    private String readingMonth;

    // Không bắt buộc: sẽ lấy từ currentReading nếu không truyền
    @DecimalMin("0.00")
    private BigDecimal meterReading;

    // Thêm trường previousReading và currentReading để tương thích với frontend
    private BigDecimal previousReading;
    private BigDecimal currentReading;

    private BigDecimal consumption;

    private BigDecimal unitPrice;

    private BigDecimal totalAmount;

    // Không bắt buộc: backend sẽ tự điền từ người dùng hiện tại nếu thiếu
    private Long recordedBy;

    // Mới: tên căn hộ
    private String apartmentName;

    // Thời gian tạo bản ghi (ai ghi khi nào)
    private LocalDateTime createdAt;

    // Tên người ghi (để hiển thị tiện lợi ở FE)
    private String recordedByName;
}