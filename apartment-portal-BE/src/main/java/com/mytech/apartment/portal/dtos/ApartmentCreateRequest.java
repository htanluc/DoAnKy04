package com.mytech.apartment.portal.dtos;

import lombok.Data;

@Data
public class ApartmentCreateRequest {
    private Long buildingId;
    private Integer floorNumber;
    private String unitNumber;
    private Double area;
    private String status;
} 