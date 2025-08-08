package com.mytech.apartment.portal.dtos;

import lombok.Data;
import java.time.LocalDate;

@Data
public class ApartmentResidentDto {
    private Long apartmentId;
    private Long userId;
    private String relationType;
    private LocalDate moveInDate;
    private LocalDate moveOutDate;
    private String unitNumber; // Mã căn hộ
    private String buildingName; // Tên tòa nhà
    
    // Thông tin cư dân đầy đủ
    private String userFullName;
    private String userPhoneNumber;
    private String userEmail;
    private String userAvatarUrl;
    private String userStatus;
    
    // Thông tin căn hộ đầy đủ
    private String apartmentStatus;
    private Double apartmentArea;
    private Integer apartmentFloorNumber;
} 