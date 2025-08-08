package com.mytech.apartment.portal.dtos;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.mytech.apartment.portal.models.enums.RelationType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApartmentResidentDto {
    private Long apartmentId;
    private Long userId;
    private String apartmentUnitNumber;
    private String userFullName;
    private String userEmail;
    private String userPhoneNumber;
    private RelationType relationType;
    private String relationTypeDisplayName;
    private LocalDate moveInDate;
    private LocalDate moveOutDate;
    private String unitNumber; // Mã căn hộ
    private String buildingName; // Tên tòa nhà
    
    // Thông tin cư dân đầy đủ
    private String userAvatarUrl;
    private String userStatus;
    
    // Thông tin căn hộ đầy đủ
    private String apartmentStatus;
    private Double apartmentArea;
    private Integer apartmentFloorNumber;
    
    private Boolean isPrimaryResident;
    private LocalDateTime createdAt;
} 