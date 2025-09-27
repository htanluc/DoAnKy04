package com.mytech.apartment.portal.dtos;

import lombok.Data;

@Data
public class FacilityDto {
    private Long id;
    private String name;
    private String description;
    private String location;
    private Integer capacity;
    private String capacityType; // INDIVIDUAL hoặc GROUP
    private Integer groupSize; // Số lượng người trong nhóm (chỉ dùng khi capacityType = GROUP)
    private String otherDetails;
    private Double usageFee;
    private String openingHours;
    private String openingSchedule; // JSON string cho lịch mở cửa theo tuần
    private String status;
    private Boolean isVisible;
} 