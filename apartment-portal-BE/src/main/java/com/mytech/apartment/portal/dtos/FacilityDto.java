package com.mytech.apartment.portal.dtos;

import lombok.Data;

@Data
public class FacilityDto {
    private Long id;
    private String name;
    private String description;
    private String location;
    private Integer capacity;
    private String otherDetails;
    private Double usageFee;
    private String openingHours;
    private String status;
    private Boolean isVisible;
} 